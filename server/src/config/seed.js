import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedData } from './seedFunction.js';

dotenv.config();

const runSeed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for manual seeding...');
    await seedData();
    mongoose.connection.close();
    console.log('Manual seeding completed successfully!');
  } catch (error) {
    console.error('Manual seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
