import React from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, MessageCircle, Image } from 'lucide-react';
import { useGiftCartStore } from '../stores/giftCartStore';
import { generateCartMessage, openWhatsApp } from '../utils/whatsappUtils';

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
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-[24px] rounded-t-[24px] max-h-[85vh] flex flex-col animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9E6F8]/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#6C4EFF]" />
            <h3 className="font-bold text-[16px] text-[#111827]">Your Cart</h3>
            {items.length > 0 && (
              <span className="bg-[#6C4EFF] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F4F1FF] flex items-center justify-center text-[#6C4EFF] hover:bg-[#6C4EFF] hover:text-white transition-all"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Cart Content */}
        {items.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-16 h-16 bg-[#F4F1FF] rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-[#6C4EFF] stroke-[1.5]" />
            </div>
            <h4 className="font-bold text-[16px] text-[#111827]">Your cart is empty</h4>
            <p className="text-[12px] text-[#9CA3AF] mt-1.5 leading-relaxed">
              Find a frame and create something memorable. 💜
            </p>
            <button
              onClick={() => {
                onClose();
                if (onBrowse) onBrowse();
              }}
              className="mt-5 h-10 px-6 bg-[#6C4EFF] text-white rounded-full text-[12px] font-bold flex items-center gap-2 hover:bg-[#5B3FE0] active:scale-[0.97] transition-all shadow-[0_4px_15px_rgba(108,78,255,0.3)]"
            >
              <Image className="w-4 h-4" />
              Browse Frames
            </button>
          </div>
        ) : (
          <>
            {/* ── Cart Items ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FAFAFF] border border-[#E9E6F8]/60 rounded-[16px] p-3.5 flex gap-3"
                >
                  {/* Product image */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0">
                    <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                  </div>

                  {/* Item details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-bold text-[12px] text-[#111827] truncate">{item.productName}</h4>
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">Size: {item.frameSize}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-6 h-6 rounded-full hover:bg-rose-50 flex items-center justify-center text-[#9CA3AF] hover:text-rose-500 transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Customization summary */}
                    {item.customization && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.customization.customText && (
                          <span className="bg-[#F4F1FF] text-[#6C4EFF] text-[8px] font-medium px-1.5 py-0.5 rounded-full">
                            "{item.customization.customText}"
                          </span>
                        )}
                        {item.customization.editingRequired && (
                          <span className="bg-[#F4F1FF] text-[#6C4EFF] text-[8px] font-medium px-1.5 py-0.5 rounded-full">
                            Editing
                          </span>
                        )}
                        {item.customization.designPreference && (
                          <span className="bg-[#F4F1FF] text-[#6C4EFF] text-[8px] font-medium px-1.5 py-0.5 rounded-full">
                            {item.customization.designPreference}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Quantity + Price */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-6 h-6 rounded-lg border border-[#E9E6F8] flex items-center justify-center text-[#9CA3AF] hover:text-[#6C4EFF] hover:border-[#6C4EFF]/40 disabled:opacity-30 transition-all"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[12px] font-bold text-[#111827] w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg border border-[#E9E6F8] flex items-center justify-center text-[#9CA3AF] hover:text-[#6C4EFF] hover:border-[#6C4EFF]/40 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[13px] font-bold text-[#6C4EFF]">₹{item.subtotal}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Cart Footer ── */}
            <div className="border-t border-[#E9E6F8]/60 px-5 py-4 flex-shrink-0">
              {/* Subtotal */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-medium text-[#9CA3AF]">Subtotal</span>
                <span className="text-[18px] font-bold text-[#111827]">₹{total}</span>
              </div>

              {/* WhatsApp Order Button */}
              <button
                onClick={handleWhatsAppOrder}
                className="w-full h-12 bg-[#25D366] hover:bg-[#20BD5B] text-white rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-all shadow-[0_4px_15px_rgba(37,211,102,0.3)]"
              >
                <MessageCircle className="w-5 h-5" />
                Message on WhatsApp
              </button>

              {/* Clear Cart */}
              <button
                onClick={clearCart}
                className="w-full mt-2 text-[11px] font-medium text-[#9CA3AF] hover:text-rose-500 transition-colors py-1"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </div>

      {/* Slide-up animation */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default GiftCart;
