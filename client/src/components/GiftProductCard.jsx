import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { getGiftProductUrl } from '../utils/slugUtils';
import './GiftProductCard.css';

/**
 * GiftProductCard — Product card for EM Gift Studio products.
 * Includes SEO slug routing, Cloudinary auto-optimization, and lazy loading.
 */
const GiftProductCard = ({ product }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(getGiftProductUrl(product));
  };

  const rawImage = product.images?.[0] || '/images/placeholder.jpg';
  const displayImage = getOptimizedImageUrl(rawImage, { width: 400 });

  return (
    <div className="gift-card" onClick={handleClick}>
      {/* Image area */}
      <div className="gift-card-img-wrapper">
        <img
          src={displayImage}
          alt={product.title ? `${product.title} - Personalized gift` : 'Gift item photo'}
          className="gift-card-img"
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <span className="gift-card-badge">
            ⭐ {product.badge}
          </span>
        )}

        {/* Category tag */}
        <span className="gift-card-category-tag">
          {product.category}
        </span>
      </div>

      {/* Content */}
      <div className="gift-card-content">
        {/* Product title */}
        <h3 className="gift-card-title">
          {product.title}
        </h3>

        {/* Feature list */}
        {product.features && product.features.length > 0 && (
          <div className="gift-card-features">
            {product.features.slice(0, 3).map((feature, i) => (
              <div key={i} className="gift-card-feature-item">
                <Check className="gift-card-check-icon" />
                <span className="gift-card-feature-text">{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="gift-card-price-row">
          <span className="gift-card-price-val">₹{product.basePrice}</span>
          {product.mrpPrice > product.basePrice && (
            <>
              <span className="gift-card-price-mrp">₹{product.mrpPrice}</span>
              <span className="gift-card-discount-badge">
                {Math.round(((product.mrpPrice - product.basePrice) / product.mrpPrice) * 100)}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftProductCard;
