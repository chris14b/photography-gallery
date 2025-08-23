import styled from 'styled-components';

// Caption for photos
export const PhotoCaption = styled.div`
  font-size: 1.2rem;
  margin-bottom: 8px;
  font-weight: 500;
`;

// Location text for photos (with pin)
export const PhotoLocation = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.85;
  font-style: italic;
  display: inline-flex;
  align-items: center;

  &::before {
    content: '📍';
    margin-right: 6px;
    opacity: 0.9;
    font-style: normal; /* keep icon non-italic */
  }
`;

// Container for photo information (used in landscape photos)
export const PhotoInfo = styled.div`
  padding: 0 24px;
  text-align: center;
`;

// Container for portrait photo information
export const PortraitPhotoInfo = styled.div<{ $alignRight?: boolean }>`
  padding: 0;
  text-align: ${props => (props.$alignRight ? 'right' : 'left')};
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center content vertically */
  align-items: ${props => (props.$alignRight ? 'flex-end' : 'flex-start')};
  max-width: 300px; /* Limit width of the info section */
  
  /* Responsive layout for smaller screens */
  @media (max-width: 768px) {
    max-width: 100%; /* Full width on mobile */
    text-align: center; /* Center text on mobile */
    align-items: center; /* Center items on mobile */
    padding: 0 24px;
  }
`;

// Header for album pages
export const AlbumHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 24px;
`;

// Title for album pages
export const AlbumTitle = styled.h1`
  font-size: 4rem;
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.text};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 5rem;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    font-size: 6rem;
  }
`;
