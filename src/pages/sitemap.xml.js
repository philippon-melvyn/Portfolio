import { getProjects } from "../lib/pocketbase.js";

export async function GET() {
  const domain = import.meta.env.SITE_URL;
  const projects = domain ? await getProjects() : [];
  const paths = domain
    ? [
        "/",
        "/a-propos/",
        "/projets/",
        "/contact/",
        ...projects.map((project) => `/projets/${project.slug}/`),
      ]
    : [];
  const urls = paths
    .map(
      (path) =>
        `<url><loc>${new URL(path, domain).href.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</loc></url>`,
    )
    .join("");
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
}
