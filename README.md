# 🐧 TuxMan - El Pac-Man de Linux

Juego web tipo Pac-Man con temática Linux. Incluye sistema de usuarios, tienda de skins, dos modos de juego y ranking global.

![TuxMan](https://img.shields.io/badge/Docker-Ready-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Version](https://img.shields.io/badge/Version-2.0-orange)

---

## 📋 Índice

1. [Novedades v2.0](#-novedades-v20)
2. [Construir y subir la imagen](#-paso-1-construir-y-subir-la-imagen)
3. [Desplegar en cualquier servidor](#-paso-2-desplegar-en-cualquier-servidor)
4. [Migrar desde v1.0](#-migrar-desde-v10)
5. [Comandos útiles](#-comandos-útiles)
6. [Estructura del proyecto](#-estructura-del-proyecto)
7. [API REST](#-api-rest)

---

## 🎮 Novedades v2.0

### Dos Modos de Juego

**🔄 Modo Infinite (Infinito)**
- Juego continuo sin fin
- Al morir, vuelves al nivel 1
- Compite por la mejor puntuación total
- Ideal para partidas rápidas

**🏆 Modo Kernel (Campaña)**
- Sistema de checkpoints cada 5 niveles
- Si mueres en el nivel 18, vuelves al nivel 15
- Progreso guardado automáticamente
- Ranking por nivel alcanzado

### Mejoras de Jugabilidad

- **IA de Fantasmas Mejorada**: Cada fantasma (systemd, cron, init, sshd) tiene personalidad única
  - systemd: Agresivo, te persigue directamente
  - cron: Patrullador, predice tus movimientos
  - init: Emboscador, intenta cortarte el paso
  - sshd: Aleatorio, comportamiento impredecible
- **Sistema de Liberación Escalonada**: Los fantasmas salen de la casa en intervalos (0s, 3s, 6s, 9s)
- **Sistema de Audio**: Efectos de sonido con Web Audio API
- **Controles de Volumen**: Ajusta el volumen o silencia completamente
- **Responsive**: Optimizado para móviles con controles táctiles
- **Fantasmas Parpadeantes**: Visual cuando el power-up está por acabar

### Mejoras Técnicas

- **Economía Balanceada**: Tokens = Puntuación / 100
- **Rankings Separados**: Leaderboards independientes por modo
- **Persistencia de Configuración**: LocalStorage para preferencias
- **Mejor Performance**: Optimizaciones en el game loop

---

## 🔨 PASO 1: Construir y subir la imagen

Ejecuta estos comandos en la carpeta del proyecto:

```bash
# 1. Entrar a la carpeta del proyecto
cd tuxman

# 2. Hacer login en Docker Hub
docker login

# 3. Construir la imagen (cambia TUUSUARIO por tu usuario de Docker Hub)
docker build -t TUUSUARIO/tuxman:2.0 ./build

# 4. También etiquetar como latest
docker tag TUUSUARIO/tuxman:2.0 TUUSUARIO/tuxman:latest

# 5. Subir ambas etiquetas a Docker Hub
docker push TUUSUARIO/tuxman:2.0
docker push TUUSUARIO/tuxman:latest
```

### Ejemplo real:
```bash
docker login
# Introduce tu usuario y contraseña de Docker Hub

docker build -t f1rul4yx/tuxman:2.0 ./build
# Building...

docker tag f1rul4yx/tuxman:2.0 f1rul4yx/tuxman:latest

docker push f1rul4yx/tuxman:2.0
docker push f1rul4yx/tuxman:latest
# Pushing...
```

✅ **Listo!** Tu imagen ya está en Docker Hub.

---

## 🚀 PASO 2: Desplegar en cualquier servidor

Solo necesitas el archivo `docker-compose.yml`. Puedes descargarlo o copiarlo.

### 2.1 Editar el docker-compose.yml

Abre el archivo y cambia estas 3 cosas:

```yaml
services:
  db:
    environment:
      POSTGRES_PASSWORD: TuPasswordSegura123      # 👈 CAMBIA ESTO

  app:
    image: f1rul4yx/tuxman:2.0                    # 👈 PON TU USUARIO Y VERSIÓN
    environment:
      JWT_SECRET: CambiaEstoCon32CaracteresMinimo # 👈 CAMBIA ESTO
      DB_PASSWORD: TuPasswordSegura123            # 👈 IGUAL QUE ARRIBA
```

### 2.2 Levantar los servicios

```bash
# Descargar las imágenes y arrancar
docker-compose up -d

# Ver que todo está corriendo
docker-compose ps
```

### 2.3 Acceder al juego

Abre en tu navegador: **http://localhost:3000**

O si es un servidor remoto: **http://IP-DEL-SERVIDOR:3000**

---

## 🔄 Migrar desde v1.0

Si ya tienes TuxMan v1.0 en producción con usuarios existentes, sigue estos pasos:

### Paso 1: Hacer backup de la base de datos

```bash
# Backup completo
docker exec tuxman-db pg_dump -U tuxman tuxman > backup_v1.sql
```

### Paso 2: Aplicar migración SQL

La v2.0 añade nuevos campos a la tabla `users`. Descarga el script de migración:

```bash
# Copiar el script al contenedor
docker cp migration.sql tuxman-db:/migration.sql

# Ejecutar la migración
docker exec -i tuxman-db psql -U tuxman -d tuxman -f /migration.sql
```

### Paso 3: Actualizar la imagen

```bash
# Editar docker-compose.yaml y cambiar la versión de la imagen
# image: f1rul4yx/tuxman:1.0  ->  image: f1rul4yx/tuxman:2.0

# Actualizar contenedores
docker compose pull
docker compose up -d
```

### Paso 4: Verificar

```bash
# Ver logs
docker compose logs -f app

# Verificar que la app arranca correctamente
curl http://localhost:3000/api/health
```

**✅ Migración completada**

Tus usuarios mantienen:
- Contraseñas y cuentas
- Monedas y tokens
- Skins compradas
- Puntuación best_score (se mantiene como Infinite)
- Historial de partidas

Nuevas características disponibles:
- Modo Kernel/Campaña con checkpoints
- Contadores separados por modo
- Rankings independientes
- IA de fantasmas mejorada

---

## 🛠️ Comandos útiles

```bash
# Ver estado de los contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs solo de la app
docker-compose logs -f app

# Reiniciar todo
docker-compose restart

# Parar todo
docker-compose down

# Parar y BORRAR todos los datos (base de datos incluida)
docker-compose down -v

# Actualizar a una nueva versión de la imagen
docker-compose pull
docker-compose up -d
```

---

## 📁 Estructura del proyecto

```
tuxman/
├── docker-compose.yaml      # Orquestación de contenedores
├── migration.sql            # Script de migración v1.0 → v2.0
├── README.md                # Este archivo
└── build/                   # Código fuente (para construir la imagen)
    ├── Dockerfile           # Imagen optimizada con Alpine
    ├── entrypoint.sh        # Script de inicialización
    ├── .dockerignore        # Excluir archivos innecesarios
    └── app/                 # Aplicación Node.js
        ├── package.json     # Dependencias
        ├── server.js        # API REST (Express + PostgreSQL)
        └── public/
            └── index.html   # Frontend del juego (Canvas + Web Audio)
```

---

## 🔌 API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener usuario actual |
| POST | `/api/game/save` | Guardar partida (requiere `mode`, `score`, `level`, `checkpoint`) |
| POST | `/api/shop/buy` | Comprar skin |
| POST | `/api/shop/equip` | Equipar skin |
| GET | `/api/leaderboard?mode=infinite` | Ranking modo Infinite (por puntuación) |
| GET | `/api/leaderboard?mode=campaign` | Ranking modo Kernel (por nivel alcanzado) |
| GET | `/api/health` | Estado del servidor |

### Ejemplo: Guardar Partida

```json
POST /api/game/save
Authorization: Bearer <token>

{
  "mode": "campaign",
  "score": 15420,
  "level": 18,
  "checkpoint": 15
}
```

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (salt rounds: 10)
- ✅ Autenticación con JWT (expira en 7 días)
- ✅ Base de datos solo accesible internamente (red bridge)
- ✅ Contenedor ejecuta como usuario no-root (nodejs:1001)
- ✅ Variables de entorno para secretos
- ✅ Healthchecks automáticos
- ✅ PostgreSQL 16 con encoding UTF-8

## 🎨 Características del Juego

- **Canvas HTML5**: Renderizado eficiente con requestAnimationFrame
- **Web Audio API**: Generación procedural de sonidos
- **LocalStorage**: Persistencia de configuración local
- **Responsive Design**: Adaptado a móviles y tablets
- **Game Loop Optimizado**: 60 FPS con deltaTime
- **Pathfinding**: Algoritmo A* simplificado para fantasmas
- **Colisiones**: Detección basada en distancia
- **Power-ups**: Sistema temporal con temporizador visual

---

## ⚙️ Variables de Entorno

Puedes personalizar la configuración editando `docker-compose.yaml`:

### Base de Datos
```yaml
POSTGRES_USER: tuxman              # Usuario de PostgreSQL
POSTGRES_PASSWORD: ${DB_PASSWORD}  # Contraseña (CAMBIAR)
POSTGRES_DB: tuxman                # Nombre de la base de datos
```

### Aplicación
```yaml
NODE_ENV: production               # Entorno (production/development)
PORT: 3000                         # Puerto interno
APP_PORT: 3000                     # Puerto expuesto (modificable)
JWT_SECRET: ${JWT_SECRET}          # Secret para tokens JWT (CAMBIAR, min 32 chars)
DB_HOST: db                        # Host de la BD (nombre del servicio)
DB_PORT: 5432                      # Puerto de PostgreSQL
DB_USER: tuxman                    # Usuario de la BD
DB_PASSWORD: ${DB_PASSWORD}        # Contraseña de la BD (igual que arriba)
DB_NAME: tuxman                    # Nombre de la BD
```

### Ejemplo con archivo .env

Crea un archivo `.env` en la raíz:

```env
DB_PASSWORD=MiPasswordSuperSegura123!
JWT_SECRET=UnSecretoMuyLargoDe32CaracteresOMas12345
APP_PORT=3000
```

Y docker-compose tomará estos valores automáticamente.

---

## 🐛 Problemas comunes

**La app no arranca / no conecta a la BD**
```bash
# Ver logs para identificar el error
docker-compose logs app
docker-compose logs db

# Reiniciar todo
docker-compose down
docker-compose up -d
```

**Olvidé mi contraseña de la BD**
```bash
# Borrar todo y empezar de nuevo
docker-compose down -v
docker-compose up -d
```

**Quiero cambiar el puerto**
```yaml
# En docker-compose.yaml, cambia:
ports:
  - "8080:3000"   # Ahora estará en el puerto 8080
```

**Los fantasmas no salen de la casa**
```bash
# Asegúrate de estar usando la versión 2.0
docker compose ps

# Verifica la imagen
docker images | grep tuxman

# Forzar actualización
docker compose down
docker compose pull
docker compose up -d
```

**Error al migrar desde v1.0**
```bash
# Si ya aplicaste la migración y da error de columnas duplicadas
# La migración usa IF NOT EXISTS, puedes ejecutarla varias veces sin problema

# Verificar columnas actuales
docker exec -it tuxman-db psql -U tuxman -d tuxman -c "\d users"
```

**El audio no funciona**
- El audio requiere interacción del usuario (click en START)
- Verifica que no esté silenciado en el panel de configuración
- Algunos navegadores bloquean autoplay, esto es normal

---

## 📝 Changelog

### v2.0 (2026-01)
- ✨ Dos modos de juego (Infinite y Kernel/Campaign)
- 🤖 IA mejorada con 4 personalidades únicas de fantasmas
- 🔊 Sistema de audio con Web Audio API
- 📱 Optimización para dispositivos móviles
- 💾 Sistema de checkpoints y guardado automático
- 🏆 Rankings separados por modo
- ⚖️ Economía balanceada (tokens = score/100)
- 🎨 Mejoras visuales (fantasmas parpadeantes, etc.)
- 📊 Estadísticas separadas por modo de juego

### v1.0 (2025-12)
- 🎮 Juego base tipo Pac-Man
- 👤 Sistema de usuarios y autenticación
- 🛒 Tienda de skins
- 🏅 Ranking global
- 🐳 Despliegue con Docker

---

## 📝 Licencia

MIT - Haz lo que quieras con el código.

---

Desarrollado para ASIR - IES Gonzalo Nazareno 🐧

**Repositorio**: [github.com/f1rul4yx/tuxman](https://github.com/f1rul4yx/tuxman)
**Docker Hub**: [hub.docker.com/r/f1rul4yx/tuxman](https://hub.docker.com/r/f1rul4yx/tuxman)
