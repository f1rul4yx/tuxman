# 🔄 Guía de Migración v1.0 → v2.0

## 📋 Resumen de Cambios

### Tabla `users` - 5 columnas nuevas:
- `best_score_campaign` - Mejor puntuación en modo campaña
- `highest_level_campaign` - Nivel más alto alcanzado en campaña
- `current_checkpoint_campaign` - Checkpoint actual guardado
- `games_played_infinite` - Contador de partidas en modo infinito
- `games_played_campaign` - Contador de partidas en modo campaña

### Tabla `game_history` - 1 columna nueva:
- `game_mode` - Modo de juego ('infinite' o 'campaign')

---

## ⚠️ PASO 0: BACKUP (OBLIGATORIO)

```bash
# Hacer backup completo de la base de datos
docker exec tuxman-db pg_dump -U tuxman tuxman > backup_v1_$(date +%Y%m%d_%H%M%S).sql

# Verificar que el backup se creó correctamente
ls -lh backup_v1_*.sql
```

**¡IMPORTANTE!** No continues sin tener un backup válido.

---

## 🔧 PASO 1: Aplicar Migración SQL

### Opción A: Desde tu máquina local (recomendado)

```bash
# 1. Copiar el script de migración al contenedor
docker cp migration.sql tuxman-db:/migration.sql

# 2. Ejecutar el script
docker exec -i tuxman-db psql -U tuxman -d tuxman -f /migration.sql

# Verás la salida con las verificaciones
```

### Opción B: Desde dentro del contenedor

```bash
# 1. Copiar el script
docker cp migration.sql tuxman-db:/tmp/migration.sql

# 2. Entrar al contenedor
docker exec -it tuxman-db bash

# 3. Ejecutar la migración
psql -U tuxman -d tuxman -f /tmp/migration.sql

# 4. Salir
exit
```

### Opción C: Línea por línea (si tienes problemas)

```bash
# Conectar a PostgreSQL
docker exec -it tuxman-db psql -U tuxman -d tuxman

# Copiar y pegar el contenido de migration.sql línea por línea
# Ctrl+D para salir cuando termines
```

---

## ✅ PASO 2: Verificar la Migración

```bash
# Conectar a la base de datos
docker exec -it tuxman-db psql -U tuxman -d tuxman
```

Ejecuta estos comandos para verificar:

```sql
-- Verificar columnas de users
\d users

-- Deberías ver las 5 columnas nuevas:
-- best_score_campaign
-- highest_level_campaign
-- current_checkpoint_campaign
-- games_played_infinite
-- games_played_campaign

-- Verificar columnas de game_history
\d game_history

-- Deberías ver la columna:
-- game_mode

-- Ver tus usuarios con los nuevos campos
SELECT username, coins, best_score,
       best_score_campaign, highest_level_campaign,
       games_played_infinite
FROM users;

-- Ver el historial de partidas con el modo
SELECT id, user_id, score, level, game_mode, played_at
FROM game_history
ORDER BY id DESC
LIMIT 10;

-- Salir
\q
```

---

## 🚀 PASO 3: Actualizar la Aplicación

### 3.1 Editar docker-compose.yaml

```bash
nano docker-compose.yaml
```

Cambia la línea de la imagen:

```yaml
# ANTES:
image: f1rul4yx/tuxman:1.0

# DESPUÉS:
image: f1rul4yx/tuxman:2.0
```

### 3.2 Descargar nueva imagen y reiniciar

```bash
# Descargar la nueva imagen
docker compose pull app

# Ver que se descargó correctamente
docker images | grep tuxman

# Reiniciar solo el contenedor de la app
docker compose up -d app

# Ver los logs en tiempo real
docker compose logs -f app
```

**Espera a ver:** `✅ Servidor corriendo en puerto 3000`

---

## 🧪 PASO 4: Probar la Aplicación

### 4.1 Verificar que el servidor responde

```bash
# Healthcheck
curl http://localhost:3000/api/health

# Deberías ver: {"status":"ok"}
```

### 4.2 Probar en el navegador

1. Abre: `http://TU_IP:3000` o `http://localhost:3000`
2. Inicia sesión con un usuario existente
3. Verifica que puedes ver:
   - Botones "INFINITE" y "KERNEL"
   - Tus monedas y estadísticas
   - El juego funciona correctamente

### 4.3 Probar ambos modos

1. Juega una partida en modo **INFINITE**
2. Muere y verifica que vuelves al nivel 1
3. Cambia a modo **KERNEL**
4. Juega hasta el nivel 6 (checkpoint en nivel 5)
5. Muere y verifica que vuelves al nivel 5

---

## 📊 PASO 5: Verificar Datos Migrados

```bash
docker exec -it tuxman-db psql -U tuxman -d tuxman
```

```sql
-- Ver estadísticas migradas
SELECT
    username,
    games_played AS "Partidas antiguas",
    games_played_infinite AS "Partidas infinite",
    games_played_campaign AS "Partidas campaign",
    best_score AS "Mejor score",
    coins AS "Monedas"
FROM users
ORDER BY id;

-- Ver partidas antiguas marcadas como 'infinite'
SELECT COUNT(*) as "Partidas marcadas infinite"
FROM game_history
WHERE game_mode = 'infinite';

-- Salir
\q
```

---

## 🎮 Nuevas Características Disponibles

Después de migrar, tus usuarios tendrán acceso a:

✅ **Modo Infinite**: Juego continuo, vuelve a nivel 1 al morir
✅ **Modo Kernel**: Sistema de checkpoints cada 5 niveles
✅ **IA Mejorada**: 4 fantasmas con personalidades únicas
✅ **Sistema de Audio**: Efectos de sonido con controles de volumen
✅ **Rankings Separados**: Leaderboard por modo de juego
✅ **Optimización Móvil**: Mejor experiencia en tablets y móviles

---

## 🐛 Solución de Problemas

### Error: "column already exists"

No pasa nada, significa que la columna ya fue añadida. El script usa `IF NOT EXISTS` para ser seguro.

### Error: "relation game_history does not exist"

Tu versión v1.0 no tiene game_history. Actualiza primero la app y la tabla se creará automáticamente.

### La app no arranca después de actualizar

```bash
# Ver logs detallados
docker compose logs app

# Si hay error de conexión a BD, reiniciar todo
docker compose restart

# Si persiste, volver atrás temporalmente
docker compose down
# Cambiar a image: f1rul4yx/tuxman:1.0 en docker-compose.yaml
docker compose up -d
```

### Los usuarios no ven los nuevos modos

1. Verificar que la app se actualizó: `docker images | grep tuxman`
2. Forzar recarga en el navegador: `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)
3. Limpiar caché del navegador

### Quiero volver a v1.0

```bash
# Parar los contenedores
docker compose down

# Restaurar backup
docker compose up -d db
docker exec -i tuxman-db psql -U tuxman -d tuxman < backup_v1_FECHA.sql

# Cambiar docker-compose.yaml a image: f1rul4yx/tuxman:1.0
nano docker-compose.yaml

# Reiniciar
docker compose up -d
```

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs: `docker compose logs -f`
2. Verifica la estructura de las tablas: `\d users` y `\d game_history`
3. Confirma que el backup existe antes de hacer cambios
4. Lee los mensajes de error completos

---

**✅ ¡Migración completada con éxito!**

Tus usuarios conservan:
- 💰 Todas sus monedas
- 🎨 Todas sus skins compradas
- 🏆 Su mejor puntuación (ahora en modo infinite)
- 📊 Su historial de partidas

Y ahora tienen acceso a las nuevas características de v2.0.
