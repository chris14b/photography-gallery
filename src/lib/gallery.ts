import type { ImageMetadata } from "astro";
import { getCollection } from "astro:content";
import {
  type Album,
  type Collection,
  buildAlbum,
  buildCollection,
  indexImages,
  unlistedImages,
} from "./rules";

export { type Album, type Collection, type Photo } from "./rules";

// import.meta.glob needs literal paths, so these repeat the folders in folders.ts.
const imageModules = {
  ...import.meta.glob<ImageMetadata>(
    "/albums/*/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}",
    { eager: true, import: "default" },
  ),
  ...import.meta.glob<ImageMetadata>(
    "/collections/*/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}",
    { eager: true, import: "default" },
  ),
};

let gallery:
  Promise<{ albums: Album[]; collections: Collection[] }> | undefined;

/** Every album, newest first, and every collection, including unlisted and empty ones. */
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
