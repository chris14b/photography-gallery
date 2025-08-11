import React from 'react';
import styled from 'styled-components';
import PhotoCard from '../../common/PhotoCard';
import type { Photo } from '../../../types';
import {
  PhotoCaption,
  PhotoLocation,
  PhotoInfo
} from '../../../styles/components/AlbumStyles';

interface LandscapePhotoProps {
  photo: Photo;
  width: number;
  height: number;
}

// Container for landscape photos (column layout)
const LandscapePhotoContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center; /* Center the photo container */
`;

const LandscapePhotoWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 20px; /* Increased margin below photo for landscape photos */
`;

/**
 * Component for rendering a landscape photo with information underneath
 */
const LandscapePhoto: React.FC<LandscapePhotoProps> = React.memo(({ 
  photo, 
  width, 
  height 
}) => {
  return (
    <LandscapePhotoContainer>
      <LandscapePhotoWrapper>
        <div style={{ width, height }}>
          <PhotoCard 
            photo={photo} 
            width={width} 
            height={height}
          />
        </div>
      </LandscapePhotoWrapper>
      <PhotoInfo>
        {photo.caption && (
          <PhotoCaption>{photo.caption}</PhotoCaption>
        )}
        {photo.location && (
          <PhotoLocation>{photo.location}</PhotoLocation>
        )}
      </PhotoInfo>
    </LandscapePhotoContainer>
  );
});

LandscapePhoto.displayName = 'LandscapePhoto';

export default LandscapePhoto;