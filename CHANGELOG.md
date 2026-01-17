# Changelog

Todos los cambios notables del proyecto TuxMan serán documentados en este archivo.

## [2.1.0] - 2026-01-17

### Añadido
- **Vibración en controles móviles**: Feedback táctil de 30ms al pulsar botones de dirección
- **Diseño responsive mejorado para móviles pequeños**:
  - Media query específica para pantallas < 400px (iPhone SE, 12 mini, etc.)
  - Controles más compactos (55px en lugar de 70px)
  - Stats, botones y logo optimizados para pantallas pequeñas
  - Canvas se escala según ancho Y alto disponible
- **Prevención de scroll accidental**:
  - Touch-action: none en canvas y controles móviles
  - Event listeners con preventDefault() en botones táctiles
  - Viewport con maximum-scale para evitar zoom accidental

### Corregido
- **Bug crítico de fantasmas atascados**: Los fantasmas muertos ahora atraviesan paredes cuando regresan a la casa (como en Pac-Man original)
- **Bug de colisiones fantasma**: Mejorada detección de salida de la casa (ahora funciona cuando y <= 11, no solo en posición exacta)
- **Bug de score en modo Kernel**: El score ahora se resetea correctamente al cerrar el modal de game over
- **Scroll no deseado en móvil**: Implementado touch-action: none solo en áreas de juego, permitiendo scroll normal en el resto de la página

### Mejorado
- **Algoritmo de escalado del canvas**: Ahora considera tanto ancho como alto disponible, ajustando espacio para controles según tamaño de pantalla
- **Experiencia táctil**: Botones con user-select: none y -webkit-tap-highlight-color: transparent
- **Rendimiento móvil**: Reducido padding y gaps en pantallas pequeñas para maximizar espacio de juego

### Técnico
- Fantasmas returning pueden atravesar celdas tipo 0 (paredes) en función `canGhostMove()`
- Función `resizeCanvas()` ajustada con cálculo dinámico de controlsHeight según viewport
- CSS media query @media (max-width: 400px) con ajustes específicos para iPhones pequeños
- Event listeners en botones móviles con { passive: false } para permitir preventDefault()

---

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
