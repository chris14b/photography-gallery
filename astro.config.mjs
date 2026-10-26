// @ts-check
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

const site = 'https://chrisjohnston.photography'

/** URLs of unlisted albums and collections, and of empty collections, which all stay out of the sitemap as well as off the home page. */
async function unlistedUrls() {
  /**
   * Each folder's JSON file, with the folder name as its ID. Folders without one aren't pages yet.
   * @param {string} dir
   * @param {string} jsonFile
   */
  const readFolders = async (dir, jsonFile) => {
    const folders = (await readdir(dir, { withFileTypes: true })).filter((entry) => entry.isDirectory())
    const files = folders.map(({ name }) => ({ id: name, file: path.join(dir, name, jsonFile) })).filter(({ file }) => existsSync(file))
    return Promise.all(files.map(async ({ id, file }) => ({ id, ...JSON.parse(await readFile(file, 'utf8')) })))
  }
  const albums = await readFolders('albums', 'album.json')
  const collections = await readFolders('portfolio', 'collection.json')
  const ids = [
    ...albums.filter((album) => album.unlisted).map((album) => album.id),
    ...collections.filter((collection) => collection.unlisted || collection.photos.length === 0).map((collection) => collection.id),
  ]
  return new Set(ids.map((id) => new URL(`/${id}/`, site).href))
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
