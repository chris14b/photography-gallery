import type { ImageMetadata } from "astro";
import { getCollection } from "astro:content";
import {
  type PhotoSet,
  buildAlbum,
  buildCollection,
  indexImages,
  unlistedImages,
} from "./rules";

export { type Photo, type PhotoSet, isListed } from "./rules";

// import.meta.glob needs literal paths, so these repeat the folders and PHOTO_EXTENSION in folders.ts.
const imageModules = import.meta.glob<ImageMetadata>(
  ["/albums/*/*.jpg", "/collections/*/*.jpg"],
  { eager: true, import: "default" },
);

let gallery:
  Promise<{ albums: PhotoSet[]; collections: PhotoSet[] }> | undefined;

/** Every album, newest first, and every collection, including unlisted ones. */
export function loadGallery() {
  gallery ??= (async () => {
    const images = indexImages(imageModules);
    const albumEntries = (await getCollection("albums")).sort((a, b) =>
      b.data.start.localeCompare(a.data.start),
    );
    const collectionEntries = await getCollection("collections");

    for (const path of unlistedImages(
      images,
      albumEntries,
      collectionEntries,
    )) {
      console.warn(
        `Skipping ${path}, which isn't in its JSON file; run npm run sync`,
      );
    }
    const albums = albumEntries.flatMap(
      ({ id, data }) => buildAlbum(id, data, images) ?? [],
    );
    const albumIds = new Set(albums.map((album) => album.id));
    return {
      albums,
      collections: collectionEntries.map(({ id, data }) =>
        buildCollection(id, data, images, albumIds),
      ),
    };
  })();
  return gallery;
}
