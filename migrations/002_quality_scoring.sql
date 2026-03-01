-- Migration 002: Add reasoning tags to draft_history
-- Feature 4: Reply Quality Scoring + "Why This Works" Context

ALTER TABLE draft_history ADD COLUMN IF NOT EXISTS reasoning_tags TEXT[];
ALTER TABLE draft_history ADD COLUMN IF NOT EXISTS draft_type TEXT DEFAULT 'reply';

-- Index for type-based queries
CREATE INDEX IF NOT EXISTS draft_history_draft_type_idx ON draft_history(draft_type);

-- Comment explaining valid reasoning tags:
-- 'Hooks with question', 'Validates then pivots', 'Pattern interrupt',
-- 'Personal story', 'Data-backed', 'Contrarian take', 'Curiosity gap'
