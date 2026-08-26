import mongoose from 'mongoose';

const giftCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const GiftCategory = mongoose.model('GiftCategory', giftCategorySchema);
export default GiftCategory;
