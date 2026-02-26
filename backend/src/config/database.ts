import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function connectDB(): Promise<void> {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log('✅ MongoDB already connected');
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.log('⚠️  Server will continue running without database connection');
    console.log('⚠️  Please fix MongoDB connection and restart the server');
    // Don't exit - let the server run for testing other endpoints
  }
}

export default connectDB;
