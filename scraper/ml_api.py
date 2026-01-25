"""
Mercado Livre API Client
Cliente para a API pública oficial do Mercado Livre, com lógica de auto-refresh de token.
"""
import httpx
import re
import os
import asyncio
from typing import Optional, Dict, Any

# Módulos locais
from scraper import token_manager


def _mask(s: Optional[str]) -> str:
    if not s:
        return "<missing>"
    if len(s) <= 8:
        return s[0:2] + "..." + s[-2:]
    return s[0:4] + "..." + s[-4:]


def _print_env_diagnostics():
    # Mostra se as variáveis críticas estão presentes (sem vazar o segredo inteiro)
    client_id = os.getenv("MERCADO_LIVRE_APP_ID")
    client_secret = os.getenv("MERCADO_LIVRE_CLIENT_SECRET")
    env_refresh = os.getenv("MERCADO_LIVRE_REFRESH_TOKEN")
    file_access, file_refresh = token_manager.read_tokens()

    print("[ML_API][DIAG] MERCADO_LIVRE_APP_ID:", _mask(client_id))
    print("[ML_API][DIAG] MERCADO_LIVRE_CLIENT_SECRET:", _mask(client_secret))
    print("[ML_API][DIAG] MERCADO_LIVRE_REFRESH_TOKEN (env):", _mask(env_refresh))
    print("[ML_API][DIAG] token_storage.json access_token:", _mask(file_access))
    print("[ML_API][DIAG] token_storage.json refresh_token:", _mask(file_refresh))


# Print diagnostics on import to help debug env/config issues in production
try:
    _print_env_diagnostics()
except Exception:
    pass

# Configuração da API
ML_API_BASE_URL = "https://api.mercadolibre.com"

# Lock para evitar race conditions ao renovar o token
token_refresh_lock = asyncio.Lock()

# Rate limiting stats
class MLApiStats:
    _success = 0
    _errors = 0
    _rate_limited = 0
    _token_refreshes = 0
    
    @classmethod
    def record_success(cls): cls._success += 1
    @classmethod
    def record_error(cls): cls._errors += 1
    @classmethod
    def record_rate_limit(cls): cls._rate_limited += 1
    @classmethod
    def record_token_refresh(cls): cls._token_refreshes += 1
    
    @classmethod
    def get_stats(cls) -> Dict[str, Any]:
        total = cls._success + cls._errors
        success_rate = f"{(cls._success / total * 100):.1f}%" if total > 0 else "0%"
        return {
            "total_requests": total,
            "success": cls._success,
            "errors": cls._errors,
            "rate_limited": cls._rate_limited,
            "token_refreshes": cls._token_refreshes,
            "success_rate": success_rate
        }

    @classmethod
    def reset(cls):
        cls._success = 0
        cls._errors = 0
        cls._rate_limited = 0
        cls._token_refreshes = 0

async def refresh_access_token() -> Optional[str]:
    """
    Usa o refresh_token para obter um novo access_token da API do Mercado Livre.
    Salva os novos tokens no armazenamento.
    """
    async with token_refresh_lock:
        print("[ML_API] 🔄 Iniciando a renovação do token de acesso...")
        
        # Lê as credenciais do ambiente
        client_id = os.getenv("MERCADO_LIVRE_APP_ID")
        client_secret = os.getenv("MERCADO_LIVRE_CLIENT_SECRET")
        
        # Lê o refresh token atual do arquivo. Se não existir, usa o inicial do ambiente.
        _, refresh_token = token_manager.read_tokens()
        if not refresh_token:
            refresh_token = os.getenv("MERCADO_LIVRE_REFRESH_TOKEN")

        if not all([client_id, client_secret, refresh_token]):
            print("[ML_API] ❌ Erro Crítico: APP_ID, CLIENT_SECRET e REFRESH_TOKEN devem ser configurados.")
            return None

        url = f"{ML_API_BASE_URL}/oauth/token"
        payload = {
            'grant_type': 'refresh_token',
            'client_id': client_id,
            'client_secret': client_secret,
            'refresh_token': refresh_token
        }
        headers = {'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json'}

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                response = await client.post(url, data=payload, headers=headers)

            if response.status_code == 200:
                new_token_data = response.json()
                token_manager.write_tokens(new_token_data)
                MLApiStats.record_token_refresh()
                print("[ML_API] ✅ Token renovado com sucesso.")
                return new_token_data.get('access_token')
            else:
                print(f"[ML_API] ❌ Falha ao renovar o token. Status: {response.status_code}, Resposta: {response.text}")
                return None
        except Exception as e:
            print(f"[ML_API] ❌ Exceção ao renovar o token: {e}")
            return None

async def get_access_token() -> Optional[str]:
    """
    Obtém o access_token do armazenamento. Se não existir, aciona a renovação.
    """
    access_token, _ = token_manager.read_tokens()
    if not access_token:
        print("[ML_API] Token de acesso não encontrado no armazenamento. Tentando renovar...")
        return await refresh_access_token()
    return access_token

def extract_item_id(url: str) -> Optional[str]:
    match = re.search(r'/p/(ML[A-Z]\d+)', url) or re.search(r'(ML[A-Z])-?(\d+)', url)
    if match:
        # Lida com os dois padrões de regex
        return match.group(1) if '/p/' in match.string else f"{match.group(1)}{match.group(2)}"
    return None

async def fetch_product_from_api(item_id: str, retry: bool = True) -> Optional[Dict[str, Any]]:
    """
    Busca informações do produto na API, com lógica de retry após renovação de token.
    """
    access_token = await get_access_token()
    if not access_token:
        return None

    url = f"{ML_API_BASE_URL}/items/{item_id}"
    headers = {"Authorization": f"Bearer {access_token}"}

    try:
        async with httpx.AsyncClient(timeout=10, headers=headers) as client:
            response = await client.get(url)

        # Se o token expirou (Unauthorized/Forbidden) e ainda podemos tentar de novo
        if response.status_code in [401, 403] and retry:
            print(f"[ML_API] ⚠️ Token possivelmente expirado (status {response.status_code}). Tentando renovar...")
            new_access_token = await refresh_access_token()
            if new_access_token:
                # Tenta a chamada novamente, mas sem permitir outro retry.
                return await fetch_product_from_api(item_id, retry=False)
            return None

        if response.status_code == 429:
            MLApiStats.record_rate_limit()
            print(f"[ML_API] ⚠️ Rate limit atingido para {item_id}")
            return None
        
        if response.status_code != 200:
            MLApiStats.record_error()
            print(f"[ML_API] ❌ Erro {response.status_code} para {item_id}. Resposta: {response.text[:200]}")
            return None
        
        data = response.json()
        title = data.get("title", "")
        price = data.get("price", 0)
        
        pictures = data.get("pictures", [])
        image_url = pictures[0].get("secure_url") if pictures else data.get("thumbnail")

        if title and price:
            MLApiStats.record_success()
            print(f"[ML_API] ✅ Sucesso: {title[:50]}... - R$ {price}")
            return {"title": title, "price": float(price), "imageUrl": image_url}
        
        MLApiStats.record_error()
        return None
            
    except httpx.TimeoutException:
        MLApiStats.record_error()
        print(f"[ML_API] ⏱️ Timeout para {item_id}")
        return None
    except Exception as e:
        MLApiStats.record_error()
        print(f"[ML_API] ❌ Exceção em fetch_product_from_api: {e}")
        return None

async def get_product_info(url: str) -> Optional[Dict[str, Any]]:
    item_id = extract_item_id(url)
    if not item_id:
        print(f"[ML_API] ❌ Não foi possível extrair ID da URL: {url[:50]}...")
        return None
    
    print(f"[ML_API] 🔍 Buscando produto: {item_id}")
    return await fetch_product_from_api(item_id)
