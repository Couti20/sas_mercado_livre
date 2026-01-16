"""
Mercado Livre Price Scraper (Asynchronous)
Uses a persistent Playwright browser instance to efficiently extract product data.

PROTEÇÕES IMPLEMENTADAS:
1. Múltiplos seletores fallback para cada elemento
2. User-Agents rotativos e realistas
3. Delays humanos aleatórios
4. Retry com exponential backoff
5. Detecção de bloqueio/captcha
6. Logs detalhados para diagnóstico
"""
import asyncio
import re
import random
from datetime import datetime
from playwright.async_api import async_playwright, Playwright, Browser, Page, TimeoutError as PlaywrightTimeout

# List of resource types to block for faster scraping
BLOCKED_RESOURCE_TYPES = [
  "image",
  "stylesheet",
  "font",
  "media",
  "texttrack",
  "object",
  "beacon",
  "csp_report",
  "imageset",
]

# Retry configuration
MAX_RETRIES = 2
INITIAL_RETRY_DELAY = 0.5  # seconds (era 1s)

# Pool de User-Agents realistas (Chrome Windows atualizado)
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
]

# Contador de requisições para estatísticas
class ScraperStats:
    total_requests = 0
    successful_requests = 0
    failed_requests = 0
    blocked_requests = 0
    last_success_time = None
    
    @classmethod
    def log_success(cls):
        cls.total_requests += 1
        cls.successful_requests += 1
        cls.last_success_time = datetime.now()
    
    @classmethod
    def log_failure(cls, blocked=False):
        cls.total_requests += 1
        cls.failed_requests += 1
        if blocked:
            cls.blocked_requests += 1
    
    @classmethod
    def get_stats(cls):
        success_rate = (cls.successful_requests / cls.total_requests * 100) if cls.total_requests > 0 else 0
        return {
            "total": cls.total_requests,
            "successful": cls.successful_requests,
            "failed": cls.failed_requests,
            "blocked": cls.blocked_requests,
            "success_rate": f"{success_rate:.1f}%",
            "last_success": cls.last_success_time.isoformat() if cls.last_success_time else None
        }

def normalize_price(price_str: str) -> float | None:
    """Normalize a Brazilian price string to a float."""
    if not price_str:
        return None
    try:
        cleaned = re.sub(r'[^\d,]', '', price_str).replace(",", ".")
        return float(cleaned)
    except (ValueError, AttributeError):
        return None

class Scraper:
    """
    A class to manage a persistent Playwright browser instance for scraping.
    The browser is launched once and reused across multiple scraping requests.
    """
    playwright: Playwright = None
    browser: Browser = None

    @classmethod
    async def initialize(cls):
        """Initializes Playwright and launches a persistent browser instance."""
        if cls.browser and cls.browser.is_connected():
            print("[INFO] Scraper already initialized.")
            return
        
        cls.playwright = await async_playwright().start()
        cls.browser = await cls.playwright.chromium.launch(
            headless=True,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--disable-dev-shm-usage",
                "--no-first-run",
                "--no-default-browser-check",
            ]
        )
        print("[INFO] Persistent browser instance launched.")

    @classmethod
    async def close(cls):
        """Closes the browser and stops Playwright."""
        if cls.browser and cls.browser.is_connected():
            await cls.browser.close()
        if cls.playwright:
            await cls.playwright.stop()
        print("[INFO] Browser instance closed.")
        
    @classmethod
    def is_initialized(cls) -> bool:
        """Check if the browser is running."""
        return cls.browser is not None and cls.browser.is_connected()

    @staticmethod
    async def _block_unnecessary_requests(page: Page):
        """Set up routing to block non-essential resources."""
        await page.route("**/*", lambda route: route.abort() if route.request.resource_type in BLOCKED_RESOURCE_TYPES else route.continue_())

    @classmethod
    async def scrape_mercadolivre(cls, url: str, timeout: int = 10000) -> dict | None:
        """
        Scrapes product data from a Mercado Livre URL using the persistent browser.
        Optimized for speed with reduced timeouts and faster selectors.
        Tries multiple selector combinations for robustness.
        Implements retry logic with exponential backoff.
        """
        for attempt in range(MAX_RETRIES):
            result = await cls._scrape_attempt(url, timeout, attempt)
            if result is not None:
                return result
            
            # If this wasn't the last attempt, wait before retrying
            if attempt < MAX_RETRIES - 1:
                wait_time = INITIAL_RETRY_DELAY * (2 ** attempt)  # Exponential backoff: 1s, 2s, 4s
                print(f"[INFO] 🔄 Tentativa {attempt + 1} falhou. Aguardando {wait_time}s antes de tentar novamente...")
                await asyncio.sleep(wait_time)
        
        print(f"[ERROR] ❌ Scrape falhou após {MAX_RETRIES} tentativas para {url}")
        return None

    @classmethod
    async def _scrape_attempt(cls, url: str, timeout: int, attempt_num: int) -> dict | None:
        """
        Internal method that performs a single scraping attempt.
        Includes human-like delays and captcha detection.
        """
        if not cls.is_initialized():
            raise RuntimeError("Scraper is not initialized. Call Scraper.initialize() first.")

        context = None
        try:
            # Seleciona User-Agent aleatório para parecer mais humano
            user_agent = random.choice(USER_AGENTS)
            
            # Create a new, isolated browser context for this request
            context = await cls.browser.new_context(
                user_agent=user_agent,
                ignore_https_errors=True,
                viewport={"width": 1920, "height": 1080},
                locale="pt-BR",
            )
            page = await context.new_page()

            # Block unnecessary assets
            await cls._block_unnecessary_requests(page)

            print(f"[INFO] [Tentativa {attempt_num + 1}/{MAX_RETRIES}] Navegando para {url}")
            await page.goto(url, timeout=timeout, wait_until="domcontentloaded")
            
            # DELAY HUMANO: espera aleatória entre 1-2 segundos
            human_delay = random.randint(1000, 2000)
            await page.wait_for_timeout(human_delay)
            
            # DETECÇÃO DE BLOQUEIO/CAPTCHA - melhorada para evitar falsos positivos
            page_content = await page.content()
            page_title = await page.title()
            
            # Detectar bloqueio REAL baseado no título ou conteúdo específico
            real_block_indicators = [
                "captcha",
                "não é um robô",
                "verify you are human",
                "acesso negado",
                "access denied"
            ]
            
            is_blocked = False
            for indicator in real_block_indicators:
                # Verificar no título (mais confiável)
                if indicator.lower() in page_title.lower():
                    print(f"[WARN] ⚠️ Bloqueio detectado no título: '{indicator}'")
                    is_blocked = True
                    break
                # Verificar no body text (não em atributos/classes)
                body_text = await page.inner_text("body") if await page.query_selector("body") else ""
                if indicator.lower() in body_text.lower()[:500]:  # Só nos primeiros 500 chars
                    print(f"[WARN] ⚠️ Bloqueio detectado no conteúdo: '{indicator}'")
                    is_blocked = True
                    break
            
            if is_blocked:
                ScraperStats.log_failure(blocked=True)
                return None

            # Try multiple selectors for price (more robust - ordem de prioridade)
            price_selectors = [
                # Seletores primários (mais estáveis)
                ".andes-money-amount__fraction",
                "span.andes-money-amount__fraction",
                # Seletores de fallback (estrutura)
                ".ui-pdp-price__second-line .andes-money-amount__fraction",
                "[data-testid='price-value']",
                # Seletores semânticos (mais resilientes)
                "span:has-text('R$')",
                ".price-tag-fraction",
                # Seletores de emergência (genéricos)
                "[class*='price'] span:first-child",
                "[class*='money'] span:first-child",
            ]
            
            price = None
            price_element = None
            
            for selector in price_selectors:
                try:
                    price_element = await page.query_selector(selector)
                    if price_element:
                        print(f"[DEBUG] Preço encontrado com seletor: {selector}")
                        break
                except:
                    continue
            
            if price_element:
                price_int = await price_element.inner_text()
                # Try to find cents
                price_cents_element = await page.query_selector(".andes-money-amount__cents")
                price_cents = "00"
                if price_cents_element:
                    price_cents = await price_cents_element.inner_text()
                
                price_str = f"{price_int},{price_cents}"
                price = normalize_price(price_str)
                print(f"[DEBUG] Preço extraído: R$ {price}")

            # Try multiple selectors for title (more robust)
            title_selectors = [
                # Seletores primários
                "h1.ui-pdp-title",
                "h1[data-testid='title']",
                "[data-testid='product-title']",
                # Seletores de fallback
                ".ui-pdp-title",
                "[class*='title'] h1",
                # Seletor genérico (último recurso)
                "h1",
            ]
            
            title = None
            for selector in title_selectors:
                try:
                    title_element = await page.query_selector(selector)
                    if title_element:
                        title = await title_element.inner_text()
                        title = title.strip()
                        if title and len(title) > 5:  # Sanity check
                            print(f"[DEBUG] Título encontrado com seletor: {selector}")
                            break
                except:
                    continue

            # Try multiple selectors for image (more robust)
            image_url = None
            image_selectors = [
                # Seletores primários
                "figure.ui-pdp-gallery__figure img",
                ".ui-pdp-gallery__figure img",
                "[data-testid='gallery-image'] img",
                # Seletores de fallback
                "img.ui-pdp-image",
                "figure img[src*='http']",
                "figure img[alt]",
                # Seletor genérico (pega primeira imagem grande)
                "img[src*='mlstatic']",
            ]
            
            for selector in image_selectors:
                try:
                    image_element = await page.query_selector(selector)
                    if image_element:
                        image_url = await image_element.get_attribute("src")
                        if image_url:
                            print(f"[DEBUG] Imagem encontrada com seletor: {selector}")
                            break
                except:
                    continue
            
            if not title or price is None:
                print(f"[WARN] Não conseguiu extrair todos os dados. Título: {title}, Preço: {price}")
                ScraperStats.log_failure()
                return None

            print(f"[INFO] ✅ Scrape bem-sucedido: {title} - R$ {price:.2f}")
            ScraperStats.log_success()
            return {"title": title, "price": price, "imageUrl": image_url}

        except PlaywrightTimeout:
            print(f"[WARN] [Tentativa {attempt_num + 1}] Timeout ao processar página: {url}")
            ScraperStats.log_failure()
            return None
        except Exception as e:
            print(f"[WARN] [Tentativa {attempt_num + 1}] Falha ao fazer scrape de {url}: {str(e)}")
            ScraperStats.log_failure()
            return None
        finally:
            if context:
                await context.close()


# ========================================
# TEST BLOCK - Run this file directly to test
# ========================================
async def main():
    test_url = "https://www.mercadolivre.com.br/cadeira-escritorio-ergonmica-sensetup-cosy-t03-preto-mesh-reclinavel-com-apoio-de-bracos-3d/p/MLB24578456"
    
    print("=" * 50)
    print("Testing Async Mercado Livre Scraper")
    print("=" * 50)
    
    await Scraper.initialize()
    
    print(f"URL: {test_url}")
    print("-" * 50)
    
    result = await Scraper.scrape_mercadolivre(test_url)
    
    if result:
        print("✅ Success!")
        print(f"   Title: {result['title']}")
        print(f"   Price: R$ {result['price']:.2f}")
        print(f"   Image URL: {result['imageUrl']}")
    else:
        print("❌ Failed to scrape product data")
    
    await Scraper.close()
    
    print("=" * 50)

if __name__ == "__main__":
    asyncio.run(main())