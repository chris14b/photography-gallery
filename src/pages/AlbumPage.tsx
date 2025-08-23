import React from 'react';
import styled from 'styled-components';
import type { Photo, Album } from '../types';
import { PhotoProvider } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import {
  AlbumHeader,
  AlbumTitle
} from '../styles/components/AlbumStyles';
import HomeIcon from '../components/common/HomeIcon';
import PortraitPhoto from '../components/features/album/PortraitPhoto';
import LandscapePhoto from '../components/features/album/LandscapePhoto';
import { useContainerWidth } from '../hooks/useContainerWidth';
import { usePhotoDimensions } from '../hooks/usePhotoDimensions';

interface AlbumPageProps {
  photos: Photo[];
  selectedAlbum: Album | null;
  onBackClick: () => void;
}

// Container for the album page layout
const AlbumContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 96px;
  padding: 24px 0;
  max-width: 100%;
  overflow-x: hidden; /* Prevent horizontal scrolling */
`;

// Row to place title and subtitle inline
const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

// Title text adjusted for inline layout
const TitleText = styled(AlbumTitle)`
  margin: 0;
`;


// Date span text shown under the subtitle
const AlbumDateSpan = styled.div`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.85;
  text-align: center;

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1.3rem;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    font-size: 1.4rem;
  }
`;


/**
 * AlbumPage component that displays photos in a full-screen scrollable layout.
 * 
 * Each photo is displayed as large as possible while fitting on the screen,
 * with caption and location information displayed underneath for landscape photos
 * or to the side for portrait photos. Portrait photos alternate between having
 * information on the right and left sides.
 * 
 * The component also includes a header with the album title and a back button
 * to return to the homepage.
 * 
 * This component uses custom hooks for container width measurement and photo dimension
 * calculations, and delegates rendering to smaller, focused components.
 */
const AlbumPage: React.FC<AlbumPageProps> = React.memo(({ 
  photos, 
  selectedAlbum,
  onBackClick
}) => {
  // Use custom hook for container width measurement
  const { containerRef, containerWidth } = useContainerWidth();
  
  // Use custom hook for photo dimension calculations
  const { calculateDimensions } = usePhotoDimensions(containerWidth);

  // Render the album photos
  const renderAlbumPhotos = () => {
    // Counter to track side-by-side photos for alternating layout
    let sideBySideIndex = 0;

    return photos.map((photo) => {
      const GAP_BETWEEN = 32; // matches PortraitPhotoContainer gap
      const INFO_WIDTH = 240; // matches PortraitPhotoInfo width
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;

      // Always stack on narrow screens
      if (vw < 768) {
        const below = calculateDimensions(photo.width, photo.height, { layout: 'below', gap: GAP_BETWEEN, infoWidth: INFO_WIDTH });
        return (
          <LandscapePhoto
            key={photo.id}
            photo={photo}
            width={below.width}
            height={below.height}
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
          <PortraitPhoto
            key={photo.id}
            photo={photo}
            width={side.width}
            height={side.height}
            isEven={isEven}
          />
        );
      }

      return (
        <LandscapePhoto
          key={photo.id}
          photo={photo}
          width={below.width}
          height={below.height}
        />
      );
    });
  };
  
  const combinedLine = [selectedAlbum?.country, selectedAlbum?.dateDescription]
    .map(s => (typeof s === 'string' ? s.trim() : ''))
    .filter(s => s.length > 0)
    .join(', ');
  
  return (
    <PhotoProvider>
      <AlbumContainer ref={containerRef}>
        <HomeIcon onClick={onBackClick} />
        <AlbumHeader>
          <TitleRow>
            <TitleText>{selectedAlbum?.title || 'Album'}</TitleText>
          </TitleRow>
          {combinedLine.length > 0 && (
            <AlbumDateSpan>{combinedLine}</AlbumDateSpan>
          )}
        </AlbumHeader>
        {renderAlbumPhotos()}
      </AlbumContainer>
    </PhotoProvider>
  );
});

// Add display name for debugging
AlbumPage.displayName = 'AlbumPage';

export default AlbumPage;