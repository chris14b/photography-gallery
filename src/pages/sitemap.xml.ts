import type { APIRoute } from "astro";
import { loadGallery } from "../lib/gallery";

/** The home page, the about page and every album and collection, for search engines. */
export const GET: APIRoute = async ({ site }) => {
  const { albums, collections } = await loadGallery();
  const paths = [
    "/",
    "/about/",
    ...[...albums, ...collections].map((photoSet) => `/${photoSet.id}/`),
  ];
  const urls = paths.map(
    (path) => `<url><loc>${new URL(path, site)}</loc></url>`,
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`,
    { headers: { "Content-Type": "application/xml" } },
  );
};
