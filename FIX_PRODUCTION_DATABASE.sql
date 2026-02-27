-- ============================================
-- FIX PRODUCTION DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS occupation VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS industry VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS education_level VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS field_of_study VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS institution VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_goals TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS focus_areas TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS hobbies TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS learning_interests TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_working_hours VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS work_environment VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS productivity_challenges TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- 2. Verify users table
SELECT 'Users table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Verify flow_sessions table
SELECT 'Flow sessions table columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'flow_sessions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Check if media table exists, if not create it
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES flow_sessions(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  s3_key TEXT NOT NULL,
  s3_url TEXT NOT NULL,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);

-- 6. Show all tables
SELECT 'All tables in public schema:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 7. Count rows in each table
SELECT 'Row counts:' as info;
SELECT 
  'users' as table_name, 
  COUNT(*) as row_count 
FROM users
UNION ALL
SELECT 
  'user_settings' as table_name, 
  COUNT(*) as row_count 
FROM user_settings
UNION ALL
SELECT 
  'flow_sessions' as table_name, 
  COUNT(*) as row_count 
FROM flow_sessions
UNION ALL
SELECT 
  'interventions' as table_name, 
  COUNT(*) as row_count 
FROM interventions
UNION ALL
SELECT 
  'media' as table_name, 
  COUNT(*) as row_count 
FROM media;
