import React, { useState } from 'react';
import { X, Plus, Minus, MessageCircle, ShoppingCart } from 'lucide-react';
import { FRAME_SIZES } from '../config/giftStudioData';
import { useGiftCartStore } from '../stores/giftCartStore';
import { generateBuyNowMessage, openWhatsApp } from '../utils/whatsappUtils';
import { useAuth } from '../context/AuthContext';
import './FrameCustomizationModal.css';

/**
 * FrameCustomizationModal — Streamlined selection flow for frame products.
 * Captures: Size, Quantity.
 * Customization details & photo requirements are discussed directly on WhatsApp.
 */
const FrameCustomizationModal = ({ product, isOpen, onClose }) => {
  const { showToast } = useAuth();
  const addItem = useGiftCartStore((s) => s.addItem);

  // Size keys from FRAME_SIZES
  const sizeKeys = Object.keys(FRAME_SIZES);

  // Form state
  const [selectedSize, setSelectedSize] = useState(sizeKeys[0]);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const unitPrice = FRAME_SIZES[selectedSize];
  const totalPrice = unitPrice * quantity;

  const buildItem = () => ({
    productId: product.id,
    productName: product.name,
    frameSize: selectedSize,
    quantity,
    unitPrice,
    image: product.image,
  });

  const handleBuyNow = () => {
    const item = buildItem();
    const message = generateBuyNowMessage(item);
    openWhatsApp(message);
    onClose();
  };

  const handleAddToCart = () => {
    const item = buildItem();
    addItem(item);
    showToast('Added to cart!', 'success');
    onClose();
  };

  const handleClose = () => {
    setSelectedSize(sizeKeys[0]);
    setQuantity(1);
    onClose();
  };

  return (
    <div
      className="frame-custom-overlay"
      onClick={handleClose}
    >
      <div
        className="frame-custom-modal animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="frame-custom-header">
          <div className="frame-custom-header-left">
            <div className="frame-custom-thumb">
              <img src={product.image} alt={product.name} className="frame-custom-thumb-img" />
            </div>
            <div>
              <h3 className="frame-custom-title">{product.name}</h3>
              <p className="frame-custom-subtitle">Select size & quantity</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="frame-custom-close-btn"
          >
            <X style={{ width: '16px', height: '16px', strokeWidth: 2.5 }} />
          </button>
        </div>

        <div className="frame-custom-body">
          {/* ── Frame Size ── */}
          <div>
            <label className="frame-custom-label">Frame Size</label>
            <div className="frame-custom-sizes">
              {sizeKeys.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`frame-custom-size-btn ${selectedSize === size ? 'selected' : ''}`}
                >
                  {size}
                  <span className="frame-custom-size-price">
                    ₹{FRAME_SIZES[size]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Quantity ── */}
          <div>
            <label className="frame-custom-label">Quantity</label>
            <div className="frame-custom-qty-row">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="frame-custom-qty-btn"
              >
                <Minus style={{ width: '16px', height: '16px', strokeWidth: 2 }} />
              </button>
              <span className="frame-custom-qty-val">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="frame-custom-qty-btn"
              >
                <Plus style={{ width: '16px', height: '16px', strokeWidth: 2 }} />
              </button>
            </div>
          </div>

          {/* ── WhatsApp Communication Callout ── */}
          <div className="frame-custom-wa-box">
            <div className="frame-custom-wa-icon-wrapper">
              <MessageCircle style={{ width: '16px', height: '16px', color: '#6C4EFF' }} />
            </div>
            <div>
              <p className="frame-custom-wa-title">Customization on WhatsApp</p>
              <p className="frame-custom-wa-desc">
                Send your photos, custom text, and specific requirements directly on WhatsApp when confirming your order.
              </p>
            </div>
          </div>

          {/* ── Price Summary ── */}
          <div className="frame-custom-price-summary">
            <div>
              <p className="frame-custom-price-label">Total Price</p>
              <p className="frame-custom-total-price">₹{totalPrice}</p>
            </div>
            <div className="frame-custom-summary-right">
              <p className="frame-custom-price-label">{selectedSize} × {quantity}</p>
              <p className="frame-custom-unit-info">₹{unitPrice} each</p>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="frame-custom-actions">
            <button
              onClick={handleAddToCart}
              className="frame-custom-btn-cart"
            >
              <ShoppingCart style={{ width: '16px', height: '16px' }} />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="frame-custom-btn-buy"
            >
              <MessageCircle style={{ width: '16px', height: '16px' }} />
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameCustomizationModal;
