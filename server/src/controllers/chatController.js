import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Listing from '../models/Listing.js';
import User from '../models/User.js';
import { sendWhatsAppNotification } from '../utils/whatsappNotification.js';

// @desc    Get all conversations for logged-in user
// @route   GET /api/chats
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      $or: [{ buyer: userId }, { seller: userId }]
    })
      .populate('listing', 'title price images status')
      .populate('buyer', 'fullName profileImageUrl department year')
      .populate('seller', 'fullName profileImageUrl department year')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching conversations', error: error.message });
  }
};

// @desc    Get messages for a conversation & mark conversation as read
// @route   GET /api/chats/:id/messages
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const conversationId = req.params.id;

    // Check if conversation exists and user is part of it
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (
      conversation.buyer.toString() !== userId.toString() &&
      conversation.seller.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    // Mark as read: remove current user from unreadFor list if present
    if (conversation.unreadFor.includes(userId)) {
      conversation.unreadFor = conversation.unreadFor.filter(
        (id) => id.toString() !== userId.toString()
      );
      await conversation.save();
    }

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching messages', error: error.message });
  }
};

// @desc    Create or retrieve conversation for a listing
// @route   POST /api/chats
// @access  Private
export const createConversation = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const { listingId } = req.body;

    if (!listingId) {
      return res.status(400).json({ message: 'listingId is required' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const sellerId = listing.seller;

    // Cannot start a chat with yourself
    if (sellerId.toString() === buyerId.toString()) {
      return res.status(400).json({ message: 'You cannot start a chat with yourself' });
    }

    // Find existing conversation
    let conversation = await Conversation.findOne({
      listing: listingId,
      buyer: buyerId,
      seller: sellerId
    });

    if (!conversation) {
      conversation = new Conversation({
        listing: listingId,
        buyer: buyerId,
        seller: sellerId,
        lastMessage: {
          text: 'Started a chat for: ' + listing.title,
          sender: buyerId,
          createdAt: new Date()
        }
      });
      await conversation.save();
    }

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating conversation', error: error.message });
  }
};

// @desc    Send a message in a conversation
// @route   POST /api/chats/:id/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const conversationId = req.params.id;
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text is required' });
    }

    // Check conversation and access rights
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    if (
      conversation.buyer.toString() !== senderId.toString() &&
      conversation.seller.toString() !== senderId.toString()
    ) {
      return res.status(403).json({ message: 'Access denied to this conversation' });
    }

    // Create the message
    const message = new Message({
      conversation: conversationId,
      sender: senderId,
      text: text.trim()
    });
    await message.save();

    // Determine the recipient ID to add to unreadFor
    const recipientId =
      conversation.buyer.toString() === senderId.toString()
        ? conversation.seller
        : conversation.buyer;

    // Update conversation metadata
    conversation.lastMessage = {
      text: text.trim(),
      sender: senderId,
      createdAt: message.createdAt
    };

    // Add recipient to unreadFor if not already there
    if (!conversation.unreadFor.includes(recipientId)) {
      conversation.unreadFor.push(recipientId);
    }
    
    // Also ensure sender is removed from unreadFor if they were in it
    conversation.unreadFor = conversation.unreadFor.filter(
      (id) => id.toString() !== senderId.toString()
    );

    await conversation.save();

    // Asynchronously send WhatsApp notification to recipient without blocking response
    User.findById(recipientId).select('whatsappNumber fullName').then((recipient) => {
      if (recipient && recipient.whatsappNumber) {
        Listing.findById(conversation.listing).select('title').then((listing) => {
          const clientBaseUrl = process.env.CLIENT_URL || 'https://engineering-market.vercel.app';
          sendWhatsAppNotification({
            recipientPhone: recipient.whatsappNumber,
            recipientName: recipient.fullName,
            itemTitle: listing?.title || 'an item on Engineering Market',
            chatUrl: `${clientBaseUrl}/chat?conversationId=${conversation._id}`,
            customMessage: text.trim()
          });
        }).catch((err) => console.error('[WhatsApp Notification Error]', err.message));
      }
    }).catch((err) => console.error('[WhatsApp Notification Error]', err.message));

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error sending message', error: error.message });
  }
};

// @desc    Get total unread conversations count
// @route   GET /api/chats/unread/count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const count = await Conversation.countDocuments({
      $or: [{ buyer: userId }, { seller: userId }],
      unreadFor: userId
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching unread count', error: error.message });
  }
};

// @desc    Report a conversation
// @route   POST /api/chats/:id/report
// @access  Private
export const reportConversation = async (req, res) => {
  try {
    const conversationId = req.params.id;
    const { reason } = req.body;
    const reporterId = req.user._id;

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required for reporting a conversation' });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Verify user is participant in conversation
    if (
      conversation.buyer.toString() !== reporterId.toString() &&
      conversation.seller.toString() !== reporterId.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if reporter has already reported this conversation
    const alreadyReported = conversation.reports?.some(
      (r) => r.reporter.toString() === reporterId.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this conversation' });
    }

    conversation.reports.push({
      reporter: reporterId,
      reason
    });

    await conversation.save();

    res.json({ message: 'Conversation reported successfully', conversation });
  } catch (error) {
    res.status(500).json({ message: 'Server error reporting conversation', error: error.message });
  }
};
