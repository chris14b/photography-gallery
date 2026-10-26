/**
 * Where albums and collections live: one folder each, holding its photos and its JSON file. The scripts import this too,
 * so it mustn't import anything from astro:. The image globs in gallery.ts and the photo cache key in
 * .github/workflows/deploy.yml need literal paths, so they repeat these.
 */

export interface Kind {
  /** The folder of folders, such as "albums". Each folder's name is its URL. */
  dir: string;
  jsonFile: string;
  /** The JSON schema Astro generates from the content collection in content.config.ts, from the repository root. */
  schema: string;
}

export const ALBUMS: Kind = {
  dir: "albums",
  jsonFile: "album.json",
  schema: ".astro/collections/albums.schema.json",
};

export const COLLECTIONS: Kind = {
  dir: "collections",
  jsonFile: "collection.json",
  schema: ".astro/collections/collections.schema.json",
};

export const KINDS = [ALBUMS, COLLECTIONS];
