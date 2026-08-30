import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowLeft, Share2, Heart, ArrowRight, ChevronRight,
  Award, Palette, Truck, ShieldCheck, Wand2, Eye, Lock, Clock,
  Store, Image, ShoppingBag, BadgeCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VENDOR_INFO, CATEGORIES } from '../config/giftStudioData';
import { useGiftCartStore } from '../stores/giftCartStore';
import GiftProductCard from '../components/GiftProductCard';
import FrameCustomizationModal from '../components/FrameCustomizationModal';
import GiftCart from '../components/GiftCart';
import api from '../api/axios';
import './GiftStudio.css';

const GiftStudio = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const popularFramesRef = useRef(null);
  const cartItemCount = useGiftCartStore((s) => s.getItemCount());

  // UI state
  const [isFavorited, setIsFavorited] = useState(false);
  const [customizeProduct, setCustomizeProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // API state
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.get('/gift/products?featured=true'),
          api.get('/gift/categories')
        ]);
        setFeaturedProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Error fetching gift studio data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Scroll to Popular Frames
  const scrollToFrames = () => {
    popularFramesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Share functionality
  const handleShare = async () => {
    const shareData = {
      title: 'EM Gift Studio — Personalized Gifts',
      text: 'Check out EM Gift Studio for beautiful customized photo frames and gifts!',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!', 'success');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showToast('Link copied to clipboard!', 'success');
        } catch {
          showToast('Could not share', 'error');
        }
      }
    }
  };

  /* Skeleton loader for product cards */
  const Skeleton = () => (
    <div className="gift-card animate-pulse">
      <div className="gift-card-img-wrapper" style={{ backgroundColor: '#F4F1FF' }} />
      <div className="gift-card-content">
        <div style={{ height: '14px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '75%' }} />
        <div style={{ height: '14px', backgroundColor: '#F4F4FF', borderRadius: '9999px', width: '50%' }} />
        <div style={{ height: '12px', backgroundColor: '#F4F1FF', borderRadius: '9999px', width: '66%' }} />
      </div>
    </div>
  );

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://engineering-market.in';

  return (
    <div className="gift-studio-page">
      <Helmet>
        <title>EM Gift Studio — Custom Photo Frames & Gifts | Engineering Market</title>
        <meta name="title" content="EM Gift Studio — Custom Photo Frames & Gifts | Engineering Market" />
        <meta name="description" content="Custom photo frames, collage frames, motivational wall art, and personalized gifts for students and campus memories." />
        <link rel="canonical" href={`${origin}/vendors/gift-studio`} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${origin}/vendors/gift-studio`} />
        <meta property="og:title" content="EM Gift Studio — Custom Photo Frames & Gifts" />
        <meta property="og:description" content="Custom photo frames, collage frames, and personalized gifts on Engineering Market." />
        <meta property="og:image" content={`${origin}/images/em_gift_studio_hero_banner.png`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`${origin}/vendors/gift-studio`} />
        <meta name="twitter:title" content="EM Gift Studio — Custom Photo Frames & Gifts" />
        <meta name="twitter:description" content="Custom photo frames, collage frames, and personalized gifts on Engineering Market." />
        <meta name="twitter:image" content={`${origin}/images/em_gift_studio_hero_banner.png`} />
      </Helmet>

      {/* 1. VENDOR HEADER */}
      <header className="gift-studio-header">
        <div className="gift-studio-header-inner">
          {/* Left: Back + Logo + Title */}
          <div className="gift-studio-header-left">
            <button
              onClick={() => navigate('/vendors')}
              className="gift-studio-back-btn"
            >
              <ArrowLeft style={{ width: '16px', height: '16px', strokeWidth: 2 }} />
            </button>

            {/* Vendor logo */}
            <div className="gift-studio-logo">
              <span>EM</span>
            </div>

            {/* Vendor info */}
            <div className="gift-studio-vendor-info">
              <h1 className="gift-studio-vendor-name">
                {VENDOR_INFO.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{VENDOR_INFO.subtitle}</span>
                {VENDOR_INFO.verified && (
                  <BadgeCheck style={{ width: '14px', height: '14px', color: '#6C4EFF', fill: '#F4F1FF' }} />
                )}
              </div>
            </div>
          </div>

          {/* Right: Share + Heart + Cart */}
          <div className="gift-studio-header-right">
            <button
              onClick={handleShare}
              className="gift-studio-icon-btn"
            >
              <Share2 style={{ width: '16px', height: '16px', strokeWidth: 2 }} />
            </button>
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="gift-studio-icon-btn"
            >
              <Heart
                style={{
                  width: '16px',
                  height: '16px',
                  strokeWidth: 2,
                  fill: isFavorited ? '#f43f5e' : 'none',
                  color: isFavorited ? '#f43f5e' : '#9CA3AF'
                }}
              />
            </button>

            {/* Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="gift-studio-icon-btn"
            >
              <ShoppingBag style={{ width: '16px', height: '16px', strokeWidth: 2 }} />
              {cartItemCount > 0 && (
                <span className="gift-studio-cart-badge">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="gift-studio-main">

        {/* 2. HERO BANNER */}
        <section className="gift-studio-hero-section">
          <div 
            onClick={scrollToFrames}
            className="gift-studio-hero-card"
          >
            <img
              src="/images/em_gift_studio_hero_banner.png"
              alt="Gifts that create memories — EM Gift Studio"
              className="gift-studio-hero-img"
              draggable={false}
              loading="eager"
            />
          </div>
        </section>

        {/* 3. BENEFITS STRIP */}
        <section className="gift-studio-benefits-section">
          <div className="gift-studio-benefits-card">
            {[
              { icon: Award, label1: 'Premium', label2: 'Quality' },
              { icon: Palette, label1: 'Custom', label2: 'Designs' },
              { icon: Truck, label1: 'Fast', label2: 'Delivery' },
              { icon: ShieldCheck, label1: 'Secure', label2: 'Payment' },
            ].map((benefit, i) => (
              <div key={i} className="gift-studio-benefit-item">
                <div className="gift-studio-benefit-icon-box">
                  <benefit.icon style={{ width: '18px', height: '18px', color: '#6C4EFF', strokeWidth: 1.8 }} />
                </div>
                <div>
                  <p className="gift-studio-benefit-text">{benefit.label1}</p>
                  <p className="gift-studio-benefit-text">{benefit.label2}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. SHOP BY CATEGORY */}
        <section className="gift-studio-categories-section">
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>Shop by Category</h2>
          <div className="gift-studio-categories-grid">
            {(categories.length > 0 ? categories : CATEGORIES).map((cat) => (
              <button
                key={cat._id || cat.id}
                onClick={() => navigate(`/gift-studio/products`)}
                className="gift-studio-cat-btn"
              >
                <div className="gift-studio-cat-icon-box">
                  <Image style={{ width: '28px', height: '28px', color: '#6C4EFF', strokeWidth: 1.5 }} />
                </div>
                <span className="gift-studio-cat-name">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 5. TRENDING IN GIFT STUDIO */}
        <section style={{ marginTop: '1.75rem' }} ref={popularFramesRef} id="popular-frames">
          {/* Section header */}
          <div className="home-section-header" style={{ paddingLeft: '1rem', paddingRight: '1rem', marginBottom: '1rem' }}>
            <h2 className="home-section-title">Trending in Gift Studio</h2>
            <button
              onClick={() => navigate('/gift-studio/products')}
              className="home-view-all-btn"
            >
              View All
              <ArrowRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          {loading ? (
            <div className="home-skeleton-grid" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
              {[1, 2, 3, 4].map(n => <Skeleton key={n} />)}
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              {/* Mobile horizontal scroll */}
              <div className="home-trending-mobile-scroll no-scrollbar" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
                {featuredProducts.map((product) => (
                  <div key={product._id} className="home-trending-mobile-item">
                    <GiftProductCard product={product} />
                  </div>
                ))}
              </div>

              {/* Desktop grid */}
              <div className="home-trending-desktop-grid" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
                {featuredProducts.map((product) => (
                  <GiftProductCard key={product._id} product={product} />
                ))}
              </div>
            </>
          ) : (
            <div className="home-empty-listings" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
              <p style={{ fontSize: '14px', fontWeight: 500 }}>No featured products yet</p>
            </div>
          )}
        </section>

        {/* 6. FEATURES STRIP */}
        <section className="gift-studio-benefits-section" style={{ marginTop: '1.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {[
              { icon: Wand2, label1: 'Easy', label2: 'Customization' },
              { icon: Eye, label1: 'Preview', label2: 'Before Order' },
              { icon: Lock, label1: 'Secure', label2: 'Payments' },
              { icon: Clock, label1: 'On-time', label2: 'Delivery' },
            ].map((feat, i) => (
              <div
                key={i}
                style={{ backgroundColor: '#FAFAFF', border: '1px solid rgba(233, 230, 248, 0.6)', borderRadius: '14px', padding: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.375rem' }}
              >
                <div style={{ width: '2.25rem', height: '2.25rem', backgroundColor: '#F4F1FF', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <feat.icon style={{ width: '16px', height: '16px', color: '#6C4EFF', strokeWidth: 1.8 }} />
                </div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.25 }}>{feat.label1}</p>
                  <p style={{ fontSize: '10px', fontWeight: 500, color: '#9CA3AF', margin: 0, lineHeight: 1.25 }}>{feat.label2}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 7. ABOUT EM GIFT STUDIO */}
        <section className="gift-studio-benefits-section" style={{ marginTop: '1.75rem', marginBottom: '1.5rem' }}>
          <button
            onClick={() => showToast('Full vendor profile coming soon!', 'info')}
            style={{ width: '100%', backgroundColor: '#F4F1FF', border: '1px solid rgba(233, 230, 248, 0.6)', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left', cursor: 'pointer' }}
          >
            <div style={{ width: '3rem', height: '3rem', backgroundColor: '#ffffff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <Store style={{ width: '24px', height: '24px', color: '#6C4EFF', strokeWidth: 1.5 }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontWeight: 700, fontSize: '14px', color: '#111827', margin: 0 }}>About {VENDOR_INFO.name}</h3>
              <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '0.125rem', margin: 0, lineHeight: 1.625 }}>
                {VENDOR_INFO.description}
              </p>
            </div>
            <ChevronRight style={{ width: '20px', height: '20px', color: '#9CA3AF', flexShrink: 0 }} />
          </button>
        </section>
      </div>

      {/* Floating Cart FAB */}
      {cartItemCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="gift-studio-fab-cart"
        >
          <ShoppingBag style={{ width: '24px', height: '24px' }} />
          <span className="gift-studio-fab-badge">
            {cartItemCount}
          </span>
        </button>
      )}

      {/* Customization Modal */}
      <FrameCustomizationModal
        product={customizeProduct}
        isOpen={!!customizeProduct}
        onClose={() => setCustomizeProduct(null)}
      />

      {/* Cart Drawer */}
      <GiftCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onBrowse={scrollToFrames}
      />
    </div>
  );
};

export default GiftStudio;
