import React from 'react';
import type { Photo } from '../types';
import { PageHeader as Header, PageTitle as GalleryTitle, PageSubtitle as GallerySubtitle } from '../styles/components/PageHeaderStyles';
import HomeIcon from '../components/common/HomeIcon';
import PhotoStream from '../components/features/album/PhotoStream';

interface AlbumPageProps {
  title: string;
  subtitle?: string;
  photos: Photo[];
  siteTitle: string;
  onBackClick: () => void;
}

const AlbumPage: React.FC<AlbumPageProps> = React.memo(({
  title,
  subtitle,
  photos,
  siteTitle,
  onBackClick
}) => (
  <PhotoStream photos={photos}>
    <title>{`${title} · ${siteTitle}`}</title>
    <HomeIcon onClick={onBackClick} />
    <Header>
      <GalleryTitle>{title}</GalleryTitle>
      {subtitle && <GallerySubtitle>{subtitle}</GallerySubtitle>}
    </Header>
  </PhotoStream>
));

AlbumPage.displayName = 'AlbumPage';

export default AlbumPage;
