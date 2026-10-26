import React from 'react';
import type { Photo, Album } from '../types';
import { PageHeader as Header, PageTitle as GalleryTitle, PageSubtitle as GallerySubtitle } from '../styles/components/PageHeaderStyles';
import HomeIcon from '../components/common/HomeIcon';
import PhotoStream from '../components/features/album/PhotoStream';

interface AlbumPageProps {
  photos: Photo[];
  selectedAlbum: Album;
  siteTitle: string;
  onBackClick: () => void;
}

const AlbumPage: React.FC<AlbumPageProps> = React.memo(({
  photos,
  selectedAlbum,
  siteTitle,
  onBackClick
}) => {
  const combinedLine = [selectedAlbum.country, selectedAlbum.dateDescription]
    .map(s => (typeof s === 'string' ? s.trim() : ''))
    .filter(s => s.length > 0)
    .join(', ');

  return (
    <PhotoStream photos={photos}>
      <title>{`${selectedAlbum.title} · ${siteTitle}`}</title>
      <HomeIcon onClick={onBackClick} />
      <Header>
        <GalleryTitle>{selectedAlbum.title}</GalleryTitle>
        {combinedLine.length > 0 && (
          <GallerySubtitle>{combinedLine}</GallerySubtitle>
        )}
      </Header>
    </PhotoStream>
  );
});

AlbumPage.displayName = 'AlbumPage';

export default AlbumPage;
