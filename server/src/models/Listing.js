import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  listingType: {
    type: String,
    enum: ['sell', 'donate'],
    required: true
  },
  marketType: {
    type: String,
    enum: ['general', 'college'],
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerCollege: {
    type: String,
    required: true
  },
  sellerWhatsappNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'removed'],
    default: 'available'
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  reports: [{
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

listingSchema.index({ sellerCollege: 1, status: 1 });
listingSchema.index({ marketType: 1, expiresAt: 1 });
listingSchema.index({ createdAt: -1 });

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
