import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface FullscreenButtonProps {
  // Optional props for customization
  size?: number;
}

interface StyledButtonProps {
  $size: number;
}

const Button = styled.button<StyledButtonProps>`
  position: fixed;
  top: 20px;
  right: 20px;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  background-color: ${({ theme }) => theme.colors.accent};
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10; /* Same z-index as HomeIcon for consistency */
  transition: background-color 0.2s ease, transform 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    transform: scale(1.1);
  }
  
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

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
 *
 * This button is fixed at the top right corner of the site and allows users
 * to enter and exit fullscreen mode for the entire document.
 *
 * @param size - Size of the button in pixels (default: 40)
 */
const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  size = 40
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle fullscreen mode for the entire document
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen().catch(err => {
        console.error(`Error attempting to exit fullscreen: ${err.message}`);
      });
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <Button
      onClick={toggleFullscreen}
      $size={size}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {isFullscreen ? <ExitFullscreenIcon /> : <EnterFullscreenIcon />}
    </Button>
  );
};

export default FullscreenButton;