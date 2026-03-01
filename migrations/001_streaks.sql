-- Migration 001: Add streak tracking to users table
-- Feature 6: Usage Streaks + Gamification

ALTER TABLE users ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_freeze_available BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_freeze_used_at DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_goal INTEGER DEFAULT 50;

-- Index for streak queries
CREATE INDEX IF NOT EXISTS users_last_active_date_idx ON users(last_active_date);
