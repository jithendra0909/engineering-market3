import React, { useState } from 'react';
import { X, Plus, Minus, MessageCircle, ShoppingCart } from 'lucide-react';
import { FRAME_SIZES } from '../config/giftStudioData';
import { useGiftCartStore } from '../stores/giftCartStore';
import { generateBuyNowMessage, openWhatsApp } from '../utils/whatsappUtils';
import { useAuth } from '../context/AuthContext';

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
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-[24px] rounded-t-[24px] max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between px-5 py-4 border-b border-[#E9E6F8]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] overflow-hidden bg-[#FAFAFF] flex-shrink-0">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-[14px] text-[#111827]">{product.name}</h3>
              <p className="text-[11px] text-[#9CA3AF]">Select size & quantity</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#F4F1FF] flex items-center justify-center text-[#6C4EFF] hover:bg-[#6C4EFF] hover:text-white transition-all"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="px-5 py-5 flex flex-col gap-5">
          {/* ── Frame Size ── */}
          <div>
            <label className="text-[12px] font-bold text-[#111827] mb-2 block">Frame Size</label>
            <div className="flex flex-wrap gap-2">
              {sizeKeys.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all ${
                    selectedSize === size
                      ? 'bg-[#6C4EFF] text-white border-[#6C4EFF] shadow-[0_2px_10px_rgba(108,78,255,0.3)]'
                      : 'bg-white text-[#111827] border-[#E9E6F8] hover:border-[#6C4EFF]/40'
                  }`}
                >
                  {size}
                  <span className={`ml-1 text-[10px] ${selectedSize === size ? 'text-white/80' : 'text-[#9CA3AF]'}`}>
                    ₹{FRAME_SIZES[size]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Quantity ── */}
          <div>
            <label className="text-[12px] font-bold text-[#111827] mb-2 block">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-9 h-9 rounded-xl border border-[#E9E6F8] flex items-center justify-center text-[#9CA3AF] hover:text-[#6C4EFF] hover:border-[#6C4EFF]/40 transition-all"
              >
                <Minus className="w-4 h-4 stroke-[2]" />
              </button>
              <span className="text-[16px] font-bold text-[#111827] w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-9 h-9 rounded-xl border border-[#E9E6F8] flex items-center justify-center text-[#9CA3AF] hover:text-[#6C4EFF] hover:border-[#6C4EFF]/40 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* ── WhatsApp Communication Callout ── */}
          <div className="bg-[#F4F1FF] border border-[#6C4EFF]/20 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#6C4EFF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <MessageCircle className="w-4 h-4 text-[#6C4EFF]" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#111827]">Customization on WhatsApp</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed">
                Send your photos, custom text, and specific requirements directly on WhatsApp when confirming your order.
              </p>
            </div>
          </div>

          {/* ── Price Summary ── */}
          <div className="bg-[#FAFAFF] border border-[#E9E6F8] rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#9CA3AF] font-medium">Total Price</p>
              <p className="text-[20px] font-bold text-[#6C4EFF]">₹{totalPrice}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#9CA3AF]">{selectedSize} × {quantity}</p>
              <p className="text-[11px] text-[#6B7280]">₹{unitPrice} each</p>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex gap-3 pb-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 h-12 border-2 border-[#6C4EFF] text-[#6C4EFF] rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#F4F1FF] active:scale-[0.97] transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 h-12 bg-[#6C4EFF] text-white rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#5B3FE0] active:scale-[0.97] transition-all shadow-[0_4px_15px_rgba(108,78,255,0.3)]"
            >
              <MessageCircle className="w-4 h-4" />
              Buy Now
            </button>
          </div>
        </div>
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

export default FrameCustomizationModal;

