import mongoose from 'mongoose';
import PrintOrder from '../models/PrintOrder.js';
import User from '../models/User.js';
import UploadedFile from '../models/UploadedFile.js';
import PdfChunk from '../models/PdfChunk.js';
import cloudinary from '../config/cloudinary.js';

let gridfsBucket;
const getGridFSBucket = () => {
  if (!gridfsBucket && mongoose.connection.db) {
    gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'print_pdfs'
    });
  }
  return gridfsBucket;
};

// @desc    Place a print order
// @route   POST /api/print/order
// @access  Private
export const createPrintOrder = async (req, res) => {
  try {
    const {
      studentName,
      registrationNumber,
      contactNumber,
      section,
      department,
      files, // Array of files: { pdfFileUrl, fileName, pagesCount, layout, colorType, binding, sets, instructions, subtotal }
      paymentScreenshotUrl,
      upiReference,
      deliveryDate,
      totalPrice
    } = req.body;

    // Verify user is from VIIT
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.college !== "Vignan's Institute of Information Technology (VIIT)") {
      return res.status(400).json({
        message: "Printing service is only available for Vignan's Institute of Information Technology (VIIT) students. Non-VIIT students, please contact 9391461855."
      });
    }

    // Validate parameters
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: 'At least one print file configuration is required.' });
    }

    if (!paymentScreenshotUrl) {
      return res.status(400).json({ message: 'Payment screenshot proof is required.' });
    }

    if (!upiReference) {
      return res.status(400).json({ message: 'UPI transaction reference code is required.' });
    }

    // Recalculate cost math securely on the backend using database uploads
    let calculatedTotal = 0;
    const verifiedFiles = [];

    for (const file of files) {
      const dbFile = await UploadedFile.findOne({ url: file.pdfFileUrl });
      if (!dbFile) {
        return res.status(400).json({ message: `Secure metadata check failed for file ${file.fileName}. Please upload it again.` });
      }

      // Check if file belongs to the requesting user
      if (dbFile.student.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: `Access denied. File ${file.fileName} does not belong to your account.` });
      }

      let sheets = dbFile.pagesCount;
      if (file.layout === 'both-side') {
        sheets = Math.ceil(dbFile.pagesCount / 2);
      } else if (file.layout === 'four-pages') {
        sheets = Math.ceil(dbFile.pagesCount / 4);
      }

      const perPaperRate = file.colorType === 'bw' ? 1.3 : 3.5;
      const bindingCost = file.binding === 'spiral' ? 30 : 0;
      const calculatedSubtotal = parseFloat(((sheets * perPaperRate * file.sets) + (bindingCost * file.sets)).toFixed(2));

      calculatedTotal += calculatedSubtotal;
      
      verifiedFiles.push({
        pdfFileUrl: file.pdfFileUrl,
        fileName: file.fileName,
        pagesCount: dbFile.pagesCount,
        layout: file.layout,
        colorType: file.colorType,
        binding: file.binding,
        sets: file.sets,
        instructions: file.instructions || '',
        subtotal: calculatedSubtotal
      });
    }

    calculatedTotal = parseFloat(calculatedTotal.toFixed(2));

    // Verify sent price matches server calculation
    if (Math.abs(calculatedTotal - Number(totalPrice)) > 0.05) {
      return res.status(400).json({
        message: `Order cost verification failed. Calculated: ₹${calculatedTotal}, Sent: ₹${totalPrice}`
      });
    }

    // Verify delivery date is at least 24 hours in the future
    const dateRequired = new Date(deliveryDate);
    const presentTime = new Date();
    const diffTime = dateRequired.getTime() - presentTime.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);

    if (diffHours < 24) {
      return res.status(400).json({
        message: 'Delivery date must be at least 24 hours in the future. For urgent prints, contact 9391461855.'
      });
    }

    // Create the order
    const printOrder = new PrintOrder({
      student: req.user._id,
      studentName,
      registrationNumber,
      contactNumber,
      section,
      department,
      files: verifiedFiles,
      paymentScreenshotUrl,
      upiReference,
      deliveryDate: dateRequired,
      totalPrice: calculatedTotal,
      status: 'pending'
    });

    await printOrder.save();

    res.status(201).json({
      message: 'Print order placed successfully!',
      order: printOrder
    });
  } catch (error) {
    console.error('Error placing print order:', error);
    res.status(500).json({ message: 'Server error placing print order', error: error.message });
  }
};

// @desc    Get student's own print orders
// @route   GET /api/print/my-orders
// @access  Private
export const getMyPrintOrders = async (req, res) => {
  try {
    const orders = await PrintOrder.find({ student: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving print orders', error: error.message });
  }
};

// @desc    Get all print orders (Admin/Vendor only)
// @route   GET /api/print/all-orders
// @access  Private/Admin
export const getAllPrintOrders = async (req, res) => {
  try {
    const orders = await PrintOrder.find().populate('student', 'fullName email whatsappNumber department year').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving all print orders', error: error.message });
  }
};

// @desc    Update print order status (Admin/Vendor only)
// @route   PUT /api/print/orders/:id/status
// @access  Private/Admin
export const updatePrintOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'printing', 'out-for-delivery', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await PrintOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Print order not found' });
    }

    order.status = status;
    await order.save();

    // Auto-cleanup: Delete PDF files from Supabase Storage after delivery
    if (status === 'delivered' && order.files && order.files.length > 0) {
      (async () => {
        try {
          const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ymarvpwrpwbkkonhsdhm.supabase.co';
          const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY;

          if (!SUPABASE_URL || !SUPABASE_KEY) {
            console.warn('[Cleanup] Supabase credentials not configured, skipping Supabase file cleanup');
            return;
          }

          const filesToDelete = [];
          for (const file of order.files) {
            const url = file.pdfFileUrl;
            if (url && url.includes('supabase.co') && url.includes('/prints/')) {
              // Extract filename from URL: .../storage/v1/object/public/prints/FILENAME
              const fileName = url.split('/prints/').pop();
              if (fileName) filesToDelete.push(fileName);
            }
            // Clean up UploadedFile record from MongoDB
            if (url) {
              await UploadedFile.deleteOne({ url });
            }
          }

          if (filesToDelete.length > 0) {
            const deleteRes = await fetch(`${SUPABASE_URL}/storage/v1/object/prints`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ prefixes: filesToDelete })
            });
            console.log(`[Cleanup] Deleted ${filesToDelete.length} file(s) from Supabase for order ${order._id}`, deleteRes.ok ? '✓' : '✗');
          }
        } catch (cleanupErr) {
          console.error('[Cleanup] Error deleting files after delivery:', cleanupErr.message);
          // Don't fail the status update if cleanup fails
        }
      })();
    }

    res.json({
      message: 'Print order status updated successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating print order status', error: error.message });
  }
};

// @desc    Generate a signed Cloudinary upload signature for direct browser upload
// @route   GET /api/print/cloudinary-sign
// @access  Private
// This allows the browser to upload directly to Cloudinary, bypassing Vercel's 4.5MB body limit
export const getCloudinarySignature = async (req, res) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      // In dev: tell client to use server-side upload instead
      return res.json({ useFallback: true });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'engineering-market/prints';

    const signature = cloudinary.utils.api_sign_request(
      { folder, timestamp },
      apiSecret
    );

    res.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
    });
  } catch (error) {
    console.error('Cloudinary sign error:', error);
    res.status(500).json({ message: 'Failed to generate upload signature', error: error.message });
  }
};

// @desc    Register a PDF that was uploaded directly to Cloudinary by the browser
// @route   POST /api/print/register-pdf
// @access  Private
export const registerPdf = async (req, res) => {
  try {
    const { url, fileName, pagesCount } = req.body;

    if (!url || !fileName) {
      return res.status(400).json({ message: 'url and fileName are required' });
    }

    // Check if already registered (idempotent)
    const existing = await UploadedFile.findOne({ url });
    if (existing) {
      return res.json({ url: existing.url, fileName: existing.fileName, pagesCount: existing.pagesCount });
    }

    const record = await UploadedFile.create({
      url,
      fileName,
      pagesCount: pagesCount || 1,
      student: req.user._id
    });

    res.status(201).json({ url: record.url, fileName: record.fileName, pagesCount: record.pagesCount });
  } catch (error) {
    console.error('Register PDF error:', error);
    res.status(500).json({ message: 'Failed to register PDF metadata', error: error.message });
  }
};

// @desc    Proxy-fetch a PDF from Cloudinary and return it to the client
//          This bypasses ALL Cloudinary delivery restrictions (strict transforms, auth, CORS)
//          because the fetch happens server-to-server with the configured SDK credentials.
// @route   GET /api/print/proxy-pdf?url=<cloudinary_url>&mode=view|download
// @access  Private (Admin)
export const proxyPdfDownload = async (req, res) => {
  try {
    const { url, mode = 'download', fileName = 'document.pdf' } = req.query;
    if (!url) return res.status(400).json({ message: 'url query parameter is required' });

    // Validate URL against allowlist to prevent SSRF and open redirects
    try {
      const parsedUrl = new URL(url, 'https://localhost');
      const allowedHosts = ['res.cloudinary.com', 'cloudinary.com', 'ymarvpwrpwbkkonhsdhm.supabase.co'];
      const isAllowedHost = allowedHosts.some(host => parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host));
      const isLocalPath = url.startsWith('/uploads/') || url.startsWith('/api/print/');

      if (!isAllowedHost && !isLocalPath) {
        return res.status(400).json({ message: 'Access denied: URL host is not in the allowed storage domains.' });
      }
    } catch {
      return res.status(400).json({ message: 'Invalid URL format' });
    }

    // Non-Cloudinary URLs: redirect directly
    if (!url.includes('cloudinary.com')) {
      return res.redirect(url);
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Extract public ID and version from URL
    const versionMatch = url.match(/\/upload\/(v\d+)\//);
    const version = versionMatch ? versionMatch[1].replace('v', '') : undefined;
    const uploadMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    
    if (!uploadMatch || !cloudName || !apiSecret) {
      // Can't parse or no credentials — try fetching original URL directly
      return await tryFetchAndSend(res, [url], fileName, mode);
    }

    const fullPath = uploadMatch[1];
    const publicId = fullPath.replace(/\.[^.]+$/, '');
    const ext = fullPath.match(/\.([^.]+)$/)?.[1] || 'pdf';
    const isRaw = url.includes('/raw/upload/');

    // Build multiple signed URLs to try (different resource types + flags)
    const makeSignedUrl = (resourceType, useAttachment) => {
      const opts = {
        sign_url: true,
        secure: true,
        resource_type: resourceType,
        format: ext,
        type: 'upload'
      };
      if (version) opts.version = version;
      if (useAttachment) opts.flags = 'attachment';
      return cloudinary.url(publicId, opts);
    };

    // Try these URLs in order — first valid PDF response wins
    const urlsToTry = [
      makeSignedUrl(isRaw ? 'raw' : 'image', true),   // primary type + fl_attachment
      makeSignedUrl(isRaw ? 'raw' : 'image', false),  // primary type, no flag
      makeSignedUrl(isRaw ? 'image' : 'raw', true),   // alternate type + fl_attachment
      makeSignedUrl(isRaw ? 'image' : 'raw', false),  // alternate type, no flag
      url                                               // original URL as-is
    ];

    await tryFetchAndSend(res, urlsToTry, fileName, mode);
  } catch (error) {
    console.error('Proxy PDF error:', error);
    res.status(500).json({ message: 'Failed to retrieve PDF', error: error.message });
  }
};

// Helper: try multiple URLs, return first one that is a valid PDF
async function tryFetchAndSend(res, urls, fileName, mode) {
  for (const tryUrl of urls) {
    try {
      const response = await fetch(tryUrl);
      if (!response.ok) continue;

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Verify it's actually a PDF (magic bytes: %PDF)
      if (buffer.length >= 4) {
        const magic = buffer.slice(0, 5).toString('ascii');
        if (magic.startsWith('%PDF')) {
          // It's a real PDF! Send it to the client
          const disposition = mode === 'view' ? 'inline' : 'attachment';
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `${disposition}; filename="${fileName}"`);
          res.setHeader('Content-Length', buffer.length);
          res.setHeader('Cache-Control', 'private, max-age=3600');
          return res.send(buffer);
        }
      }
      // Not a PDF — try next URL
    } catch (e) {
      // Fetch failed — try next URL
      continue;
    }
  }

  // All URLs exhausted — nothing returned a valid PDF
  res.status(404).json({ 
    message: 'Could not retrieve a valid PDF from any Cloudinary URL. The file may have been corrupted during upload or is no longer available.',
    tried: urls.length 
  });
}

// @desc    Upload a PDF chunk (3MB max per chunk to bypass Vercel limits)
// @route   POST /api/print/upload-chunk
// @access  Private
export const uploadPdfChunk = async (req, res) => {
  try {
    const { uploadId, chunkIndex, totalChunks, chunkData, fileName, pagesCount } = req.body;

    if (!uploadId || chunkIndex === undefined || !totalChunks || !chunkData || !fileName) {
      return res.status(400).json({ message: 'Missing chunk upload parameters' });
    }

    // Store this chunk in MongoDB
    await PdfChunk.create({
      uploadId,
      chunkIndex,
      totalChunks,
      data: chunkData
    });

    // Check how many chunks have arrived
    const savedCount = await PdfChunk.countDocuments({ uploadId });

    if (savedCount < totalChunks) {
      return res.json({ 
        success: true, 
        received: savedCount, 
        totalChunks, 
        isComplete: false 
      });
    }

    // All chunks saved! Reassemble full PDF buffer
    const chunks = await PdfChunk.find({ uploadId }).sort({ chunkIndex: 1 });
    const bufferArray = chunks.map(c => Buffer.from(c.data, 'base64'));
    const fullBuffer = Buffer.concat(bufferArray);

    // Save to GridFS
    const bucket = getGridFSBucket();
    if (!bucket) {
      return res.status(500).json({ message: 'Database file storage is not ready' });
    }

    const uploadStream = bucket.openUploadStream(fileName, {
      contentType: 'application/pdf',
      metadata: {
        student: req.user._id,
        pagesCount: pagesCount || 1
      }
    });

    const fileId = uploadStream.id;

    await new Promise((resolve, reject) => {
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
      uploadStream.end(fullBuffer);
    });

    // Clean up temporary chunks
    await PdfChunk.deleteMany({ uploadId });

    const fileUrl = `/api/print/file/${fileId}`;

    // Register with UploadedFile model
    await UploadedFile.create({
      url: fileUrl,
      fileName,
      pagesCount: pagesCount || 1,
      student: req.user._id
    });

    res.json({
      success: true,
      isComplete: true,
      url: fileUrl,
      fileName,
      pagesCount: pagesCount || 1
    });
  } catch (error) {
    console.error('Upload chunk error:', error);
    res.status(500).json({ message: 'Failed to process PDF chunk', error: error.message });
  }
};

// @desc    Stream or download a PDF file from GridFS database storage
// @route   GET /api/print/file/:fileId
// @access  Public / Private
export const getPrintFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const isDownload = req.query.download === 'true';

    if (!mongoose.Types.ObjectId.isValid(fileId)) {
      return res.status(400).json({ message: 'Invalid file ID' });
    }

    const bucket = getGridFSBucket();
    if (!bucket) {
      return res.status(500).json({ message: 'Database file storage is not ready' });
    }

    const _id = new mongoose.Types.ObjectId(fileId);
    const files = await bucket.find({ _id }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];
    const fileName = file.filename || 'document.pdf';
    const disposition = isDownload ? 'attachment' : 'inline';

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Length', file.length);
    res.setHeader('Cache-Control', 'private, max-age=86400');

    const downloadStream = bucket.openDownloadStream(_id);
    downloadStream.on('error', (err) => {
      console.error('GridFS stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming PDF file' });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Get print file error:', error);
    res.status(500).json({ message: 'Failed to retrieve PDF file', error: error.message });
  }
};

