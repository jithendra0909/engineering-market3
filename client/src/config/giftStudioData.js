/**
 * EM Gift Studio — Product Data Configuration
 * 
 * Structured product catalog for the Gift Studio vendor.
 * This file serves as the source of truth for products and pricing
 * until a backend API is implemented.
 * 
 * IMPORTANT: Prices here are read-only configuration data.
 * Do not allow client-side price manipulation.
 */

// ─── Vendor Information ───
export const VENDOR_INFO = {
  id: 'em-gift-studio',
  name: 'EM Gift Studio',
  subtitle: 'Personalized Gifts',
  verified: true,
  rating: 4.9,
  reviewCount: 128,
  description: 'We create personalized gifts that make every moment special. Perfect for your friends, family and loved ones.',
};

// ─── Frame Sizes & Prices ───
// These are the current base prices per size.
export const FRAME_SIZES = {
  '8×12': 180,
  '10×12': 210,
  '10×15': 235,
  '12×15': 260,
  '12×18': 260,
};

// ─── Frame Products ───
export const FRAME_PRODUCTS = [
  {
    id: 'wooden-frame',
    name: '8×12 Wooden Frame',
    category: 'Photo Frames',
    features: ['HD Print Quality', 'Matte Finish', 'Premium Wood'],
    basePrice: 180,
    badge: 'BEST SELLER',
    image: '/images/frame_wooden.jpg',
    customizationAvailable: true,
  },
  {
    id: 'collage-frame',
    name: '8×12 Collage Frame',
    category: 'Photo Frames',
    features: ['Multiple Photos', 'Premium Finish', 'HD Print Quality'],
    basePrice: 180,
    badge: null,
    image: '/images/frame_collage.jpg',
    customizationAvailable: true,
  },
  {
    id: 'motivational-frame',
    name: '8×12 Motivational Frame',
    category: 'Photo Frames',
    features: ['HD Print Quality', 'Elegant Design', 'Premium Frame'],
    basePrice: 180,
    badge: null,
    image: '/images/frame_motivational.jpg',
    customizationAvailable: true,
  },
  {
    id: 'classic-frame',
    name: '8×12 Classic Frame',
    category: 'Photo Frames',
    features: ['HD Print Quality', 'Matte Finish', 'Durable Frame'],
    basePrice: 180,
    badge: null,
    image: '/images/frame_classic.jpg',
    customizationAvailable: true,
  },
];

// ─── Customization Options ───
export const DESIGN_PREFERENCES = [
  'Classic',
  'Modern',
  'Minimalist',
  'Vintage',
  'Artistic',
  'Custom (describe in instructions)',
];

// ─── Categories ───
export const CATEGORIES = [
  {
    id: 'photo-frames',
    name: 'Photo Frames',
    icon: 'Image', // lucide icon name
  },
];
