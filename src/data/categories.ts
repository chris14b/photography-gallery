import type { Category, Photo } from '../types';

interface CategoryFile {
  name: string;
  description?: string;
  /** Ordered references to album photos, as "{albumId}/{fileName}". */
  photos: string[];
}

const categoryFiles = import.meta.glob<CategoryFile>('./categories/*.json', { eager: true, import: 'default' });

export function buildCategories(photos: Photo[]): Category[] {
  const photosByRef = new Map(photos.map(photo => [`${photo.albumId}/${photo.fileName}`, photo]));

  return Object.entries(categoryFiles)
    .map(([path, file]) => ({
      slug: path.replace(/^.*\/(.+)\.json$/, '$1'),
      title: file.name,
      description: file.description,
      photos: file.photos
        .map(ref => photosByRef.get(ref))
        .filter((photo): photo is Photo => photo !== undefined),
    }))
    .filter(category => category.photos.length > 0);
}
