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
  gap: 36px; /* Reduced gap between photos */
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
    // Counter to track portrait photos for alternating layout
    let portraitPhotoIndex = 0;
    
    return photos.map((photo) => {
      // Calculate dimensions while maintaining aspect ratio
      const aspectRatio = photo.width / photo.height;
      const isPortrait = aspectRatio < 1;
      
      // Calculate dimensions based on aspect ratio
      const { width, height } = calculateDimensions(photo.width, photo.height);
      
      // For portrait photos, use row layout with info to the side
      if (isPortrait) {
        // Determine if this is an even-indexed portrait photo
        const isEven = portraitPhotoIndex % 2 === 0;
        
        // Increment the portrait photo counter for the next portrait photo
        portraitPhotoIndex++;
        
        return (
          <PortraitPhoto
            key={photo.id}
            photo={photo}
            width={width}
            height={height}
            isEven={isEven}
          />
        );
      }
      
      // For landscape photos, use the original column layout
      return (
        <LandscapePhoto
          key={photo.id}
          photo={photo}
          width={width}
          height={height}
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