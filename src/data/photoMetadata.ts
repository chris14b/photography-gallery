/**
 * This file contains metadata for photos in the gallery.
 * 
 * The metadata is organized by album ID and then by photo filename (without extension).
 * For example, if you have a photo at src/assets/images/Thailand (2023)/beach.jpg,
 * the metadata would be under the "thailand-2023" album ID and with the key "beach".
 * 
 * Each photo can have the following metadata:
 * - caption: A description or caption for the photo
 * - location: A mandatory human-readable location string (e.g., "Eiffel Tower, Paris").
 * 
 * IMPORTANT: Instead of editing this file directly, create or edit JSON files in the
 * src/data/metadata directory. Each file should be named after the album ID (e.g., "thailand-2023.json")
 * and contain metadata for photos in that album.
 */

export interface PhotoMetadata {
  fileName: string;
  caption?: string;
  location: string; // mandatory string
  dimensions: {
    width: number;
    height: number;
  };
}

export interface AlbumInfo {
  title: string;
  country?: string;
  dateDescription: string;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;   // ISO date string (YYYY-MM-DD)
}

// Use Vite's import.meta.glob to dynamically import all JSON files from the metadata directory
const metadataFiles = import.meta.glob('./metadata/*.json', { eager: true });

/**
 * Metadata for all photos, organized by album ID with a photos array.
 * Each album metadata file contains top-level album info and a photos array.
 */
export interface AlbumMetadataFileNew {
  slug?: string; // slug based on folder name; optional for backward compatibility
  name: string; // mandatory
  country?: string; // optional
  dateDescription: string; // mandatory human-friendly description derived from dates or provided
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;   // ISO date string (YYYY-MM-DD)
  /** Optional album cover fileName (without extension). If omitted, UI will choose a fallback. */
  cover?: string;
  photos: PhotoMetadata[];
}
export const photoMetadata: Record<string, AlbumMetadataFileNew> = {};

// Process each metadata file and add it to the photoMetadata object
Object.entries(metadataFiles).forEach(([path, module]) => {
  // Extract the album ID from the file path
  // Example: './metadata/thailand-2023.json' -> 'thailand-2023'
  const match = path.match(/\.\/metadata\/(.+)\.json$/);
  if (match && match[1]) {
    const albumId = match[1];
    // Add the album's metadata to the photoMetadata object
    const mod = module as { default?: unknown };
    photoMetadata[albumId] = (mod.default ?? module) as AlbumMetadataFileNew;
  }
});

// Build slug maps for routing support
const slugToAlbumIdMap: Map<string, string> = new Map();
const albumIdToSlugMap: Map<string, string> = new Map();
Object.entries(photoMetadata).forEach(([albumId, meta]) => {
  const slug = (typeof meta?.slug === 'string' && meta.slug.trim() !== '') ? meta.slug.trim() : albumId;
  slugToAlbumIdMap.set(slug, albumId);
  albumIdToSlugMap.set(albumId, slug);
});

/**
 * Resolve albumId by slug (slug from URL). Returns undefined if not found.
 */
export function findAlbumIdBySlug(slug: string): string | undefined {
  return slugToAlbumIdMap.get(slug);
}

/**
 * Get the primary slug to use in URLs for a given albumId.
 */
export function getSlugForAlbumId(albumId: string): string {
  return albumIdToSlugMap.get(albumId) ?? albumId;
}

/**
 * Helper function to get metadata for a specific photo by filename
 * @param albumId The ID of the album
 * @param filename The filename without extension
 * @returns The metadata for the photo, or undefined if not found
 */
export function getPhotoMetadata(albumId: string, filename: string): PhotoMetadata | undefined {
  const albumMeta = photoMetadata[albumId];
  if (!albumMeta) {
    return undefined;
  }
  return albumMeta.photos?.find(p => p.fileName === filename);
}

/**
 * Get album-level metadata (title, subtitle, startDate, endDate) from the album metadata file.
 */
export function getAlbumInfo(albumId: string): AlbumInfo {
  const albumMeta = photoMetadata[albumId] as AlbumMetadataFileNew | undefined;
  return {
    title: albumMeta?.name ?? '',
    country: albumMeta?.country,
    dateDescription: albumMeta?.dateDescription ?? '',
    startDate: albumMeta?.startDate ?? '',
    endDate: albumMeta?.endDate ?? '',
  } as AlbumInfo;
}