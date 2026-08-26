/**
 * One-time migration script to seed GiftProduct and GiftCategory collections
 * from the existing hardcoded FRAME_PRODUCTS data.
 *
 * Usage: npm run seed-gifts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './db.js';
import GiftProduct from '../models/GiftProduct.js';
import GiftCategory from '../models/GiftCategory.js';

dotenv.config();

const FRAME_PRODUCTS = [
  {
    title: '8×12 Wooden Frame',
    description: 'A beautifully crafted wooden photo frame with HD print quality and matte finish. Perfect for preserving your most cherished memories with a touch of premium elegance.',
    category: 'Photo Frames',
    features: ['HD Print Quality', 'Matte Finish', 'Premium Wood'],
    basePrice: 180,
    badge: 'BEST SELLER',
    images: ['/images/frame_wooden.jpg'],
    isFeatured: true,
    isActive: true,
    sizeOptions: [
      { label: '8×12', priceModifier: 0 },
      { label: '10×12', priceModifier: 30 },
      { label: '10×15', priceModifier: 55 },
      { label: '12×15', priceModifier: 80 },
      { label: '12×18', priceModifier: 80 }
    ]
  },
  {
    title: '8×12 Collage Frame',
    description: 'Create stunning photo collages with this premium collage frame. Features multiple photo slots with HD print quality and a premium finish for a professional look.',
    category: 'Photo Frames',
    features: ['Multiple Photos', 'Premium Finish', 'HD Print Quality'],
    basePrice: 180,
    badge: null,
    images: ['/images/frame_collage.jpg'],
    isFeatured: true,
    isActive: true,
    sizeOptions: [
      { label: '8×12', priceModifier: 0 },
      { label: '10×12', priceModifier: 30 },
      { label: '10×15', priceModifier: 55 },
      { label: '12×15', priceModifier: 80 },
      { label: '12×18', priceModifier: 80 }
    ]
  },
  {
    title: '8×12 Motivational Frame',
    description: 'An elegantly designed motivational photo frame that combines inspiring aesthetics with HD print quality. Perfect as a gift or for your workspace and study room.',
    category: 'Photo Frames',
    features: ['HD Print Quality', 'Elegant Design', 'Premium Frame'],
    basePrice: 180,
    badge: null,
    images: ['/images/frame_motivational.jpg'],
    isFeatured: true,
    isActive: true,
    sizeOptions: [
      { label: '8×12', priceModifier: 0 },
      { label: '10×12', priceModifier: 30 },
      { label: '10×15', priceModifier: 55 },
      { label: '12×15', priceModifier: 80 },
      { label: '12×18', priceModifier: 80 }
    ]
  },
  {
    title: '8×12 Classic Frame',
    description: 'A timeless classic photo frame with HD print quality and durable construction. The matte finish adds a sophisticated touch, making it ideal for any room or occasion.',
    category: 'Photo Frames',
    features: ['HD Print Quality', 'Matte Finish', 'Durable Frame'],
    basePrice: 180,
    badge: null,
    images: ['/images/frame_classic.jpg'],
    isFeatured: true,
    isActive: true,
    sizeOptions: [
      { label: '8×12', priceModifier: 0 },
      { label: '10×12', priceModifier: 30 },
      { label: '10×15', priceModifier: 55 },
      { label: '12×15', priceModifier: 80 },
      { label: '12×18', priceModifier: 80 }
    ]
  }
];

const seedGifts = async () => {
  try {
    await connectDB();
    console.log('Connected to database.');

    // Seed GiftCategory
    const existingCategory = await GiftCategory.findOne({ name: 'Photo Frames' });
    if (!existingCategory) {
      await GiftCategory.create({ name: 'Photo Frames', isActive: true });
      console.log('✅ Seeded "Photo Frames" category.');
    } else {
      console.log('ℹ️  "Photo Frames" category already exists, skipping.');
    }

    // Seed GiftProducts
    const existingCount = await GiftProduct.countDocuments();
    if (existingCount > 0) {
      console.log(`ℹ️  ${existingCount} gift product(s) already exist. Skipping seed to avoid duplicates.`);
    } else {
      await GiftProduct.insertMany(FRAME_PRODUCTS);
      console.log(`✅ Seeded ${FRAME_PRODUCTS.length} gift products.`);
    }

    console.log('🎉 Gift Studio seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedGifts();
