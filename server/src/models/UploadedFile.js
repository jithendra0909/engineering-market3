import mongoose from 'mongoose';

const uploadedFileSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true
  },
  fileName: {
    type: String,
    required: true
  },
  pagesCount: {
    type: Number,
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const UploadedFile = mongoose.model('UploadedFile', uploadedFileSchema);
export default UploadedFile;
