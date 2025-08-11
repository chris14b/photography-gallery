import React from 'react';
import styled from 'styled-components';
import type { AlbumCover } from '../types';
import { 
  GalleryContainer, 
  Header, 
  GalleryTitle 
} from '../styles/components/HomeStyles';
import AlbumCard from '../components/features/gallery/AlbumCard';
import { useContainerWidth } from '../hooks/useContainerWidth';

interface HomePageProps {
  albumCovers: AlbumCover[];
  galleryTitle: string;
  onSelectAlbum: (albumId: string) => void;
}

// Grid container for album cards with responsive columns
const AlbumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 16px;
  width: 100%;
  
  /* Responsive adjustments */
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 12px;
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.sm}) and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
    gap: 16px;
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.xl}) {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
`;

/**
 * HomePage component that displays photos in a responsive grid layout.
 * 
 * Photos are displayed in a CSS Grid layout with the gallery title at the top.
 * Each photo represents an album and has an overlay with the album name.
 * 
 * This component uses CSS Grid for responsive layout without complex calculations.
 */
const HomePage: React.FC<HomePageProps> = React.memo(({ 
  albumCovers, 
  galleryTitle,
  onSelectAlbum
}) => {
  // Use custom hook for container width measurement (for potential future use)
  const { containerRef } = useContainerWidth();
  
  return (
    <GalleryContainer ref={containerRef}>
      <Header>
        <GalleryTitle>{galleryTitle}</GalleryTitle>
      </Header>
      <AlbumGrid>
        {albumCovers.map(ac => (
          <AlbumCard
            key={ac.album.id}
            album={ac.album}
            coverPhoto={ac.coverPhoto}
            onSelectAlbum={onSelectAlbum}
          />
        ))}
      </AlbumGrid>
    </GalleryContainer>
  );
});

// Add display name for debugging
HomePage.displayName = 'HomePage';

export default HomePage;