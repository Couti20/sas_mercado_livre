#!/bin/bash
# ==============================================
# Script de Monitoramento de Saúde do Sistema
# Execute via cron: */5 * * * * /path/to/health-check.sh
# ==============================================

# Configurações
BACKEND_URL="http://localhost:8080/actuator/health"
SCRAPER_URL="http://localhost:8000/health"
FRONTEND_URL="http://localhost:80"
ALERT_EMAIL="${NOTIFICATION_EMAIL:-admin@example.com}"
LOG_FILE="/var/log/price-monitor-health.log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a $LOG_FILE
}

check_service() {
    local name=$1
    local url=$2
    local response
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✅ $name: OK${NC}"
        return 0
    else
        echo -e "${RED}❌ $name: FALHOU (HTTP $response)${NC}"
        log "ALERTA: $name está offline (HTTP $response)"
        return 1
    fi
}

check_docker_container() {
    local name=$1
    local status
    
    status=$(docker inspect -f '{{.State.Status}}' "$name" 2>/dev/null)
    
    if [ "$status" = "running" ]; then
        echo -e "${GREEN}✅ Container $name: rodando${NC}"
        return 0
    else
        echo -e "${RED}❌ Container $name: $status${NC}"
        log "ALERTA: Container $name não está rodando ($status)"
        return 1
    fi
}

check_scraper_stats() {
    local stats
    stats=$(curl -s --max-time 10 "http://localhost:8000/stats" 2>/dev/null)
    
    if [ -n "$stats" ]; then
        local success_rate=$(echo $stats | grep -o '"success_rate":"[^"]*"' | cut -d'"' -f4)
        local blocked=$(echo $stats | grep -o '"blocked":[0-9]*' | cut -d':' -f2)
        local warning=$(echo $stats | grep -o '"warning":"[^"]*"' | cut -d'"' -f4)
        
        echo -e "${YELLOW}📊 Scraper Stats:${NC}"
        echo "   Taxa de sucesso: $success_rate"
        echo "   Bloqueios: $blocked"
        
        if [ -n "$warning" ] && [ "$warning" != "null" ]; then
            echo -e "${RED}   ⚠️ ALERTA: $warning${NC}"
            log "ALERTA SCRAPER: $warning"
        fi
    fi
}

# ==============================================
# EXECUÇÃO
# ==============================================

echo "=========================================="
echo "🔍 Verificação de Saúde do Sistema"
echo "   $(date)"
echo "=========================================="

ERRORS=0

# Verificar containers Docker
echo ""
echo "📦 Containers Docker:"
check_docker_container "price-monitor-db" || ((ERRORS++))
check_docker_container "price-monitor-scraper" || ((ERRORS++))
check_docker_container "price-monitor-backend" || ((ERRORS++))
check_docker_container "price-monitor-frontend" || ((ERRORS++))

# Verificar endpoints HTTP
echo ""
echo "🌐 Endpoints HTTP:"
check_service "Backend" "$BACKEND_URL" || ((ERRORS++))
check_service "Scraper" "$SCRAPER_URL" || ((ERRORS++))
check_service "Frontend" "$FRONTEND_URL" || ((ERRORS++))

# Verificar estatísticas do scraper
echo ""
check_scraper_stats

# Resumo
echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Sistema 100% operacional${NC}"
else
    echo -e "${RED}❌ $ERRORS problema(s) detectado(s)${NC}"
    log "RESUMO: $ERRORS problemas detectados"
    
    # TODO: Enviar email de alerta
    # echo "Problemas detectados no MonitoraPreço" | mail -s "ALERTA: Sistema com problemas" $ALERT_EMAIL
fi
echo "=========================================="
