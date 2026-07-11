import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const IntroSplash = () => {
  const [showSplash, setShowSplash] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 1. Only play on mobile views (< 768px)
    const isMobile = window.innerWidth < 768;
    
    // 2. Only show once per browser session so it doesn't annoy students on page refreshes
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');

    if (isMobile && !hasSeenIntro) {
      setShowSplash(true);
      // Prevent body scrolling during intro splash
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleStartPlay = () => {
    setIsPlaying(true);
  };

  const handleCloseSplash = () => {
    setFadeOut(true);
    // Smooth transition
    setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('hasSeenIntro', 'true');
      document.body.style.overflow = 'unset';
    }, 600);
  };

  if (!showSplash) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#0B0813] via-[#0F0A1C] to-[#08050E] transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {!isPlaying ? (
        // Start Interaction Screen to unlock browser audio autoplay
        <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm animate-fadeIn">
          {/* Logo Icon glowing indicator */}
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center text-white shadow-[0_8px_32px_rgba(108,78,255,0.15)] mb-6 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#6C4EFF]/20 to-transparent opacity-50" />
            <Sparkles className="w-10 h-10 text-[#8A72FF] animate-pulse" />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight mb-2">
            VIGNAN MARKET
          </h1>
          <p className="text-[13px] text-[#A7A3F0] font-medium max-w-[280px] mb-8 leading-relaxed">
            Welcome to your student marketplace. Experience the new intro.
          </p>

          <button
            onClick={handleStartPlay}
            className="px-8 py-3.5 bg-gradient-to-r from-[#6C4EFF] to-[#8A72FF] hover:from-[#5739E6] hover:to-[#765EE6] text-white font-extrabold text-[14px] rounded-full shadow-[0_0_24px_rgba(108,78,255,0.4)] transition-all duration-300 active:scale-95 flex items-center gap-2 group tracking-wide"
          >
            Enter Experience
          </button>
        </div>
      ) : (
        // Active Intro Video Player State
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            src="/intro.mp4"
            autoPlay
            playsInline
            controls={false}
            onEnded={handleCloseSplash}
            className="w-full h-full object-cover pointer-events-none"
          />

          {/* Translucent Premium Skip Button */}
          <button
            onClick={handleCloseSplash}
            className="absolute top-6 right-6 px-4 py-2 bg-black/30 hover:bg-black/50 backdrop-blur-md border border-white/10 text-white font-bold text-[11px] uppercase tracking-wider rounded-full shadow-lg transition-colors cursor-pointer"
          >
            Skip Intro
          </button>
        </div>
      )}
    </div>
  );
};

export default IntroSplash;
