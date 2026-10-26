/**
 * Turns album.json and collection.json into albums and collections, and checks them. These are plain functions, apart from
 * astro:content and the image imports in gallery.ts, so tests can call them directly.
 */

import type { ImageMetadata } from "astro";
import type { CollectionEntry } from "astro:content";
import { AUTHOR, SEPARATOR } from "../site";
import { formatDates } from "./dates";

export interface Photo {
  /** The file name with its extension, such as "R0001234.jpg". */
  file: string;
  image: ImageMetadata;
  caption?: string;
  location?: string;
  /** The caption and location, for the image's alt text. */
  alt: string;
}

export interface Album {
  /** The folder name, which is also the URL. */
  id: string;
  title: string;
  subtitle: string;
  /** A sentence for search results and link previews. */
  description: string;
  unlisted: boolean;
  photos: Photo[];
  cover: Photo;
}

export interface Collection {
  /** The folder name, which is also the URL. */
  id: string;
  title: string;
  description?: string;
  unlisted: boolean;
  photos: Photo[];
}

export type AlbumData = CollectionEntry<"albums">["data"];
export type CollectionData = CollectionEntry<"collections">["data"];

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

function photoText(caption: string | undefined, location: string | undefined) {
  const text = {
    caption: caption?.trim() || undefined,
    location: location?.trim() || undefined,
  };
  return {
    ...text,
    alt: [text.caption, text.location].filter(Boolean).join(", "),
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

/** The photo named by cover, else the first landscape photo, else the first photo. */
export function pickCover(photos: Photo[], cover: string | undefined): Photo {
  return (
    photos.find((photo) => photo.file === cover?.trim()) ??
    photos.find((photo) => photo.image.width > photo.image.height) ??
    photos[0]
  );
}

/** The album in albums/{id}/album.json, or undefined while it has no photos. */
export function buildAlbum(
  id: string,
  data: AlbumData,
  images: Images,
): Album | undefined {
  if (data.end < data.start)
    throw new Error(`Album "${id}" ends before it starts`);
  checkUnique(
    data.photos.map((photo) => photo.file),
    `Album "${id}"`,
  );

  const photos = data.photos.map((photo): Photo => {
    const found = images.get(photo.file);
    if (found?.folder !== `albums/${id}`) {
      throw new Error(
        `Album "${id}" lists "${photo.file}", but there's no image with that name in its folder`,
      );
    }
    return {
      file: photo.file,
      image: found.image,
      ...photoText(photo.caption, photo.location),
    };
  });
  if (photos.length === 0) return undefined;

  const details = [data.description?.trim(), data.country?.trim()];
  const dates = formatDates(data.start, data.end);
  return {
    id,
    title: data.title,
    subtitle: [...details, dates].filter(Boolean).join(SEPARATOR),
    description: `Photos by ${AUTHOR} from ${[data.title, ...details, dates].filter(Boolean).join(", ")}.`,
    unlisted: data.unlisted === true,
    photos,
    cover: pickCover(photos, data.cover),
  };
}

/** The collection in collections/{id}/collection.json. Its URL mustn't be one of albumIds. */
export function buildCollection(
  id: string,
  data: CollectionData,
  images: Images,
  albumIds: Set<string>,
): Collection {
  if (albumIds.has(id))
    throw new Error(
      `Collection "${id}" has the same URL as an album; rename one of their folders`,
    );
  checkUnique(
    data.photos.map((photo) => photo.file),
    `Collection "${id}"`,
  );

  // The image can be in the collection's folder or any album's, but the text is always the collection's own.
  const photos = data.photos.map(({ file, caption, location }): Photo => {
    const found = images.get(file);
    if (
      !found ||
      (found.folder !== `collections/${id}` &&
        !found.folder.startsWith("albums/"))
    ) {
      throw new Error(
        `Collection "${id}" lists "${file}", which isn't in its folder or any album`,
      );
    }
    return { file, image: found.image, ...photoText(caption, location) };
  });

  return {
    id,
    title: data.title,
    description: data.description,
    unlisted: data.unlisted === true,
    photos,
  };
}

/** Images that no album.json or collection.json lists, such as "albums/laos-2023/R0001234.jpg", which the site leaves out. */
export function unlistedImages(
  images: Images,
  albums: { id: string; data: AlbumData }[],
  collections: { id: string; data: CollectionData }[],
): string[] {
  const listed = new Set([
    ...albums.flatMap(({ id, data }) =>
      data.photos.map((photo) => `albums/${id}/${photo.file}`),
    ),
    ...collections.flatMap(({ id, data }) =>
      data.photos.map((photo) => `collections/${id}/${photo.file}`),
    ),
  ]);
  return [...images]
    .map(([file, { folder }]) => `${folder}/${file}`)
    .filter((path) => !listed.has(path));
}
