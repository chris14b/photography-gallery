import { copyFile, mkdir, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const dataDir = path.resolve(import.meta.dirname, 'src/data')

interface AlbumFile {
  slug?: string
  photos: { fileName: string }[]
}

interface CategoryFile {
  photos: string[]
}

async function readJsonDir<T>(dir: string): Promise<Map<string, T>> {
  const files = (await readdir(dir).catch(() => [])).filter((file) => file.endsWith('.json'))
  const entries = await Promise.all(
    files.map(async (file) => [path.basename(file, '.json'), JSON.parse(await readFile(path.join(dir, file), 'utf8')) as T] as const),
  )
  return new Map(entries)
}

async function pageSlugs(): Promise<string[]> {
  const albums = await readJsonDir<AlbumFile>(path.join(dataDir, 'metadata'))
  const categories = await readJsonDir<CategoryFile>(path.join(dataDir, 'categories'))

  const albumSlugs = [...albums].map(([id, album]) => album.slug?.trim() || id)
  const photoRefs = new Set([...albums].flatMap(([id, album]) => album.photos.map((photo) => `${id}/${photo.fileName}`)))

  for (const [slug, category] of categories) {
    if (albumSlugs.includes(slug)) {
      throw new Error(`Category "${slug}" has the same URL as an album`)
    }
    const seen = new Set<string>()
    for (const ref of category.photos) {
      if (!photoRefs.has(ref)) throw new Error(`Category "${slug}" refers to unknown photo "${ref}"`)
      if (seen.has(ref)) throw new Error(`Category "${slug}" lists "${ref}" more than once`)
      seen.add(ref)
    }
  }

  return [...albumSlugs, ...categories.keys()]
}

// GitHub Pages only serves files that exist, so each album and category URL needs its own copy of the SPA entry point.
function staticPages(): Plugin {
  let slugs: string[] = []
  return {
    name: 'static-pages',
    apply: 'build',
    async buildStart() {
      slugs = await pageSlugs()
    },
    async writeBundle({ dir }) {
      if (!dir) return
      const index = path.join(dir, 'index.html')
      await copyFile(index, path.join(dir, '404.html'))
      for (const slug of slugs) {
        await mkdir(path.join(dir, slug), { recursive: true })
        await copyFile(index, path.join(dir, slug, 'index.html'))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), staticPages()],
  base: "/",
})
