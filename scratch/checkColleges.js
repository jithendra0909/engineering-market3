import mongoose from 'mongoose';
import connectDB from '../server/src/config/db.js';
import College from '../server/src/models/College.js';

const run = async () => {
  await connectDB();
  const colleges = await College.find({});
  console.log('COLLEGES IN DATABASE:', colleges);
  process.exit(0);
};

run();
