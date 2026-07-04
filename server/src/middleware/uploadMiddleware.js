import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { isCloudinaryConfigured } from '../config/cloudinary.js';

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

export { handleSingleUpload, handleMultipleUpload };
