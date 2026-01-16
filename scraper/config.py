"""
Configurações do Scraper - Ambiente e Produção

Para produção, configure a variável de ambiente SCRAPER_API_KEY
ou altere USE_SCRAPER_API para True e adicione sua chave.

ScraperAPI: https://www.scraperapi.com/ (~$49/mês para 100k requisições)
"""
import os

# ========================================
# Modo de Operação
# ========================================

# True = Usa ScraperAPI (recomendado para produção)
# False = Usa Playwright direto (ok para desenvolvimento)
USE_SCRAPER_API = os.getenv("USE_SCRAPER_API", "false").lower() == "true"

# Chave da ScraperAPI (obtenha em https://www.scraperapi.com/)
SCRAPER_API_KEY = os.getenv("SCRAPER_API_KEY", "")

# ========================================
# Cache de Requisições
# ========================================

# Tempo em segundos para cachear resultados (evita requisições repetidas)
# 1 hora = 3600, 6 horas = 21600, 12 horas = 43200
CACHE_TTL_SECONDS = int(os.getenv("CACHE_TTL_SECONDS", "3600"))

# Habilitar cache
CACHE_ENABLED = os.getenv("CACHE_ENABLED", "true").lower() == "true"

# ========================================
# Delays e Retries
# ========================================

# Delay entre requisições (em segundos) - para evitar bloqueios
MIN_DELAY_SECONDS = float(os.getenv("MIN_DELAY_SECONDS", "1.0"))
MAX_DELAY_SECONDS = float(os.getenv("MAX_DELAY_SECONDS", "2.0"))

# Número máximo de retries
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "2"))

# ========================================
# Rate Limiting
# ========================================

# Máximo de requisições por minuto (0 = sem limite)
MAX_REQUESTS_PER_MINUTE = int(os.getenv("MAX_REQUESTS_PER_MINUTE", "30"))

# ========================================
# Ambiente
# ========================================

# True = produção (mais delays, mais cuidado)
# False = desenvolvimento (mais rápido)
IS_PRODUCTION = os.getenv("IS_PRODUCTION", "false").lower() == "true"

def get_config_summary():
    """Retorna resumo das configurações atuais"""
    return {
        "mode": "ScraperAPI" if USE_SCRAPER_API else "Playwright Direct",
        "scraper_api_configured": bool(SCRAPER_API_KEY),
        "cache_enabled": CACHE_ENABLED,
        "cache_ttl_seconds": CACHE_TTL_SECONDS,
        "delay_range": f"{MIN_DELAY_SECONDS}-{MAX_DELAY_SECONDS}s",
        "max_retries": MAX_RETRIES,
        "rate_limit": f"{MAX_REQUESTS_PER_MINUTE}/min" if MAX_REQUESTS_PER_MINUTE > 0 else "unlimited",
        "is_production": IS_PRODUCTION
    }
