import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { getListingUrl } from '../utils/slugUtils';
import './ProductCard.css';

export const ProductCard = ({ product }) => {
  const { isLoggedIn, user, updateProfile, showToast } = useAuth();
  const navigate = useNavigate();

  const isSavedInitial = user?.savedListings?.some(id => id.toString() === product._id.toString()) || false;
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [saving, setSaving] = useState(false);

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { navigate('/login'); return; }
    if (saving) return;
    setSaving(true);
    try {
      const { data } = await api.post(`/listings/${product._id}/save`);
      setIsSaved(data.saved);
      showToast(data.message, 'success');
      let updatedSaved = [...(user.savedListings || [])];
      if (data.saved) { updatedSaved.push(product._id); }
      else { updatedSaved = updatedSaved.filter(id => id.toString() !== product._id.toString()); }
      updateProfile({ ...user, savedListings: updatedSaved });
    } catch (err) {
      showToast('Failed to save item', 'error');
    } finally { setSaving(false); }
  };

  const rawImage = product.images && product.images.length > 0
    ? product.images[0]
    : '/images/file_00000000968c71f8895e41375cd51838.png';

  const displayImage = getOptimizedImageUrl(rawImage, { width: 400 });

  return (
    <Link
      to={getListingUrl(product)}
      className="product-card"
    >
      {/* Image area */}
      <div className="product-card-image-wrapper">
        <img
          src={displayImage}
          alt={product.title ? `${product.title} - Engineering Market listing` : 'Product photo'}
          className="product-card-image"
          loading="lazy"
        />

        {/* Heart bookmark */}
        <button
          onClick={handleHeartClick}
          disabled={saving}
          aria-label={isSaved ? "Remove from saved" : "Save this listing"}
          className="product-card-heart-btn"
        >
          <Heart
            className={`product-card-heart-icon ${isSaved ? 'saved' : ''}`}
          />
        </button>

        {/* Donate badge */}
        {product.listingType === 'donate' && (
          <span className="product-card-donate-badge">
            Free
          </span>
        )}
      </div>

      {/* Info */}
      <div className="product-card-info">
        <h3 className="product-card-title">
          {product.title}
        </h3>
        <p className="product-card-price">
          {product.listingType === 'donate' ? 'Free' : `₹${product.price}`}
        </p>
        <div className="product-card-location">
          <MapPin className="product-card-pin-icon" />
          <span className="product-card-college">
            {user && product.sellerCollege === user.college ? 'Your College' : product.sellerCollege}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
