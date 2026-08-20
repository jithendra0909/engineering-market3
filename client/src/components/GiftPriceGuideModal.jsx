import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './GiftPriceGuideModal.css';

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
      className="price-guide-overlay animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="EM Gift Studio Price Guide"
    >
      <div
        className="price-guide-dialog animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Top-Right Close Button */}
        <button
          onClick={onClose}
          aria-label="Close price guide"
          className="price-guide-close-btn"
        >
          <X style={{ width: '18px', height: '18px', strokeWidth: 2.5 }} />
        </button>

        {/* Scrollable image area if height exceeds viewport */}
        <div className="price-guide-img-container no-scrollbar">
          <img
            src="/images/em_gift_studio_price_guide.jpg"
            alt="EM Gift Studio Frame Price Guide"
            className="price-guide-img"
            draggable={false}
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
};

export default GiftPriceGuideModal;
