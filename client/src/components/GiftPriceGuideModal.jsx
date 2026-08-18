import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * GiftPriceGuideModal — Centered modal popup displaying the official
 * EM Gift Studio Frame Price Guide.
 * 
 * - Semi-transparent dark overlay + backdrop blur
 * - High quality, uncropped, original aspect ratio image
 * - Responsive on desktop and mobile with smooth scrolling when needed
 * - Closes via X button or backdrop click
 * - Locks background body scrolling while open
 */
const GiftPriceGuideModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="EM Gift Studio Price Guide"
    >
      <div
        className="relative bg-white rounded-[20px] sm:rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-[#E9E6F8]/80 max-w-[480px] w-full max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Top-Right Close Button */}
        <button
          onClick={onClose}
          aria-label="Close price guide"
          className="absolute top-3 right-3 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-[#E9E6F8] flex items-center justify-center text-[#111827] hover:text-[#6C4EFF] hover:bg-white hover:scale-105 active:scale-95 transition-all"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        {/* Scrollable image area if height exceeds viewport */}
        <div className="overflow-y-auto no-scrollbar w-full flex-1 rounded-[20px] sm:rounded-[24px] bg-[#FAFAFF]">
          <img
            src="/images/em_gift_studio_price_guide.jpg"
            alt="EM Gift Studio Frame Price Guide"
            className="w-full h-auto object-contain block select-none"
            draggable={false}
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
};

export default GiftPriceGuideModal;
