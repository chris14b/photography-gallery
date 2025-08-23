import React from 'react';
import IconButton from './IconButton';

interface HomeIconProps {
  onClick: () => void;
  size?: number;
}

// SVG icon for home
const HomeSvgIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1L1 6V15H5V9H11V15H15V6L8 1Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * HomeIcon component that navigates back to the homepage
 */
const HomeIcon: React.FC<HomeIconProps> = ({ onClick, size = 40 }) => {
  return (
    <IconButton
      onClick={onClick}
      size={size}
      top={20}
      left={20}
      aria-label="Return to homepage"
      title="Return to homepage"
    >
      <HomeSvgIcon />
    </IconButton>
  );
};

export default HomeIcon;