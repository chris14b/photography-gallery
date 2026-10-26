# Gallery

A minimal, static photo gallery built with Astro. It uses a dark theme and reads each album's captions and dates from a JSON file next to its photos. A sync script adds new photos to those files.

## Features

- Home page grid of album covers, newest first
- Album pages show one photo per screen, as large as fits, with its caption and location below. On screens at least 768px wide in landscape orientation, portrait photos have their caption beside them instead, alternating sides. The layout is CSS only.
- Phones get 1200px AVIF copies; bigger screens get the original 3000px JPEG, untouched
- Per-page titles, descriptions and link previews, plus a sitemap
- Per‑album JSON metadata with preserved photo order
- Sync script that adds new photos to the JSON

## Tech stack

- Astro 7 (static output), TypeScript
- Scoped CSS in Astro components
- Content collections with Zod schemas for the album and collection JSON
- astro:assets (sharp) for image resizing
- Vitest, ESLint and Prettier

## Quick start

Prerequisites

- Node.js 22.23.4 or later (see .nvmrc; with nvm, run nvm install)
- npm

Run locally

- npm install
- npm run dev
- Open http://localhost:4321

Build and preview

- npm run build (builds to dist/; npm run check does the type checking)
- npm run preview (serves the production build locally)

The first build resizes every photo, which takes a few minutes. Later builds reuse the copies cached in node_modules/.astro.

Checks

- npm run check runs everything CI runs before deploying: astro check, lint, the Prettier format check and the tests. It ends with a list of photos without captions, as a reminder rather than a failure.
- npm run format formats everything with Prettier, using its default style
- npm run lint, npm run format:check and npm test run one check each

Other scripts

- npm run sync

## Exporting photos

Export from Lightroom with these settings so new photos match the existing ones:

- File type: JPEG, quality 70
- Image sizing: Resize to Fit, Long Edge, 3000 px
- Metadata: none (existing exports carry no EXIF or creator tags)

## Deploying

Pushing to main deploys the site to GitHub Pages via .github/workflows/deploy.yml, which runs npm run check, builds and uploads dist/. It caches the resized photos between runs. Pull requests run npm run check via .github/workflows/check.yml. To publish new photos:

1. Export them (see Exporting photos) into an album folder under albums/
2. npm run sync, then fill in captions and locations
3. Commit and push

The custom domain, chrisjohnston.photography, is set in the repository's Pages settings.

## Project layout

| Path                  | What it is                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| albums/{url}/         | One folder per album: its photos and album.json. The folder name is the URL.                         |
| collections/{url}/    | One folder per collection: its own photos and collection.json, e.g. collections/concerts → /concerts |
| src/site.ts           | The site's URL, title and author                                                                     |
| src/content.config.ts | Zod schemas for album.json and collection.json                                                       |
| src/lib/folders.ts    | The folder layout: albums/ with album.json, collections/ with collection.json                        |
| src/lib/gallery.ts    | Loads the JSON and images for the pages                                                              |
| src/lib/rules.ts      | Builds albums and collections from them, and checks them (tested in rules.test.ts)                   |
| src/lib/dates.ts      | Formats an album's dates                                                                             |
| src/lib/images.ts     | Image sizes and formats                                                                              |
| src/pages/            | The home page, album and collection pages ([slug].astro), and 404                                    |
| scripts/sync.mjs      | Adds new photos to the JSON (npm run sync)                                                           |
| scripts/captions.mjs  | Lists photos without captions (part of npm run check)                                                |

## Albums

An album's URL is `{place}-{year}`, using the year the trip started, such as laos-2023. When two albums share a place and year, both get the month: `{place}-{year}-{month}`, such as home-2024-03 and home-2024-10. Home is one album per stay between trips, split at New Year.

Each album folder has an album.json:

```json
{
  "$schema": "../../.astro/collections/albums.schema.json",
  "title": "Sumatra",
  "country": "Indonesia",
  "start": "2024-07-16",
  "end": "2024-08-07",
  "cover": "R0004183.jpg",
  "photos": [
    {
      "file": "R0003897.jpg",
      "caption": "Dawn on top of the volcano",
      "location": "Mount Sibayak, Berastagi"
    }
  ]
}
```

- title, start, end and photos are required. Everything else is optional; leave a field out rather than filling it with a placeholder.
- The page shows the dates as months, such as "July–August 2024" or "October 2024 – April 2025", from start and end (YYYY-MM-DD). Albums are sorted by start, newest first.
- description is shown under the title, such as "Bali, the Gili Islands and Flores".
- country is shown under the title too. Set it only when the title doesn't already name the country.
- cover is the file of the home page cover photo, such as R0004183.jpg. It defaults to the first landscape photo.
- Photos are shown in the order listed. file is the file name with its extension, such as R0003897.jpg, and must be unique across all albums and collections. An empty caption or location is left off the page.
- Set "unlisted": true to keep an album off the home page and out of the sitemap. Its URL still works, and collections can still use its photos.
- `$schema` points at the JSON schema Astro generates from src/content.config.ts, so editors such as VS Code autocomplete fields and flag mistakes. It's generated by npm run dev, npm run build or npx astro sync, so run one of them once after cloning.

## Collections

A collection page, such as /concerts, shows hand-picked photos, in the same layout as an album. Each collection is a folder in collections/, with a collection.json and any photos of its own. The folder name is the URL:

```json
{
  "$schema": "../../.astro/collections/collections.schema.json",
  "title": "Concerts",
  "description": "Live music in Sydney",
  "photos": [
    {
      "file": "R0009278.jpg",
      "caption": "Tame Impala, 2026",
      "location": "Sydney SuperDome"
    },
    {
      "file": "R0006333.jpg",
      "caption": "Ólafur Arnalds of Kiasmos, 2025",
      "location": "Sydney Opera House"
    }
  ]
}
```

- Each photo's file can be in the collection's own folder or in any album. The page shows photos in the order listed.
- Each photo has the same fields as in an album: file, and an optional caption and location. collection.json is the only source of a collection's text; nothing comes from the album, even for an album photo, so an album photo can read differently on its album page.
- A concert photo that also belongs in a personal album goes in that album, and the collection lists it. A concert-only photo goes in collections/concerts/.
- Collections with photos are linked from the home page, unless the collection has "unlisted": true, in which case it's only reachable by its URL. A collection with no photos is hidden, and its URL redirects home.
- The build fails if a collection has the same URL as an album, two photo files share a name, a JSON file lists a photo that doesn't exist or lists one twice, an album ends before it starts, or any JSON file doesn't match its schema in src/content.config.ts. Photos that no JSON file lists are left out, with a warning.

## Syncing new photos

npm run sync adds every photo that isn't listed yet to its folder's album.json or collection.json, with an empty caption and location to fill in. It leaves everything already there, including the order, as it is. A new album folder gets an album.json with just its photos; add its title, start and end before building.
