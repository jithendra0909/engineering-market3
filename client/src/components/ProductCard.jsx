import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

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

  const displayImage = product.images && product.images.length > 0
    ? product.images[0]
    : '/images/file_00000000968c71f8895e41375cd51838.png';

  return (
    <Link
      to={`/listing/${product._id}`}
      className="block bg-white border border-[#E9E6F8]/70 rounded-[20px] overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
    >
      {/* Image area */}
      <div className="relative aspect-square bg-[#FAFAFF] overflow-hidden">
        <img
          src={displayImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />

        {/* Heart bookmark */}
        <button
          onClick={handleHeartClick}
          disabled={saving}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all"
        >
          <Heart
            className={`w-4 h-4 stroke-[2] transition-colors ${
              isSaved ? 'fill-[#6C4EFF] text-[#6C4EFF]' : 'text-[#9CA3AF]'
            }`}
          />
        </button>

        {/* Donate badge */}
        {product.listingType === 'donate' && (
          <span className="absolute bottom-3 left-3 bg-[#6C4EFF] text-white text-[9px] font-bold px-2.5 py-[3px] rounded-full uppercase tracking-wider">
            Free
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-1">
        <h3 className="font-semibold text-[#111827] text-[13px] leading-snug truncate group-hover:text-[#6C4EFF] transition-colors">
          {product.title}
        </h3>
        <p className="font-bold text-[#111827] text-[14px]">
          {product.listingType === 'donate' ? 'Free' : `₹${product.price}`}
        </p>
        <div className="flex items-center gap-1 text-[#9CA3AF] mt-0.5">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="text-[11px] font-medium truncate">
            {user && product.sellerCollege === user.college ? 'Your College' : product.sellerCollege}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
