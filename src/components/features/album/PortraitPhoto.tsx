import React from 'react';
import styled from 'styled-components';
import PhotoCard from '../../common/PhotoCard';
import type { Photo } from '../../../types';
import {
  PhotoCaption,
  PhotoLocation,
  PortraitPhotoInfo
} from '../../../styles/components/AlbumStyles';

interface PortraitPhotoProps {
  photo: Photo;
  width: number;
  height: number;
  isEven: boolean;
}

// Container for portrait photos (row layout with photo and info side by side)
const PortraitPhotoContainer = styled.div<{ $isEven: boolean }>`
  display: flex;
  flex-direction: ${props => props.$isEven ? 'row' : 'row-reverse'};
  width: 100%;
  align-items: center; /* Center items vertically */
  justify-content: center; /* Center the container */
  gap: 32px; /* Increased space between photo and info */
  
  /* Responsive layout for smaller screens */
  @media (max-width: 768px) {
    flex-direction: column; /* Stack vertically on mobile */
    gap: 16px;
  }
`;

// Photo container for portrait photos (no bottom margin needed)
const PortraitPhotoWrapper = styled.div`
  display: flex;
  justify-content: center; /* Center the photo in its container */
  max-width: 90%; /* Increased from 80% to make portrait photos larger since data is to the side */
  
  /* Responsive layout for smaller screens */
  @media (max-width: 768px) {
    max-width: 100%; /* Full width on mobile */
    justify-content: center; /* Center on mobile */
  }
`;

/**
 * Component for rendering a portrait photo with information to the side
 * Portrait photos alternate between having information on the right and left sides
 */
const PortraitPhoto: React.FC<PortraitPhotoProps> = React.memo(({ 
  photo, 
  width, 
  height, 
  isEven 
}) => {
  return (
    <PortraitPhotoContainer $isEven={isEven}>
      <PortraitPhotoWrapper>
        <div style={{ width, height }}>
          <PhotoCard 
            photo={photo} 
            width={width} 
            height={height}
          />
        </div>
      </PortraitPhotoWrapper>
      <PortraitPhotoInfo $alignRight={!isEven}>
        {photo.caption && (
          <PhotoCaption>{photo.caption}</PhotoCaption>
        )}
        {photo.location && (
          <PhotoLocation>{photo.location}</PhotoLocation>
        )}
      </PortraitPhotoInfo>
    </PortraitPhotoContainer>
  );
});

PortraitPhoto.displayName = 'PortraitPhoto';

export default PortraitPhoto;