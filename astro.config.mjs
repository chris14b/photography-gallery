// @ts-check
import { defineConfig } from "astro/config";
import { SITE_URL } from "./src/site.ts";

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: SITE_URL,
  output: "static",
  // Each page is written to /{slug}/index.html, which GitHub Pages serves at both /{slug} and /{slug}/.
  build: { format: "directory" },
  trailingSlash: "ignore",
});
