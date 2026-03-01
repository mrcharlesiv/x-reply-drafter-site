-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  stripe_subscription_id TEXT,
  usage_count INTEGER DEFAULT 0,
  usage_reset_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Saved prompts table
CREATE TABLE saved_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  persona TEXT DEFAULT 'professional',
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Draft history table
CREATE TABLE draft_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tweet_text TEXT NOT NULL,
  persona TEXT DEFAULT 'professional',
  drafts TEXT[] NOT NULL,
  selected_draft TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Custom personas table
CREATE TABLE custom_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  tone TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Policies for saved_prompts
CREATE POLICY "Users can view own prompts" ON saved_prompts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create prompts" ON saved_prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts" ON saved_prompts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts" ON saved_prompts
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for draft_history
CREATE POLICY "Users can view own history" ON draft_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create history" ON draft_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for custom_personas
CREATE POLICY "Users can view own personas" ON custom_personas
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create personas" ON custom_personas
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personas" ON custom_personas
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own personas" ON custom_personas
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for analytics
CREATE POLICY "Users can view own analytics" ON analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create analytics" ON analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX users_plan_idx ON users(plan);
CREATE INDEX saved_prompts_user_id_idx ON saved_prompts(user_id);
CREATE INDEX draft_history_user_id_idx ON draft_history(user_id);
CREATE INDEX draft_history_created_at_idx ON draft_history(created_at);
CREATE INDEX custom_personas_user_id_idx ON custom_personas(user_id);
CREATE INDEX analytics_user_id_idx ON analytics(user_id);
CREATE INDEX analytics_created_at_idx ON analytics(created_at);
