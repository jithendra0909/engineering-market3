import mongoose from 'mongoose';

let mongoServer;
let isConnected = false;
let connectionPromise = null;

const connectDB = async () => {
  // If already connected, return immediately
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  // If a connection attempt is already in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = _connect();
  try {
    await connectionPromise;
  } finally {
    connectionPromise = null;
  }
};

const _connect = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    // No MONGO_URI set — try in-memory for development
    if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
      console.log('MONGO_URI not set. Starting in-memory MongoDB for local development...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        const memUri = mongoServer.getUri();
        console.log(`Connecting to in-memory MongoDB at ${memUri}...`);
        await mongoose.connect(memUri);
        console.log(`MongoDB Connected (In-Memory): ${mongoose.connection.host}`);
        isConnected = true;

        // Auto-seed in-memory database
        const { seedData } = await import('./seedFunction.js');
        console.log('Auto-seeding in-memory database with sample data...');
        await seedData();
        console.log('Auto-seeding completed successfully!');
        return;
      } catch (memError) {
        console.error(`Failed to start in-memory MongoDB: ${memError.message}`);
        throw memError;
      }
    } else {
      throw new Error('MONGO_URI environment variable is not set. Please add it in Vercel Dashboard → Settings → Environment Variables.');
    }
  }

  // Try connecting to the provided MONGO_URI
  try {
    console.log(`Attempting to connect to MongoDB...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    isConnected = true;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);

    // In development (non-Vercel), fall back to in-memory
    if (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1') {
      console.log('Falling back to in-memory MongoDB for local development...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        const memUri = mongoServer.getUri();
        console.log(`Connecting to in-memory MongoDB at ${memUri}...`);
        await mongoose.connect(memUri);
        console.log(`MongoDB Connected (In-Memory): ${mongoose.connection.host}`);
        isConnected = true;

        const { seedData } = await import('./seedFunction.js');
        console.log('Auto-seeding in-memory database with sample data...');
        await seedData();
        console.log('Auto-seeding completed successfully!');
      } catch (memError) {
        console.error(`Failed to start in-memory MongoDB: ${memError.message}`);
        throw memError;
      }
    } else {
      // In production, don't process.exit — just throw so the request gets a 500
      throw error;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    isConnected = false;
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Error disconnecting from database:', error.message);
  }
};

export { connectDB, disconnectDB };
export default connectDB;
