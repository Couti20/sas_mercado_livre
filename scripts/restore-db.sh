#!/bin/bash
# ==============================================
# Script de Restauração de Backup
# Uso: ./restore-db.sh [arquivo_backup.sql.gz]
# ==============================================

BACKUP_DIR="/backups"
DB_CONTAINER="price-monitor-db"
DB_NAME="pricedb"
DB_USER="postgres"

# Verificar se arquivo foi passado como argumento
if [ -z "$1" ]; then
    echo "📋 Backups disponíveis:"
    ls -lht $BACKUP_DIR/*.gz 2>/dev/null || echo "   Nenhum backup encontrado"
    echo ""
    echo "Uso: $0 <arquivo_backup.sql.gz>"
    echo "Exemplo: $0 ${BACKUP_DIR}/backup_20260115_030000.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

# Verificar se arquivo existe
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Erro: Arquivo não encontrado: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  ATENÇÃO: Isso vai SUBSTITUIR todos os dados atuais!"
echo "   Arquivo: $BACKUP_FILE"
read -p "   Tem certeza? (digite 'SIM' para confirmar): " confirm

if [ "$confirm" != "SIM" ]; then
    echo "❌ Operação cancelada."
    exit 1
fi

echo ""
echo "📦 Iniciando restauração..."

# Descomprimir se necessário
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "   Descomprimindo arquivo..."
    gunzip -k "$BACKUP_FILE"
    SQL_FILE="${BACKUP_FILE%.gz}"
else
    SQL_FILE="$BACKUP_FILE"
fi

# Parar backend para evitar conflitos
echo "   Parando backend..."
docker stop price-monitor-backend 2>/dev/null

# Restaurar banco
echo "   Restaurando banco de dados..."
cat "$SQL_FILE" | docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME

# Reiniciar backend
echo "   Reiniciando backend..."
docker start price-monitor-backend

# Limpar arquivo SQL temporário
if [[ "$BACKUP_FILE" == *.gz ]]; then
    rm -f "$SQL_FILE"
fi

echo ""
echo "✅ Restauração concluída!"
echo "   Verifique o sistema em: http://localhost:80"
