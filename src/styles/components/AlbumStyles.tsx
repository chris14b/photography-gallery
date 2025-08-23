import styled from 'styled-components';

// Caption for photos
export const PhotoCaption = styled.div`
  font-size: 1.2rem;
  margin-bottom: 8px;
  font-weight: 500;
`;

// Location text for photos with inline SVG icon
export const PhotoLocation = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.85;
  font-style: italic;
  display: inline-flex;
  align-items: center;
  gap: 6px; /* space between icon and text */
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
  margin-bottom: 16px; /* Tighter spacing so photos start higher */
`;

// Title for album pages
export const AlbumTitle = styled.h1`
  font-size: clamp(1.75rem, 3.2vw, 2.75rem);
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.08;
  letter-spacing: -0.01em;
  font-weight: 600;
`;
