# Gallery

A minimal, static photo gallery built with Astro. It uses a dark theme and reads each album's captions and dates from a JSON file next to its photos. A sync script adds new photos to those files.

## Features

- A header on every page with the site name, which links home, a link to the about page and a fullscreen button. On album and collection pages it hides as you scroll down and comes back when you scroll up.
- Home page with albums under the year they spend the most days in, newest first, then the collections. Covers keep their own shapes, in rows of even height.
- Album pages show one photo per screen, as large as fits, with its caption and location below. On screens at least 768px wide in landscape orientation, portrait photos have their caption beside them instead, alternating sides. The layout is CSS only.
- Each photo fills with its average colour while it loads. Album pages end with links to the albums before and after, and home.
- Phones get 1200px AVIF copies; bigger screens get the original 3000px JPEG, untouched
- An about page with a portrait, a paragraph and links to Instagram and email
- Per-page titles, descriptions and link previews, plus a sitemap
- Per‑album JSON metadata with preserved photo order
- Sync script that adds new photos to the JSON

## Tech stack

- Astro 7 (static output), TypeScript
- Scoped CSS in Astro components
- Content collections with Zod schemas for the album and collection JSON
- astro:assets (sharp) for image resizing
- Astro's fonts API, serving Geist Mono from src/assets/fonts for dates, places and labels; everything else uses the system font
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

- npm run check runs everything CI runs before deploying: astro check, lint, the Prettier format check and the tests. It ends with a list of captions still to write, as a reminder rather than a failure.
- npm run format formats everything with Prettier, using its default style
- npm run lint, npm run format:check and npm test run one check each

Other scripts

- npm run sync

## Exporting photos

Export from Lightroom with these settings so new photos match the existing ones. The site only uses .jpg files:

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
| src/site.ts           | The site's URL, title and author, and the author's email and Instagram                               |
| src/content.config.ts | Zod schemas for album.json and collection.json                                                       |
| src/lib/folders.ts    | The folder layout: albums/ with album.json, collections/ with collection.json                        |
| src/lib/gallery.ts    | Loads the JSON and images for the pages                                                              |
| src/lib/rules.ts      | Builds albums and collections from them, and checks them (tested in rules.test.ts)                   |
| src/lib/dates.ts      | Formats an album's dates                                                                             |
| src/lib/images.ts     | Image sizes and formats                                                                              |
| src/pages/            | The home page, album and collection pages ([slug].astro), about, 404 and sitemap.xml                 |
| src/assets/about.jpg  | The about page's photo, exported like the album photos                                               |
| scripts/sync.ts       | Adds new photos to the JSON (npm run sync)                                                           |
| scripts/captions.ts   | Lists captions still to write (part of npm run check)                                                |

## Albums

An album is one continuous visit, titled with the smallest place that covers the whole visit. Sumatra and Java are separate albums in 2024 because they were separate visits, but Indonesia is one album in 2023 because Bali, the Gili Islands and Flores were one visit. Kuala Lumpur 2024 and Malaysia 2024 are separate albums too, because they were separate visits.

Home is one album per stay between trips. When one gets too big, split it at whatever date suits.

An album's URL is `{place}-{year}`, using the year the visit started, such as laos-2023. A later album for the same place and year adds the month it started: `{place}-{year}-{month}`. Published URLs never change, so never rename an album folder once it's live. Existing URLs stay as they are, even home-2024-03 and home-2024-10, which both have a month from before this rule.

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

- title, start and photos are required. Everything else is optional; leave a field out rather than filling it with a placeholder.
- The page shows the dates as months, such as "July–August 2024" or "October 2024 – April 2025", from start and end (YYYY-MM-DD). An album with no end, such as the current stay at home, shows "July 2026 – present". Albums are sorted by start, newest first.
- description is shown under the title, such as "Bali, the Gili Islands and Flores".
- country is shown under the title too. Set it only when the title doesn't already name the country.
- cover is the file of the home page cover photo, such as R0004183.jpg, and must be one of the album's photos. It defaults to the first photo.
- Photos are shown in the order listed. file is the file name with its extension, such as R0003897.jpg, and must be unique across all albums and collections.
- Leave caption out for a photo that has no caption on purpose. "caption": "" means it's still to write: npm run sync adds it for new photos, and npm run check lists them. Neither shows a caption on the page. An empty location is left off the page too.
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
- cover is the file of the home page cover photo, as in an album, and must be one of the collection's photos. It doesn't change the order. It defaults to the first photo.
- Each photo has the same fields as in an album: file, and an optional caption and location. collection.json is the only source of a collection's text; nothing comes from the album, even for an album photo, so an album photo can read differently on its album page.
- A concert photo that also belongs in a personal album goes in that album, and the collection lists it. A concert-only photo goes in collections/concerts/.
- Every collection is linked from the home page and from the end of each collection page.
- The build fails if a collection has the same URL as an album, two photo files share a name, a JSON file lists a photo that doesn't exist or lists one twice, a collection has no photos, an album's or collection's cover isn't one of its photos, an album ends before it starts, or any JSON file doesn't match its schema in src/content.config.ts. Photos that no JSON file lists are left out, with a warning.

## Captions and locations

These apply to album.json and collection.json alike.

- Write a location as "Place, Town", such as "Monkey Forest, Ubud". Leave the country out; the album gives it.
- Don't repeat the town. A town on its own is fine, and so is a place that already names its town, such as "Ella" or "Manly Beach", not "Manly Beach, Manly".
- Where there's no town, use the island, park or area instead, such as "Padar Island, Komodo".
- Spell places the common English way, without diacritics: "Hue", not "Huế", and "Koh Tao", not "Ko Tao".
- Call a place by the same name everywhere it appears.
- Vague locations, such as "Middle of nowhere", are fine.
- Write captions in sentence case, without a full stop at the end.
- Call people by their first name.
- Caption a concert photo in collections/concerts with the artist and year, such as "Tame Impala, 2026".

## Syncing new photos

npm run sync adds every .jpg photo that isn't listed yet to its folder's album.json or collection.json, with an empty caption and location to fill in. Remove the caption of a photo that doesn't need one. It leaves everything already there, including the order, as it is. A new album folder gets an album.json with just its photos; add its title, start and end before building.
