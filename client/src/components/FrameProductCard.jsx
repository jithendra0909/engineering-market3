import React, { useState } from 'react';
import { Heart, Check } from 'lucide-react';

/**
 * FrameProductCard — Product card for EM Gift Studio frames.
 * Matches the reference screenshot card design:
 * image + heart + optional badge + name + features + price + customize button
 */
const FrameProductCard = ({ product, onCustomize }) => {
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div className="bg-white border border-[#E9E6F8]/70 rounded-[16px] overflow-hidden flex flex-col hover:shadow-md transition-all duration-300 group">
      {/* Image area */}
      <div className="relative aspect-square bg-[#FAFAFF] overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          loading="lazy"
        />

        {/* Heart / Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all"
        >
          <Heart
            className={`w-3.5 h-3.5 stroke-[2] transition-colors ${
              isFavorited ? 'fill-[#6C4EFF] text-[#6C4EFF]' : 'text-[#9CA3AF]'
            }`}
          />
        </button>

        {/* Badge */}
        {product.badge && (
          <span className="absolute bottom-2.5 left-2.5 bg-gradient-to-r from-[#F59E0B] to-[#F97316] text-white text-[8px] font-bold px-2 py-[2px] rounded-full uppercase tracking-wider flex items-center gap-0.5">
            ⭐ {product.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {/* Product name */}
        <h3 className="font-bold text-[12px] text-[#111827] leading-snug line-clamp-1">
          {product.name}
        </h3>

        {/* Feature list */}
        <div className="flex flex-col gap-0.5">
          {product.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-1">
              <Check className="w-3 h-3 text-[#6C4EFF] stroke-[2.5] flex-shrink-0" />
              <span className="text-[10px] text-[#6B7280] leading-tight">{feature}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <p className="text-[12px] text-[#111827] mt-auto pt-1">
          <span className="text-[#9CA3AF] font-medium">From </span>
          <span className="font-bold text-[#6C4EFF]">₹{product.basePrice}</span>
        </p>

        {/* Customize button */}
        <button
          onClick={() => onCustomize(product)}
          className="w-full h-8 border-2 border-[#6C4EFF] text-[#6C4EFF] rounded-lg text-[11px] font-bold hover:bg-[#6C4EFF] hover:text-white active:scale-[0.97] transition-all"
        >
          Customize
        </button>
      </div>
    </div>
  );
};

export default FrameProductCard;
