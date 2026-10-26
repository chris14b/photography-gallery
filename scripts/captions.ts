#!/usr/bin/env node

/**
 * Warns about photos without a caption in album.json and collection.json, one line per file. It's only a reminder, so it
 * never fails; the build checks everything else about the JSON.
 *
 * Usage: node scripts/captions.ts (part of npm run check)
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { KINDS } from "../src/lib/folders.ts";

let missing = 0;
for (const { dir, jsonFile } of KINDS) {
  if (!existsSync(dir)) continue;
  const folders = readdirSync(dir, { withFileTypes: true }).filter((entry) =>
    entry.isDirectory(),
  );

  for (const { name } of folders) {
    const file = path.join(dir, name, jsonFile);
    if (!existsSync(file)) continue;
    const { photos = [] }: { photos?: { file: string; caption?: string }[] } =
      JSON.parse(readFileSync(file, "utf8"));
    const uncaptioned = photos
      .filter((photo) => !photo.caption?.trim())
      .map((photo) => photo.file);
    if (uncaptioned.length === 0) continue;

    missing += uncaptioned.length;
    console.warn(`${file}: ${uncaptioned.join(", ")}`);
  }
}

console.warn(
  missing === 0
    ? "Every photo has a caption."
    : `Warning: ${missing} photo${missing === 1 ? " has" : "s have"} no caption (listed above).`,
);
