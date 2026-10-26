import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

// The file name is the ID. Without this, the glob loader would use an album's "slug" field instead.
const idFromFileName = ({ entry }: { entry: string }) => entry.replace(/\.json$/, '')

const photo = z.strictObject({
  /** The image's file name without its extension. */
  fileName: z.string().min(1),
  caption: z.string().optional(),
  location: z.string(),
  dimensions: z.strictObject({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
})

/** One album per folder in src/assets/images; the file name is the folder name slugified. */
const albums = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/metadata', generateId: idFromFileName }),
  schema: z.strictObject({
    /** The album's URL, if it differs from its ID. */
    slug: z.string().optional(),
    name: z.string().min(1),
    country: z.string().optional(),
    dateDescription: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    /** The fileName of the home page cover photo. */
    cover: z.string().optional(),
    /** Unlisted albums are left off the home page, e.g. photos that only appear in a category. */
    unlisted: z.boolean().optional(),
    photos: z.array(photo),
  }),
})

/** A reference to an album photo as "{albumId}/{fileName}", optionally with category-specific text. */
const categoryPhoto = z.union([
  z.string(),
  z.strictObject({
    photo: z.string(),
    caption: z.string().optional(),
    location: z.string().optional(),
  }),
])

/** Hand-picked photos from any album; the file name is the URL. */
const categories = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/categories', generateId: idFromFileName }),
  schema: z.strictObject({
    name: z.string().min(1),
    description: z.string().optional(),
    /** Unlisted categories are only reachable by their URL. */
    unlisted: z.boolean().optional(),
    photos: z.array(categoryPhoto),
  }),
})

export const collections = { albums, categories }
