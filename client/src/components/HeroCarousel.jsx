import React, { useState, useEffect, useRef } from 'react';

const BANNERS = [
  { id: 1, image: '/images/file_00000000ef3c7207962898fa886a1dfe.png', alt: 'Connect Across Colleges' },
  { id: 2, image: '/images/file_0000000089387207ae3efbac0454e8bd.png', alt: 'College Market' },
  { id: 3, image: '/images/file_00000000f4e872069c9860337ed3b3de.png', alt: 'General Market' },
  { id: 4, image: '/images/file_000000007ac07207bf291c82f183c3b7 (1).png', alt: 'Vendors Coming Soon' },
];

export const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const sliderRef = useRef(null);

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isDragging) {
        setCurrent((prev) => (prev + 1) % BANNERS.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [isDragging]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !sliderRef.current) return;
    const diff = e.touches[0].clientX - startX.current;
    const width = sliderRef.current.offsetWidth;
    const walk = (diff / width) * 100;
    sliderRef.current.style.transform = `translateX(${-current * 100 + walk}%)`;
    sliderRef.current.style.transition = 'none';
  };

  const handleTouchEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const diff = e.changedTouches[0].clientX - startX.current;

    if (sliderRef.current) {
      sliderRef.current.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
    }

    if (Math.abs(diff) > 60) {
      if (diff > 0) setCurrent((p) => (p === 0 ? BANNERS.length - 1 : p - 1));
      else setCurrent((p) => (p + 1) % BANNERS.length);
    } else if (sliderRef.current) {
      sliderRef.current.style.transform = `translateX(-${current * 100}%)`;
    }
  };

  // Sync transform on current change
  useEffect(() => {
    if (sliderRef.current && !isDragging) {
      sliderRef.current.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
      sliderRef.current.style.transform = `translateX(-${current * 100}%)`;
    }
  }, [current, isDragging]);

  return (
    <div className="relative w-full rounded-[20px] overflow-hidden select-none group bg-[#F4F1FF]">
      {/* Slider track */}
      <div
        ref={sliderRef}
        className="flex"
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
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex gap-[6px] z-10">
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-[6px] rounded-full transition-all duration-300 ${
              current === idx
                ? 'bg-[#6C4EFF] w-5'
                : 'bg-[#111827]/20 w-[6px] hover:bg-[#111827]/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
