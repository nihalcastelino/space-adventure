import { useEffect, useRef } from 'react';
import { usePremium } from '../hooks/usePremium';

/**
 * Google AdSense Ad Component
 * 
 * Displays ads for non-premium users
 * Respects premium status (no ads for premium users)
 */
export default function AdSenseAd({ 
  adSlot = 'auto',
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = {},
  className = ''
}) {
  const { isPremium } = usePremium();
  const adRef = useRef(null);
  const adLoadedRef = useRef(false);

  useEffect(() => {
    // Don't show ads for premium users
    if (isPremium) {
      return;
    }

    // Load AdSense script if not already loaded
    if (!window.adsbygoogle && !adLoadedRef.current) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9836174027317671';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
      adLoadedRef.current = true;
    }

    // Initialize ad after script loads
    const initializeAd = () => {
      if (window.adsbygoogle && adRef.current && !adRef.current.dataset.adsbygoogleStatus) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.error('AdSense error:', e);
        }
      }
    };

    // Wait for script to load
    if (window.adsbygoogle) {
      initializeAd();
    } else {
      const checkInterval = setInterval(() => {
        if (window.adsbygoogle) {
          initializeAd();
          clearInterval(checkInterval);
        }
      }, 100);

      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000);
    }
  }, [isPremium]);

  // Don't render for premium users
  if (isPremium) {
    return null;
  }

  return (
    <div 
      className={`adsense-container ${className}`} 
      style={{
        ...style,
        maxWidth: '100%',
        overflow: 'hidden',
        // Ensure ads don't overlap game content
        position: 'relative',
        zIndex: 1
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          maxWidth: '100%',
          ...(fullWidthResponsive ? {} : { width: '100%', height: '100px' })
        }}
        data-ad-client="ca-pub-9836174027317671"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}

