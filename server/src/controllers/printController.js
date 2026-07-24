import PrintOrder from '../models/PrintOrder.js';
import User from '../models/User.js';
import UploadedFile from '../models/UploadedFile.js';
import cloudinary from '../config/cloudinary.js';

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

    // resource_type must NOT be in signed params for raw uploads
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      apiSecret
    );

    res.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      resourceType: 'raw',
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`
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

// @desc    Generate signed Cloudinary URLs for PDF download/view
// @route   GET /api/print/signed-url?url=<cloudinary_url>
// @access  Private (Admin)
export const getSignedPdfUrl = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: 'url query parameter is required' });

    if (!url.includes('cloudinary.com')) {
      return res.json({ signedUrl: url, fallbackUrls: [] });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiSecret) {
      return res.json({ signedUrl: url, fallbackUrls: [] });
    }

    // Extract version and public ID from Cloudinary URL
    const versionMatch = url.match(/\/upload\/(v\d+)\//);
    const version = versionMatch ? versionMatch[1] : null;

    const uploadMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (!uploadMatch) return res.json({ signedUrl: url, fallbackUrls: [] });

    const fullPath = uploadMatch[1];
    const publicId = fullPath.replace(/\.[^.]+$/, '');
    const ext = fullPath.match(/\.([^.]+)$/)?.[1] || 'pdf';

    const isRaw = url.includes('/raw/upload/');
    const resourceType = isRaw ? 'raw' : 'image';

    const baseOptions = {
      sign_url: true,
      secure: true,
      resource_type: resourceType,
      format: ext,
      type: 'upload'
    };
    if (version) {
      baseOptions.version = version.replace('v', '');
    }

    // PRIMARY: fl_attachment forces Cloudinary to serve the ORIGINAL uploaded file binary
    // (without this, PDFs stored as 'image' type get rasterized to PNG)
    // Signed URLs bypass strict transformations, so this works even with restricted accounts
    const downloadUrl = cloudinary.url(publicId, {
      ...baseOptions,
      flags: 'attachment'
    });

    // FALLBACK 1: Plain signed URL without transformation (for raw-type PDFs that work directly)
    const plainUrl = cloudinary.url(publicId, baseOptions);

    // FALLBACK 2: Try as 'raw' resource type with fl_attachment
    const rawDownloadUrl = resourceType !== 'raw' 
      ? cloudinary.url(publicId, { ...baseOptions, resource_type: 'raw', flags: 'attachment' })
      : null;

    // FALLBACK 3: Try as 'raw' resource type plain
    const rawPlainUrl = resourceType !== 'raw'
      ? cloudinary.url(publicId, { ...baseOptions, resource_type: 'raw' })
      : null;

    const fallbackUrls = [plainUrl, rawDownloadUrl, rawPlainUrl].filter(Boolean);

    res.json({ signedUrl: downloadUrl, fallbackUrls });
  } catch (error) {
    console.error('Signed URL generation error:', error);
    res.status(500).json({ message: 'Failed to generate signed URL', error: error.message });
  }
};
