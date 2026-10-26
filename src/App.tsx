import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
import { theme } from './styles/theme';
import GlobalStyles from './styles/globalStyles';
import HomePage from './pages/HomePage';
import AlbumPage from './pages/AlbumPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import FullscreenButton from './components/common/FullscreenButton';
import { albums as initialAlbums, photos as initialPhotos, loadGalleryData } from './data/photos';
import { buildCategories } from './data/categories';
import type { Album, Photo, AlbumCover, Category } from './types';
import 'react-photo-view/dist/react-photo-view.css';
import { findAlbumIdBySlug, getSlugForAlbumId } from './data/photoMetadata';

const SITE_TITLE = 'Chris Johnston Photography';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

const MainContent = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  color: ${({ theme }) => theme.colors.text};
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid ${({ theme }) => theme.colors.accent};
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

/**
 * Select one representative cover photo for each album and return AlbumCover view models
 */
const getAlbumCoverCards = (photos: Photo[], albums: Album[]): AlbumCover[] => {
  const result: AlbumCover[] = [];

  // Sort albums by date (prefer startDate, fallback to endDate), most recent first
  const sortedAlbums = [...albums].sort((a, b) => {
    const aDateStr = a.startDate || a.endDate || '';
    const bDateStr = b.startDate || b.endDate || '';

    if (!aDateStr && !bDateStr) return 0;
    if (!aDateStr) return 1; // a goes after b
    if (!bDateStr) return -1; // b goes after a

    const aTime = Date.parse(aDateStr);
    const bTime = Date.parse(bDateStr);

    if (isNaN(aTime) && isNaN(bTime)) return 0;
    if (isNaN(aTime)) return 1;
    if (isNaN(bTime)) return -1;

    return bTime - aTime; // descending
  });

  // For each album, select one photo
  sortedAlbums.forEach(album => {
    const albumPhotos = photos.filter(photo => photo.albumId === album.id);
    if (albumPhotos.length > 0) {
      const preferred = album.coverPhotoId ? albumPhotos.find(p => p.id === album.coverPhotoId) : undefined;
      const landscapePhoto = albumPhotos.find(p => p.width > p.height);
      const selectedPhoto = preferred || landscapePhoto || albumPhotos[0];
      result.push({ album, coverPhoto: selectedPhoto });
    }
  });

  return result;
};

interface SlugPageProps {
  albums: Album[];
  photos: Photo[];
  categories: Category[];
}

const SlugPage: React.FC<SlugPageProps> = ({ albums, photos, categories }) => {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const goHome = () => navigate('/');

  const category = categories.find(c => c.slug === slug);
  if (category) {
    return (
      <AlbumPage
        title={category.title}
        subtitle={category.description}
        photos={category.photos}
        siteTitle={SITE_TITLE}
        onBackClick={goHome}
      />
    );
  }

  const albumId = findAlbumIdBySlug(slug);
  const album = albums.find(a => a.id === albumId);
  if (album) {
    const subtitle = [album.country, album.dateDescription]
      .map(s => s?.trim())
      .filter(Boolean)
      .join(', ');
    return (
      <AlbumPage
        title={album.title}
        subtitle={subtitle}
        photos={photos.filter(photo => photo.albumId === album.id)}
        siteTitle={SITE_TITLE}
        onBackClick={goHome}
      />
    );
  }

  return <Navigate to="/" replace />;
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { albums: loadedAlbums, photos: loadedPhotos } = await loadGalleryData();
        setAlbums(loadedAlbums);
        setPhotos(loadedPhotos);
      } catch (error) {
        console.error('Error loading gallery data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  const albumCoverCards = useMemo(
    () => getAlbumCoverCards(photos, albums.filter(album => !album.unlisted)),
    [photos, albums],
  );

  const categories = useMemo(() => buildCategories(photos), [photos]);
  const listedCategories = useMemo(() => categories.filter(category => !category.unlisted), [categories]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles theme={theme} />
      <AppContainer>
        <FullscreenButton />
        <MainContent>
          {loading ? (
            <LoadingContainer>
              <Spinner />
              <p>Loading images...</p>
            </LoadingContainer>
          ) : (
            <ErrorBoundary>
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage
                      albumCovers={albumCoverCards}
                      categories={listedCategories}
                      galleryTitle={SITE_TITLE}
                      gallerySubtitle="Selected work • 2023–2026"
                      onSelectAlbum={albumId => navigate(`/${encodeURIComponent(getSlugForAlbumId(albumId))}`)}
                    />
                  }
                />
                <Route path="/:slug" element={<SlugPage albums={albums} photos={photos} categories={categories} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ErrorBoundary>
          )}
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
