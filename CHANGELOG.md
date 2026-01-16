# Changelog

Todos los cambios notables del proyecto TuxMan serán documentados en este archivo.

## [2.0.0] - 2026-01-17

### Añadido
- **Dos modos de juego**:
  - Modo Infinite: Juego continuo, vuelve a nivel 1 al morir
  - Modo Kernel (Campaign): Sistema de checkpoints cada 5 niveles
- **IA de fantasmas mejorada**:
  - systemd (rojo): Personalidad agresiva, persigue directamente
  - cron (cian): Patrullador, predice movimientos
  - init (naranja): Emboscador, intenta cortar el paso
  - sshd (rosa): Comportamiento aleatorio e impredecible
- **Sistema de liberación escalonada**: Fantasmas salen en intervalos (0s, 3s, 6s, 9s)
- **Sistema de audio completo**:
  - Efectos de sonido con Web Audio API
  - Controles de volumen maestro
  - Toggle de silencio
  - Persistencia de configuración en LocalStorage
- **Optimización móvil**:
  - Canvas escalable responsive
  - Controles táctiles más grandes
  - Interfaz adaptada a pantallas pequeñas
- **Sistema de checkpoints**:
  - Guardado automático cada 5 niveles en modo Campaign
  - Recuperación de progreso al reiniciar
  - Dashboard muestra checkpoint actual
- **Rankings separados**:
  - Leaderboard Infinite: Ordenado por puntuación máxima
  - Leaderboard Kernel: Ordenado por nivel más alto alcanzado
- **Nuevos campos en base de datos**:
  - `best_score_campaign`: Mejor puntuación en campaña
  - `highest_level_campaign`: Nivel más alto en campaña
  - `current_checkpoint_campaign`: Checkpoint actual guardado
  - `games_played_infinite`: Contador de partidas infinite
  - `games_played_campaign`: Contador de partidas campaign
- **Script de migración SQL** (`migration.sql`) para actualizar desde v1.0
- **Efectos visuales**: Fantasmas parpadean cuando el power-up está por acabar (últimos 2 segundos)

### Cambiado
- **Economía balanceada**: Tokens = Puntuación / 100 (antes era / 10)
- **Estructura del proyecto**: Carpeta `backend/` renombrada a `build/`
- **Versión en metadatos**: Actualizada a 2.0 en Dockerfile y package.json
- **Docker Compose**: Imagen actualizada a `f1rul4yx/tuxman:2.0`
- **Comportamiento de fantasmas**: No pueden re-entrar a la casa después de salir (solo al morir)
- **Sistema de reinicio**: Diferente comportamiento según modo (nivel 1 vs checkpoint)
- **API `/api/game/save`**: Ahora requiere parámetros `mode`, `checkpoint`
- **API `/api/leaderboard`**: Ahora acepta parámetro `mode` (infinite/campaign)

### Mejorado
- **Rendimiento del game loop**: Optimizado con mejor gestión de deltaTime
- **Pathfinding de fantasmas**: Salida más rápida y eficiente de la casa
- **Detección de colisiones**: Fantasmas en casa ignorados hasta que salen
- **Sistema de guardado**: Persistencia del modo de juego seleccionado
- **Experiencia de usuario**: Feedback visual y auditivo más claro
- **Documentación**: README completamente renovado con todas las nuevas características

### Corregido
- Fantasmas que se quedaban atrapados en la casa
- Score que no se reseteaba correctamente en modo Infinite
- Dashboard que mostraba nivel 1 en lugar del checkpoint en modo Campaign
- Botón de reintentar que no reseteaba el juego correctamente
- Fantasmas que podían re-entrar a la casa durante la partida
- Contador de partidas que no distinguía entre modos

### Técnico
- Node.js 20-alpine como base
- PostgreSQL 16 con healthcheck mejorado
- Entrypoint script con retry logic
- Usuario no-root (nodejs:1001) para seguridad
- Logs con rotación automática (10MB máx, 3 archivos)
- Healthcheck HTTP para la aplicación
- Web Audio API para generación procedural de sonidos
- LocalStorage para configuración del cliente
- Canvas responsive con escalado dinámico

---

## [1.0.0] - 2025-12

### Añadido
- Juego base tipo Pac-Man con temática Linux
- Sistema de usuarios con registro y login
- Autenticación JWT con bcrypt
- Base de datos PostgreSQL
- Tienda de skins (Tux, Ubuntu, Arch, Debian, Gentoo, RedHat)
- Sistema de monedas y tokens
- Ranking global de jugadores
- API REST completa
- Despliegue con Docker y Docker Compose
- Healthcheck endpoints
- Sistema básico de fantasmas
- Power-ups temporales
- Contador de vidas
- Persistencia de puntuación y estadísticas

### Inicial
- Estructura base del proyecto
- Frontend con Canvas HTML5
- Backend con Node.js y Express
- Containerización con Docker
- Documentación inicial
