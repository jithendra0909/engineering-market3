import React, { useState, useEffect } from 'react';

const IntroSplash = () => {
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

  useEffect(() => {
    if (showSplash) {
      document.body.style.overflow = 'hidden';
      
      // Auto close after 5 seconds (Intro time)
      const timer = setTimeout(() => {
        handleCloseSplash();
      }, 5000);

      return () => clearTimeout(timer);
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
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        controls={false}
        onEnded={handleCloseSplash}
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
};

export default IntroSplash;
