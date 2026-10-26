import type { ImageMetadata } from 'astro'
import { getImage } from 'astro:assets'

/** Width of the resized copies for phones and home page covers. */
const SMALL_WIDTH = 1200
const AVIF_QUALITY = 60

async function small(image: ImageMetadata) {
  return getImage({ src: image, width: SMALL_WIDTH, format: 'avif', quality: AVIF_QUALITY })
}

/**
 * An AVIF copy for phones, and the original JPEG, passed through without re-encoding, for everything bigger.
 * Photos are exported at 3000px on the long edge, so the original is what 4K screens get.
 */
export async function photoSources(image: ImageMetadata): Promise<{ src: string; srcset?: string }> {
  if (image.width <= SMALL_WIDTH) return { src: image.src }
  const resized = await small(image)
  // In dev, the original's URL is its path on disk, and any spaces in it would split a srcset candidate.
  const candidate = (src: string, width: number) => `${src.replaceAll(' ', '%20')} ${width}w`
  return { src: image.src, srcset: `${candidate(resized.src, SMALL_WIDTH)}, ${candidate(image.src, image.width)}` }
}

/** A home page cover, which is never shown much more than 1200px wide. */
export async function coverSource(image: ImageMetadata): Promise<{ src: string; width: number; height: number }> {
  if (image.width <= SMALL_WIDTH) return image
  const resized = await small(image)
  return { src: resized.src, width: SMALL_WIDTH, height: Math.round((image.height * SMALL_WIDTH) / image.width) }
}

/** A 1200×630 JPEG for link previews, which don't all support AVIF. */
export async function socialImage(image: ImageMetadata) {
  const resized = await getImage({ src: image, width: 1200, height: 630, fit: 'cover', format: 'jpeg', quality: 80 })
  return { src: resized.src, width: 1200, height: 630 }
}
