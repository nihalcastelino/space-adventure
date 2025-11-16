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

    // Don't load ads in development (localhost)
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDev) {
      console.log('AdSense disabled in development mode');
      return;
    }

    // Load AdSense script if not already loaded
    const existingScript = document.querySelector('script[src*="adsbygoogle"]');
    if (!existingScript && !adLoadedRef.current) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9836174027317671';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        script.setAttribute('data-loaded', 'true');
        console.log('AdSense script loaded');
      };
      script.onerror = () => {
        console.error('Failed to load AdSense script');
      };
      document.head.appendChild(script);
      adLoadedRef.current = true;
    } else if (existingScript) {
      // Script already exists, mark as loaded
      adLoadedRef.current = true;
    }

    // Initialize ad after script loads
    const initializeAd = () => {
      if (adRef.current && !adRef.current.dataset.adsbygoogleStatus) {
        try {
          // Check if adsbygoogle is available
          if (window.adsbygoogle && window.adsbygoogle.loaded !== true) {
            // Initialize adsbygoogle array if needed
            window.adsbygoogle = window.adsbygoogle || [];
          }
          
          // Push ad configuration
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          
          // Mark as initialized
          adRef.current.dataset.adsbygoogleStatus = 'initialized';
          console.log('AdSense ad initialized');
        } catch (e) {
          console.error('AdSense initialization error:', e);
        }
      }
    };

    // Wait for script to load
    const script = document.querySelector('script[src*="adsbygoogle"]');
    if (script && script.getAttribute('data-loaded') === 'true') {
      // Script already loaded
      setTimeout(initializeAd, 100);
    } else if (window.adsbygoogle) {
      // adsbygoogle already available
      setTimeout(initializeAd, 100);
    } else {
      // Wait for script to load
      const checkInterval = setInterval(() => {
        if (window.adsbygoogle) {
          clearInterval(checkInterval);
          setTimeout(initializeAd, 100);
        }
      }, 100);

      // Also listen for script load event
      if (script) {
        script.addEventListener('load', () => {
          script.setAttribute('data-loaded', 'true');
          clearInterval(checkInterval);
          setTimeout(initializeAd, 100);
        });
      }

      // Cleanup after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (window.adsbygoogle) {
          initializeAd();
        }
      }, 10000);
    }

    // Cleanup function
    return () => {
      // Cleanup if needed
    };
  }, [isPremium]);

  // Don't render for premium users
  if (isPremium) {
    return null;
  }

  // Don't render in development
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isDev) {
    return (
      <div className={className} style={{ ...style, textAlign: 'center', padding: '20px', opacity: 0.5 }}>
        <small style={{ color: '#999' }}>[Ad Space - Disabled in Dev Mode]</small>
      </div>
    );
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
        {...(adSlot !== 'auto' ? { 'data-ad-slot': adSlot } : {})}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </div>
  );
}

