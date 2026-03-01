-- Migration 003: Target Accounts table
-- Feature 5: Smart Target Suggestions — "Reply to These People"

CREATE TABLE IF NOT EXISTS target_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  handle TEXT NOT NULL,
  display_name TEXT,
  notes TEXT,
  priority INTEGER DEFAULT 0,
  last_tweet_seen_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, handle)
);

-- Enable RLS
ALTER TABLE target_accounts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own targets" ON target_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create targets" ON target_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own targets" ON target_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own targets" ON target_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS target_accounts_user_id_idx ON target_accounts(user_id);
CREATE INDEX IF NOT EXISTS target_accounts_handle_idx ON target_accounts(handle);
