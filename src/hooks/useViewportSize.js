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
  
  // Detect folding device states
  // Folding device when folded (small screen)
  const isFoldingFolded = viewport.height < 700 || (viewport.width < 500 && viewport.height < 800);
  // Folding device when unfolded (large screen - tablet-like)
  const isFoldingUnfolded = (viewport.width >= 640 && viewport.width < 1400) && 
                             (viewport.height >= 800 && viewport.height < 1200) &&
                             (aspectRatio > 1.2 && aspectRatio < 2.0);

  // Calculate optimal board dimensions
  // Reserve space for: header (~60px), controls panel, padding
  const headerHeight = 60;
  
  // Controls panel height varies by device type
  // On mobile/folding, we use floating overlay, so no height reserved
  let controlsHeight = 0;
  if (isTablet || isFoldingUnfolded) {
    // On tablets/unfolded, controls are on the side, so no height reserved
    controlsHeight = 0;
  } else if (isDesktop) {
    // Desktop: controls on side
    controlsHeight = 0;
  }
  // Mobile/folding: floating overlay, no height reserved
  
  const padding = isMobile || isFoldingFolded ? 16 : (isTablet || isFoldingUnfolded ? 24 : 32);
  const availableHeight = viewport.height - headerHeight - controlsHeight - (padding * 2);
  const availableWidth = viewport.width - (padding * 2);

  // Calculate board size (maintain square aspect ratio)
  const maxBoardSize = Math.min(availableWidth, availableHeight);
  
  // Scale factor based on available space
  // Only apply scaling on small/folded screens
  let scaleFactor = 1;
  if (isFoldingFolded) {
    // Very small screens: scale down more
    if (viewport.height < 500) {
      scaleFactor = 0.75;
    } else if (viewport.height < 600) {
      scaleFactor = 0.8;
    } else {
      scaleFactor = 0.85;
    }
  } else if (isMobile && !isFoldingUnfolded) {
    if (viewport.width < 360) {
      scaleFactor = 0.85;
    } else if (viewport.width < 480) {
      scaleFactor = 0.9;
    } else {
      scaleFactor = 0.95;
    }
  }
  // No scaling for tablets, desktops, or unfolded folding devices

  // Calculate max dimensions
  // For larger screens, use more of the available space
  let maxWidth, maxHeight;
  
  if (isMobile || isFoldingFolded) {
    // Small screens: use most of width, limited height
    maxWidth = Math.min(availableWidth * 0.95, viewport.width * 0.98);
    maxHeight = Math.min(availableHeight * scaleFactor, viewport.height * 0.45);
  } else if (isTablet || isFoldingUnfolded) {
    // Tablets/unfolded: use more space, maintain good aspect ratio
    maxWidth = Math.min(availableWidth * 0.85, 900);
    maxHeight = Math.min(availableHeight * 0.85, viewport.height * 0.75);
  } else {
    // Desktop: use generous space
    maxWidth = Math.min(availableWidth * 0.8, 1000);
    maxHeight = Math.min(availableHeight * 0.8, viewport.height * 0.75);
  }

  return {
    viewport,
    aspectRatio,
    isPortrait,
    isLandscape,
    isMobile,
    isTablet,
    isDesktop,
    isFoldingFolded,
    isFoldingUnfolded,
    maxBoardSize,
    maxWidth,
    maxHeight,
    scaleFactor,
    availableHeight,
    availableWidth,
  };
}

