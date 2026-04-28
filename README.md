# tuxman

Juego web tipo Pac-Man con temática Linux.

## Qué es

Clon de Pac-Man en el que el personaje es Tux, el pingüino de Linux. Tiene sistema de usuarios con JWT, tienda de skins con tokens (tokens = puntuación / 100), dos modos de juego (Infinite y Kernel/Campaña con checkpoints cada 5 niveles) y rankings globales. Los fantasmas son demonios de Linux (systemd, cron, init, sshd) con IA propia.

## Instalación

```bash
git clone https://github.com/f1rul4yx/tuxman.git
cd tuxman
```

Crea un archivo `.env` con las variables obligatorias:

```env
DB_PASSWORD=MiPasswordSegura123
JWT_SECRET=UnSecretoMuyLargoDe32CaracteresOMas
APP_PORT=3000
```

Variables de entorno disponibles:

| Variable | Por defecto | Descripción |
|---|---|---|
| `APP_PORT` | `3000` | Puerto expuesto |
| `JWT_SECRET` | — | Secret JWT (mín. 32 caracteres) |
| `DB_PASSWORD` | — | Contraseña de PostgreSQL |
| `DB_HOST` | `db` | Host de la base de datos |
| `DB_PORT` | `5432` | Puerto de PostgreSQL |
| `DB_USER` | `tuxman` | Usuario de la base de datos |
| `DB_NAME` | `tuxman` | Nombre de la base de datos |

## Uso

```bash
docker compose up -d
```

Accede a `http://TU_IP:3000` y regístrate desde la pantalla de inicio.

```bash
docker compose down       # Parar
docker compose restart    # Reiniciar
docker compose logs -f    # Ver logs
```

## Build

```bash
docker build -t f1rul4yx/tuxman:latest ./build
docker push f1rul4yx/tuxman:latest
```
