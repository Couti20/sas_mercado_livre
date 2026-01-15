"""
Debug script to check current Mercado Livre selectors
Run this to inspect what's actually on the page
"""
import asyncio
from scraper import Scraper

async def debug_page():
    """Debug a Mercado Livre page to check current HTML structure"""
    
    # Replace with a real Mercado Livre product URL
    url = "https://www.mercadolivre.com.br/cadeira-escritorio-ergonmica-sensetup-cosy-t03-preto-mesh-reclinavel-com-apoio-de-bracos-3d/p/MLB24578456"
    
    await Scraper.initialize()
    
    context = await Scraper.browser.new_context(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ignore_https_errors=True
    )
    page = await context.new_page()
    
    print(f"[DEBUG] Navegando para {url}")
    await page.goto(url, timeout=15000, wait_until="domcontentloaded")
    
    # Wait a bit for dynamic content to load
    await page.wait_for_timeout(3000)
    
    # Try to find the title
    print("\n=== BUSCANDO TÍTULO ===")
    selectors_title = [
        "h1.ui-pdp-title",
        "h1",
        "[data-testid='title']",
        ".ui-pdp-title",
    ]
    for selector in selectors_title:
        element = await page.query_selector(selector)
        if element:
            text = await element.inner_text()
            print(f"✅ Encontrado com '{selector}': {text[:80]}")
            break
    else:
        print("❌ Nenhum seletor de título funcionou")
        # Print all h1 elements
        h1s = await page.query_selector_all("h1")
        print(f"Total de h1s na página: {len(h1s)}")
    
    # Try to find the price
    print("\n=== BUSCANDO PREÇO ===")
    selectors_price = [
        ".andes-money-amount__fraction",
        ".andes-money-amount",
        "[data-testid='price']",
        ".price",
        "[class*='price']",
    ]
    for selector in selectors_price:
        element = await page.query_selector(selector)
        if element:
            text = await element.inner_text()
            print(f"✅ Encontrado com '{selector}': {text}")
            break
    else:
        print("❌ Nenhum seletor de preço funcionou")
        # Print all elements with 'price' in class
        prices = await page.query_selector_all("[class*='price']")
        print(f"Total de elementos com 'price' na classe: {len(prices)}")
    
    # Try to find image
    print("\n=== BUSCANDO IMAGEM ===")
    selectors_img = [
        "figure.ui-pdp-gallery__figure img",
        "img[alt*='Imagem principal']",
        "img.ui-pdp-gallery__figure",
        "figure img",
    ]
    for selector in selectors_img:
        element = await page.query_selector(selector)
        if element:
            src = await element.get_attribute("src")
            print(f"✅ Encontrado com '{selector}': {src[:80]}")
            break
    else:
        print("❌ Nenhum seletor de imagem funcionou")
    
    # Save page for manual inspection
    await page.screenshot(path="debug_screenshot.png")
    print("\n📸 Screenshot salvo em: debug_screenshot.png")
    
    # Get page HTML for inspection
    html = await page.content()
    with open("debug_page.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("📄 HTML salvo em: debug_page.html")
    
    await context.close()
    await Scraper.close()

if __name__ == "__main__":
    asyncio.run(debug_page())
