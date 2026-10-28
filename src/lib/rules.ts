/**
 * Turns album.json and collection.json into albums and collections, and checks them. These are plain functions, apart from
 * astro:content and the image imports in gallery.ts, so tests can call them directly.
 */

import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import { AUTHOR, SEPARATOR } from "../site";
import { formatDates } from "./dates";
import { ALBUMS, COLLECTIONS } from "./folders";

export interface Photo {
  /** The file name with its extension, such as "R0001234.jpg". */
  file: string;
  /** The file's path from the project folder, such as "albums/laos-2023/R0001234.jpg". */
  path: string;
  image: ImageMetadata;
  caption?: string;
  location?: string;
  /** The caption and location, for the image's alt text. */
  alt: string;
}

/** An album or a collection, with everything its page shows. A type rather than an interface, so it can be a page's props. */
export type PhotoSet = {
  /** The folder name, which is also the URL. */
  id: string;
  title: string;
  /** Shown under the title. */
  subtitle?: string;
  /** An album's country, when its title doesn't name it. */
  country?: string;
  /** A sentence for search results and link previews. */
  description: string;
  unlisted: boolean;
  photos: Photo[];
  /** The home page cover and link preview photo. */
  cover: Photo;
  /** An album's first and last days, as YYYY-MM-DD. Collections have none. */
  dates?: [start: string, end: string];
};

export type AlbumData = CollectionEntry<"albums">["data"];
export type CollectionData = CollectionEntry<"collections">["data"];
/** A photo as album.json or collection.json lists it. The schema has already trimmed its text and dropped empty text. */
type PhotoData = AlbumData["photos"][number];

/** Every image by its file name, such as "R0001234.jpg", with the folder it's in, such as "albums/laos-2023". */
export type Images = Map<string, { folder: string; image: ImageMetadata }>;

/** Indexes images by their paths, such as "/albums/laos-2023/R0001234.jpg". File names must be unique across folders. */
export function indexImages(modules: Record<string, ImageMetadata>): Images {
  const images: Images = new Map();
  for (const [path, image] of Object.entries(modules)) {
    const [, folder, file] = path.match(/^\/(.+)\/([^/]+)$/)!;
    const other = images.get(file);
    if (other)
      throw new Error(
        `Photo file names must be unique, but "${file}" is in both ${other.folder} and ${folder}`,
      );
    images.set(file, { folder, image });
  }
  return images;
}

function toPhoto(
  { file, caption, location }: PhotoData,
  { folder, image }: { folder: string; image: ImageMetadata },
): Photo {
  return {
    file,
    path: `${folder}/${file}`,
    image,
    caption,
    location,
    alt: [caption, location].filter(Boolean).join(", "),
  };
}

function checkUnique(files: string[], owner: string) {
  const seen = new Set<string>();
  for (const file of files) {
    if (seen.has(file))
      throw new Error(`${owner} lists "${file}" more than once`);
    seen.add(file);
  }
}

/** The photo named by cover, which must be one of owner's photos, such as `Album "laos-2023"`. */
function namedCover(owner: string, photos: Photo[], cover: string): Photo {
  const named = photos.find((photo) => photo.file === cover);
  if (!named)
    throw new Error(
      `${owner} has cover "${cover}", which isn't one of its photos`,
    );
  return named;
}

/** The photo named by cover, which must be one of the album's photos. Without a cover, the first landscape photo, else the first photo. */
export function pickCover(
  id: string,
  photos: Photo[],
  cover: string | undefined,
): Photo {
  if (cover === undefined)
    return (
      photos.find((photo) => photo.image.width > photo.image.height) ??
      photos[0]
    );
  return namedCover(`Album "${id}"`, photos, cover);
}

/** The album in albums/{id}/album.json, or undefined while it has no photos. */
export function buildAlbum(
  id: string,
  data: AlbumData,
  images: Images,
): PhotoSet | undefined {
  if (data.end < data.start)
    throw new Error(`Album "${id}" ends before it starts`);
  checkUnique(
    data.photos.map((photo) => photo.file),
    `Album "${id}"`,
  );

  const photos = data.photos.map((photo): Photo => {
    const found = images.get(photo.file);
    if (found?.folder !== `${ALBUMS.dir}/${id}`) {
      throw new Error(
        `Album "${id}" lists "${photo.file}", but there's no image with that name in its folder`,
      );
    }
    return toPhoto(photo, found);
  });
  if (photos.length === 0) return undefined;

  const details = [data.description, data.country];
  const dates = formatDates(data.start, data.end);
  return {
    id,
    title: data.title,
    subtitle: [...details, dates].filter(Boolean).join(SEPARATOR),
    country: data.country,
    description: `Photos by ${AUTHOR} from ${[data.title, ...details, dates].filter(Boolean).join(", ")}.`,
    unlisted: data.unlisted === true,
    photos,
    cover: pickCover(id, photos, data.cover),
    dates: [data.start, data.end],
  };
}

/** The collection in collections/{id}/collection.json, whose cover is the photo named by cover, else its first photo. Its URL mustn't be one of albumIds, and it must have photos. */
export function buildCollection(
  id: string,
  data: CollectionData,
  images: Images,
  albumIds: Set<string>,
): PhotoSet {
  if (albumIds.has(id))
    throw new Error(
      `Collection "${id}" has the same URL as an album; rename one of their folders`,
    );
  if (data.photos.length === 0)
    throw new Error(
      `Collection "${id}" has no photos; add some or delete its folder`,
    );
  checkUnique(
    data.photos.map((photo) => photo.file),
    `Collection "${id}"`,
  );

  // The image can be in the collection's folder or any album's, but the text is always the collection's own.
  const photos = data.photos.map((photo): Photo => {
    const found = images.get(photo.file);
    if (
      !found ||
      (found.folder !== `${COLLECTIONS.dir}/${id}` &&
        !found.folder.startsWith(`${ALBUMS.dir}/`))
    ) {
      throw new Error(
        `Collection "${id}" lists "${photo.file}", which isn't in its folder or any album`,
      );
    }
    return toPhoto(photo, found);
  });

  return {
    id,
    title: data.title,
    subtitle: data.description,
    description: data.description ?? `${data.title} photos by ${AUTHOR}.`,
    unlisted: data.unlisted === true,
    photos,
    cover:
      data.cover === undefined
        ? photos[0]
        : namedCover(`Collection "${id}"`, photos, data.cover),
  };
}

/** How many photos an album or collection has, such as "24 photos". */
export function countPhotos(photoSet: PhotoSet): string {
  const { length } = photoSet.photos;
  return `${length} ${length === 1 ? "photo" : "photos"}`;
}

/** Whether the home page and the sitemap list an album or collection, which they do unless it's unlisted. */
export function isListed(photoSet: PhotoSet): boolean {
  return !photoSet.unlisted;
}

/** Images that no album.json or collection.json lists, such as "albums/laos-2023/R0001234.jpg", which the site leaves out. */
export function unlistedImages(
  images: Images,
  albums: { id: string; data: AlbumData }[],
  collections: { id: string; data: CollectionData }[],
): string[] {
  const listed = new Set([
    ...albums.flatMap(({ id, data }) =>
      data.photos.map((photo) => `${ALBUMS.dir}/${id}/${photo.file}`),
    ),
    ...collections.flatMap(({ id, data }) =>
      data.photos.map((photo) => `${COLLECTIONS.dir}/${id}/${photo.file}`),
    ),
  ]);
  return [...images]
    .map(([file, { folder }]) => `${folder}/${file}`)
    .filter((path) => !listed.has(path));
}
