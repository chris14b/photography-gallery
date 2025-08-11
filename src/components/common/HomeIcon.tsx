import React from 'react';
import styled from 'styled-components';

interface HomeIconProps {
  onClick: () => void;
  size?: number;
}

interface StyledButtonProps {
  $size: number;
}

const Button = styled.button<StyledButtonProps>`
  position: fixed;
  top: 20px;
  left: 20px;
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
  z-index: 10;
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

// SVG icon for home
const HomeSvgIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 1L1 6V15H5V9H11V15H15V6L8 1Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/**
 * HomeIcon component that navigates back to the homepage
 *
 * This button is fixed at the top left corner of the site and allows users
 * to return to the homepage from any other page.
 *
 * @param onClick - Function to call when the button is clicked
 * @param size - Size of the button in pixels (default: 40)
 */
const HomeIcon: React.FC<HomeIconProps> = ({
  onClick,
  size = 40
}) => {
  return (
    <Button
      onClick={onClick}
      $size={size}
      aria-label="Return to homepage"
      title="Return to homepage"
    >
      <HomeSvgIcon />
    </Button>
  );
};

export default HomeIcon;