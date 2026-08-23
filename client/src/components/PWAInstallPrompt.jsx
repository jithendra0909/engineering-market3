import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import './PWAInstallPrompt.css';

/**
 * PWA Install Prompt Component
 * 
 * Shows a floating banner when the browser triggers the `beforeinstallprompt` event.
 * - On Android Chrome: triggers native install dialog
 * - On iOS Safari: shows instructions to add to home screen
 * - Dismissed state is stored in localStorage for 7 days
 */
const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
    
    if (isStandalone) return;

    // Check if user dismissed recently (7 days)
    const dismissedAt = localStorage.getItem('em_pwa_dismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) return;
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // For iOS, show banner after a delay (no beforeinstallprompt event on iOS)
    if (isIOSDevice) {
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      if (isSafari) {
        const timer = setTimeout(() => setShowBanner(true), 3000);
        return () => clearTimeout(timer);
      }
      return;
    }

    // For Android/Chrome — listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after a short delay
      setTimeout(() => setShowBanner(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setDeferredPrompt(null);
      console.log('[PWA] App installed successfully!');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // iOS doesn't have a native install prompt — show instructions
      alert(
        '📱 To install Engineering Market:\n\n' +
        '1. Tap the Share button (📤) at the bottom\n' +
        '2. Scroll down and tap "Add to Home Screen"\n' +
        '3. Tap "Add" to confirm\n\n' +
        'The app will appear on your home screen!'
      );
      handleDismiss();
      return;
    }

    if (!deferredPrompt) return;

    // Show the native install prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA] User accepted install');
    } else {
      console.log('[PWA] User dismissed install');
    }
    
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('em_pwa_dismissed', Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <div className="pwa-install-banner">
      {/* Icon */}
      <div className="pwa-install-icon-box">
        <Download style={{ width: '20px', height: '20px', color: '#ffffff', strokeWidth: 2 }} />
      </div>

      {/* Text */}
      <div className="pwa-install-content">
        <p className="pwa-install-title">
          {isIOS ? 'Add to Home Screen' : 'Install Engineering Market'}
        </p>
        <p className="pwa-install-subtitle">
          {isIOS 
            ? 'Tap Share → Add to Home Screen'
            : 'Quick access, works offline!'
          }
        </p>
      </div>

      {/* Actions */}
      <div className="pwa-install-actions">
        <button 
          onClick={handleInstall}
          className="pwa-install-btn"
        >
          Install
        </button>
        <button 
          onClick={handleDismiss}
          className="pwa-install-close"
          aria-label="Dismiss"
        >
          <X style={{ width: '12px', height: '12px', strokeWidth: 2.5 }} />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
