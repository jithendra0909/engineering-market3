import mongoose from 'mongoose';

const giftProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  images: [{
    type: String,
    required: true
  }],
  basePrice: {
    type: Number,
    required: true
  },
  mrpPrice: {
    type: Number,
    default: null,
    validate: {
      validator: function (v) {
        // Only enforce when mrpPrice is actually set
        return v === null || v === undefined || v >= this.basePrice;
      },
      message: 'MRP must be greater than or equal to the selling price'
    }
  },
  features: [{
    type: String
  }],
  badge: {
    type: String,
    enum: [null, 'BEST SELLER', 'NEW', 'TRENDING'],
    default: null
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sizeOptions: [{
    label: {
      type: String,
      required: true
    },
    priceModifier: {
      type: Number,
      required: true
    },
    mrpModifier: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true
});

giftProductSchema.index({ category: 1, isActive: 1 });
giftProductSchema.index({ isFeatured: 1, isActive: 1 });

const GiftProduct = mongoose.model('GiftProduct', giftProductSchema);
export default GiftProduct;
