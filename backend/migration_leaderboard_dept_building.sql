-- ============================================================
-- MIGRATION: Add department + building leaderboard scores
-- Run this once against your Supabase DB (SQL Editor)
-- Safe to run multiple times — uses DELETE + re-insert per period
-- ============================================================

-- Remove any existing dept/building rows for Feb 2026 to avoid duplicates
DELETE FROM leaderboard_scores
WHERE campus_id = 1
  AND entity_type IN ('department', 'building')
  AND period_label = 'Feb 2026';

-- Insert department leaderboard scores
INSERT INTO leaderboard_scores (
  campus_id, entity_type, entity_id, period_label,
  period_start, period_end,
  total_points, energy_reduction_pct, carbon_reduction_pct,
  participation_pct, streak_days, rank, trend, hall_of_fame
)
SELECT
  1,
  'department',
  d.id,
  'Feb 2026',
  '2026-02-01',
  '2026-02-28',
  ROUND((600 + RANDOM() * 500)::numeric)::int,
  ROUND((5  + RANDOM() * 15)::numeric, 2),
  ROUND((4  + RANDOM() * 12)::numeric, 2),
  ROUND((60 + RANDOM() * 30)::numeric, 2),
  ROUND((3  + RANDOM() * 20)::numeric)::smallint,
  ROW_NUMBER() OVER (ORDER BY RANDOM())::smallint,
  (ARRAY['up', 'down', 'same'])[FLOOR(RANDOM() * 3 + 1)::int],
  (RANDOM() > 0.8)
FROM departments d
LIMIT 8;

-- Insert building leaderboard scores
INSERT INTO leaderboard_scores (
  campus_id, entity_type, entity_id, period_label,
  period_start, period_end,
  total_points, energy_reduction_pct, carbon_reduction_pct,
  participation_pct, streak_days, rank, trend
)
SELECT
  1,
  'building',
  b.id,
  'Feb 2026',
  '2026-02-01',
  '2026-02-28',
  ROUND((400 + RANDOM() * 600)::numeric)::int,
  ROUND((3  + RANDOM() * 18)::numeric, 2),
  ROUND((2  + RANDOM() * 14)::numeric, 2),
  ROUND((50 + RANDOM() * 40)::numeric, 2),
  ROUND((2  + RANDOM() * 28)::numeric)::smallint,
  ROW_NUMBER() OVER (ORDER BY RANDOM())::smallint,
  (ARRAY['up', 'down', 'same'])[FLOOR(RANDOM() * 3 + 1)::int]
FROM buildings b
WHERE b.campus_id = 1
LIMIT 10;

-- Verify counts
SELECT entity_type, COUNT(*) as rows
FROM leaderboard_scores
WHERE campus_id = 1
GROUP BY entity_type
ORDER BY entity_type;
