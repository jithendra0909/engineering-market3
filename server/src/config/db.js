import mongoose from 'mongoose';
import User from '../models/User.js';
import College from '../models/College.js';
import Listing from '../models/Listing.js';
import Notification from '../models/Notification.js';

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

    // In production, check if database is empty. If it is, seed the initial data safely.
    await seedIfEmpty();
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
      throw error;
    }
  }
};

// Safe seeding: only seeds if no users exist in the database
const seedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('Database is empty. Seeding initial admin and college data safely...');
      
      // 1. Create Colleges
      const viit = await College.create({
        name: "Vignan's Institute of Information Technology (VIIT)",
        isActive: true
      });
      const view = await College.create({
        name: "Vignan's Institute of Engineering for Women (VIEW)",
        isActive: true
      });
      
      // 2. Create Admin
      await User.create({
        fullName: 'System Administrator',
        email: 'admin@vignan.edu.in',
        password: 'admin123',
        whatsappNumber: '919876543210',
        registrationNumber: 'ADMIN-001',
        department: 'Administration',
        year: '4th Year',
        college: viit.name,
        idCardImageUrl: '/images/file_0000000024747207aa9ab38052a0cc35.png',
        role: 'admin',
        verificationStatus: 'approved'
      });

      // 3. Create a default verified student so there is a listing seller
      const arjun = await User.create({
        fullName: 'Arjun Sharma',
        email: 'arjun.sharma@vignan.edu.in',
        password: 'password123',
        whatsappNumber: '919876543210',
        registrationNumber: '21F31A0512',
        department: 'Computer Science Engineering',
        year: '3rd Year',
        college: viit.name,
        idCardImageUrl: '/images/file_0000000024747207aa9ab38052a0cc35.png',
        role: 'student',
        verificationStatus: 'approved'
      });

      // 4. Create sample listings
      const sampleListings = [
        {
          title: 'Data Structures Using C',
          description: 'Standard textbook for 2nd year engineering students. Cover is slightly worn out but all pages are clean with no handwriting. Extremely useful for semester exams and coding interviews.',
          price: 250,
          images: ['/images/file_00000000968c71f8895e41375cd51838.png'],
          category: 'Books',
          condition: 'Good',
          listingType: 'sell',
          marketType: 'college',
          seller: arjun._id,
          sellerCollege: viit.name,
          sellerWhatsappNumber: arjun.whatsappNumber,
          status: 'available'
        },
        {
          title: 'Casio fx-991 Calculator',
          description: 'Original Casio FX-991 EX ClassWiz scientific calculator. Fully functional, dynamic solar panel, and in great condition. Recommended for all engineering branches.',
          price: 750,
          images: ['/images/file_0000000006d871fa89f7ea6cc8b17d67.png'],
          category: 'Electronics',
          condition: 'Like New',
          listingType: 'sell',
          marketType: 'college',
          seller: arjun._id,
          sellerCollege: viit.name,
          sellerWhatsappNumber: arjun.whatsappNumber,
          status: 'available'
        }
      ];

      await Listing.insertMany(sampleListings);

      // 5. Create sample notifications
      await Notification.create([
        {
          recipient: arjun._id,
          title: 'Account Verified! 🎉',
          message: "Congratulations Arjun! Your student identity has been verified. You can now post books/items and chat with buyers.",
          type: 'verification',
          isRead: false
        }
      ]);

      console.log('Seeding completed successfully.');
    }
  } catch (error) {
    console.error('Error during auto-seeding:', error.message);
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
