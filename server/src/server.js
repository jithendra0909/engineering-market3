import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import collegeRoutes from './routes/collegeRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

// Load .env file (no-op on Vercel where env vars are injected)
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local uploaded files statically (development only)
if (process.env.VERCEL !== '1') {
  const publicDir = path.join(process.cwd(), 'public');
  app.use('/uploads', express.static(path.join(publicDir, 'uploads')));
}

// Ensure DB is connected before any API request
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(503).json({
      message: 'Database connection failed. Please check MONGO_URI environment variable.',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/chats', chatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    vercel: process.env.VERCEL === '1',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Only start listening when not running as a Vercel serverless function
if (process.env.VERCEL !== '1') {
  // For local dev, also connect immediately so seed runs on startup
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  });
}

// Export for Vercel serverless
export default app;
