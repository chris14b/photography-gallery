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
- Node.js 18+ (recommended for Vite 7)
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

## Project layout

- src/assets/images/          Local images by album folder (gitignored)
- src/data/metadata/          JSON metadata per album (committed)
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
