import GiftProduct from '../models/GiftProduct.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all gift products (public: active only, admin: all)
// @route   GET /api/gift/products
// @access  Public
const getGiftProducts = async (req, res) => {
  try {
    let query = {};

    // Non-admin callers only see active products.
    // Admin callers also only see active products on public pages.
    // Admin dashboard passes ?showAll=true to see inactive products too.
    if (req.query.showAll === 'true' && req.user && req.user.role === 'admin') {
      // Admin dashboard view: show all products (active + inactive)
    } else {
      query.isActive = true;
    }

    // Optional category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Optional featured filter
    if (req.query.featured === 'true') {
      query.isFeatured = true;
    }

    // Optional search filter
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // default: newest
    if (req.query.sort === 'price-asc') {
      sortOption = { basePrice: 1 };
    } else if (req.query.sort === 'price-desc') {
      sortOption = { basePrice: -1 };
    }

    const products = await GiftProduct.find(query).sort(sortOption);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving gift products', error: error.message });
  }
};

// @desc    Get single gift product
// @route   GET /api/gift/products/:id
// @access  Public
const getGiftProductById = async (req, res) => {
  try {
    const product = await GiftProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Gift product not found' });
    }

    // Non-admin cannot view inactive products
    if (!product.isActive && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({ message: 'Gift product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving gift product', error: error.message });
  }
};

// @desc    Generate a signed Cloudinary upload signature for direct browser upload of gift images
// @route   GET /api/gift/cloudinary-sign
// @access  Private/Admin
// This allows the browser to upload images directly to Cloudinary, bypassing Vercel's 4.5MB body limit
const getGiftImageCloudinarySignature = async (req, res) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      // In dev: tell client to use server-side upload (multer) instead
      return res.json({ useFallback: true });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = 'engineering-market/gift-products';

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
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    });
  } catch (error) {
    console.error('Gift Cloudinary sign error:', error);
    res.status(500).json({ message: 'Failed to generate upload signature', error: error.message });
  }
};

// @desc    Create a new gift product
// @route   POST /api/gift/products
// @access  Admin
const createGiftProduct = async (req, res) => {
  try {
    const { title, description, category, basePrice, mrpPrice, features, badge, isFeatured, sizeOptions } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Product title is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Product description is required' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ message: 'Product category is required' });
    }
    if (!basePrice || isNaN(Number(basePrice))) {
      return res.status(400).json({ message: 'Valid selling price is required' });
    }

    if (mrpPrice !== undefined && mrpPrice !== '' && mrpPrice !== null) {
      if (Number(mrpPrice) < Number(basePrice)) {
        return res.status(400).json({ message: 'MRP cannot be lower than the selling price' });
      }
    }

    // Image handling: combine existingImages, newImages (direct Cloudinary URLs), and uploadedPaths (multer fallback)
    let existingImagesList = [];
    if (req.body.existingImages !== undefined) {
      if (typeof req.body.existingImages === 'string') {
        try {
          existingImagesList = JSON.parse(req.body.existingImages);
        } catch {
          existingImagesList = req.body.existingImages ? [req.body.existingImages] : [];
        }
      } else if (Array.isArray(req.body.existingImages)) {
        existingImagesList = req.body.existingImages;
      }
    }

    // newImages: Cloudinary URLs uploaded directly by the browser (production path)
    let newImagesList = [];
    if (req.body.newImages !== undefined) {
      if (typeof req.body.newImages === 'string') {
        try { newImagesList = JSON.parse(req.body.newImages); } catch { newImagesList = []; }
      } else if (Array.isArray(req.body.newImages)) {
        newImagesList = req.body.newImages;
      }
    }

    // uploadedPaths: multer server-side upload fallback (local dev without Cloudinary)
    const newUploadedPaths = req.uploadedPaths || [];
    const imageUrls = [...existingImagesList, ...newImagesList, ...newUploadedPaths];

    if (imageUrls.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required.' });
    }

    // Parse features and sizeOptions if they come as JSON strings
    let parsedFeatures = features;
    if (typeof features === 'string') {
      try { parsedFeatures = JSON.parse(features); } catch { parsedFeatures = features ? [features] : []; }
    }

    let parsedSizeOptions = sizeOptions;
    if (typeof sizeOptions === 'string') {
      try { parsedSizeOptions = JSON.parse(sizeOptions); } catch { parsedSizeOptions = []; }
    }

    const product = await GiftProduct.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      images: imageUrls,
      basePrice: Number(basePrice),
      mrpPrice: mrpPrice !== undefined && mrpPrice !== '' && mrpPrice !== null ? Number(mrpPrice) : null,
      features: parsedFeatures || [],
      badge: badge || null,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      sizeOptions: parsedSizeOptions || []
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating gift product:', error);
    res.status(400).json({ message: error.message || 'Server error creating gift product', error: error.message });
  }
};

// @desc    Update gift product
// @route   PUT /api/gift/products/:id
// @access  Admin
const updateGiftProduct = async (req, res) => {
  try {
    const product = await GiftProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Gift product not found' });
    }

    const { title, description, category, basePrice, mrpPrice, features, badge, isFeatured, isActive, sizeOptions } = req.body;

    if (mrpPrice !== undefined && mrpPrice !== '' && mrpPrice !== null) {
      const effectiveBasePrice = basePrice !== undefined ? Number(basePrice) : product.basePrice;
      if (Number(mrpPrice) < effectiveBasePrice) {
        return res.status(400).json({ message: 'MRP cannot be lower than the selling price' });
      }
    }

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (basePrice !== undefined) product.basePrice = Number(basePrice);
    if (mrpPrice !== undefined) {
      product.mrpPrice = (mrpPrice === '' || mrpPrice === null) ? null : Number(mrpPrice);
    }
    if (badge !== undefined) product.badge = badge || null;
    if (isFeatured !== undefined) product.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;

    // Parse features if sent as JSON string
    if (features !== undefined) {
      if (typeof features === 'string') {
        try { product.features = JSON.parse(features); } catch { product.features = [features]; }
      } else {
        product.features = features;
      }
    }

    // Parse sizeOptions if sent as JSON string
    if (sizeOptions !== undefined) {
      if (typeof sizeOptions === 'string') {
        try { product.sizeOptions = JSON.parse(sizeOptions); } catch { product.sizeOptions = []; }
      } else {
        product.sizeOptions = sizeOptions;
      }
    }

    // Image handling: combine retained existing images, new Cloudinary URLs, and multer fallback paths
    let existingImagesList = [];
    if (req.body.existingImages !== undefined) {
      if (typeof req.body.existingImages === 'string') {
        try {
          existingImagesList = JSON.parse(req.body.existingImages);
        } catch {
          existingImagesList = req.body.existingImages ? [req.body.existingImages] : [];
        }
      } else if (Array.isArray(req.body.existingImages)) {
        existingImagesList = req.body.existingImages;
      }
    }

    // newImages: Cloudinary URLs uploaded directly by the browser (production path)
    let newImagesList = [];
    if (req.body.newImages !== undefined) {
      if (typeof req.body.newImages === 'string') {
        try { newImagesList = JSON.parse(req.body.newImages); } catch { newImagesList = []; }
      } else if (Array.isArray(req.body.newImages)) {
        newImagesList = req.body.newImages;
      }
    }

    // uploadedPaths: multer server-side upload fallback (local dev without Cloudinary)
    const newUploadedPaths = req.uploadedPaths || [];

    // If no image sources were explicitly provided, retain current images
    if (req.body.existingImages === undefined && newImagesList.length === 0 && newUploadedPaths.length === 0) {
      existingImagesList = product.images || [];
    }

    const finalImages = [...existingImagesList, ...newImagesList, ...newUploadedPaths];

    if (finalImages.length === 0) {
      return res.status(400).json({ message: 'At least one product image is required.' });
    }

    product.images = finalImages;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating gift product:', error);
    res.status(400).json({ message: error.message || 'Server error updating gift product', error: error.message });
  }
};

// @desc    Delete gift product (soft delete by default, hard delete with ?hard=true)
// @route   DELETE /api/gift/products/:id
// @access  Admin
const deleteGiftProduct = async (req, res) => {
  try {
    const product = await GiftProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Gift product not found' });
    }

    if (req.query.hard === 'true') {
      await product.deleteOne();
      res.json({ message: 'Gift product permanently deleted' });
    } else {
      product.isActive = false;
      await product.save();
      res.json({ message: 'Gift product deactivated successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting gift product', error: error.message });
  }
};

// @desc    Toggle featured status of gift product
// @route   POST /api/gift/products/:id/toggle-featured
// @access  Admin
const toggleFeatured = async (req, res) => {
  try {
    const product = await GiftProduct.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Gift product not found' });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.json({ message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'} successfully`, isFeatured: product.isFeatured });
  } catch (error) {
    res.status(500).json({ message: 'Server error toggling featured status', error: error.message });
  }
};

export {
  getGiftProducts,
  getGiftProductById,
  createGiftProduct,
  updateGiftProduct,
  deleteGiftProduct,
  toggleFeatured,
  getGiftImageCloudinarySignature
};
