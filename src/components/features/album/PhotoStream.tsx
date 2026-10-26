import React from 'react';
import styled from 'styled-components';
import { PhotoProvider } from 'react-photo-view';
import type { Photo } from '../../../types';
import PhotoWithInfo from './PhotoWithInfo';
import { useContainerWidth } from '../../../hooks/useContainerWidth';
import { usePhotoDimensions } from '../../../hooks/usePhotoDimensions';

interface PhotoStreamProps {
  photos: Photo[];
  children?: React.ReactNode;
}

const StreamContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0; /* Separate header spacing from photo list spacing */
  padding: 24px 0;
  max-width: 100%;
  overflow-x: hidden; /* Prevent horizontal scrolling */
`;

const PhotosList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 96px;
`;

/**
 * One photo per screen, each as large as fits, with its caption and location below
 * (landscape) or alternating to either side (portrait). Children render above the photos.
 */
const PhotoStream: React.FC<PhotoStreamProps> = ({ photos, children }) => {
  const { containerRef, containerWidth } = useContainerWidth();
  const { calculateDimensions } = usePhotoDimensions(containerWidth);

  const renderPhotos = () => {
    // Counter to track side-by-side photos for alternating layout
    let sideBySideIndex = 0;

    return photos.map((photo) => {
      const GAP_BETWEEN = 32; // matches PortraitPhotoContainer gap
      const INFO_WIDTH = 300; // matches InfoContainer side width
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;

      // Always stack on narrow screens
      if (vw < 768) {
        const below = calculateDimensions(photo.width, photo.height, { layout: 'below', gap: GAP_BETWEEN, infoWidth: INFO_WIDTH });
        return (
          <PhotoWithInfo
            key={photo.id}
            photo={photo}
            width={below.width}
            height={below.height}
            layout="below"
          />
        );
      }

      // Compute both layouts and choose the one that yields the larger image area
      const below = calculateDimensions(photo.width, photo.height, { layout: 'below', gap: GAP_BETWEEN, infoWidth: INFO_WIDTH });
      const side = calculateDimensions(photo.width, photo.height, { layout: 'side', gap: GAP_BETWEEN, infoWidth: INFO_WIDTH });

      const areaBelow = below.width * below.height;
      const areaSide = side.width * side.height;

      const useSide = areaSide > areaBelow;

      if (useSide) {
        const isEven = sideBySideIndex % 2 === 0;
        sideBySideIndex++;

        return (
          <PhotoWithInfo
            key={photo.id}
            photo={photo}
            width={side.width}
            height={side.height}
            layout="side"
            reverse={!isEven}
          />
        );
      }

      return (
        <PhotoWithInfo
          key={photo.id}
          photo={photo}
          width={below.width}
          height={below.height}
          layout="below"
        />
      );
    });
  };

  return (
    <PhotoProvider>
      <StreamContainer ref={containerRef}>
        {children}
        <PhotosList>
          {renderPhotos()}
        </PhotosList>
      </StreamContainer>
    </PhotoProvider>
  );
};

export default PhotoStream;
