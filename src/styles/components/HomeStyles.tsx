import styled from 'styled-components';

// Base container for gallery layouts (homepage)
export const GalleryContainer = styled.div`
  padding: 24px;
  width: 100%;
  max-width: 1800px;
  margin: 0 auto;
  position: relative;
`;

// Header for homepage
export const Header = styled.div`
  width: 100%;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
`;

// Title for homepage
export const GalleryTitle = styled.h1`
  font-size: 2.5rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;
