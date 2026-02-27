-- Fix Supabase Schema - Add missing columns
-- Run this in Supabase SQL Editor

-- Add missing image column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT;

-- Verify all columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
