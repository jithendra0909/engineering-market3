import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from '../models/Department.js';

dotenv.config();

const seedDepartments = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/engineering-market';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const defaultDepartments = [
      'Computer Science and Engineering',
      'Electronics and Communication Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Information Technology',
      'Chemical Engineering',
      'Other'
    ];

    for (const name of defaultDepartments) {
      const exists = await Department.findOne({ name });
      if (!exists) {
        await Department.create({ name, isActive: true });
        console.log(`Created department: ${name}`);
      } else {
        console.log(`Department already exists: ${name}`);
      }
    }

    console.log('Department seeding completed successfully.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding departments:', error);
    process.exit(1);
  }
};

seedDepartments();
