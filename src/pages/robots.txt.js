export function GET() {
  const domain = import.meta.env.SITE_URL;
  return new Response(
    domain
      ? `User-agent: *\nAllow: /\nSitemap: ${new URL("/sitemap.xml", domain).href}\n`
      : "User-agent: *\nDisallow: /\n",
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
