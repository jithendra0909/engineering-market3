import mongoose from 'mongoose';

const pdfChunkSchema = new mongoose.Schema({
  uploadId: {
    type: String,
    required: true,
    index: true
  },
  chunkIndex: {
    type: Number,
    required: true
  },
  totalChunks: {
    type: Number,
    required: true
  },
  data: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Auto-expire incomplete upload chunks after 2 hours
pdfChunkSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7200 });

const PdfChunk = mongoose.model('PdfChunk', pdfChunkSchema);
export default PdfChunk;
