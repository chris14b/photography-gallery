import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { ALBUMS, COLLECTIONS } from "./lib/folders";

// The folder name is the ID, and the URL.
const idFromFolder = ({ entry }: { entry: string }) => entry.split("/")[0];

/** Lets editors find the JSON schema Astro generates in .astro/collections, which a strict object would otherwise reject. */
const $schema = z.string().optional();
const date = z.iso.date();
const title = z.string().trim().min(1);
/** Optional text, trimmed. Empty or whitespace-only text becomes undefined, the same as leaving the field out. */
const text = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional();
const file = z
  .string()
  .min(1)
  .describe(
    "The photo's file name with its extension, such as R0001234.jpg. File names are unique across albums and collections.",
  );
const caption = text.describe(
  "Leave it out for no caption. An empty caption, which npm run sync adds for new photos, means it's still to write; npm run check lists those. Neither shows a caption.",
);
const location = text.describe(
  'A single string, such as "Site, City". Leave empty for no location.',
);

/** A photo in an album or collection. In a collection, the text always comes from collection.json, never from the album. */
const photo = z.strictObject({ file, caption, location });

/** One album per folder in albums/, with its photos alongside album.json. */
const albums = defineCollection({
  loader: glob({
    pattern: `*/${ALBUMS.jsonFile}`,
    base: ALBUMS.dir,
    generateId: idFromFolder,
  }),
  schema: z.strictObject({
    $schema,
    title,
    description: text.describe(
      "Shown under the title, such as the places an album covers.",
    ),
    country: text.describe(
      "Shown under the title. Set it only when the title doesn't already name the country.",
    ),
    start: date.describe(
      "The first day of the trip, as YYYY-MM-DD. Albums are sorted by it, newest first.",
    ),
    end: date
      .optional()
      .describe(
        "The last day of the trip, as YYYY-MM-DD. Leave it out while the album is still going, such as the current stay at home.",
      ),
    cover: text.describe(
      "The file name of the home page cover photo, with its extension. It must be one of the album's photos. Defaults to the first photo.",
    ),
    unlisted: z
      .boolean()
      .optional()
      .describe(
        "Leaves the album off the home page and out of the sitemap. Its URL still works.",
      ),
    photos: z
      .array(photo)
      .describe("In the order shown. npm run sync adds new photos to the end."),
  }),
});

/** Hand-picked photos, from its own folder in collections/ and from any album; the folder name is the URL. */
const handPicked = defineCollection({
  loader: glob({
    pattern: `*/${COLLECTIONS.jsonFile}`,
    base: COLLECTIONS.dir,
    generateId: idFromFolder,
  }),
  schema: z.strictObject({
    $schema,
    title,
    description: text.describe("Shown under the title."),
    cover: text.describe(
      "The file name of the home page cover photo, with its extension. It must be one of the collection's photos. Defaults to the first photo.",
    ),
    unlisted: z
      .boolean()
      .optional()
      .describe(
        "Leaves the collection off the home page and out of the sitemap. Its URL still works.",
      ),
    photos: z
      .array(photo)
      .describe(
        "In the order shown. A photo can be from this folder or any album, but its text comes only from here, not from the album.",
      ),
  }),
});

export const collections = { albums, collections: handPicked };
