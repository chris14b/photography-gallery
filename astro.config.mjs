// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import { SITE_URL } from "./src/site.ts";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: SITE_URL,
  output: "static",
  // Each page is written to /{slug}/index.html, which GitHub Pages serves at both /{slug} and /{slug}/.
  build: { format: "directory" },
  trailingSlash: "ignore",
  // Served with the site rather than left to the browser, whose own monospace fonts differ a lot from one to the next.
  // The full font rather than Fontsource's subsets, which leave out the footer's arrows.
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Geist Mono",
      cssVariable: "--font-mono",
      fallbacks: ["monospace"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/GeistMono-Regular.woff2"],
            weight: 400,
            style: "normal",
          },
        ],
      },
    },
  ],
});
