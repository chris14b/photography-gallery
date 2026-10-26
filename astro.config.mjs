// @ts-check
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

const site = 'https://chrisjohnston.photography'

/** URLs of unlisted albums and categories, and of empty categories, which all stay out of the sitemap as well as off the home page. */
async function unlistedUrls() {
  /** @param {string} dir */
  const readJsonDir = async (dir) => {
    const files = (await readdir(dir)).filter((file) => file.endsWith('.json'))
    return Promise.all(files.map(async (file) => ({ id: path.basename(file, '.json'), ...JSON.parse(await readFile(path.join(dir, file), 'utf8')) })))
  }
  const albums = await readJsonDir('src/data/metadata')
  const categories = await readJsonDir('src/data/categories')
  const slugs = [
    ...albums.filter((album) => album.unlisted).map((album) => album.slug?.trim() || album.id),
    ...categories.filter((category) => category.unlisted || category.photos.length === 0).map((category) => category.id),
  ]
  return new Set(slugs.map((slug) => new URL(`/${slug}/`, site).href))
}

const unlisted = await unlistedUrls()

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site,
  output: 'static',
  // Each page is written to /{slug}/index.html, which GitHub Pages serves at both /{slug} and /{slug}/.
  build: { format: 'directory' },
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !unlisted.has(page) })],
})
