#!/usr/bin/env node

/**
 * Adds photos that aren't listed yet to their folder's album.json or collection.json, with an empty caption and location.
 * It leaves everything already in the file as it is, including the order. A folder without a JSON file gets one, which
 * then needs its other fields filling in, such as an album's title and dates.
 *
 * Usage: npm run sync
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

const KINDS = [
  { dir: "albums", jsonFile: "album.json", schema: "albums" },
  { dir: "portfolio", jsonFile: "collection.json", schema: "collections" },
];

/** @param {string} folder */
function imageNames(folder) {
  return readdirSync(folder)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .map((file) => path.basename(file, path.extname(file)))
    .sort();
}

let changed = 0;
for (const { dir, jsonFile, schema } of KINDS) {
  if (!existsSync(dir)) continue;
  const folders = readdirSync(dir, { withFileTypes: true }).filter((entry) =>
    entry.isDirectory(),
  );

  for (const { name } of folders) {
    const folder = path.join(dir, name);
    const file = path.join(folder, jsonFile);
    const isNew = !existsSync(file);
    const data = isNew
      ? {
          $schema: `../../.astro/collections/${schema}.schema.json`,
          photos: [],
        }
      : JSON.parse(readFileSync(file, "utf8"));
    data.photos ??= [];

    const listed = new Set(data.photos.map((photo) => photo.fileName));
    const added = imageNames(folder).filter(
      (fileName) => !listed.has(fileName),
    );
    if (added.length === 0 && !isNew) continue;

    data.photos.push(
      ...added.map((fileName) => ({ fileName, caption: "", location: "" })),
    );
    writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
    changed++;
    console.log(
      `${isNew ? "Created" : "Updated"} ${file}: added ${added.length} photo${added.length === 1 ? "" : "s"}`,
    );
    if (isNew)
      console.log(
        `  Fill in its other fields, such as ${dir === "albums" ? "title, start and end" : "title"}, before building.`,
      );
  }
}

console.log(
  changed === 0
    ? "Everything is already listed."
    : "Now fill in the new captions and locations.",
);
