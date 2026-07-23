import mongoose from 'mongoose';

const printFileSchema = new mongoose.Schema({
  pdfFileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  pagesCount: {
    type: Number,
    required: true
  },
  layout: {
    type: String,
    enum: ['single-side', 'both-side', 'four-pages'],
    required: true
  },
  colorType: {
    type: String,
    enum: ['bw', 'color'],
    required: true
  },
  binding: {
    type: String,
    enum: ['none', 'spiral'],
    required: true
  },
  sets: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  instructions: {
    type: String,
    default: ''
  },
  subtotal: {
    type: Number,
    required: true
  }
});

const printOrderSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  registrationNumber: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  files: [printFileSchema],
  paymentScreenshotUrl: {
    type: String,
    required: true
  },
  upiReference: {
    type: String,
    required: true
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'printing', 'out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

printOrderSchema.index({ student: 1, createdAt: -1 });
printOrderSchema.index({ status: 1 });

const PrintOrder = mongoose.model('PrintOrder', printOrderSchema);
export default PrintOrder;
