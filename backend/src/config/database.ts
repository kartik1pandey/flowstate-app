import mongoose from 'mongoose';

// Support both MongoDB and Supabase (PostgreSQL)
const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGODB_URI;

if (!DATABASE_URL) {
  console.warn('⚠️  No DATABASE_URL or MONGODB_URI environment variable defined');
  console.warn('⚠️  Database features will be disabled');
}

async function connectDB(): Promise<void> {
  try {
    if (!DATABASE_URL) {
      console.log('⚠️  Skipping database connection - no connection string provided');
      return;
    }

    // Check if it's PostgreSQL (Supabase) or MongoDB
    if (DATABASE_URL.startsWith('postgresql://') || DATABASE_URL.startsWith('postgres://')) {
      console.log('✅ Using PostgreSQL (Supabase) - database connection handled by models');
      return;
    }

    // MongoDB connection
    if (mongoose.connection.readyState >= 1) {
      console.log('✅ MongoDB already connected');
      return;
    }

    await mongoose.connect(DATABASE_URL, {
      bufferCommands: false,
    });

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    console.log('⚠️  Server will continue running without database connection');
    console.log('⚠️  Please fix database connection and restart the server');
    // Don't exit - let the server run for testing other endpoints
  }
}

export default connectDB;
