import { useState, useEffect } from 'react';

/**
 * Hook to detect viewport size and calculate optimal board dimensions
 * Returns dynamic values that adapt to any device size
 */
export function useViewportSize() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial viewport
    updateViewport();

    // Listen for resize events
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);

    // Also listen for visual viewport changes (important for mobile keyboards)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
    }

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
      }
    };
  }, []);

  // Calculate aspect ratio
  const aspectRatio = viewport.width / viewport.height;
  const isPortrait = viewport.height > viewport.width;
  const isLandscape = viewport.width > viewport.height;

  // Detect device type based on dimensions
  const isMobile = viewport.width < 640;
  const isTablet = viewport.width >= 640 && viewport.width < 1024;
  const isDesktop = viewport.width >= 1024;
  const isFolding = viewport.height < 700 || (viewport.width < 500 && viewport.height < 800);

  // Calculate optimal board dimensions
  // Reserve space for: header (~60px), controls panel (~30vh on mobile), padding
  const headerHeight = 60;
  const controlsHeight = isMobile ? Math.min(viewport.height * 0.3, 200) : 0;
  const padding = isMobile ? 16 : 32;
  const availableHeight = viewport.height - headerHeight - controlsHeight - (padding * 2);
  const availableWidth = viewport.width - (padding * 2);

  // Calculate board size (maintain square aspect ratio)
  const maxBoardSize = Math.min(availableWidth, availableHeight);
  
  // Scale factor based on available space
  // Smaller screens get more aggressive scaling
  let scaleFactor = 1;
  if (isFolding) {
    // Very small screens: scale down more
    if (viewport.height < 500) {
      scaleFactor = 0.75;
    } else if (viewport.height < 600) {
      scaleFactor = 0.8;
    } else {
      scaleFactor = 0.85;
    }
  } else if (isMobile) {
    if (viewport.width < 360) {
      scaleFactor = 0.85;
    } else if (viewport.width < 480) {
      scaleFactor = 0.9;
    } else {
      scaleFactor = 0.95;
    }
  }

  // Calculate max dimensions
  const maxWidth = Math.min(
    availableWidth * 0.95,
    isMobile ? viewport.width * 0.98 : 800
  );
  const maxHeight = Math.min(
    availableHeight * scaleFactor,
    isMobile ? viewport.height * 0.45 : viewport.height * 0.7
  );

  return {
    viewport,
    aspectRatio,
    isPortrait,
    isLandscape,
    isMobile,
    isTablet,
    isDesktop,
    isFolding,
    maxBoardSize,
    maxWidth,
    maxHeight,
    scaleFactor,
    availableHeight,
    availableWidth,
  };
}

