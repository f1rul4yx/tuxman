# 🐧 TuxMan

Juego web tipo Pac-Man con temática Linux. Sistema de usuarios, tienda de skins, dos modos de juego y ranking global.

## Uso

```bash
docker compose up -d
```

Accede a `http://TU_IP:3000`. Regístrate desde la pantalla de inicio.

## Construcción de la imagen

```bash
docker build -t f1rul4yx/tuxman:latest ./build
docker push f1rul4yx/tuxman:latest
```

## Variables de entorno

| Variable | Por defecto | Descripción |
|---|---|---|
| `APP_PORT` | `3000` | Puerto expuesto |
| `JWT_SECRET` | — | Secret para tokens JWT (mín. 32 caracteres) |
| `DB_PASSWORD` | — | Contraseña de PostgreSQL |
| `DB_HOST` | `db` | Host de la base de datos |
| `DB_PORT` | `5432` | Puerto de PostgreSQL |
| `DB_USER` | `tuxman` | Usuario de la base de datos |
| `DB_NAME` | `tuxman` | Nombre de la base de datos |

Crea un archivo `.env` en la raíz con los valores sensibles:

```env
DB_PASSWORD=MiPasswordSegura123
JWT_SECRET=UnSecretoMuyLargoDe32CaracteresOMas
APP_PORT=3000
```

## Comandos útiles

```bash
docker compose up -d       # Arrancar
docker compose down        # Parar
docker compose down -v     # Parar y borrar datos
docker compose restart     # Reiniciar
docker compose logs -f     # Ver logs en tiempo real
docker compose logs -f app # Ver logs solo de la app
docker compose pull        # Actualizar imagen
```

## Funcionalidades

- Dos modos de juego: Infinite (puntuación máxima) y Kernel/Campaña (checkpoints cada 5 niveles)
- IA de fantasmas con 4 personalidades únicas (systemd, cron, init, sshd)
- Sistema de usuarios con autenticación JWT
- Tienda de skins con sistema de tokens (tokens = puntuación / 100)
- Rankings separados por modo de juego
- Efectos de sonido con Web Audio API
- Responsive con controles táctiles para móvil

## Stack

Node.js, Express, PostgreSQL, Docker
