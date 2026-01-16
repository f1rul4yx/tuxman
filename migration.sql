-- =============================================
-- 🐧 TUXMAN - Script de Migración v1.0 → v2.0
-- =============================================
--
-- Este script añade los nuevos campos necesarios para
-- los modos de juego Infinite y Kernel (Campaign).
--
-- INSTRUCCIONES:
-- 1. Haz backup de tu base de datos antes de ejecutar:
--    docker exec tuxman-db pg_dump -U tuxman tuxman > backup_v1.sql
-- 2. Ejecuta este script en tu base de datos de producción
-- 3. Los usuarios existentes mantendrán todos sus datos
--
-- =============================================

-- =============================================
-- TABLA: users
-- =============================================

-- Añadir nuevos campos para el modo Campaign
ALTER TABLE users
ADD COLUMN IF NOT EXISTS best_score_campaign INTEGER DEFAULT 0;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS highest_level_campaign INTEGER DEFAULT 1;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS current_checkpoint_campaign INTEGER DEFAULT 1;

-- Separar contador de partidas por modo
ALTER TABLE users
ADD COLUMN IF NOT EXISTS games_played_infinite INTEGER DEFAULT 0;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS games_played_campaign INTEGER DEFAULT 0;

-- Migrar el contador de partidas antiguo al modo infinito
-- (asumiendo que el modo por defecto era infinito)
UPDATE users
SET games_played_infinite = games_played
WHERE games_played_infinite = 0 AND games_played > 0;

-- =============================================
-- TABLA: game_history
-- =============================================

-- Añadir columna de modo de juego
ALTER TABLE game_history
ADD COLUMN IF NOT EXISTS game_mode VARCHAR(20) DEFAULT 'infinite';

-- Marcar todas las partidas antiguas como modo 'infinite'
UPDATE game_history
SET game_mode = 'infinite'
WHERE game_mode IS NULL OR game_mode = 'infinite';

-- =============================================
-- VERIFICACIÓN
-- =============================================

-- Verificar estructura de tabla users
\echo '=== Verificando tabla USERS ==='
SELECT
    username,
    coins,
    best_score,
    best_score_campaign,
    highest_level_campaign,
    current_checkpoint_campaign,
    games_played,
    games_played_infinite,
    games_played_campaign,
    equipped_skin
FROM users
ORDER BY id
LIMIT 5;

-- Verificar estructura de tabla game_history
\echo ''
\echo '=== Verificando tabla GAME_HISTORY ==='
SELECT
    id,
    user_id,
    score,
    level,
    game_mode,
    tokens_earned,
    played_at
FROM game_history
ORDER BY id DESC
LIMIT 5;

-- Mostrar resumen de migración
\echo ''
\echo '=== RESUMEN DE MIGRACIÓN ==='
SELECT
    'Usuarios totales' AS descripcion,
    COUNT(*) AS cantidad
FROM users
UNION ALL
SELECT
    'Partidas totales',
    COUNT(*)
FROM game_history
UNION ALL
SELECT
    'Partidas infinite',
    COUNT(*)
FROM game_history
WHERE game_mode = 'infinite'
UNION ALL
SELECT
    'Partidas campaign',
    COUNT(*)
FROM game_history
WHERE game_mode = 'campaign';

-- =============================================
-- ✅ MIGRACIÓN COMPLETADA
-- =============================================
