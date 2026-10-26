#!/usr/bin/env node

/**
 * Warns about photos without a caption in album.json and collection.json, one line per file. It's only a reminder, so it
 * never fails; the build checks everything else about the JSON.
 *
 * Usage: node scripts/captions.mjs (part of npm run check)
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const KINDS = [
  { dir: "albums", jsonFile: "album.json" },
  { dir: "portfolio", jsonFile: "collection.json" },
];

let missing = 0;
for (const { dir, jsonFile } of KINDS) {
  if (!existsSync(dir)) continue;
  const folders = readdirSync(dir, { withFileTypes: true }).filter((entry) =>
    entry.isDirectory(),
  );

  for (const { name } of folders) {
    const file = path.join(dir, name, jsonFile);
    if (!existsSync(file)) continue;
    const { photos = [] } = JSON.parse(readFileSync(file, "utf8"));
    const fileNames = photos
      .filter((photo) => !photo.caption?.trim())
      .map((photo) => photo.fileName);
    if (fileNames.length === 0) continue;

    missing += fileNames.length;
    console.warn(`${file}: ${fileNames.join(", ")}`);
  }
}

console.warn(
  missing === 0
    ? "Every photo has a caption."
    : `Warning: ${missing} photo${missing === 1 ? " has" : "s have"} no caption (listed above).`,
);
