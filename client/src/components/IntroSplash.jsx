import React, { useState, useEffect } from 'react';

const IntroSplash = () => {
  const checkInitialSplash = () => {
    if (typeof window !== 'undefined') {
      const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
      return !hasSeenIntro;
    }
    return false;
  };

  const [showSplash, setShowSplash] = useState(checkInitialSplash);
  const [phase, setPhase] = useState(0); // 0=start, 1=logo, 2=text, 3=tagline, 4=fadeout

  useEffect(() => {
    if (!showSplash) return;
    document.body.style.overflow = 'hidden';

    const timers = [];
    timers.push(setTimeout(() => setPhase(1), 200));   // Logo scales in
    timers.push(setTimeout(() => setPhase(2), 900));   // Title appears
    timers.push(setTimeout(() => setPhase(3), 1600));  // Tagline appears
    timers.push(setTimeout(() => setPhase(4), 3000));  // Start fade out
    timers.push(setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem('hasSeenIntro', 'true');
      document.body.style.overflow = 'unset';
    }, 3600));

    return () => timers.forEach(clearTimeout);
  }, [showSplash]);

  if (!showSplash) return null;

  return (
    <div
      className="intro-splash-overlay"
      style={{
        opacity: phase >= 4 ? 0 : 1,
        transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Animated background gradient orbs */}
      <div className="intro-orb intro-orb-1" />
      <div className="intro-orb intro-orb-2" />
      <div className="intro-orb intro-orb-3" />

      {/* Subtle grid pattern overlay */}
      <div className="intro-grid-overlay" />

      {/* Content */}
      <div className="intro-content">
        {/* Animated Logo Mark */}
        <div
          className="intro-logo-wrap"
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(30px)',
            transition: 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div className="intro-logo-ring">
            <div className="intro-logo-inner">
              <svg viewBox="0 0 48 48" fill="none" className="intro-logo-svg">
                <path d="M24 4L8 14V34L24 44L40 34V14L24 4Z" stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round" />
                <path d="M24 4L24 44" stroke="white" strokeWidth="1.5" opacity="0.4" />
                <path d="M8 14L40 34" stroke="white" strokeWidth="1.5" opacity="0.4" />
                <path d="M40 14L8 34" stroke="white" strokeWidth="1.5" opacity="0.4" />
                <circle cx="24" cy="24" r="6" fill="white" opacity="0.9" />
              </svg>
            </div>
          </div>

          {/* Pulse rings */}
          <div className="intro-pulse-ring intro-pulse-ring-1" style={{ animationDelay: '0s' }} />
          <div className="intro-pulse-ring intro-pulse-ring-2" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Title */}
        <h1
          className="intro-title"
          style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Engineering Market
        </h1>

        {/* Divider line */}
        <div
          className="intro-divider"
          style={{
            width: phase >= 2 ? '64px' : '0px',
            opacity: phase >= 2 ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.15s',
          }}
        />

        {/* Tagline */}
        <p
          className="intro-tagline"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? 'translateY(0)' : 'translateY(14px)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Buy · Sell · Print · Deliver
        </p>

        {/* Loading dots */}
        <div
          className="intro-loader"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transition: 'opacity 0.4s ease 0.2s',
          }}
        >
          <span className="intro-dot" style={{ animationDelay: '0s' }} />
          <span className="intro-dot" style={{ animationDelay: '0.15s' }} />
          <span className="intro-dot" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    </div>
  );
};

export default IntroSplash;
