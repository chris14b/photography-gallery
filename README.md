# Gallery

A minimal, static photo gallery built with Astro. It uses a dark theme and reads photo metadata from JSON files per album. A generator script scans your images, extracts dimensions, and keeps metadata up to date.

## Features

- Home page grid of album covers, newest first
- Album pages show one photo per screen, as large as fits, with its caption and location below. On screens at least 768px wide in landscape orientation, portrait photos have their caption beside them instead, alternating sides. The layout is CSS only.
- Phones get 1200px AVIF copies; bigger screens get the original 3000px JPEG, untouched
- Per-page titles, descriptions and link previews, plus a sitemap
- Per‑album JSON metadata with preserved photo order
- Generator script to scan images and auto‑populate dimensions

## Tech stack

- Astro 7 (static output), TypeScript
- Scoped CSS in Astro components
- Content collections with Zod schemas for the album and category JSON
- astro:assets (sharp) for image resizing

## Quick start

Prerequisites
- Node.js 22.23.4 or later (see .nvmrc; with nvm, run nvm install)
- npm

Run locally
- npm install
- npm run dev
- Open http://localhost:4321

Build and preview
- npm run build (type checks with astro check, then builds to dist/)
- npm run preview (serves the production build locally)

The first build resizes every photo, which takes a few minutes. Later builds reuse the copies cached in node_modules/.astro.

Other scripts
- npm run lint
- npm run generate-metadata

## Exporting photos

Export from Lightroom with these settings so new photos match the existing ones:

- File type: JPEG, quality 70
- Image sizing: Resize to Fit, Long Edge, 3000 px
- Metadata: none (existing exports carry no EXIF or creator tags)

## Deploying

Pushing to main deploys the site to GitHub Pages via .github/workflows/deploy.yml, which lints, builds and uploads dist/. It caches the resized photos between runs. To publish new photos:

1. Export them (see Exporting photos) into an album folder under src/assets/images/
2. npm run generate-metadata, then fill in captions and locations
3. Commit and push

The custom domain comes from public/CNAME.

## Project layout

- src/assets/images/          Images by album folder
- src/data/metadata/          JSON metadata per album (committed)
- src/data/categories/        JSON per category page, e.g. concerts.json → /concerts
- src/content.config.ts       Zod schemas for the metadata and category files
- src/lib/gallery.ts          Builds albums and categories from the JSON and images, and checks them
- src/lib/images.ts           Image sizes and formats
- src/pages/                  The home page, album and category pages ([slug].astro), and 404
- scripts/generateMetadata.mjs Metadata generator (Node ESM)

Album IDs are derived from the folder name under src/assets/images (slugified). Photo fileName is the filename without extension.

## Metadata schema (current)

Each album has a JSON file named {albumId}.json:

```json
{
  "name": "Sumatra",
  "country": "Indonesia",
  "dateDescription": "July–August 2024",
  "startDate": "2024-07-16",
  "endDate": "2024-08-07",
  "photos": [
    {
      "fileName": "R0003897",
      "caption": "Dawn on top of the volcano",
      "location": "Mount Sibayak, Berastagi",
      "dimensions": { "width": 6000, "height": 3375 }
    }
  ]
}
```

Notes
- location is a single string (e.g., "Site, City").
- dimensions are required for layout; the generator extracts them.
- Existing photo order is preserved when regenerating.
- Set "unlisted": true to keep an album off the home page and out of the sitemap. Its URL still works, and categories can still use its photos.

## Categories

A category page, such as /concerts, shows hand-picked photos from any album, in the same layout as an album. Each category is a JSON file in src/data/categories/, and the file name is the URL:

```json
{
  "name": "Concerts",
  "description": "Live music in Sydney",
  "photos": [
    "concerts/R0008123",
    { "photo": "sydney-h2-2025/R0006325", "caption": "Kiasmos", "location": "Sydney Opera House" }
  ]
}
```

- Each photo is "{albumId}/{fileName}", where albumId is the album's metadata file name. The page shows photos in the order listed.
- To give a photo a different caption or location on the category page, use the object form. Anything you leave out comes from the album.
- A concert photo that also belongs in a personal album goes in that album. A concert-only photo goes in src/assets/images/Concerts/, an unlisted album whose slug is concerts-album so it doesn't clash with /concerts.
- Categories with photos are linked from the home page, unless the category has "unlisted": true, in which case it's only reachable by its URL. A category with no photos is hidden, and its URL redirects home.
- The build fails if a category has the same URL as an album, lists a photo that doesn't exist, or lists a photo twice. It also fails if any metadata or category file doesn't match its schema in src/content.config.ts.

## Metadata generator

Scans src/assets/images, groups images by album, and writes/updates JSON under src/data/metadata.

Usage
- npm run generate-metadata
- npm run generate-metadata -- --force-dimensions  (recompute dimensions for all photos)
- node scripts/generateMetadata.mjs --help

Supported input image formats for dimension extraction: JPEG (.jpg/.jpeg), PNG (.png), GIF (.gif), WebP (.webp).

Tips
- If you see errors about missing/invalid dimensions, re-run with --force-dimensions.
- The script preserves existing captions, locations, and ordering.
