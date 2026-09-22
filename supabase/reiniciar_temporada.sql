-- ============================================================
-- 🌍 REINICIAR TEMPORADA - Reset masivo
-- ============================================================
-- Este SQL se ejecuta MANUALMENTE desde el SQL Editor de Supabase.
-- Cada vez que quieras arrancar una temporada nueva, seguí estos pasos:
--
-- 1. Ejecutá este SQL completo (una sola vez).
-- 2. El workflow de GitHub regenerará el ranking automáticamente en 1 hora.
-- 3. Los jugadores que entren verán el reset reflejado en su panel.
--
-- ⚠️ ADVERTENCIA: Este SQL resetea TODOS los jugadores y borra TODOS los
--    récords. NO se puede deshacer. Asegurate de estar en el momento correcto.
-- ============================================================

-- ============================================================
-- PASO 1: Guardar histórico de TODOS los jugadores actuales
-- ============================================================
-- Antes de resetear, guardamos una "foto final" en historico_temporadas.
-- El puesto mundial se calcula ordenando por nivel_maximo DESC.
-- ============================================================

INSERT INTO historico_temporadas (uid, nombre, temporada, nivel_maximo, puesto_mundial_final)
SELECT 
    j1.uid,
    j1.nombre,
    j1.temporada_actual,
    j1.nivel_maximo,
    (SELECT COUNT(*) + 1 FROM jugadores j2 WHERE j2.nivel_maximo > j1.nivel_maximo AND j2.temporada_actual = j1.temporada_actual)
FROM jugadores j1
WHERE j1.nivel_maximo > 0;  -- Solo guardamos los que tuvieron progreso real

-- ============================================================
-- PASO 2: Resetear TODOS los jugadores
-- ============================================================
-- Pone stats y nivel a 0, y actualiza la temporada_actual a la nueva.
-- ============================================================

UPDATE jugadores 
SET 
    nivel_maximo = 0,
    nivel_actual = 1,
    tutorial_completado = false,
    stats_fuerza = 0,
    stats_agilidad = 0,
    stats_inteligencia = 0,
    stats_destreza = 0,
    temporada_actual = (SELECT temporada_actual + 1 FROM config_temporada WHERE id = 1);

-- ============================================================
-- PASO 3: Borrar TODOS los récords por nivel
-- ============================================================
-- Los récords son específicos de cada temporada, así que se borran.
-- ============================================================

DELETE FROM records_por_nivel;

-- ============================================================
-- PASO 4: Avanzar el número de temporada global
-- ============================================================
-- Esto es lo que hace que los jugadores detecten el cambio al entrar.
-- ============================================================

UPDATE config_temporada 
SET temporada_actual = temporada_actual + 1 
WHERE id = 1;

-- ============================================================
-- ✅ FIN DEL RESET
-- ============================================================
-- Después de ejecutar este SQL:
-- - Todos los jugadores tienen temporada_actual = N+1 y stats en 0.
-- - Todos los récords están borrados.
-- - El histórico de la temporada N quedó guardado.
-- - config_temporada.temporada_actual = N+1.
--
-- La próxima vez que un jugador abra el juego:
-- - Detectará que temporada_global (N+1) > temporada_vista_local (N).
-- - Limpiará su PlayerPrefs local.
-- - Arrancará la temporada N+1 desde cero.
-- ============================================================
