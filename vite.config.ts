import { copyFile, mkdir, readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const metadataDir = path.resolve(import.meta.dirname, 'src/data/metadata')

async function albumSlugs(): Promise<string[]> {
  const files = (await readdir(metadataDir)).filter((file) => file.endsWith('.json'))
  return Promise.all(
    files.map(async (file) => {
      const { slug } = JSON.parse(await readFile(path.join(metadataDir, file), 'utf8')) as { slug?: string }
      return slug?.trim() || path.basename(file, '.json')
    }),
  )
}

// GitHub Pages only serves files that exist, so each album URL needs its own copy of the SPA entry point.
function albumPages(): Plugin {
  return {
    name: 'album-pages',
    apply: 'build',
    async writeBundle({ dir }) {
      if (!dir) return
      const index = path.join(dir, 'index.html')
      await copyFile(index, path.join(dir, '404.html'))
      for (const slug of await albumSlugs()) {
        await mkdir(path.join(dir, slug), { recursive: true })
        await copyFile(index, path.join(dir, slug, 'index.html'))
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), albumPages()],
  base: "/",
})
