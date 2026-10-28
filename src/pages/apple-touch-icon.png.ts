import { readFile } from "node:fs/promises";
import type { APIRoute } from "astro";
import sharp from "sharp";

const SIZE = 180;
// favicon.svg is 24 units across with the camera 22 of them, so this makes the camera about 124px wide.
const CAMERA = 135;
const BACKGROUND = "#121212";

/**
 * The icon iPhones and iPads use when the site is added to the home screen, drawn from favicon.svg so the two can't
 * drift apart. favicon.svg has no background and changes colour with the browser's theme, but a home screen icon
 * needs one, so this draws the camera's shape in white on the site's background. iOS rounds the corners itself.
 */
export const GET: APIRoute = async () => {
  const svg = await readFile("public/favicon.svg");
  const shape = await sharp(svg, { density: (72 * CAMERA) / 24 })
    .resize(CAMERA, CAMERA)
    .extractChannel("alpha")
    .toBuffer();
  const camera = await sharp({
    create: {
      width: CAMERA,
      height: CAMERA,
      channels: 3,
      background: "#ffffff",
    },
  })
    .joinChannel(shape)
    .png()
    .toBuffer();
  const png = await sharp({
    create: { width: SIZE, height: SIZE, channels: 3, background: BACKGROUND },
  })
    .composite([{ input: camera }])
    .png()
    .toBuffer();
  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
