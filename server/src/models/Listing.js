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
  }
}, {
  timestamps: true
});

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
