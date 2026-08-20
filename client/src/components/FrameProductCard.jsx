import React, { useState } from 'react';
import { Heart, Check } from 'lucide-react';
import './FrameProductCard.css';

/**
 * FrameProductCard — Product card for EM Gift Studio frames.
 * Matches the reference screenshot card design:
 * image + heart + optional badge + name + features + price + customize button
 */
const FrameProductCard = ({ product, onCustomize }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div className="frame-card group">
      {/* Image area */}
      <div className="frame-card-img-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="frame-card-img"
          loading="lazy"
        />

        {/* Heart / Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="frame-card-heart-btn"
        >
          <Heart
            className={`frame-card-heart-icon ${isFavorited ? 'saved' : ''}`}
          />
        </button>

        {/* Badge */}
        {product.badge && (
          <span className="frame-card-badge">
            ⭐ {product.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="frame-card-content">
        {/* Product name */}
        <h3 className="frame-card-title">
          {product.name}
        </h3>

        {/* Feature list */}
        <div className="frame-card-features">
          {product.features.map((feature, i) => (
            <div key={i} className="frame-card-feature-item">
              <Check className="frame-card-check-icon" />
              <span className="frame-card-feature-text">{feature}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <p className="frame-card-price">
          <span className="frame-card-price-label">From </span>
          <span className="frame-card-price-val">₹{product.basePrice}</span>
        </p>

        {/* Customize button */}
        <button
          onClick={() => onCustomize(product)}
          className="frame-card-btn"
        >
          Customize
        </button>
      </div>
    </div>
  );
};

export default FrameProductCard;
