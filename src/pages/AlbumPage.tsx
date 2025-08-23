import React from 'react';
import styled from 'styled-components';
import type { Photo, Album } from '../types';
import { PhotoProvider } from 'react-photo-view';
import { PageHeader as Header, PageTitle as GalleryTitle, PageSubtitle as GallerySubtitle } from '../styles/components/PageHeaderStyles';
import HomeIcon from '../components/common/HomeIcon';
import PhotoWithInfo from '../components/features/album/PhotoWithInfo';
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
  gap: 0; /* Separate header spacing from photo list spacing */
  padding: 24px 0;
  max-width: 100%;
  overflow-x: hidden; /* Prevent horizontal scrolling */
`;

// Dedicated list container for photos with its own vertical spacing
const PhotosList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 96px; /* Inter-photo spacing (increased) */
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
  
  const combinedLine = [selectedAlbum?.country, selectedAlbum?.dateDescription]
    .map(s => (typeof s === 'string' ? s.trim() : ''))
    .filter(s => s.length > 0)
    .join(', ');
  
  return (
    <PhotoProvider>
      <AlbumContainer ref={containerRef}>
        <HomeIcon onClick={onBackClick} />
        <Header>
          <GalleryTitle>{selectedAlbum?.title || 'Album'}</GalleryTitle>
          {combinedLine.length > 0 && (
            <GallerySubtitle>{combinedLine}</GallerySubtitle>
          )}
        </Header>
        <PhotosList>
          {renderAlbumPhotos()}
        </PhotosList>
      </AlbumContainer>
    </PhotoProvider>
  );
});

// Add display name for debugging
AlbumPage.displayName = 'AlbumPage';

export default AlbumPage;