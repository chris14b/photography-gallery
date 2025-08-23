import React, { useCallback } from 'react';
import styled from 'styled-components';
import type {Album, Photo} from '../../../types';
import LazyImage from '../../common/LazyImage';

interface AlbumCardProps {
  album: Album;
  coverPhoto: Photo;
  onSelectAlbum: (albumId: string) => void;
}

const Card = styled.div`
  background-color: transparent;
  border-radius: 0;
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  cursor: pointer;
  will-change: transform; /* Hint to browser to optimize for animation */
  
  /* Add containment for better performance */
  contain: layout style paint;
  content-visibility: auto; /* Optimize rendering of off-screen content */
  contain-intrinsic-size: 0 240px; /* Provide size hint for off-screen content */
  
  /* Respect user's reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    will-change: auto;
    
    &:hover {
      transform: none;
    }
    
    &::after {
      transition: none;
    }
  }
  
  @media (prefers-reduced-motion: no-preference) {
    &:hover {
      transform: translateY(-5px);
    }
    
    &:hover::after {
      opacity: 1;
    }
  }
  
  /* Use pseudo-element for shadow to avoid animating box-shadow directly */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    z-index: -1;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 3 / 2; /* Maintain 3:2 aspect ratio for the image area */
  background-color: ${({ theme }) => theme.colors.primary};

  @media (prefers-reduced-motion: no-preference) {
    ${Card}:hover & {
      transform: scale(1.05);
    }
  }
`;

const Caption = styled.div`
  padding: 10px 12px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

const AlbumName = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const AlbumSubtitle = styled.div`
  margin-top: 4px;
  font-size: 0.95rem;
  opacity: 0.85;
`;



/**
 * AlbumCard component that displays an album cover with lazy loading
 * 
 * This component combines the functionality of AlbumPhotoItem and PhotoCard
 * into a single, simplified component that uses CSS for responsive sizing.
 */
const AlbumCard: React.FC<AlbumCardProps> = ({ album, coverPhoto, onSelectAlbum }) => {
  const handleAlbumClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const albumId = album?.id;
    if (albumId) {
      onSelectAlbum(albumId);
    }
  }, [album?.id, onSelectAlbum]);

  const combinedSubtitleLine = [album.country, album.dateDescription]
    .map(s => (typeof s === 'string' ? s.trim() : ''))
    .filter(s => s.length > 0)
    .join(' • ');

  return (
    <Card onClick={handleAlbumClick}>
      <ImageContainer>
        <LazyImage
          src={coverPhoto.src}
          alt={coverPhoto.alt || album.title || 'Album cover'}
          loading="lazy"
          layout="below"
          fillContainer
          fit="cover"
          imgClassName="album-img"
        />
      </ImageContainer>
      {(album.title || (combinedSubtitleLine.length > 0)) && (
        <Caption>
          {album.title && <AlbumName>{album.title}</AlbumName>}
          {combinedSubtitleLine.length > 0 && <AlbumSubtitle>{combinedSubtitleLine}</AlbumSubtitle>}
        </Caption>
      )}
    </Card>
  );
};

export default AlbumCard;