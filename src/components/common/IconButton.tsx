import React from 'react';
import styled from 'styled-components';

interface StyledButtonProps {
  $size: number;
  $top?: number;
  $right?: number;
  $bottom?: number;
  $left?: number;
}

const FloatingButton = styled.button<StyledButtonProps>`
  position: fixed;
  top: ${({ $top }) => ($top !== undefined ? `${$top}px` : '20px')};
  right: ${({ $right }) => ($right !== undefined ? `${$right}px` : 'auto')};
  bottom: ${({ $bottom }) => ($bottom !== undefined ? `${$bottom}px` : 'auto')};
  left: ${({ $left }) => ($left !== undefined ? `${$left}px` : 'auto')};
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background-color: ${({ theme }) => theme.colors.accent};
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.15s ease, box-shadow 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  }

  &:active {
    filter: brightness(0.95);
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.accent};
    outline-offset: 2px;
  }
`;

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: number;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

const IconButton: React.FC<IconButtonProps> = ({
  size = 40,
  top,
  right,
  bottom,
  left,
  children,
  ...rest
}) => {
  return (
    <FloatingButton
      $size={size}
      $top={top}
      $right={right}
      $bottom={bottom}
      $left={left}
      {...rest}
    >
      {children}
    </FloatingButton>
  );
};

export default IconButton;
