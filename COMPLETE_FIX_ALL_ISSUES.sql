-- ============================================
-- COMPLETE DATABASE FIX - Run this in Supabase
-- ============================================

-- 1. Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS email_verifications CASCADE;
DROP TABLE IF EXISTS interventions CASCADE;
DROP TABLE IF EXISTS flow_sessions CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create users table with email verification
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    
    -- Profile fields
    age INTEGER,
    date_of_birth DATE,
    gender VARCHAR(50),
    phone_number VARCHAR(50),
    occupation VARCHAR(255),
    company VARCHAR(255),
    job_title VARCHAR(255),
    industry VARCHAR(255),
    years_of_experience INTEGER,
    education_level VARCHAR(255),
    field_of_study VARCHAR(255),
    institution VARCHAR(255),
    
    -- Preferences
    primary_goals TEXT[],
    focus_areas TEXT[],
    hobbies TEXT[],
    learning_interests TEXT[],
    preferred_working_hours VARCHAR(100),
    work_environment VARCHAR(255),
    productivity_challenges TEXT[],
    
    -- Location
    timezone VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    bio TEXT,
    
    -- Spotify integration
    spotify_access_token TEXT,
    spotify_refresh_token TEXT,
    spotify_token_expires TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create email verifications table
CREATE TABLE email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Create user settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification settings
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    
    -- Focus settings
    focus_mode_enabled BOOLEAN DEFAULT FALSE,
    focus_duration INTEGER DEFAULT 25,
    break_duration INTEGER DEFAULT 5,
    long_break_duration INTEGER DEFAULT 15,
    sessions_before_long_break INTEGER DEFAULT 4,
    
    -- Intervention settings
    intervention_frequency VARCHAR(50) DEFAULT 'medium',
    intervention_types TEXT[] DEFAULT ARRAY['break', 'stretch', 'hydrate'],
    
    -- Theme and display
    theme VARCHAR(50) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create flow sessions table
CREATE TABLE flow_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session basics
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration INTEGER DEFAULT 0,
    session_type VARCHAR(50) DEFAULT 'other',
    
    -- Scores
    quality_score INTEGER DEFAULT 0,
    focus_score INTEGER DEFAULT 0,
    distractions INTEGER DEFAULT 0,
    
    -- Flow triggers and breakers
    triggers TEXT[],
    breakers TEXT[],
    
    -- General metrics
    metrics_avg_typing_speed DECIMAL(10,2) DEFAULT 0,
    metrics_tab_switches INTEGER DEFAULT 0,
    metrics_mouse_activity DECIMAL(10,2) DEFAULT 0,
    metrics_fatigue_level DECIMAL(10,2) DEFAULT 0,
    
    -- Code session specific
    language VARCHAR(100),
    code_metrics_lines_of_code INTEGER DEFAULT 0,
    code_metrics_characters_typed INTEGER DEFAULT 0,
    code_metrics_complexity_score DECIMAL(10,2) DEFAULT 0,
    code_metrics_errors_fixed INTEGER DEFAULT 0,
    
    -- Whiteboard session specific
    whiteboard_metrics_total_strokes INTEGER DEFAULT 0,
    whiteboard_metrics_shapes_drawn INTEGER DEFAULT 0,
    whiteboard_metrics_colors_used INTEGER DEFAULT 0,
    whiteboard_metrics_canvas_coverage DECIMAL(10,2) DEFAULT 0,
    whiteboard_metrics_eraser_uses INTEGER DEFAULT 0,
    whiteboard_metrics_tool_switches INTEGER DEFAULT 0,
    whiteboard_metrics_average_stroke_speed DECIMAL(10,2) DEFAULT 0,
    whiteboard_metrics_creativity_score DECIMAL(10,2) DEFAULT 0,
    
    -- Additional data
    interventions TEXT[],
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Create interventions table
CREATE TABLE interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES flow_sessions(id) ON DELETE SET NULL,
    
    type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    triggered_at TIMESTAMP DEFAULT NOW(),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    effectiveness INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Create media table
CREATE TABLE media (
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

-- 8. Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_verification_token ON users(verification_token);

CREATE INDEX idx_email_verifications_token ON email_verifications(token);
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);

CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);

CREATE INDEX idx_flow_sessions_user_id ON flow_sessions(user_id);
CREATE INDEX idx_flow_sessions_start_time ON flow_sessions(start_time DESC);
CREATE INDEX idx_flow_sessions_session_type ON flow_sessions(session_type);
CREATE INDEX idx_flow_sessions_user_time ON flow_sessions(user_id, start_time DESC);

CREATE INDEX idx_interventions_user_id ON interventions(user_id);
CREATE INDEX idx_interventions_session_id ON interventions(session_id);
CREATE INDEX idx_interventions_triggered_at ON interventions(triggered_at DESC);

CREATE INDEX idx_media_user_id ON media(user_id);
CREATE INDEX idx_media_session_id ON media(session_id);
CREATE INDEX idx_media_created_at ON media(created_at DESC);

-- 9. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flow_sessions_updated_at BEFORE UPDATE ON flow_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interventions_updated_at BEFORE UPDATE ON interventions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Verify tables created
SELECT 'Tables created successfully!' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 12. Show column counts
SELECT 
    'users' as table_name, 
    COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'users'
UNION ALL
SELECT 
    'flow_sessions' as table_name, 
    COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'flow_sessions'
UNION ALL
SELECT 
    'interventions' as table_name, 
    COUNT(*) as column_count 
FROM information_schema.columns 
WHERE table_name = 'interventions';

