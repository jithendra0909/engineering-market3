import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronLeft, Tag, Check, ShoppingBag } from 'lucide-react';
import api from '../api/axios';
import { generateCustomizeMessage, openWhatsApp } from '../utils/whatsappUtils';
import { useGiftCartStore } from '../stores/giftCartStore';
import { useAuth } from '../context/AuthContext';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { slugify } from '../utils/slugUtils';
import './GiftProductDetails.css';

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.982L2 22l5.233-1.371a9.994 9.994 0 0 0 4.779 1.21c5.507 0 9.99-4.479 9.991-9.985-.002-5.507-4.483-9.985-9.992-9.985zM6.83 16.967l-.318-.506a8.217 8.217 0 0 1-1.258-4.478c.001-4.529 3.69-8.214 8.222-8.214 4.53 0 8.217 3.687 8.219 8.217 0 4.53-3.69 8.215-8.222 8.215a8.204 8.204 0 0 1-4.183-1.139l-.3-.179-3.11.815.832-3.032zM15.485 13.6c-.282-.141-1.664-.82-1.921-.912-.257-.094-.443-.141-.63.141-.186.28-.724.912-.887 1.096-.164.183-.328.206-.61.064a7.81 7.81 0 0 1-2.274-1.402 8.602 8.602 0 0 1-1.573-1.956c-.163-.282-.017-.434.124-.575.127-.127.282-.328.423-.492a1.9 1.9 0 0 0 .282-.47c.093-.188.047-.352-.024-.493-.07-.141-.63-1.517-.863-2.079-.226-.546-.453-.47-.63-.478-.162-.008-.35-.01-.539-.01-.19 0-.498.07-.757.352-.26.282-.99.967-.99 2.359 0 1.391 1.012 2.735 1.153 2.923.142.188 1.993 3.044 4.829 4.265 2.836 1.22 2.836.814 3.344.767.509-.047 1.664-.678 1.899-1.334.234-.656.234-1.219.164-1.334-.07-.116-.257-.209-.539-.35z"/>
  </svg>
);

export const GiftProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const addItem = useGiftCartStore((s) => s.addItem);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/gift/products/${id}`);
        setProduct(data);
        // Auto-select first size if available
        if (data.sizeOptions && data.sizeOptions.length > 0) {
          setSelectedSize(data.sizeOptions[0]);
        }
      } catch (err) {
        console.error('Gift product fetch error:', err.response?.status, err.response?.data, err.message);
        setError(err.response?.data?.message || err.message || 'Failed to load product');
        showToast('Failed to load product', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleCustomize = () => {
    const message = generateCustomizeMessage(product, selectedSize);
    openWhatsApp(message);
  };

  const handleAddToCart = () => {
    const finalPrice = selectedSize
      ? product.basePrice + (selectedSize.priceModifier || 0)
      : product.basePrice;

    addItem({
      productName: product.title,
      productId: product._id,
      frameSize: selectedSize ? selectedSize.label : 'Default',
      quantity: 1,
      unitPrice: finalPrice,
      image: product.images?.[0] || '',
    });
    showToast('Added to cart!', 'success');
  };

  const finalPrice = selectedSize
    ? product?.basePrice + (selectedSize?.priceModifier || 0)
    : product?.basePrice;

  const finalMrp = selectedSize
    ? (product?.mrpPrice ?? null) !== null
      ? product.mrpPrice + (selectedSize?.mrpModifier || 0)
      : null
    : product?.mrpPrice ?? null;

  const discountPct = finalMrp && finalMrp > finalPrice
    ? Math.round(((finalMrp - finalPrice) / finalMrp) * 100)
    : null;

  if (loading) {
    return (
      <div className="details-page-container animate-pulse">
        <div style={{ height: '24px', width: '96px', backgroundColor: '#F4F1FF', borderRadius: '9999px', marginBottom: '1.5rem' }} />
        <div className="details-layout">
          <div className="details-gallery-col" style={{ aspectRatio: '1/1', backgroundColor: '#F4F1FF', borderRadius: '24px' }} />
          <div className="details-info-col" style={{ gap: '1rem' }}>
            <div style={{ height: '28px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '75%' }} />
            <div style={{ height: '32px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '25%' }} />
            <div style={{ height: '16px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '100%' }} />
            <div style={{ height: '16px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '66%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="details-page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem' }}>
        <p style={{ fontSize: '15px', fontWeight: 600, color: '#6B7280' }}>{error || 'Product not found'}</p>
        <button
          onClick={() => navigate('/gift-studio/products')}
          style={{ padding: '0.5rem 1.25rem', backgroundColor: '#6C4EFF', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
        >
          Browse Products
        </button>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://engineering-market.in';
  const itemSlug = product.slug || slugify(product.title);
  const canonicalUrl = `${origin}/gift-studio/product/${product._id}${itemSlug ? '/' + itemSlug : ''}`;
  const pageTitle = `${product.title} — ₹${finalPrice} | EM Gift Studio`;
  
  const discountSnippet = discountPct !== null
    ? `${discountPct}% OFF (was ₹${finalMrp}, now ₹${finalPrice}) — `
    : '';
  const descSnippet = product.description
    ? product.description.slice(0, 140) + (product.description.length > 140 ? '...' : '')
    : 'Personalized gift crafted for students.';
  const metaDesc = `${discountSnippet}${descSnippet}`;

  const primaryImage = (product.images && product.images.length > 0)
    ? getOptimizedImageUrl(product.images[0], { width: 1200 })
    : `${origin}/images/em_gift_studio_hero_banner.png`;

  const giftProductJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": product.title,
        "description": product.description,
        "image": product.images || [],
        "category": product.category,
        "offers": {
          "@type": "Offer",
          "price": String(finalPrice),
          "priceCurrency": "INR",
          "availability": product.isActive ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "url": canonicalUrl,
          ...(finalMrp && finalMrp > finalPrice ? {
            "priceSpecification": {
              "@type": "PriceSpecification",
              "price": String(finalMrp),
              "priceCurrency": "INR",
              "valueAddedTaxIncluded": true
            }
          } : {})
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${origin}/`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Gift Studio",
            "item": `${origin}/vendors/gift-studio`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": product.category || "Products",
            "item": `${origin}/gift-studio/products`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": product.title,
            "item": canonicalUrl
          }
        ]
      }
    ]
  };

  return (
    <div className="details-page-container">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="title" content={pageTitle} />
        <meta name="description" content={metaDesc} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:image" content={primaryImage} />
        <meta property="og:price:amount" content={String(finalPrice)} />
        <meta property="og:price:currency" content="INR" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonicalUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content={primaryImage} />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(giftProductJsonLd)}
        </script>
      </Helmet>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="details-back-btn"
      >
        <ChevronLeft style={{ width: '16px', height: '16px' }} /> Back
      </button>

      <div className="details-layout">
        {/* Left: Image gallery */}
        <div className="details-gallery-col">
          {/* Main image */}
          <div className="details-main-img-box">
            <img
              src={getOptimizedImageUrl(product.images[selectedImg], { width: 900 })}
              alt={`${product.title} - Main photo`}
              className="details-main-img"
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="details-thumbs-list no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(idx)}
                  className={`details-thumb-btn ${selectedImg === idx ? 'active' : ''}`}
                >
                  <img
                    src={getOptimizedImageUrl(img, { width: 140 })}
                    alt={`${product.title} thumbnail ${idx + 1}`}
                    className="details-thumb-img"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="details-info-col">
          {/* Category + Badge */}
          <div className="details-meta-row">
            <span className="details-cat-pill">
              <Tag style={{ width: '12px', height: '12px' }} /> {product.category}
            </span>
            {product.badge && (
              <span className="gift-details-badge">
                ⭐ {product.badge}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="details-title">
            {product.title}
          </h1>

          {/* Price */}
          <div className="details-price-row">
            <span className="details-price">₹{finalPrice}</span>
            {discountPct !== null && (
              <>
                <span className="details-price-mrp">₹{finalMrp}</span>
                <span className="details-discount-badge">{discountPct}% OFF</span>
              </>
            )}
          </div>

          {/* Size Options */}
          {product.sizeOptions && product.sizeOptions.length > 0 && (
            <div className="gift-details-sizes">
              <h2 className="gift-details-section-title">Select Size</h2>
              <div className="gift-details-size-pills">
                {product.sizeOptions.map((size, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedSize(size)}
                    className={`gift-details-size-pill ${selectedSize?.label === size.label ? 'active' : ''}`}
                  >
                    <span className="gift-details-size-label">{size.label}</span>
                    <span className="gift-details-size-price">₹{product.basePrice + size.priceModifier}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="details-desc-box">
            <h3 className="details-desc-title">Description</h3>
            <p className="details-desc-text">
              {product.description}
            </p>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="gift-details-features">
              <h3 className="gift-details-section-title">Features</h3>
              <div className="gift-details-features-list">
                {product.features.map((feature, i) => (
                  <div key={i} className="gift-details-feature-item">
                    <Check className="gift-details-check-icon" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="gift-details-actions">
            {/* Primary CTA: Customize on WhatsApp */}
            <button
              onClick={handleCustomize}
              className="gift-details-wa-btn"
            >
              <WhatsAppIcon style={{ width: '20px', height: '20px' }} />
              Customize on WhatsApp
            </button>

            {/* Secondary: Add to Cart */}
            <button
              onClick={handleAddToCart}
              className="gift-details-cart-btn"
              title="Add to Cart"
            >
              <ShoppingBag style={{ width: '18px', height: '18px' }} />
            </button>

            {/* Tertiary: Share to WhatsApp */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="gift-details-share-btn"
              title="Share to WhatsApp Group"
            >
              <WhatsAppIcon style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>
      </div>

      {/* WhatsApp Share Preview Modal */}
      {isShareModalOpen && (() => {
        const shareText = `🎁 *EM Gift Studio - Custom Creation*

*Product:* ${product.title}
*Price:* ₹${finalPrice}${product.mrpPrice && product.mrpPrice > finalPrice ? ` (MRP ₹${product.mrpPrice})` : ''}
*Category:* ${product.category || 'Gifts'}

*Description:* ${product.description ? product.description.slice(0, 150) + (product.description.length > 150 ? '...' : '') : 'Custom personalized gift crafted for students.'}

🔗 *View & customize here:* ${window.location.href}`;

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setIsShareModalOpen(false)} />
            <div style={{ position: 'relative', width: '100%', maxWidth: '440px', backgroundColor: '#ffffff', borderRadius: '24px', overflow: 'hidden', padding: '1.5rem', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid #E9E6F8', textAlign: 'left' }}>
              <h3 style={{ fontWeight: 700, fontSize: '16px', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <WhatsAppIcon style={{ width: '20px', height: '20px', color: '#059669' }} /> WhatsApp Group Quick-Share
              </h3>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                Here is the clean, formatted message for your college and friend groups. Copy it or share directly to WhatsApp.
              </p>
              
              <div style={{ backgroundColor: 'rgba(238,249,242,0.5)', border: '1px solid #d1fae5', borderRadius: '16px', padding: '1rem', fontFamily: 'monospace', fontSize: '11px', color: '#374151', lineHeight: 1.625, whiteSpace: 'pre-wrap', userSelect: 'all', maxHeight: '220px', overflowY: 'auto' }}>
                {shareText}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  style={{ flex: 1, height: '44px', border: '1px solid #E9E6F8', color: '#6B7280', fontWeight: 700, fontSize: '13px', borderRadius: '9999px', background: 'none', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(shareText);
                    showToast('Message copied to clipboard!', 'success');
                  }}
                  style={{ flex: 1, height: '44px', border: '1px solid #a7f3d0', backgroundColor: '#ffffff', color: '#047857', fontWeight: 700, fontSize: '13px', borderRadius: '9999px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}
                >
                  Copy Message
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, height: '44px', backgroundColor: '#059669', color: '#ffffff', fontWeight: 700, fontSize: '13px', borderRadius: '9999px', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}
                >
                  <WhatsAppIcon style={{ width: '16px', height: '16px' }} /> Share
                </a>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default GiftProductDetails;
