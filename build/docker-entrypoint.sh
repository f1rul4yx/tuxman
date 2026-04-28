#!/bin/sh
# =============================================
# 🐧 TUXMAN - Entrypoint Script
# =============================================
# Este script espera a que PostgreSQL esté listo
# antes de iniciar la aplicación

set -e

echo "🔄 Esperando a que PostgreSQL esté disponible..."

# Esperar a que la base de datos esté lista
MAX_RETRIES=30
RETRY_COUNT=0

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1 || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "⏳ Intento $RETRY_COUNT/$MAX_RETRIES: PostgreSQL no está listo todavía..."
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Error: No se pudo conectar a PostgreSQL después de $MAX_RETRIES intentos"
  exit 1
fi

echo "✅ PostgreSQL está listo!"
echo "🚀 Iniciando TuxMan..."

# Ejecutar el comando pasado como argumentos (CMD del Dockerfile)
exec "$@"
