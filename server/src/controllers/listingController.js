import Listing from '../models/Listing.js';
import User from '../models/User.js';

// @desc    Get all listings accessible by user
// @route   GET /api/listings
// @access  Private
const getListings = async (req, res) => {
  try {
    let query = { status: 'available' };
    
    // If authenticated admin, show everything; if student, show general + own college; if unauthenticated, show only general
    if (req.user && req.user.role === 'admin') {
      // Admin sees all listings
    } else if (req.user) {
      query.$or = [
        { marketType: 'general' },
        { marketType: 'college', sellerCollege: req.user.college }
      ];
    } else {
      // Unauthenticated: show all available listings (general + college)
    }
    
    const listings = await Listing.find(query)
      .populate('seller', 'fullName email profileImageUrl')
      .sort({ createdAt: -1 });
      
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving listings', error: error.message });
  }
};

// @desc    Get general market listings
// @route   GET /api/listings/general
// @access  Private
const getGeneralListings = async (req, res) => {
  try {
    const listings = await Listing.find({ marketType: 'general', status: 'available' })
      .populate('seller', 'fullName email profileImageUrl')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving general listings', error: error.message });
  }
};

// @desc    Get college market listings for user's college
// @route   GET /api/listings/college
// @access  Private
const getCollegeListings = async (req, res) => {
  try {
    const listings = await Listing.find({ 
      marketType: 'college', 
      sellerCollege: req.user.college,
      status: 'available' 
    })
      .populate('seller', 'fullName email profileImageUrl')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving college listings', error: error.message });
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Private
const getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'fullName email profileImageUrl department year whatsappNumber');
      
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Authorization check: if college market and user is authenticated, verify same college or admin
    if (req.user && req.user.role !== 'admin' && listing.marketType === 'college' && listing.sellerCollege !== req.user.college) {
      return res.status(403).json({ message: 'Access denied. This listing is only visible to students of ' + listing.sellerCollege });
    }
    
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving listing details', error: error.message });
  }
};

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private & Verified
const createListing = async (req, res) => {
  try {
    const { title, description, price, category, condition, listingType, marketType, whatsappNumber } = req.body;
    
    // Image handling from Multer multiple uploads
    let imageUrls = [];
    if (req.uploadedPaths && req.uploadedPaths.length > 0) {
      imageUrls = req.uploadedPaths;
    } else {
      return res.status(400).json({ message: 'At least one product image is required.' });
    }
    
    // If listing is a donation, price must be 0
    const finalPrice = listingType === 'donate' ? 0 : Number(price);
    
    const listing = await Listing.create({
      title,
      description,
      price: finalPrice,
      images: imageUrls,
      category,
      condition,
      listingType,
      marketType,
      seller: req.user._id,
      sellerCollege: req.user.college,
      sellerWhatsappNumber: whatsappNumber || req.user.whatsappNumber,
      status: 'available'
    });
    
    res.status(201).json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ message: 'Server error creating listing', error: error.message });
  }
};

// @desc    Update listing details
// @route   PUT /api/listings/:id
// @access  Private & Verified
const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check ownership
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized to edit this listing' });
    }
    
    const { title, description, price, category, condition, listingType, marketType, status } = req.body;
    
    listing.title = title || listing.title;
    listing.description = description || listing.description;
    listing.price = listingType === 'donate' ? 0 : (price !== undefined ? Number(price) : listing.price);
    listing.category = category || listing.category;
    listing.condition = condition || listing.condition;
    listing.listingType = listingType || listing.listingType;
    listing.marketType = marketType || listing.marketType;
    listing.status = status || listing.status;
    
    // Update uploaded images if provided
    if (req.uploadedPaths && req.uploadedPaths.length > 0) {
      listing.images = req.uploadedPaths;
    }
    
    const updatedListing = await listing.save();
    res.json(updatedListing);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating listing', error: error.message });
  }
};

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private & Verified
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    // Check ownership or admin
    if (listing.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'User not authorized to delete this listing' });
    }
    
    await listing.deleteOne();
    res.json({ message: 'Listing removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error removing listing', error: error.message });
  }
};

// @desc    Contact seller (Checks if user is verified)
// @route   POST /api/listings/:id/contact
// @access  Private & Verified
const contactListingSeller = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', 'fullName whatsappNumber');
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    res.json({
      sellerWhatsappNumber: listing.sellerWhatsappNumber || listing.seller.whatsappNumber,
      message: 'Is it available?'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during contact route', error: error.message });
  }
};

// @desc    Save/Bookmark a listing
// @route   POST /api/listings/:id/save
// @access  Private
const saveListing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listingId = req.params.id;
    
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    const isAlreadySaved = user.savedListings.includes(listingId);
    
    if (isAlreadySaved) {
      // Remove it
      user.savedListings = user.savedListings.filter(id => id.toString() !== listingId);
      await user.save();
      res.json({ message: 'Listing unsaved successfully', saved: false });
    } else {
      // Save it
      user.savedListings.push(listingId);
      await user.save();
      res.json({ message: 'Listing saved successfully', saved: true });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error saving listing', error: error.message });
  }
};

export {
  getListings,
  getGeneralListings,
  getCollegeListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  contactListingSeller,
  saveListing
};
