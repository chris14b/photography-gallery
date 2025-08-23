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
  opacity: 0.5;
  font-style: italic;
  display: inline-flex;
  align-items: center;
  gap: 6px; /* space between icon and text */
`;

// Unified container for photo information with configurable alignment
export const InfoContainer = styled.div<{ $align: 'left' | 'right' | 'center' }>`
  /* Padding and text alignment adapt to alignment mode */
  padding: ${props => (props.$align === 'center' ? '0 24px' : '0')};
  text-align: ${props => (props.$align === 'center' ? 'center' : props.$align)};
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center content vertically */
  align-items: ${props => (props.$align === 'right' ? 'flex-end' : props.$align === 'left' ? 'flex-start' : 'center')};
  /* Limit width of the side info section, full width when centered */
  max-width: ${props => (props.$align === 'center' ? '100%' : '300px')};

  /* Responsive layout for smaller screens */
  @media (max-width: 768px) {
    max-width: 100%; /* Full width on mobile */
    text-align: center; /* Center text on mobile */
    align-items: center; /* Center items on mobile */
    padding: 0 24px;
  }
`;
