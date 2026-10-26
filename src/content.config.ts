import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// The folder name is the ID, and the URL.
const idFromFolder = ({ entry }: { entry: string }) => entry.split('/')[0]

/** Lets editors find the JSON schema Astro generates in .astro/collections, which a strict object would otherwise reject. */
const $schema = z.string().optional()
const date = z.iso.date()
const fileName = z.string().min(1).describe("The photo's file name without its extension. File names are unique across albums and the portfolio.")
const caption = z.string().optional().describe('Leave empty for no caption.')
const location = z.string().optional().describe('A single string, such as "Site, City". Leave empty for no location.')

/** A photo in an album or collection. In a collection, the text always comes from collection.json, never from the album. */
const photo = z.strictObject({ fileName, caption, location })

/** One album per folder in albums/, with its photos alongside album.json. */
const albums = defineCollection({
  loader: glob({ pattern: '*/album.json', base: './albums', generateId: idFromFolder }),
  schema: z.strictObject({
    $schema,
    title: z.string().min(1),
    description: z.string().optional().describe('Shown under the title, such as the places an album covers.'),
    country: z.string().optional().describe("Shown under the title. Set it only when the title doesn't already name the country."),
    start: date.describe('The first day of the trip, as YYYY-MM-DD. Albums are sorted by it, newest first.'),
    end: date.describe('The last day of the trip, as YYYY-MM-DD.'),
    cover: z.string().optional().describe('The fileName of the home page cover photo. Defaults to the first landscape photo.'),
    unlisted: z.boolean().optional().describe('Leaves the album off the home page and out of the sitemap. Its URL still works.'),
    photos: z.array(photo).describe('In the order shown. npm run sync adds new photos to the end.'),
  }),
})

/** Hand-picked photos, from its own folder in portfolio/ and from any album; the folder name is the URL. */
const portfolio = defineCollection({
  loader: glob({ pattern: '*/collection.json', base: './portfolio', generateId: idFromFolder }),
  schema: z.strictObject({
    $schema,
    title: z.string().min(1),
    description: z.string().optional().describe('Shown under the title.'),
    unlisted: z.boolean().optional().describe('Leaves the collection off the home page and out of the sitemap. Its URL still works.'),
    photos: z
      .array(photo)
      .describe("In the order shown. A photo can be from this folder or any album, but its text comes only from here, not from the album."),
  }),
})

export const collections = { albums, collections: portfolio }
