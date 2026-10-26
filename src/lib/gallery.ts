import type { ImageMetadata } from "astro";
import { getCollection } from "astro:content";
import { formatDates } from "./dates";

export const SITE_TITLE = "Chris Johnston Photography";
/** Joins the parts of a subtitle, such as an album's country and dates. */
export const SEPARATOR = " • ";

export interface Photo {
  fileName: string;
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

const imageModules = {
  ...import.meta.glob<ImageMetadata>(
    "/albums/*/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}",
    { eager: true, import: "default" },
  ),
  ...import.meta.glob<ImageMetadata>(
    "/portfolio/*/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}",
    { eager: true, import: "default" },
  ),
};

/** Every image by its file name without the extension, with the folder it's in, such as "albums/laos-2023". */
function loadImages() {
  const images = new Map<string, { folder: string; image: ImageMetadata }>();
  for (const [path, image] of Object.entries(imageModules)) {
    const [, folder, fileName] = path.match(/^\/(.+)\/([^/]+)\.[^.]+$/)!;
    const other = images.get(fileName);
    if (other)
      throw new Error(
        `Photo file names must be unique, but "${fileName}" is in both ${other.folder} and ${folder}`,
      );
    images.set(fileName, { folder, image });
  }
  return images;
}

type Images = ReturnType<typeof loadImages>;

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

function checkUnique(fileNames: string[], owner: string) {
  const seen = new Set<string>();
  for (const fileName of fileNames) {
    if (seen.has(fileName))
      throw new Error(`${owner} lists "${fileName}" more than once`);
    seen.add(fileName);
  }
}

async function loadAlbums(images: Images): Promise<Album[]> {
  const entries = (await getCollection("albums")).sort((a, b) =>
    b.data.start.localeCompare(a.data.start),
  );

  return entries.flatMap(({ id, data }) => {
    if (data.end < data.start)
      throw new Error(`Album "${id}" ends before it starts`);
    checkUnique(
      data.photos.map((photo) => photo.fileName),
      `Album "${id}"`,
    );

    const photos = data.photos.map((photo): Photo => {
      const found = images.get(photo.fileName);
      if (found?.folder !== `albums/${id}`) {
        throw new Error(
          `Album "${id}" lists "${photo.fileName}", but there's no image with that name in its folder`,
        );
      }
      return {
        fileName: photo.fileName,
        image: found.image,
        ...photoText(photo.caption, photo.location),
      };
    });
    if (photos.length === 0) return [];

    const cover =
      photos.find((photo) => photo.fileName === data.cover?.trim()) ??
      photos.find((photo) => photo.image.width > photo.image.height) ??
      photos[0];

    const details = [data.description?.trim(), data.country?.trim()];
    const dates = formatDates(data.start, data.end);
    return [
      {
        id,
        title: data.title,
        subtitle: [...details, dates].filter(Boolean).join(SEPARATOR),
        description: `Photos by Chris Johnston from ${[data.title, ...details, dates].filter(Boolean).join(", ")}.`,
        unlisted: data.unlisted === true,
        photos,
        cover,
      },
    ];
  });
}

async function loadCollections(
  albums: Album[],
  images: Images,
): Promise<Collection[]> {
  const albumIds = new Set(albums.map((album) => album.id));

  return (await getCollection("collections")).map(({ id, data }) => {
    if (albumIds.has(id))
      throw new Error(
        `Collection "${id}" has the same URL as an album; rename one of their folders`,
      );
    checkUnique(
      data.photos.map((photo) => photo.fileName),
      `Collection "${id}"`,
    );

    // The image can be in the collection's folder or any album's, but the text is always the collection's own.
    const photos = data.photos.map(({ fileName, caption, location }): Photo => {
      const found = images.get(fileName);
      if (
        !found ||
        (found.folder !== `portfolio/${id}` &&
          !found.folder.startsWith("albums/"))
      ) {
        throw new Error(
          `Collection "${id}" lists "${fileName}", which isn't in its folder or any album`,
        );
      }
      return { fileName, image: found.image, ...photoText(caption, location) };
    });

    return {
      id,
      title: data.title,
      description: data.description,
      unlisted: data.unlisted === true,
      photos,
    };
  });
}

/** Warns about images that no album.json or collection.json lists, which the site leaves out. */
async function warnAboutUnlistedImages(images: Images) {
  const listed = new Set([
    ...(await getCollection("albums")).flatMap(({ id, data }) =>
      data.photos.map((photo) => `albums/${id}/${photo.fileName}`),
    ),
    ...(await getCollection("collections")).flatMap(({ id, data }) =>
      data.photos.map((photo) => `portfolio/${id}/${photo.fileName}`),
    ),
  ]);
  for (const [fileName, { folder }] of images) {
    if (!listed.has(`${folder}/${fileName}`))
      console.warn(
        `Skipping ${folder}/${fileName}, which isn't in its JSON file; run npm run sync`,
      );
  }
}

let gallery:
  Promise<{ albums: Album[]; collections: Collection[] }> | undefined;

/** Every album, newest first, and every collection, including unlisted and empty ones. */
export function loadGallery() {
  gallery ??= (async () => {
    const images = loadImages();
    await warnAboutUnlistedImages(images);
    const albums = await loadAlbums(images);
    return { albums, collections: await loadCollections(albums, images) };
  })();
  return gallery;
}
