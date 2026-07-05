import React, { useState, useEffect, useRef, useCallback } from 'react';

const BANNERS = [
  { id: 1, image: '/images/file_000000007ac07207bf291c82f183c3b7 (1).png', alt: 'Buy. Sell. Donate. — All things student.' },
  { id: 2, image: '/images/file_00000000f4e872069c9860337ed3b3de.png', alt: 'Buy Within Your College — College Marketplace' },
  { id: 3, image: '/images/file_00000000592871f8a49c9c3cf84fde89.png', alt: 'Verified Local Vendors — Trusted & Verified' },
  { id: 4, image: '/images/file_00000000ef3c7207962898fa886a1dfe.png', alt: 'Connect Across Colleges — General Marketplace' },
];

export const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const startX = useRef(0);
  const sliderRef = useRef(null);

  // Auto-slide (5s interval)
  useEffect(() => {
    if (isPaused || isDragging) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isDragging, isPaused]);

  // Touch swipe — start
  const handleTouchStart = useCallback((e) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  }, []);

  // Touch swipe — move (live drag feedback)
  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !sliderRef.current) return;
    const diff = e.touches[0].clientX - startX.current;
    const width = sliderRef.current.offsetWidth;
    const walk = (diff / width) * 100;
    sliderRef.current.style.transform = `translateX(${-current * 100 + walk}%)`;
    sliderRef.current.style.transition = 'none';
  }, [isDragging, current]);

  // Touch swipe — end (snap)
  const handleTouchEnd = useCallback((e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = e.changedTouches[0].clientX - startX.current;

    if (sliderRef.current) {
      sliderRef.current.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
    }

    if (Math.abs(diff) > 50) {
      if (diff > 0) setCurrent((p) => (p === 0 ? BANNERS.length - 1 : p - 1));
      else setCurrent((p) => (p + 1) % BANNERS.length);
    } else if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${current * 100}%)`;
    }
  }, [isDragging, current]);

  // Sync transform on current change
  useEffect(() => {
    if (sliderRef.current && !isDragging) {
      sliderRef.current.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      sliderRef.current.style.transform = `translateX(-${current * 100}%)`;
    }
  }, [current, isDragging]);

  return (
    <div
      className="relative w-full overflow-hidden select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{ borderRadius: '20px' }}
    >
      {/* Slider track */}
      <div
        ref={sliderRef}
        className="flex will-change-transform"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {BANNERS.map((banner) => (
          <div key={banner.id} className="w-full flex-shrink-0">
            <img
              src={banner.image}
              alt={banner.alt}
              className="w-full h-auto object-cover"
              draggable={false}
              loading={banner.id === 1 ? 'eager' : 'lazy'}
            />
          </div>
        ))}
      </div>

      {/* Navigation arrows (desktop only — appear on hover) */}
      <button
        onClick={() => setCurrent((p) => (p === 0 ? BANNERS.length - 1 : p - 1))}
        className="absolute left-3 lg:left-5 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-[#111827] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95 z-10"
        aria-label="Previous banner"
      >
        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button
        onClick={() => setCurrent((p) => (p + 1) % BANNERS.length)}
        className="absolute right-3 lg:right-5 top-1/2 -translate-y-1/2 w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-[#111827] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-105 active:scale-95 z-10"
        aria-label="Next banner"
      >
        <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 lg:bottom-5 left-1/2 -translate-x-1/2 flex gap-[6px] z-10">
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to banner ${idx + 1}`}
            className={`h-[6px] rounded-full transition-all duration-400 ${
              current === idx
                ? 'bg-[#6C4EFF] w-6 shadow-sm'
                : 'bg-white/60 w-[6px] hover:bg-white/90'
            }`}
          />
        ))}
      </div>

      {/* Subtle gradient overlay at bottom for dot readability */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/[0.06] to-transparent pointer-events-none" />
    </div>
  );
};

export default HeroCarousel;
