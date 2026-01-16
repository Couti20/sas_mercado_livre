#!/bin/bash
# ==============================================
# Script de Backup Automático do Banco de Dados
# Execute via cron: 0 3 * * * /path/to/backup-db.sh
# ==============================================

# Configurações
BACKUP_DIR="/backups"
DB_CONTAINER="price-monitor-db"
DB_NAME="pricedb"
DB_USER="postgres"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${DATE}.sql"
RETENTION_DAYS=7

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

echo "📦 Iniciando backup do banco de dados..."
echo "   Data: $(date)"
echo "   Arquivo: $BACKUP_FILE"

# Executar backup
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

# Verificar se backup foi criado
if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
    # Comprimir backup
    gzip $BACKUP_FILE
    echo "✅ Backup criado com sucesso: ${BACKUP_FILE}.gz"
    
    # Remover backups antigos (mais de 7 dias)
    echo "🧹 Removendo backups com mais de $RETENTION_DAYS dias..."
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    
    # Listar backups existentes
    echo "📋 Backups disponíveis:"
    ls -lh $BACKUP_DIR/*.gz 2>/dev/null || echo "   Nenhum backup encontrado"
else
    echo "❌ ERRO: Falha ao criar backup!"
    exit 1
fi

echo "✅ Backup concluído!"
