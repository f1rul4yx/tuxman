# =============================================
# 🐧 TUXMAN - Dockerfile con Buenas Prácticas
# =============================================

# Usar imagen base oficial de Node.js Alpine (ligera y segura)
FROM node:20-alpine

# Metadata de la imagen
LABEL maintainer="Diego - ASIR" \
      description="TuxMan - Juego Pac-Man con temática Linux" \
      version="2.1.0"

# Instalar dependencias necesarias (curl para healthcheck, postgresql-client para entrypoint)
RUN apk add --no-cache curl postgresql-client

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias primero (mejor cache de Docker)
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev && \
    npm cache clean --force

# Copiar el resto de la aplicación
COPY . ./

# Copiar script de entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs && \
    chown -R nodejs:nodejs /app

# Cambiar a usuario no-root
USER nodejs

# Puerto expuesto
EXPOSE 3000

# Healthcheck para verificar que la app está funcionando
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Usar ENTRYPOINT para el script de inicialización
ENTRYPOINT ["docker-entrypoint.sh"]

# CMD para ejecutar la aplicación
CMD ["node", "src/server.js"]
