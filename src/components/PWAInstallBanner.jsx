import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

export default function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running already in standalone / installed PWA mode
    const standaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true;
    
    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(ios);

    // Listen for Android beforeinstallprompt
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // If mobile and not installed, show banner after 2 seconds
    const timer = setTimeout(() => {
      const dismissed = sessionStorage.getItem('shopbook_pwa_dismissed');
      if (!dismissed && (ios || window.innerWidth <= 768)) {
        setShowBanner(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('ഫോണിൽ Chrome / Safari ബ്രൗസറിൽ Add to Home Screen തിരഞ്ഞെടുക്കുക.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('shopbook_pwa_dismissed', 'true');
  };

  if (!showBanner || isStandalone) return null;

  return (
    <div className="pwa-install-banner">
      <div className="pwa-banner-icon-box">
        <img 
          src="/icons/icon-180.png" 
          alt="App Icon" 
          className="pwa-app-logo"
        />
      </div>

      <div className="pwa-banner-text">
        <strong className="pwa-title">ShopBook ആപ്പായി ഇൻസ്റ്റാൾ ചെയ്യാം</strong>
        <p className="pwa-subtitle">
          {isIOS ? (
            <span>Safari-ൽ <Share size={12} className="inline-icon" /> Share &gt; <strong>Add to Home Screen</strong> നൽകുക</span>
          ) : (
            <span>ഫോൺ ഹോം സ്ക്രീനിൽ ഈ ലോഗോയോടെ വെച്ച് ഉപയോഗിക്കാം</span>
          )}
        </p>
      </div>

      <div className="pwa-banner-actions">
        {!isIOS && deferredPrompt && (
          <button 
            type="button" 
            className="btn-pwa-install" 
            onClick={handleInstallClick}
          >
            ഇൻസ്റ്റാൾ
          </button>
        )}
        <button 
          type="button" 
          className="btn-pwa-close" 
          onClick={handleDismiss} 
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
