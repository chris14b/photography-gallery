import { readFile } from "node:fs/promises";
import type { APIRoute } from "astro";
import sharp from "sharp";

const SIZE = 180;

/**
 * The icon iPhones and iPads use when the site is added to the home screen, drawn from favicon.svg so the two can't
 * drift apart. iOS rounds the corners itself, so the tile's own rounded corners are filled in with its colour.
 */
export const GET: APIRoute = async () => {
  const svg = await readFile("public/favicon.svg");
  const png = await sharp(svg, { density: (72 * SIZE) / 32 })
    .resize(SIZE, SIZE)
    .flatten({ background: "#121212" })
    .png()
    .toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
