import type { Album, Photo } from '../types';
import { getPhotoMetadata, getAlbumInfo, photoMetadata } from '../data/photoMetadata';

/**
 * This utility module handles dynamically loading images from the src/assets/images directory.
 * It uses Vite's import.meta.glob feature to:
 * 1. Find all image files in the directory and its subfolders
 * 2. Group them by folder
 * 3. Create Album objects based on folder names
 * 4. Create Photo objects for each image
 * 5. Use dimensions from metadata when available to avoid computing them
 * 
 * The result is a collection of albums (based on folders) and photos that can be displayed in the gallery.
 */

// Use Vite's import.meta.glob to get all images
// This will find all jpg, jpeg, png, gif, and webp files in the images directory and its subfolders
const imageFiles = import.meta.glob('../assets/images/**/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}', { eager: true });

// Interface for the module returned by import.meta.glob
interface ImageModule {
  default: string;
}


/**
 * Extract folder name from a file path
 * @param filePath Path to the image file
 * @returns The folder name
 */
function extractFolderName(filePath: string): string {
  // Extract the folder name from the path
  // Example: '../assets/images/Thailand (2023)/image.jpg' -> 'Thailand (2023)'
  const match = filePath.match(/\/images\/([^/]+)\//);
  return match ? match[1] : 'Uncategorized';
}

/**
 * Generate a slug from a string (for use as ID)
 * @param str The string to convert to a slug
 * @returns A slug version of the string
 */
function generateSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with a single hyphen
}

/**
 * Extract filename without extension
 * @param filePath Path to the image file
 * @returns The filename without extension
 */
function extractFileName(filePath: string): string {
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];
  // Split by dot and take everything before the last dot (to handle filenames with multiple dots)
  const nameParts = fileName.split('.');
  return nameParts.slice(0, -1).join('.') || nameParts[0]; // Handle case with no extension
}

/**
 * Load all images from the assets/images directory and organize them by folder
 * @returns A promise that resolves to an object containing albums and photos
 */
export async function loadImagesFromFolders(): Promise<{ albums: Album[], photos: Photo[] }> {
  const folderMap: Record<string, string[]> = {};
  const albums: Album[] = [];
  const photos: Photo[] = [];
  
  try {
    // Group image paths by folder
    Object.keys(imageFiles).forEach(path => {
      try {
        const folderName = extractFolderName(path);
        if (!folderMap[folderName]) {
          folderMap[folderName] = [];
        }
        folderMap[folderName].push(path);
      } catch (error) {
        console.error(`Error processing image path: ${path}`, error);
      }
    });
    
    // Create albums from folders
    for (const folderName of Object.keys(folderMap)) {
      try {
        const albumId = generateSlug(folderName);
        const albumInfo = getAlbumInfo(albumId);
        const albumMeta = photoMetadata[albumId];

        // Sort this folder's images by metadata order if provided
        const orderIndex = new Map((albumMeta?.photos || []).map((p, i) => [p.fileName, i] as const));
        folderMap[folderName].sort((a, b) => {
          const fa = extractFileName(a);
          const fb = extractFileName(b);
          const ai = orderIndex.has(fa) ? (orderIndex.get(fa) as number) : Number.POSITIVE_INFINITY;
          const bi = orderIndex.has(fb) ? (orderIndex.get(fb) as number) : Number.POSITIVE_INFINITY;
          if (ai !== bi) return ai - bi;
          // Fallback to filename lexicographic order for items not in metadata
          return fa.localeCompare(fb);
        });

        // Compute coverPhotoId from metadata cover (fileName) if provided
        let coverPhotoId: string | undefined = undefined;
        const coverFileName = (typeof albumMeta?.cover === 'string') ? albumMeta.cover.trim() : '';
        if (coverFileName) {
          const coverIndex = folderMap[folderName].findIndex(p => extractFileName(p) === coverFileName);
          if (coverIndex >= 0) {
            coverPhotoId = `${albumId}-${coverIndex}`;
          }
        }

        albums.push({
          id: albumId,
          coverPhotoId,
          title: albumInfo.title,
          country: albumInfo?.country,
          dateDescription: albumInfo?.dateDescription,
          startDate: albumInfo.startDate,
          endDate: albumInfo.endDate
        });
        
        // Create photos for each image in the folder (now in sorted order)
        for (let index = 0; index < folderMap[folderName].length; index++) {
          const path = folderMap[folderName][index];
          try {
            const module = imageFiles[path] as ImageModule;
            const photoId = `${albumId}-${index}`;
            const fileName = extractFileName(path);
            const src = module.default;
            
            // Check if we have metadata with dimensions for this photo
            const metadata = getPhotoMetadata(albumId, fileName);
            const dimensionsFromMetadata = metadata?.dimensions;
            
            if (dimensionsFromMetadata) {
              // Use dimensions from metadata if available
              // Using dimensions from metadata improves performance by avoiding image loading
              
              photos.push({
                id: photoId,
                src: src,
                alt: fileName,
                width: dimensionsFromMetadata.width,
                height: dimensionsFromMetadata.height,
                title: fileName,
                caption: (typeof metadata?.caption === 'string' && metadata.caption.trim() !== '' && metadata.caption !== 'Add a caption for this photo') ? metadata.caption : undefined,
                location: metadata.location,
                albumId: albumId
              });
            } else {
              // If no dimensions in metadata, throw an error
              // This enforces that all photos must have dimensions in their metadata
              const errorMessage = `Missing dimensions in metadata for photo: ${fileName} in album: ${albumId}`;
              console.error(errorMessage);
              throw new Error(errorMessage);
            }
          } catch (error) {
            console.error(`Error creating photo from path: ${path}`, error);
          }
        }
      } catch (error) {
        console.error(`Error creating album for folder: ${folderName}`, error);
      }
    }
  } catch (error) {
    console.error('Error loading images from folders:', error);
  }
  
  // If no albums were found, provide a fallback message
  if (albums.length === 0) {
    console.warn('No image folders found in src/assets/images');
  }
  
  return { albums, photos };
}