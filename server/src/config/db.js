import mongoose from 'mongoose';
import { seedData } from './seedFunction.js';

let mongoServer;

const connectDB = async () => {
  try {
    console.log(`Attempting to connect to MongoDB at ${process.env.MONGO_URI}...`);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000 // Timeout after 3 seconds
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Local MongoDB connection failed: ${error.message}`);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Starting in-memory MongoDB server for local development...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        console.log(`Connecting to in-memory MongoDB at ${mongoUri}...`);
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);
        
        // Auto-seed in-memory database
        console.log('Auto-seeding in-memory database with sample data...');
        await seedData();
        console.log('Auto-seeding completed successfully!');
      } catch (memError) {
        console.error(`Failed to start in-memory MongoDB: ${memError.message}`);
        process.exit(1);
      }
    } else {
      console.error('Production database connection failed. Exiting.');
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (error) {
    console.error('Error disconnecting from database:', error.message);
  }
};

export { connectDB, disconnectDB };
export default connectDB;
