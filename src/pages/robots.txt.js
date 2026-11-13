import { validateSiteUrl, pageUrl } from "../lib/seo.js";

export function GET() {
  const domain = validateSiteUrl(import.meta.env.SITE_URL, { required: import.meta.env.PROD });
  return new Response(
    domain
      ? `User-agent: *\nAllow: /\nSitemap: ${pageUrl("/sitemap.xml", domain)}\n`
      : "User-agent: *\nDisallow: /\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
