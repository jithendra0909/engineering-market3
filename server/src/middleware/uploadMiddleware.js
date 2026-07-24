import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import UploadedFile from '../models/UploadedFile.js';

// Setup memory storage for Multer
const storage = multer.memoryStorage();

// File filter (images only)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files (jpg, jpeg, png, webp) are allowed!'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit
  fileFilter: fileFilter
});

// Helper to upload buffer to Cloudinary via stream
const uploadToCloudinary = (fileBuffer, folder = 'engineering-market') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Helper to save buffer locally
const saveLocally = (fileBuffer, originalName) => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(originalName).toLowerCase();
  const filename = `${uniqueSuffix}${ext}`;
  
  // Ensure server/public/uploads exists
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, fileBuffer);
  
  // Return the relative URL served by Express static
  return `/uploads/${filename}`;
};

// Check file signature magic bytes
const checkMagicBytes = (buffer) => {
  if (!buffer || buffer.length < 4) return false;
  const hex = buffer.toString('hex', 0, 4);
  // JPEG: ffd8ff
  if (hex.startsWith('ffd8ff')) return true;
  // PNG: 89504e47
  if (hex === '89504e47') return true;
  // WebP/RIFF: 52494646
  if (hex === '52494646') {
    const webpHex = buffer.toString('hex', 8, 12);
    if (webpHex === '57454250') return true;
  }
  return false;
};

// Middleware handler for single file upload
const handleSingleUpload = (fieldName) => {
  const uploadMiddleware = upload.single(fieldName);
  
  return (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.file) {
        return next();
      }

      // Strict file signature check (magic bytes guard)
      if (!checkMagicBytes(req.file.buffer)) {
        return res.status(400).json({ message: 'Invalid file signature. Only actual image files (JPG, PNG, WebP) are allowed!' });
      }
      
      try {
        if (isCloudinaryConfigured) {
          // Upload to Cloudinary
          const url = await uploadToCloudinary(req.file.buffer);
          req.file.path = url; // Set path to Cloudinary URL
        } else {
          // Fallback to local storage
          if (process.env.NODE_ENV === 'production') {
            return res.status(500).json({ message: 'Cloudinary credentials not configured in production environment.' });
          }
          const url = saveLocally(req.file.buffer, req.file.originalname);
          req.file.path = url; // Set path to local static URL
        }
        next();
      } catch (uploadErr) {
        console.error('File upload error:', uploadErr);
        res.status(500).json({ message: 'Failed to upload image.', error: uploadErr.message });
      }
    });
  };
};

// Middleware handler for multiple files upload
const handleMultipleUpload = (fieldName, maxCount = 5) => {
  const uploadMiddleware = upload.array(fieldName, maxCount);
  
  return (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.files || req.files.length === 0) {
        req.uploadedPaths = [];
        return next();
      }

      // Check signature for all files
      const invalidFile = req.files.find(file => !checkMagicBytes(file.buffer));
      if (invalidFile) {
        return res.status(400).json({ message: `Invalid file signature for ${invalidFile.originalname}. Only actual image files (JPG, PNG, WebP) are allowed!` });
      }
      
      try {
        const uploadPromises = req.files.map(async (file) => {
          if (isCloudinaryConfigured) {
            return await uploadToCloudinary(file.buffer);
          } else {
            if (process.env.NODE_ENV === 'production') {
              throw new Error('Cloudinary credentials not configured in production environment.');
            }
            return saveLocally(file.buffer, file.originalname);
          }
        });
        
        req.uploadedPaths = await Promise.all(uploadPromises);
        next();
      } catch (uploadErr) {
        console.error('Files upload error:', uploadErr);
        res.status(500).json({ message: 'Failed to upload images.', error: uploadErr.message });
      }
    });
  };
};

// PDF file filter
const pdfFileFilter = (req, file, cb) => {
  const isPdf = file.mimetype === 'application/pdf' || file.mimetype === 'application/x-pdf' || file.mimetype === '';
  const isExtPdf = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isPdf || isExtPdf) {
    return cb(null, true);
  }
  cb(new Error('Only PDF files (.pdf) are allowed!'));
};

const pdfUpload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: pdfFileFilter
});

const fastGetPdfPageCount = (buffer) => {
  if (!buffer || buffer.length === 0) return null;

  try {
    // Strategy 1: Scan the ENTIRE buffer (in 512KB chunks to avoid huge string creation)
    // Looking for /Count <number> pattern — most reliable approach
    const CHUNK = 512 * 1024;
    let maxCount = 0;

    for (let offset = 0; offset < buffer.length; offset += CHUNK) {
      const end = Math.min(offset + CHUNK + 64, buffer.length); // 64 byte overlap
      const chunk = buffer.toString('latin1', offset, end);

      // Match /Count <number> anywhere (not just inside <<>>)
      const matches = chunk.match(/\/Count\s+(\d+)/g);
      if (matches) {
        for (const m of matches) {
          const n = parseInt(m.match(/\d+/)[0], 10);
          if (n > maxCount) maxCount = n;
        }
      }
    }

    if (maxCount > 0) return maxCount;

    // Strategy 2: Look for /N <number> in trailer (some older PDFs use this)
    const trailerSlice = buffer.toString('latin1', Math.max(0, buffer.length - 256 * 1024));
    const nMatch = trailerSlice.match(/\/N\s+(\d+)/);
    if (nMatch) {
      const n = parseInt(nMatch[1], 10);
      if (n > 0) return n;
    }

    return null;
  } catch (e) {
    return null;
  }
};

const checkPdfMagicBytes = (buffer) => {
  if (!buffer || buffer.length < 4) return false;
  // Scan the first 1024 bytes to locate the standard '%PDF-' magic bytes header
  const searchLimit = Math.min(buffer.length, 1024);
  const leadingBytes = buffer.toString('binary', 0, searchLimit);
  return leadingBytes.includes('%PDF-');
};

const handlePdfUpload = (fieldName) => {
  const uploadMiddleware = pdfUpload.single(fieldName);
  
  return (req, res, next) => {
    uploadMiddleware(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.file) {
        return next();
      }

      // Check file signature magic bytes
      if (!checkPdfMagicBytes(req.file.buffer)) {
        return res.status(400).json({ message: 'Invalid file signature. Only actual PDF files are allowed!' });
      }
      
      // Count PDF pages on server using fast binary scan only (never blocks)
      let pagesCount = 1;

      try {
        const fastCount = fastGetPdfPageCount(req.file.buffer);
        if (fastCount && fastCount > 0) {
          pagesCount = fastCount;
        }
      } catch (fastErr) {
        console.error('Fast PDF page counting failed:', fastErr);
      }
      // If fast scan couldn't find page count, default to 1.
      // User can manually correct the count in the UI.

      req.file.pagesCount = pagesCount;
      
      try {
        let fileUrl;
        if (isCloudinaryConfigured) {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'engineering-market/prints', resource_type: 'raw' },
              (error, uploadResult) => {
                if (error) return reject(error);
                resolve(uploadResult.secure_url);
              }
            );
            uploadStream.end(req.file.buffer);
          });
          fileUrl = result;
          req.file.path = result;
        } else {
          if (process.env.NODE_ENV === 'production') {
            return res.status(500).json({ message: 'Cloudinary credentials not configured in production environment.' });
          }
          const url = saveLocally(req.file.buffer, req.file.originalname);
          fileUrl = url;
          req.file.path = url;
        }

        // Save metadata securely to Database for checkout validation
        await UploadedFile.create({
          url: fileUrl,
          fileName: req.file.originalname,
          pagesCount: req.file.pagesCount,
          student: req.user._id
        });

        next();
      } catch (uploadErr) {
        console.error('PDF upload error:', uploadErr);
        res.status(500).json({ message: 'Failed to upload PDF.', error: uploadErr.message });
      }
    });
  };
};

export { handleSingleUpload, handleMultipleUpload, handlePdfUpload };
