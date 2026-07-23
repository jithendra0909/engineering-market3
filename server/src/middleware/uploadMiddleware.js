import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
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
  const isPdf = file.mimetype === 'application/pdf';
  const isExtPdf = path.extname(file.originalname).toLowerCase() === '.pdf';

  if (isPdf && isExtPdf) {
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

  const searchSlice = (sliceText) => {
    const dictRegex = /<<([^>]+)>>/g;
    let match;
    let maxCount = 0;
    while ((match = dictRegex.exec(sliceText)) !== null) {
      const dictContent = match[1];
      if (/\/Type\s*\/Pages/.test(dictContent)) {
        const countMatch = dictContent.match(/\/Count\s+(\d+)/);
        if (countMatch) {
          const count = parseInt(countMatch[1], 10);
          if (count > maxCount) {
            maxCount = count;
          }
        }
      }
    }
    return maxCount;
  };

  const headerSize = Math.min(buffer.length, 256 * 1024);
  const headerText = buffer.toString('binary', 0, headerSize);
  let count = searchSlice(headerText);
  if (count > 0) return count;

  if (buffer.length > 256 * 1024) {
    const trailerStart = Math.max(0, buffer.length - 1024 * 1024);
    const trailerText = buffer.toString('binary', trailerStart);
    count = searchSlice(trailerText);
    if (count > 0) return count;
  }

  const lastSegmentStart = Math.max(0, buffer.length - 1024 * 1024);
  const lastSegmentText = buffer.toString('binary', lastSegmentStart);
  const countMatches = lastSegmentText.match(/\/Count\s+(\d+)/g);
  if (countMatches) {
    const lastMatch = countMatches[countMatches.length - 1];
    const numMatch = lastMatch.match(/\d+/);
    if (numMatch) {
      return parseInt(numMatch[0], 10);
    }
  }

  return null;
};

const checkPdfMagicBytes = (buffer) => {
  if (!buffer || buffer.length < 4) return false;
  const hex = buffer.toString('hex', 0, 4);
  // PDF magic bytes start with '%PDF-' (hex: 25504446)
  return hex === '25504446';
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
      
      // Count PDF pages on server using fast check, with full pdfParse fallback
      let pagesCount = 1;
      let parseSuccess = false;

      // 1. Fast, non-blocking check on sliced buffer first
      try {
        const fastCount = fastGetPdfPageCount(req.file.buffer);
        if (fastCount && fastCount > 0) {
          pagesCount = fastCount;
          parseSuccess = true;
        }
      } catch (fastErr) {
        console.error('Fast PDF page counting failed:', fastErr);
      }

      // 2. Fallback to full pdf-parse ONLY if fast check failed
      if (!parseSuccess) {
        let parser;
        try {
          parser = new pdfParse.PDFParse({ data: req.file.buffer });
          const doc = await parser.load();
          pagesCount = doc.numPages || 1;
          parseSuccess = true;
          await parser.destroy();
        } catch (parseErr) {
          console.error('Failed to parse PDF pages on server:', parseErr);
          if (parser) {
            try {
              await parser.destroy();
            } catch (_) {}
          }
          
          // Strict Rejections: password protected
          const errMessage = parseErr.message || '';
          const errName = parseErr.name || '';
          if (errMessage.includes('password') || errName === 'PasswordException' || errMessage.includes('Password')) {
            return res.status(400).json({ message: 'The PDF is password protected. Please remove the password and try again.' });
          }
        }
      }

      if (!parseSuccess) {
        return res.status(400).json({ message: 'The PDF file appears to be corrupted, invalid, or password protected. Please check the file and try again.' });
      }

      req.file.pagesCount = pagesCount;
      
      try {
        let fileUrl;
        if (isCloudinaryConfigured) {
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: 'engineering-market/prints', resource_type: 'auto' },
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
