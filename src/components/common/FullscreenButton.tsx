import React, { useState, useEffect, useMemo } from 'react';
import IconButton from './IconButton';

interface FullscreenButtonProps {
  size?: number;
}

// SVG icons for fullscreen and exit fullscreen
const EnterFullscreenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 6V1H6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 1H15V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 10V15H10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 15H1V10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 6L6 6L6 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 1L10 6L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M15 10L10 10L10 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 15L6 10L1 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * FullscreenButton component that toggles fullscreen mode for the entire site
 */
const FullscreenButton: React.FC<FullscreenButtonProps> = ({ size = 40 }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Feature detection for Fullscreen API support
  const isSupported = useMemo(() => {
    if (typeof document === 'undefined') return false;
    const el = document.documentElement as HTMLElement;
    return document.fullscreenEnabled && typeof el.requestFullscreen === 'function';
  }, []);

  const toggleFullscreen = () => {
    if (!isSupported) return; // No-op if unsupported

    if (!document.fullscreenElement) {
      (document.documentElement as HTMLElement).requestFullscreen?.().catch((err: unknown) => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen?.().catch((err: unknown) => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  useEffect(() => {
    if (!isSupported) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isSupported]);

  if (!isSupported) {
    // Hide the button entirely if fullscreen is not supported
    return null;
  }

  return (
    <IconButton
      onClick={toggleFullscreen}
      size={size}
      top={20}
      right={20}
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    >
      {isFullscreen ? <ExitFullscreenIcon /> : <EnterFullscreenIcon />}
    </IconButton>
  );
};

export default FullscreenButton;