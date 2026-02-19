-- Run this SQL in your Supabase SQL Editor
-- Go to: Supabase Dashboard > SQL Editor > New Query

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  tag TEXT DEFAULT 'untagged',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- MIGRATION: Run this ONLY if the table already exists
-- ============================================================
-- Step 1: Add the tag column to existing table
-- ALTER TABLE questions ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT 'untagged';

-- Step 2: Update all existing questions to have 'old-question' tag
-- UPDATE questions SET tag = 'old-question' WHERE tag IS NULL OR tag = 'untagged';

-- System prompt table (supports multiple named prompts)
CREATE TABLE IF NOT EXISTS system_prompt (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Default',
  content TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default system prompt
INSERT INTO system_prompt (name, content) VALUES (
  'Default',
  'You are an ICP (Ideal Customer Profile) analyst. Analyze the provided website/company data thoroughly. Be detailed, specific, and provide actionable insights based on the data provided.'
);

-- ============================================================
-- MIGRATION: Run this ONLY if system_prompt table already exists
-- ============================================================
-- Step 1: Add the name column to existing table
-- ALTER TABLE system_prompt ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'Default';

-- Step 2: Backfill existing rows with a default name
-- UPDATE system_prompt SET name = 'Default' WHERE name IS NULL;

-- Prompt results table
CREATE TABLE IF NOT EXISTS prompt_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_url TEXT NOT NULL,
  prompt_input JSONB NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_prompt ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_results ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (adjust based on your auth needs)
CREATE POLICY "Allow all operations on questions" ON questions FOR ALL USING (true);
CREATE POLICY "Allow all operations on system_prompt" ON system_prompt FOR ALL USING (true);
CREATE POLICY "Allow all operations on prompt_results" ON prompt_results FOR ALL USING (true);
