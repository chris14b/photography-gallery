import React from 'react';
import styled from 'styled-components';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

const HeaderContainer = styled.header`
  padding: 2rem 1rem;
  text-align: center;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text};
  text-shadow: 0 0 10px ${({ theme }) => theme.colors.accent}40;
  letter-spacing: 1px;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 3px;
    background: linear-gradient(
      90deg, 
      transparent, 
      ${({ theme }) => theme.colors.accent}, 
      transparent
    );
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  opacity: 0.8;
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1rem;
  }
`;

const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <HeaderContainer>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </HeaderContainer>
  );
};

export default Header;