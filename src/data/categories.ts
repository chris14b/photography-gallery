import type { Category, Photo } from '../types';

/** A reference to an album photo as "{albumId}/{fileName}", optionally with category-specific text. */
type CategoryPhotoEntry = string | { photo: string; caption?: string; location?: string };

interface CategoryFile {
  name: string;
  description?: string;
  /** Unlisted categories are only reachable by their URL. */
  unlisted?: boolean;
  photos: CategoryPhotoEntry[];
}

const categoryFiles = import.meta.glob<CategoryFile>('./categories/*.json', { eager: true, import: 'default' });

function resolvePhoto(entry: CategoryPhotoEntry, photosByRef: Map<string, Photo>): Photo | undefined {
  if (typeof entry === 'string') return photosByRef.get(entry);
  const photo = photosByRef.get(entry.photo);
  return photo && {
    ...photo,
    caption: entry.caption ?? photo.caption,
    location: entry.location ?? photo.location,
  };
}

export function buildCategories(photos: Photo[]): Category[] {
  const photosByRef = new Map(photos.map(photo => [`${photo.albumId}/${photo.fileName}`, photo]));

  return Object.entries(categoryFiles)
    .map(([path, file]) => ({
      slug: path.replace(/^.*\/(.+)\.json$/, '$1'),
      title: file.name,
      description: file.description,
      unlisted: file.unlisted === true,
      photos: file.photos
        .map(entry => resolvePhoto(entry, photosByRef))
        .filter((photo): photo is Photo => photo !== undefined),
    }))
    .filter(category => category.photos.length > 0);
}
