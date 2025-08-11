import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { theme } from './styles/theme';
import GlobalStyles from './styles/globalStyles';
import HomePage from './pages/HomePage';
import AlbumPage from './pages/AlbumPage';
import ErrorBoundary from './components/common/ErrorBoundary';
import FullscreenButton from './components/common/FullscreenButton';
import { albums as initialAlbums, photos as initialPhotos, loadGalleryData } from './data/photos';
import type { Album, Photo, AlbumCover } from './types';
import 'react-photo-view/dist/react-photo-view.css';

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
      const landscapePhoto = albumPhotos.find(p => p.width > p.height);
      const selectedPhoto = landscapePhoto || albumPhotos[0];
      result.push({ album, coverPhoto: selectedPhoto });
    }
  });

  return result;
};

const App: React.FC = () => {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [albums, setAlbums] = useState<Album[]>(initialAlbums);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  
  // Load gallery data when component mounts
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
  
  const albumCoverCards = useMemo(() => {
    if (!selectedAlbumId) {
      return getAlbumCoverCards(photos, albums);
    }
    return [] as AlbumCover[];
  }, [selectedAlbumId, photos, albums]);

  const filteredPhotos = useMemo(() => {
    if (selectedAlbumId) {
      return photos.filter(photo => photo.albumId === selectedAlbumId);
    }
    return [] as Photo[];
  }, [selectedAlbumId, photos]);

  const handleSelectAlbum = (albumId: string) => {
    setSelectedAlbumId(albumId || null);
  };

  // Find the selected album object if an album is selected
  const selectedAlbum = selectedAlbumId 
    ? albums.find(album => album.id === selectedAlbumId) || null
    : null;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles theme={theme} />
      <AppContainer>
        {/* Fullscreen button that stays fixed at the top right corner */}
        <FullscreenButton />
        <MainContent>
          {loading ? (
            <LoadingContainer>
              <Spinner />
              <p>Loading images...</p>
            </LoadingContainer>
          ) : (
            <ErrorBoundary>
              {!selectedAlbumId ? (
                <HomePage
                  albumCovers={albumCoverCards}
                  galleryTitle="Chris Johnston's Photography Gallery"
                  onSelectAlbum={handleSelectAlbum}
                />
              ) : (
                <AlbumPage
                  photos={filteredPhotos}
                  selectedAlbum={selectedAlbum}
                  onBackClick={() => setSelectedAlbumId(null)}
                />
              )}
            </ErrorBoundary>
          )}
        </MainContent>
      </AppContainer>
    </ThemeProvider>
  );
};

export default App;
