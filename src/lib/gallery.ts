import type { ImageMetadata } from 'astro'
import { getCollection } from 'astro:content'

export const SITE_TITLE = 'Chris Johnston Photography'
/** Joins the parts of a subtitle, such as an album's country and dates. */
export const SEPARATOR = ' • '

export interface Photo {
  albumId: string
  fileName: string
  image: ImageMetadata
  caption?: string
  location: string
  /** The caption and location, for the image's alt text. */
  alt: string
}

export interface Album {
  id: string
  slug: string
  title: string
  subtitle: string
  /** A sentence for search results and link previews. */
  description: string
  unlisted: boolean
  photos: Photo[]
  cover: Photo
}

export interface Category {
  slug: string
  title: string
  description?: string
  unlisted: boolean
  photos: Photo[]
}

const imageModules = import.meta.glob<ImageMetadata>('../assets/images/*/*.{jpg,jpeg,png,gif,webp,JPG,JPEG,PNG,GIF,WEBP}', {
  eager: true,
  import: 'default',
})

/** The album ID for an image folder, e.g. "Thailand (2023)" → "thailand-2023". */
function albumIdForFolder(folder: string): string {
  return folder
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** Images keyed by "{albumId}/{fileName}", where fileName has no extension. */
const imagesByRef = new Map(
  Object.entries(imageModules).map(([path, image]) => {
    const [, folder, fileName] = path.match(/\/images\/([^/]+)\/(.+)\.[^.]+$/)!
    return [`${albumIdForFolder(folder)}/${fileName}`, image] as const
  }),
)

const PLACEHOLDER_CAPTION = 'Add a caption for this photo'

function photoText(caption: string | undefined, location: string) {
  const trimmed = caption?.trim()
  const text = trimmed && trimmed !== PLACEHOLDER_CAPTION ? trimmed : undefined
  return { caption: text, location, alt: [text, location].filter(Boolean).join(', ') }
}

interface Dated {
  startDate: string
  endDate: string
}

/** Newest first by start date (or end date if there's no start), with undated albums last. */
function byDateDescending(a: Dated, b: Dated): number {
  const time = (album: Dated) => Date.parse(album.startDate || album.endDate)
  const aTime = time(a)
  const bTime = time(b)
  if (Number.isNaN(aTime)) return Number.isNaN(bTime) ? 0 : 1
  if (Number.isNaN(bTime)) return -1
  return bTime - aTime
}

async function loadAlbums(): Promise<Album[]> {
  const entries = (await getCollection('albums')).sort((a, b) => byDateDescending(a.data, b.data))

  const listed = new Set(entries.flatMap(({ id, data }) => data.photos.map((photo) => `${id}/${photo.fileName}`)))
  for (const ref of imagesByRef.keys()) {
    if (!listed.has(ref)) console.warn(`Skipping ${ref}, which has no metadata; run npm run generate-metadata`)
  }

  return entries.flatMap(({ id, data }) => {
    const photos = data.photos.map((photo): Photo => {
      const image = imagesByRef.get(`${id}/${photo.fileName}`)
      if (!image) throw new Error(`Album "${id}" lists "${photo.fileName}", but there's no image with that name in its folder`)
      return { albumId: id, fileName: photo.fileName, image, ...photoText(photo.caption, photo.location) }
    })
    if (photos.length === 0) return []

    const cover =
      photos.find((photo) => photo.fileName === data.cover?.trim()) ??
      photos.find((photo) => photo.image.width > photo.image.height) ??
      photos[0]

    const country = data.country?.trim()
    const dates = data.dateDescription.trim()
    return [
      {
        id,
        slug: data.slug?.trim() || id,
        title: data.name,
        subtitle: [country, dates].filter(Boolean).join(SEPARATOR),
        description: `Photos by Chris Johnston from ${[data.name, country, dates].filter(Boolean).join(', ')}.`,
        unlisted: data.unlisted === true,
        photos,
        cover,
      },
    ]
  })
}

async function loadCategories(albums: Album[]): Promise<Category[]> {
  const photosByRef = new Map<string, Photo>(albums.flatMap((album) => album.photos.map((photo) => [`${photo.albumId}/${photo.fileName}`, photo])))
  const albumSlugs = new Set(albums.map((album) => album.slug))

  return (await getCollection('categories')).map(({ id, data }) => {
    if (albumSlugs.has(id)) {
      throw new Error(`Category "${id}" has the same URL as an album; give the album a different "slug" in its metadata`)
    }

    const seen = new Set<string>()
    const photos = data.photos.map((entry): Photo => {
      const ref = typeof entry === 'string' ? entry : entry.photo
      const photo = photosByRef.get(ref)
      if (!photo) throw new Error(`Category "${id}" refers to unknown photo "${ref}"`)
      if (seen.has(ref)) throw new Error(`Category "${id}" lists "${ref}" more than once`)
      seen.add(ref)
      if (typeof entry === 'string') return photo
      return { ...photo, ...photoText(entry.caption ?? photo.caption, entry.location ?? photo.location) }
    })

    return { slug: id, title: data.name, description: data.description, unlisted: data.unlisted === true, photos }
  })
}

let gallery: Promise<{ albums: Album[]; categories: Category[] }> | undefined

/** Every album, newest first, and every category, including unlisted and empty ones. */
export function loadGallery() {
  gallery ??= loadAlbums().then(async (albums) => ({ albums, categories: await loadCategories(albums) }))
  return gallery
}
