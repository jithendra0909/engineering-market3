import React, { useState, useEffect, useRef } from 'react';

const IntroSplash = () => {
  const videoRef = useRef(null);
  
  // Synchronous check on initial render to prevent home screen flash/flicker
  const checkInitialSplash = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
      return isMobile && !hasSeenIntro;
    }
    return false;
  };

  const [showSplash, setShowSplash] = useState(checkInitialSplash);
  const [fadeOut, setFadeOut] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (showSplash) {
      document.body.style.overflow = 'hidden';
      
      // Auto close after 5 seconds (Intro time)
      const timer = setTimeout(() => {
        handleCloseSplash();
      }, 5000);

      // Listen for touch/click to unmute song/audio safely
      const handleDocClick = () => {
        if (videoRef.current) {
          videoRef.current.muted = false;
          setIsMuted(false);
        }
      };

      document.addEventListener('click', handleDocClick);
      document.addEventListener('touchstart', handleDocClick);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleDocClick);
        document.removeEventListener('touchstart', handleDocClick);
      };
    }
  }, [showSplash]);

  const handleCloseSplash = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('hasSeenIntro', 'true');
      document.body.style.overflow = 'unset';
    }, 600);
  };

  if (!showSplash) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        ref={videoRef}
        src="/intro.mp4"
        autoPlay
        muted={isMuted}
        playsInline
        controls={false}
        onEnded={handleCloseSplash}
        className="w-full h-full object-cover pointer-events-none"
      />

      {/* Floating sound notification overlay if muted */}
      {isMuted && (
        <div className="absolute bottom-10 bg-black/50 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-[11px] font-bold tracking-wide animate-pulse pointer-events-none flex items-center gap-1.5 shadow-lg">
          <span>🔊 Tap anywhere for sound</span>
        </div>
      )}
    </div>
  );
};

export default IntroSplash;
