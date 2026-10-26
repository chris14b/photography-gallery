# Gallery

A modern, minimal photo gallery built with React + TypeScript + Vite. It renders a fast, justified layout, uses a dark theme, and reads photo metadata from JSON files per album. A generator script scans your images, extracts dimensions, and keeps metadata up to date.

## Features

- Justified, responsive layout that respects original aspect ratios
- Dark theme and minimalist UI with hover overlays (location + caption)
- Lightbox viewing with keyboard navigation
- Per‑album JSON metadata with preserved photo order
- Generator script to scan images and auto‑populate dimensions

## Tech stack

- React 19, TypeScript, Vite 7
- styled-components for styling
- react-photo-view for the lightbox

## Quick start

Prerequisites
- Node.js 22 (see .nvmrc)
- npm

Run locally
- npm install
- npm run dev
- Open http://localhost:5173

Build and preview
- npm run build (outputs to dist/)
- npm run preview (serves the production build locally)

Other scripts
- npm run lint
- npm run generate-metadata

## Exporting photos

Export from Lightroom with these settings so new photos match the existing ones:

- File type: JPEG, quality 70
- Image sizing: Resize to Fit, Long Edge, 3000 px
- Metadata: none (existing exports carry no EXIF or creator tags)

## Deploying

Pushing to main deploys the site to GitHub Pages via .github/workflows/deploy.yml. To publish new photos:

1. Export them (see Exporting photos) into an album folder under src/assets/images/
2. npm run generate-metadata, then fill in captions and locations
3. Commit and push

The custom domain comes from public/CNAME.

## Project layout

- src/assets/images/          Images by album folder
- src/data/metadata/          JSON metadata per album (committed)
- src/data/categories/        JSON per category page, e.g. concerts.json → /concerts
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
      "caption": "Dawn on top the volcano",
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
- Set "unlisted": true to keep an album off the home page. Its URL still works, and categories can still use its photos.

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
- The build fails if a category has the same URL as an album, or lists a photo that doesn't exist.

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
