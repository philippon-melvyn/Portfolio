import { getProjects } from "../lib/pocketbase.js";
import { sitemapXml, validateSiteUrl } from "../lib/seo.js";

export async function GET() {
  const domain = validateSiteUrl(import.meta.env.SITE_URL, { required: import.meta.env.PROD });
  if (!domain) return new Response("Sitemap disponible après configuration de SITE_URL.", { status: 404 });
  const projects = await getProjects();
  return new Response(sitemapXml([
    "/", "/a-propos/", "/projets/", "/contact/",
    ...projects.map(({ slug }) => `/projets/${slug}/`),
  ], domain), { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
