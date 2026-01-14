# 🐧 TuxMan - El Pac-Man de Linux

Juego web tipo Pac-Man con temática Linux. Incluye sistema de usuarios, tienda de skins y ranking global.

![TuxMan](https://img.shields.io/badge/Docker-Ready-blue) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Índice

1. [Construir y subir la imagen](#-paso-1-construir-y-subir-la-imagen)
2. [Desplegar en cualquier servidor](#-paso-2-desplegar-en-cualquier-servidor)
3. [Comandos útiles](#-comandos-útiles)
4. [Estructura del proyecto](#-estructura-del-proyecto)
5. [API REST](#-api-rest)

---

## 🔨 PASO 1: Construir y subir la imagen

Ejecuta estos comandos en la carpeta del proyecto:

```bash
# 1. Entrar a la carpeta
cd tuxman-final

# 2. Hacer login en Docker Hub
docker login

# 3. Construir la imagen (cambia TUUSUARIO por tu usuario de Docker Hub)
docker build -t TUUSUARIO/tuxman:latest ./backend

# 4. Subir la imagen a Docker Hub
docker push TUUSUARIO/tuxman:latest
```

### Ejemplo real:
```bash
docker login
# Introduce tu usuario y contraseña de Docker Hub

docker build -t diegoasir/tuxman:latest ./backend
# Building...

docker push diegoasir/tuxman:latest
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
    image: TUUSUARIO/tuxman:latest                # 👈 PON TU USUARIO
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
tuxman-final/
├── docker-compose.yml       # Para desplegar (usa la imagen de Docker Hub)
├── README.md                # Este archivo
└── backend/                 # Código fuente (para construir la imagen)
    ├── Dockerfile
    ├── package.json
    ├── server.js            # API REST (Node.js + Express)
    ├── .dockerignore
    └── public/
        └── index.html       # El juego (frontend)
```

---

## 🔌 API REST

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Obtener usuario actual |
| POST | `/api/game/save` | Guardar partida |
| POST | `/api/shop/buy` | Comprar skin |
| POST | `/api/shop/equip` | Equipar skin |
| GET | `/api/leaderboard` | Ver ranking |
| GET | `/api/health` | Estado del servidor |

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación con JWT (expira en 7 días)
- ✅ Base de datos solo accesible internamente
- ✅ Contenedor ejecuta como usuario no-root

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
# En docker-compose.yml, cambia:
ports:
  - "8080:3000"   # Ahora estará en el puerto 8080
```

---

## 📝 Licencia

MIT - Haz lo que quieras con el código.

---

Desarrollado para ASIR - IES Gonzalo Nazareno 🐧
