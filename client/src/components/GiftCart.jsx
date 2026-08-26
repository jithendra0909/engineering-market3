import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, Image } from 'lucide-react';
import { useGiftCartStore } from '../stores/giftCartStore';
import { generateCartMessage, openWhatsApp } from '../utils/whatsappUtils';
import './GiftCart.css';

/**
 * GiftCart — Cart drawer for EM Gift Studio items.
 * Shows structured cart items with edit/remove capabilities.
 * Primary action: "Message on WhatsApp" sends the full cart.
 */
const GiftCart = ({ isOpen, onClose, onBrowse }) => {
  const items = useGiftCartStore((s) => s.items);
  const removeItem = useGiftCartStore((s) => s.removeItem);
  const updateQuantity = useGiftCartStore((s) => s.updateQuantity);
  const getTotal = useGiftCartStore((s) => s.getTotal);
  const clearCart = useGiftCartStore((s) => s.clearCart);

  if (!isOpen) return null;

  const total = getTotal();

  const handleWhatsAppOrder = () => {
    if (items.length === 0) return;
    const message = generateCartMessage(items, total);
    openWhatsApp(message);
  };

  return (
    <div
      className="gift-cart-overlay"
      onClick={onClose}
    >
      <div
        className="gift-cart-drawer animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="gift-cart-header">
          <div className="gift-cart-header-left">
            <ShoppingBag style={{ width: '20px', height: '20px', color: '#6C4EFF' }} />
            <h3 className="gift-cart-header-title">Your Cart</h3>
            {items.length > 0 && (
              <span className="gift-cart-count-badge">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="gift-cart-close-btn"
          >
            <X style={{ width: '16px', height: '16px', strokeWidth: 2.5 }} />
          </button>
        </div>

        {/* Cart Content */}
        {items.length === 0 ? (
          /* ── Empty State ── */
          <div className="gift-cart-empty">
            <div className="gift-cart-empty-icon-box">
              <ShoppingBag style={{ width: '32px', height: '32px', color: '#6C4EFF', strokeWidth: 1.5 }} />
            </div>
            <h4 className="gift-cart-empty-title">Your cart is empty</h4>
            <p className="gift-cart-empty-desc">
              Find a frame and create something memorable. 💜
            </p>
            <button
              onClick={() => {
                onClose();
                if (onBrowse) onBrowse();
              }}
              className="gift-cart-browse-btn"
            >
              <Image style={{ width: '16px', height: '16px' }} />
              Browse Frames
            </button>
          </div>
        ) : (
          <>
            {/* ── Cart Items ── */}
            <div className="gift-cart-items-list">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="gift-cart-item-card"
                >
                  {/* Product image */}
                  <div className="gift-cart-item-img-box">
                    <img
                      src={item.image || '/images/placeholder.jpg'}
                      alt={item.productName}
                      className="gift-cart-item-img"
                      onError={(e) => { e.currentTarget.src = '/images/placeholder.jpg'; }}
                    />
                  </div>

                  {/* Item details */}
                  <div className="gift-cart-item-info">
                    <div className="gift-cart-item-top">
                      <div className="min-w-0">
                        <h4 className="gift-cart-item-name">{item.productName}</h4>
                        <p className="gift-cart-item-size">Size: {item.frameSize}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="gift-cart-remove-btn"
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>

                    {/* Customization summary */}
                    {item.customization && (
                      <div className="gift-cart-tags">
                        {item.customization.customText && (
                          <span className="gift-cart-tag">
                            "{item.customization.customText}"
                          </span>
                        )}
                        {item.customization.editingRequired && (
                          <span className="gift-cart-tag">
                            Editing
                          </span>
                        )}
                        {item.customization.designPreference && (
                          <span className="gift-cart-tag">
                            {item.customization.designPreference}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Quantity + Price */}
                    <div className="gift-cart-item-bottom">
                      <div className="gift-cart-qty-controls">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="gift-cart-qty-btn"
                        >
                          <Minus style={{ width: '12px', height: '12px' }} />
                        </button>
                        <span className="gift-cart-qty-num">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="gift-cart-qty-btn"
                        >
                          <Plus style={{ width: '12px', height: '12px' }} />
                        </button>
                      </div>
                      <p className="gift-cart-subtotal">₹{item.subtotal}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Cart Footer ── */}
            <div className="gift-cart-footer">
              {/* Subtotal */}
              <div className="gift-cart-subtotal-row">
                <span className="gift-cart-subtotal-label">Subtotal</span>
                <span className="gift-cart-subtotal-val">₹{total}</span>
              </div>

              {/* WhatsApp Order Button */}
              <button
                onClick={handleWhatsAppOrder}
                className="gift-cart-wa-btn"
              >
                <MessageCircle style={{ width: '20px', height: '20px' }} />
                Message on WhatsApp
              </button>

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="gift-cart-clear-btn"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GiftCart;
