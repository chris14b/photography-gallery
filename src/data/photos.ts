import type {Photo, Album} from '../types';
import { loadImagesFromFolders } from '../utils/imageLoader';

// Initial empty arrays for albums and photos
export let albums: Album[] = [];
export let photos: Photo[] = [];

// Function to load albums and photos
export async function loadGalleryData(): Promise<{ albums: Album[], photos: Photo[] }> {
  try {
    // Load albums and photos from the assets/images directory
    const { albums: folderAlbums, photos: folderPhotos } = await loadImagesFromFolders();
    
    // Update the exported variables
    albums = folderAlbums;
    photos = folderPhotos;
    
    return { albums, photos };
  } catch (error) {
    console.error('Error loading gallery data:', error);
    return { albums: [], photos: [] };
  }
}