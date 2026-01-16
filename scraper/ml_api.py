"""
Mercado Livre API Client
Cliente para a API pública oficial do Mercado Livre.

Vantagens sobre scraping:
- Sem bloqueios
- Mais rápido
- Mais confiável
- Gratuito
"""

import httpx
import re
from typing import Optional, Dict, Any


# Configuração da API
ML_API_BASE_URL = "https://api.mercadolibre.com"

# Rate limiting stats
class MLApiStats:
    """Estatísticas de uso da API."""
    _success = 0
    _errors = 0
    _rate_limited = 0
    
    @classmethod
    def record_success(cls):
        cls._success += 1
    
    @classmethod
    def record_error(cls):
        cls._errors += 1
    
    @classmethod
    def record_rate_limit(cls):
        cls._rate_limited += 1
    
    @classmethod
    def get_stats(cls) -> Dict[str, Any]:
        total = cls._success + cls._errors
        success_rate = f"{(cls._success / total * 100):.1f}%" if total > 0 else "0%"
        return {
            "total": total,
            "success": cls._success,
            "errors": cls._errors,
            "rate_limited": cls._rate_limited,
            "success_rate": success_rate
        }
    
    @classmethod
    def reset(cls):
        cls._success = 0
        cls._errors = 0
        cls._rate_limited = 0


def extract_item_id(url: str) -> Optional[str]:
    """
    Extrai o ID do produto (MLB-XXXXXXXXX) da URL do Mercado Livre.
    
    Exemplos de URLs suportadas:
    - https://www.mercadolivre.com.br/produto-nome/p/MLB12345678
    - https://produto.mercadolivre.com.br/MLB-1234567890-titulo_JM
    - https://www.mercadolivre.com.br/...?...#product_id=MLB1234567890
    """
    # Padrão 1: /p/MLB12345678 (página de produto)
    match = re.search(r'/p/(ML[A-Z]\d+)', url)
    if match:
        return match.group(1)
    
    # Padrão 2: MLB-1234567890 ou MLB1234567890 na URL
    match = re.search(r'(ML[A-Z])-?(\d+)', url)
    if match:
        return f"{match.group(1)}{match.group(2)}"
    
    return None


async def fetch_product_from_api(item_id: str) -> Optional[Dict[str, Any]]:
    """
    Busca informações do produto na API oficial do Mercado Livre.
    
    Endpoint: GET https://api.mercadolibre.com/items/{ITEM_ID}
    
    Returns:
        Dict com title, price, imageUrl ou None se falhar
    """
    url = f"{ML_API_BASE_URL}/items/{item_id}"
    
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.get(url)
            
            # Rate limit atingido
            if response.status_code == 429:
                MLApiStats.record_rate_limit()
                print(f"[ML_API] ⚠️ Rate limit atingido para {item_id}")
                return None
            
            # Produto não encontrado
            if response.status_code == 404:
                MLApiStats.record_error()
                print(f"[ML_API] ❌ Produto não encontrado: {item_id}")
                return None
            
            # Erro na API
            if response.status_code != 200:
                MLApiStats.record_error()
                print(f"[ML_API] ❌ Erro {response.status_code} para {item_id}")
                return None
            
            data = response.json()
            
            # Extrair dados
            title = data.get("title", "")
            price = data.get("price", 0)
            
            # Pegar a melhor imagem disponível
            image_url = None
            pictures = data.get("pictures", [])
            if pictures:
                # Preferir imagem em alta resolução
                image_url = pictures[0].get("secure_url") or pictures[0].get("url")
            elif data.get("thumbnail"):
                image_url = data.get("secure_thumbnail") or data.get("thumbnail")
            
            if title and price:
                MLApiStats.record_success()
                print(f"[ML_API] ✅ Sucesso: {title[:50]}... - R$ {price}")
                return {
                    "title": title,
                    "price": float(price),
                    "imageUrl": image_url
                }
            
            MLApiStats.record_error()
            return None
            
    except httpx.TimeoutException:
        MLApiStats.record_error()
        print(f"[ML_API] ⏱️ Timeout para {item_id}")
        return None
    except Exception as e:
        MLApiStats.record_error()
        print(f"[ML_API] ❌ Exceção: {e}")
        return None


async def get_product_info(url: str) -> Optional[Dict[str, Any]]:
    """
    Função principal: extrai ID da URL e busca na API.
    
    Args:
        url: URL do produto no Mercado Livre
        
    Returns:
        Dict com title, price, imageUrl ou None se falhar
    """
    # Extrair ID do produto da URL
    item_id = extract_item_id(url)
    
    if not item_id:
        print(f"[ML_API] ❌ Não foi possível extrair ID da URL: {url[:50]}...")
        return None
    
    print(f"[ML_API] 🔍 Buscando produto: {item_id}")
    
    # Buscar na API
    return await fetch_product_from_api(item_id)
