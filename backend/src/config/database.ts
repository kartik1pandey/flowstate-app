import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.warn('⚠️  No DATABASE_URL environment variable defined');
  console.warn('⚠️  Database features will be disabled');
}

// Create PostgreSQL connection pool
export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL?.includes('supabase') ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

async function connectDB(): Promise<void> {
  try {
    if (!DATABASE_URL) {
      console.log('⚠️  Skipping database connection - no connection string provided');
      return;
    }

    // Test the connection
    const client = await pool.connect();
    console.log('✅ PostgreSQL (Supabase) connected successfully');
    client.release();

    // Create tables if they don't exist
    await createTables();
  } catch (error) {
    console.error('❌ Database connection error:', error);
    console.log('⚠️  Server will continue running without database connection');
    console.log('⚠️  Please fix database connection and restart the server');
  }
}

async function createTables(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        image TEXT,
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
        primary_goals TEXT[],
        focus_areas TEXT[],
        hobbies TEXT[],
        learning_interests TEXT[],
        preferred_working_hours VARCHAR(100),
        work_environment VARCHAR(255),
        productivity_challenges TEXT[],
        timezone VARCHAR(100),
        country VARCHAR(100),
        city VARCHAR(100),
        bio TEXT,
        spotify_access_token TEXT,
        spotify_refresh_token TEXT,
        spotify_token_expiry TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // User settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        notifications_enabled BOOLEAN DEFAULT true,
        notifications_interventions BOOLEAN DEFAULT true,
        notifications_daily_summary BOOLEAN DEFAULT true,
        flow_detection_sensitivity VARCHAR(20) DEFAULT 'medium',
        flow_detection_min_duration INTEGER DEFAULT 300,
        intervention_breathing BOOLEAN DEFAULT true,
        intervention_eye_rest BOOLEAN DEFAULT true,
        intervention_posture BOOLEAN DEFAULT true,
        intervention_hydration BOOLEAN DEFAULT true,
        work_schedule_start_time VARCHAR(10),
        work_schedule_end_time VARCHAR(10),
        work_schedule_work_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5],
        distraction_sites TEXT[],
        privacy_local_processing BOOLEAN DEFAULT true,
        privacy_share_analytics BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Flow sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS flow_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        duration INTEGER DEFAULT 0,
        quality_score INTEGER DEFAULT 0,
        focus_score INTEGER DEFAULT 0,
        triggers TEXT[],
        breakers TEXT[],
        metrics_avg_typing_speed NUMERIC DEFAULT 0,
        metrics_tab_switches INTEGER DEFAULT 0,
        metrics_mouse_activity NUMERIC DEFAULT 0,
        metrics_fatigue_level NUMERIC DEFAULT 0,
        language VARCHAR(100) DEFAULT 'javascript',
        distractions INTEGER DEFAULT 0,
        session_type VARCHAR(50) DEFAULT 'other',
        code_metrics_lines_of_code INTEGER DEFAULT 0,
        code_metrics_characters_typed INTEGER DEFAULT 0,
        code_metrics_complexity_score NUMERIC DEFAULT 0,
        code_metrics_errors_fixed INTEGER DEFAULT 0,
        whiteboard_metrics_total_strokes INTEGER DEFAULT 0,
        whiteboard_metrics_shapes_drawn INTEGER DEFAULT 0,
        whiteboard_metrics_colors_used INTEGER DEFAULT 0,
        whiteboard_metrics_canvas_coverage NUMERIC DEFAULT 0,
        whiteboard_metrics_eraser_uses INTEGER DEFAULT 0,
        whiteboard_metrics_tool_switches INTEGER DEFAULT 0,
        whiteboard_metrics_average_stroke_speed NUMERIC DEFAULT 0,
        whiteboard_metrics_creativity_score NUMERIC DEFAULT 0,
        interventions TEXT[],
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for flow_sessions
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flow_sessions_user_id ON flow_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_flow_sessions_start_time ON flow_sessions(start_time DESC);
      CREATE INDEX IF NOT EXISTS idx_flow_sessions_created_at ON flow_sessions(created_at DESC);
    `);

    // Interventions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS interventions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        session_id UUID REFERENCES flow_sessions(id) ON DELETE SET NULL,
        type VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        duration INTEGER DEFAULT 60,
        completed BOOLEAN DEFAULT false,
        effectiveness INTEGER,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for interventions
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_interventions_user_id ON interventions(user_id);
      CREATE INDEX IF NOT EXISTS idx_interventions_timestamp ON interventions(timestamp DESC);
    `);

    // Media table
    await client.query(`
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
      )
    `);

    // Create indexes for media
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
      CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at DESC);
    `);

    await client.query('COMMIT');
    console.log('✅ Database tables created/verified successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
}

export default connectDB;
