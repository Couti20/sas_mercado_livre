"""
ScraperAPI Client
Cliente para fazer requisições HTTP usando ScraperAPI como proxy.
O ScraperAPI rotaciona IPs automaticamente e resolve CAPTCHAs.

Documentação: https://www.scraperapi.com/documentation/
"""
import httpx
import re
import os
from typing import Optional, Dict, Any
from bs4 import BeautifulSoup

# Configuração
SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY", "")
SCRAPER_API_URL = "http://api.scraperapi.com"

def is_available() -> bool:
    """Verifica se o ScraperAPI está configurado."""
    return bool(SCRAPER_API_KEY)


async def fetch_with_scraperapi(url: str, timeout: int = 60) -> Optional[str]:
    """
    Busca uma página usando ScraperAPI.
    
    Args:
        url: URL para buscar
        timeout: Timeout em segundos (ScraperAPI pode demorar mais)
        
    Returns:
        HTML da página ou None se falhar
    """
    if not SCRAPER_API_KEY:
        print("[SCRAPERAPI] ❌ API key não configurada", flush=True)
        return None
    
    params = {
        "api_key": SCRAPER_API_KEY,
        "url": url,
        "country_code": "br",  # IP brasileiro
        "render": "true",      # Renderiza JavaScript
        "premium": "true",     # Usa proxies premium (melhor para ML)
    }
    
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            print(f"[SCRAPERAPI] 🔄 Buscando: {url[:60]}...", flush=True)
            response = await client.get(SCRAPER_API_URL, params=params)
            
            if response.status_code == 200:
                print(f"[SCRAPERAPI] ✅ Resposta OK ({len(response.text)} bytes)", flush=True)
                return response.text
            elif response.status_code == 403:
                print(f"[SCRAPERAPI] ⚠️ Bloqueado (403) - ScraperAPI não conseguiu", flush=True)
                return None
            elif response.status_code == 500:
                print(f"[SCRAPERAPI] ⚠️ Erro do ScraperAPI (500)", flush=True)
                return None
            else:
                print(f"[SCRAPERAPI] ❌ Erro {response.status_code}: {response.text[:200]}", flush=True)
                return None
                
    except httpx.TimeoutException:
        print(f"[SCRAPERAPI] ⏱️ Timeout após {timeout}s", flush=True)
        return None
    except Exception as e:
        print(f"[SCRAPERAPI] ❌ Exceção: {e}", flush=True)
        return None


def normalize_price(price_str: str) -> Optional[float]:
    """Normaliza preço brasileiro para float."""
    if not price_str:
        return None
    try:
        cleaned = re.sub(r'[^\d,]', '', price_str).replace(",", ".")
        return float(cleaned)
    except (ValueError, AttributeError):
        return None


def extract_product_data(html: str) -> Optional[Dict[str, Any]]:
    """
    Extrai dados do produto do HTML usando BeautifulSoup.
    
    Args:
        html: HTML da página do produto
        
    Returns:
        Dict com title, price, imageUrl ou None se falhar
    """
    if not html:
        return None
    
    soup = BeautifulSoup(html, 'html.parser')
    
    title = None
    price = None
    image_url = None
    
    # ===== TÍTULO =====
    # Múltiplos seletores para encontrar o título
    title_selectors = [
        'h1.ui-pdp-title',
        'h1[class*="title"]',
        '.ui-pdp-title',
        'h1',
        'meta[property="og:title"]'
    ]
    
    for selector in title_selectors:
        if selector.startswith('meta'):
            elem = soup.select_one(selector)
            if elem and elem.get('content'):
                title = elem['content'].strip()
                break
        else:
            elem = soup.select_one(selector)
            if elem and elem.get_text(strip=True):
                title = elem.get_text(strip=True)
                break
    
    # ===== PREÇO =====
    # Múltiplos seletores para encontrar o preço
    price_selectors = [
        '.andes-money-amount__fraction',
        'span[class*="price-tag-fraction"]',
        '.ui-pdp-price__second-line .andes-money-amount__fraction',
        'meta[itemprop="price"]',
        '.price-tag-amount',
    ]
    
    for selector in price_selectors:
        if selector.startswith('meta'):
            elem = soup.select_one(selector)
            if elem and elem.get('content'):
                price = normalize_price(elem['content'])
                if price:
                    break
        else:
            elem = soup.select_one(selector)
            if elem:
                price_text = elem.get_text(strip=True)
                price = normalize_price(price_text)
                if price:
                    break
    
    # Buscar centavos se existir
    cents_elem = soup.select_one('.andes-money-amount__cents')
    if cents_elem and price:
        cents = cents_elem.get_text(strip=True)
        if cents:
            try:
                price = price + (int(cents) / 100)
            except:
                pass
    
    # ===== PREÇO ORIGINAL (desconto) =====
    original_price = None
    discount_percent = None
    
    original_price_selectors = [
        '.ui-pdp-price__original-value .andes-money-amount__fraction',
        '.ui-pdp-price__second-line--crossed .andes-money-amount__fraction',
        's.andes-money-amount .andes-money-amount__fraction',
        '[class*="crossed"] .andes-money-amount__fraction',
    ]
    
    for selector in original_price_selectors:
        elem = soup.select_one(selector)
        if elem:
            original_price = normalize_price(elem.get_text(strip=True))
            if original_price:
                break
    
    # Buscar desconto direto do HTML
    discount_selectors = [
        '.ui-pdp-price__second-line__label',
        '.andes-money-amount__discount',
        '[class*="discount"]',
    ]
    
    for selector in discount_selectors:
        elem = soup.select_one(selector)
        if elem:
            text = elem.get_text(strip=True)
            match = re.search(r'(\d+)\s*%\s*OFF', text, re.IGNORECASE)
            if match:
                discount_percent = int(match.group(1))
                break
    
    # Calcular desconto se temos preço original mas não encontramos o %
    if original_price and price and not discount_percent:
        discount_percent = round((1 - price / original_price) * 100)
    
    # ===== IMAGEM =====
    # Múltiplos seletores para encontrar a imagem
    image_selectors = [
        '.ui-pdp-gallery__figure img',
        'img.ui-pdp-image',
        'meta[property="og:image"]',
        'img[data-zoom]',
        '.ui-pdp-image img',
    ]
    
    for selector in image_selectors:
        if selector.startswith('meta'):
            elem = soup.select_one(selector)
            if elem and elem.get('content'):
                image_url = elem['content']
                break
        else:
            elem = soup.select_one(selector)
            if elem and elem.get('src'):
                image_url = elem['src']
                # Converter thumbnail para imagem maior
                if image_url and '-O.jpg' not in image_url:
                    image_url = re.sub(r'-[A-Z]\.jpg', '-O.jpg', image_url)
                break
    
    # Validar dados mínimos
    if not title or not price:
        print(f"[SCRAPERAPI] ⚠️ Dados incompletos: title={bool(title)}, price={bool(price)}", flush=True)
        return None
    
    if discount_percent and discount_percent > 0:
        print(f"[SCRAPERAPI] ✅ Extraído: {title[:50]}... - R$ {price} (🏷️ {discount_percent}% OFF)", flush=True)
    else:
        print(f"[SCRAPERAPI] ✅ Extraído: {title[:50]}... - R$ {price}", flush=True)
    
    return {
        "title": title,
        "price": price,
        "imageUrl": image_url,
        "originalPrice": original_price,
        "discountPercent": discount_percent
    }


async def scrape_product(url: str) -> Optional[Dict[str, Any]]:
    """
    Busca dados de um produto do Mercado Livre usando ScraperAPI.
    
    Args:
        url: URL do produto no Mercado Livre
        
    Returns:
        Dict com title, price, imageUrl ou None se falhar
    """
    html = await fetch_with_scraperapi(url)
    if not html:
        return None
    
    return extract_product_data(html)
