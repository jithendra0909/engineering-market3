import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Share2, Heart, ArrowRight, ChevronRight,
  Award, Palette, Truck, ShieldCheck, Wand2, Eye, Lock, Clock,
  Store, Image, ShoppingBag, BadgeCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VENDOR_INFO, FRAME_PRODUCTS, CATEGORIES } from '../config/giftStudioData';
import { useGiftCartStore } from '../stores/giftCartStore';
import FrameProductCard from '../components/FrameProductCard';
import FrameCustomizationModal from '../components/FrameCustomizationModal';
import GiftCart from '../components/GiftCart';
import GiftPriceGuideModal from '../components/GiftPriceGuideModal';

/* ═══════════════════════════════════════════════
   EM GIFT STUDIO — Vendor Page
   Mobile-first, uses Engineering Market design system
   ═══════════════════════════════════════════════ */

const GiftStudio = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const popularFramesRef = useRef(null);
  const cartItemCount = useGiftCartStore((s) => s.getItemCount());

  // UI state
  const [isPriceGuideOpen, setIsPriceGuideOpen] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showAllFrames, setShowAllFrames] = useState(false);
  const [customizeProduct, setCustomizeProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Products to display
  const displayedProducts = showAllFrames ? FRAME_PRODUCTS : FRAME_PRODUCTS.slice(0, 4);

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

  return (
    <div className="relative bg-white min-h-screen">

      {/* ╔══════════════════════════════════════╗
          ║   1. VENDOR HEADER                   ║
          ╚══════════════════════════════════════╝ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#E9E6F8]/60">
        <div className="max-w-[1360px] mx-auto px-4 h-[60px] flex items-center justify-between gap-3">
          {/* Left: Back + Logo + Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/vendors')}
              className="w-9 h-9 rounded-full border border-[#E9E6F8] flex items-center justify-center text-[#111827] hover:bg-[#F4F1FF] hover:border-[#6C4EFF]/30 transition-all flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2]" />
            </button>

            {/* Vendor logo */}
            <div className="w-10 h-10 bg-[#F4F1FF] rounded-full flex items-center justify-center flex-shrink-0 border border-[#E9E6F8]/60">
              <span className="text-[14px] font-bold text-[#6C4EFF]">EM</span>
            </div>

            {/* Vendor info */}
            <div className="min-w-0">
              <h1 className="font-bold text-[15px] text-[#111827] truncate leading-tight">
                {VENDOR_INFO.name}
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[#9CA3AF]">{VENDOR_INFO.subtitle}</span>
                {VENDOR_INFO.verified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-[#6C4EFF] fill-[#F4F1FF]" />
                )}
              </div>
            </div>
          </div>

          {/* Right: Price Guide + Share + Heart + Cart */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsPriceGuideOpen(true)}
              className="h-8 px-2.5 rounded-full bg-[#F4F1FF] border border-[#6C4EFF]/20 text-[#6C4EFF] text-[11px] font-bold flex items-center gap-1 hover:bg-[#6C4EFF] hover:text-white transition-all shadow-sm"
              title="View Price Guide"
            >
              Price Guide
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full border border-[#E9E6F8] flex items-center justify-center text-[#9CA3AF] hover:text-[#6C4EFF] hover:border-[#6C4EFF]/30 transition-all"
            >
              <Share2 className="w-4 h-4 stroke-[2]" />
            </button>
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="w-9 h-9 rounded-full border border-[#E9E6F8] flex items-center justify-center hover:border-[#6C4EFF]/30 transition-all"
            >
              <Heart
                className={`w-4 h-4 stroke-[2] transition-colors ${
                  isFavorited ? 'fill-rose-500 text-rose-500' : 'text-[#9CA3AF]'
                }`}
              />
            </button>

            {/* Cart button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-9 h-9 rounded-full border border-[#E9E6F8] flex items-center justify-center text-[#9CA3AF] hover:text-[#6C4EFF] hover:border-[#6C4EFF]/30 transition-all"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6C4EFF] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-[1360px] mx-auto pb-28 lg:pb-12">

        {/* ╔══════════════════════════════════════╗
            ║   2. HERO BANNER                     ║
            ╚══════════════════════════════════════╝ */}
        <section className="px-4 lg:px-8 pt-4 lg:pt-6">
          <div 
            onClick={scrollToFrames}
            className="relative w-full overflow-hidden select-none group cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300"
            style={{ borderRadius: '20px' }}
          >
            <img
              src="/images/em_gift_studio_hero_banner.png"
              alt="Gifts that create memories — EM Gift Studio"
              className="w-full h-auto object-cover block group-hover:scale-[1.01] transition-transform duration-500"
              draggable={false}
              loading="eager"
            />
          </div>
        </section>

        {/* ╔══════════════════════════════════════╗
            ║   3. BENEFITS STRIP                  ║
            ╚══════════════════════════════════════╝ */}
        <section className="px-4 mt-5">
          <div className="bg-white border border-[#E9E6F8]/70 rounded-[16px] p-4 grid grid-cols-4 gap-2">
            {[
              { icon: Award, label1: 'Premium', label2: 'Quality' },
              { icon: Palette, label1: 'Custom', label2: 'Designs' },
              { icon: Truck, label1: 'Fast', label2: 'Delivery' },
              { icon: ShieldCheck, label1: 'Secure', label2: 'Payment' },
            ].map((benefit, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-1.5">
                <div className="w-10 h-10 bg-[#F4F1FF] rounded-full flex items-center justify-center">
                  <benefit.icon className="w-4.5 h-4.5 text-[#6C4EFF] stroke-[1.8]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#111827] leading-tight">{benefit.label1}</p>
                  <p className="text-[10px] font-bold text-[#111827] leading-tight">{benefit.label2}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ╔══════════════════════════════════════╗
            ║   4. SHOP BY CATEGORY                ║
            ╚══════════════════════════════════════╝ */}
        <section className="px-4 mt-7">
          <h2 className="text-[18px] font-bold text-[#111827] mb-4">Shop by Category</h2>
          <div className="flex gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={scrollToFrames}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 bg-[#F4F1FF] rounded-full flex items-center justify-center border border-[#E9E6F8]/60 group-hover:border-[#6C4EFF]/30 group-hover:shadow-md transition-all">
                  <Image className="w-7 h-7 text-[#6C4EFF] stroke-[1.5]" />
                </div>
                <span className="text-[11px] font-semibold text-[#111827]">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ╔══════════════════════════════════════╗
            ║   5. POPULAR FRAMES                  ║
            ╚══════════════════════════════════════╝ */}
        <section className="mt-7" ref={popularFramesRef} id="popular-frames">
          {/* Section header */}
          <div className="px-4 flex items-end justify-between mb-4">
            <h2 className="text-[18px] font-bold text-[#111827]">Popular Frames</h2>
            <button
              onClick={() => setShowAllFrames(!showAllFrames)}
              className="text-[12px] font-bold text-[#6C4EFF] flex items-center gap-0.5 hover:gap-1.5 transition-all"
            >
              {showAllFrames ? 'Show Less' : 'View All'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Product Cards — Horizontal scroll on mobile, grid on desktop */}
          {/* Mobile horizontal scroll */}
          <div className="flex lg:hidden gap-3 overflow-x-auto no-scrollbar pb-2 px-4">
            {displayedProducts.map((product) => (
              <div key={product.id} className="w-[155px] flex-shrink-0">
                <FrameProductCard
                  product={product}
                  onCustomize={(p) => setCustomizeProduct(p)}
                />
              </div>
            ))}
          </div>

          {/* Desktop grid */}
          <div className="hidden lg:grid grid-cols-4 gap-4 px-4">
            {displayedProducts.map((product) => (
              <FrameProductCard
                key={product.id}
                product={product}
                onCustomize={(p) => setCustomizeProduct(p)}
              />
            ))}
          </div>
        </section>

        {/* ╔══════════════════════════════════════╗
            ║   6. FEATURES STRIP                  ║
            ╚══════════════════════════════════════╝ */}
        <section className="px-4 mt-7">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Wand2, label1: 'Easy', label2: 'Customization' },
              { icon: Eye, label1: 'Preview', label2: 'Before Order' },
              { icon: Lock, label1: 'Secure', label2: 'Payments' },
              { icon: Clock, label1: 'On-time', label2: 'Delivery' },
            ].map((feat, i) => (
              <div
                key={i}
                className="bg-[#FAFAFF] border border-[#E9E6F8]/60 rounded-[14px] p-3 flex flex-col items-center text-center gap-1.5"
              >
                <div className="w-9 h-9 bg-[#F4F1FF] rounded-full flex items-center justify-center">
                  <feat.icon className="w-4 h-4 text-[#6C4EFF] stroke-[1.8]" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#111827] leading-tight">{feat.label1}</p>
                  <p className="text-[10px] font-medium text-[#9CA3AF] leading-tight">{feat.label2}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ╔══════════════════════════════════════╗
            ║   7. ABOUT EM GIFT STUDIO            ║
            ╚══════════════════════════════════════╝ */}
        <section className="px-4 mt-7 mb-6">
          <button
            onClick={() => showToast('Full vendor profile coming soon!', 'info')}
            className="w-full bg-[#F4F1FF] border border-[#E9E6F8]/60 rounded-[16px] p-5 flex items-center gap-4 text-left hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-white rounded-[14px] flex items-center justify-center flex-shrink-0 shadow-sm">
              <Store className="w-6 h-6 text-[#6C4EFF] stroke-[1.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[14px] text-[#111827]">About {VENDOR_INFO.name}</h3>
              <p className="text-[11px] text-[#6B7280] mt-0.5 leading-relaxed line-clamp-2">
                {VENDOR_INFO.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#6C4EFF] transition-colors flex-shrink-0" />
          </button>
        </section>
      </div>

      {/* ── Floating Cart FAB (mobile only, when items in cart) ── */}
      {cartItemCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="lg:hidden fixed bottom-[80px] right-4 z-30 w-14 h-14 bg-[#6C4EFF] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(108,78,255,0.4)] active:scale-95 transition-all"
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {cartItemCount}
          </span>
        </button>
      )}

      {/* ── Price Guide Modal Popup ── */}
      <GiftPriceGuideModal
        isOpen={isPriceGuideOpen}
        onClose={() => setIsPriceGuideOpen(false)}
      />

      {/* ── Customization Modal ── */}
      <FrameCustomizationModal
        product={customizeProduct}
        isOpen={!!customizeProduct}
        onClose={() => setCustomizeProduct(null)}
      />

      {/* ── Cart Drawer ── */}
      <GiftCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onBrowse={scrollToFrames}
      />
    </div>
  );
};

export default GiftStudio;
