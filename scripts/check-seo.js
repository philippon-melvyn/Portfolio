// Audit the real static build. No network, CMS writes or extra dependencies.
import { readFile, readdir, stat, mkdir, writeFile } from "node:fs/promises";
import { resolve, relative, join } from "node:path";
import { decodeHtmlEntities, plainText } from "../src/lib/content.js";
import { validateSiteUrl } from "../src/lib/seo.js";

const directory = resolve(process.argv[2] || "dist");
const errors = [];
const pages = new Map();
const titles = new Set();
const descriptions = new Set();
let imageCount = 0;
let structuredPages = 0;
let referenceCount = 0;
const check = (condition, message) => { if (!condition) errors.push(message); };
async function files(dir) {
  return (await Promise.all((await readdir(dir, { withFileTypes: true })).map((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]))).flat();
}
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)(?:="([^"]*)")?/g)].map(([, name, value]) => [name, decodeHtmlEntities(value ?? "")]));
}
async function exists(file) { try { return await stat(file); } catch { return null; } }
const sitemap = await readFile(join(directory, "sitemap.xml"), "utf8");
check(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>') && sitemap.includes('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), "Sitemap : déclaration ou espace de noms manquant.");
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, value]) => decodeHtmlEntities(value));
check(locations.length > 0 && locations.length === new Set(locations).size, "Sitemap vide ou URL dupliquées.");
const domain = validateSiteUrl(new URL(locations[0]).origin, { required: true });
const robots = await readFile(join(directory, "robots.txt"), "utf8");
check(robots === `User-agent: *\nAllow: /\nSitemap: ${domain}/sitemap.xml\n`, "robots.txt incohérent.");

for (const file of (await files(directory)).filter((path) => path.endsWith(".html"))) {
  const html = await readFile(file, "utf8");
  const route = `/${relative(directory, file).replaceAll("\\", "/").replace(/index\.html$/, "")}`;
  if (/http-equiv="refresh"/i.test(html)) {
    check(route === "/projets/la-cimade/" && html.includes("/projets/lacimade/"), `Redirection inattendue : ${route}`);
    continue;
  }
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] || "";
  const metadata = new Map();
  for (const tag of head.match(/<meta\b[^>]*>/g) || []) {
    const attrs = attributes(tag);
    const key = attrs.name || attrs.property;
    if (!key) continue;
    check(!metadata.has(key), `${route} : meta ${key} dupliquée.`);
    metadata.set(key, attrs.content);
  }
  const title = plainText(head.match(/<title>([\s\S]*?)<\/title>/)?.[1]);
  const description = metadata.get("description");
  check(title && !titles.has(title), `${route} : titre vide ou dupliqué.`);
  check(description && !descriptions.has(description), `${route} : description vide ou dupliquée.`);
  titles.add(title); descriptions.add(description);
  check((title.match(/Melvyn Philippon/g) || []).length === 1, `${route} : nom répété ou absent du titre.`);
  check(!/\b(undefined|null)\b/.test(`${title} ${description}`), `${route} : valeur manquante dans les métadonnées.`);
  const canonicalTags = (head.match(/<link\b[^>]*>/g) || []).map(attributes).filter((tag) => tag.rel === "canonical");
  const canonical = canonicalTags[0]?.href;
  const noindex = metadata.get("robots")?.includes("noindex") || false;
  check(canonicalTags.length === (route === "/404.html" ? 0 : 1), `${route} : nombre de canoniques incorrect.`);
  if (canonical) check(canonical === `${domain}${route}`, `${route} : canonique incorrecte (${canonical}).`);
  check(metadata.get("og:url") === canonical, `${route} : URL Open Graph incohérente.`);
  check(metadata.get("og:title") === title && metadata.get("og:description") === description, `${route} : Open Graph incohérent.`);
  check(metadata.get("twitter:title") === title && metadata.get("twitter:description") === description, `${route} : carte de partage incohérente.`);
  check(metadata.get("og:locale") === "fr_FR" && /<html\b[^>]*lang="fr"/.test(html), `${route} : langue manquante.`);
  check((html.match(/<h1\b/g) || []).length === 1 && (html.match(/<main\b/g) || []).length === 1, `${route} : titre principal ou main incorrect.`);
  check(!/(localhost|127\.0\.0\.1|https?:\/\/[^" ]+:\d+)/.test(head), `${route} : URL locale dans les métadonnées.`);
  const share = metadata.get("og:image");
  check(share?.startsWith(`${domain}/_astro/`) && /\.jpe?g$/.test(share) && metadata.get("og:image:type") === "image/jpeg", `${route} : image de partage non JPEG ou non publique.`);
  if (share) {
    const bytes = await readFile(join(directory, new URL(share).pathname));
    check(bytes[0] === 0xff && bytes[1] === 0xd8, `${route} : format réel de l’image de partage incorrect.`);
  }
  const jsonLd = [...head.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  const expectedType = route === "/" ? "WebSite" : route === "/a-propos/" ? "ProfilePage" : /^\/projets\/[^/]+\/$/.test(route) ? "CreativeWork" : null;
  check(jsonLd.length === (expectedType ? 1 : 0), `${route} : nombre de blocs JSON-LD incorrect.`);
  for (const [, source] of jsonLd) {
    try {
      const data = JSON.parse(source);
      check(data["@context"] === "https://schema.org" && data["@graph"].some((item) => item["@type"] === expectedType), `${route} : type JSON-LD incorrect.`);
      check(!source.includes("</script"), `${route} : fermeture de script dans le JSON-LD.`);
      structuredPages++;
    } catch { errors.push(`${route} : JSON-LD invalide.`); }
  }
  for (const tag of html.match(/<img\b[^>]*>/g) || []) {
    const image = attributes(tag); imageCount++;
    check("alt" in image && Number(image.width) > 0 && Number(image.height) > 0 && image.loading, `${route} : image sans alternative, dimensions ou chargement explicite.`);
    check(image.fetchpriority !== "high" || image.loading === "eager", `${route} : image prioritaire chargée en différé.`);
  }
  const links = [];
  for (const tag of html.match(/<(?:a|link|script|img)\b[^>]*>/g) || []) {
    const attrs = attributes(tag);
    const target = attrs.href || attrs.src;
    if (!target || /^(?:mailto:|tel:|data:|https?:\/\/)/.test(target) && !target.startsWith(`${domain}/`)) continue;
    const url = new URL(target, `${domain}${route}`);
    if (url.origin !== domain) continue;
    const path = decodeURIComponent(url.pathname);
    let destination = resolve(directory, `.${path}`);
    if ((await exists(destination))?.isDirectory()) destination = join(destination, "index.html");
    check(Boolean(await exists(destination)), `${route} : ressource ou lien absent (${target}).`);
    if (tag.startsWith("<a")) links.push(url.pathname);
    referenceCount++;
  }
  pages.set(route, { title, description, canonical, noindex, links });
}
const indexable = [...pages].filter(([, page]) => !page.noindex).map(([route]) => `${domain}${route}`);
check(indexable.length === locations.length && locations.every((url) => indexable.includes(url)), "Sitemap : différence avec les pages publiques indexables.");
const reached = new Set();
function crawl(route) { if (reached.has(route)) return; reached.add(route); for (const next of pages.get(route)?.links || []) if (pages.has(next)) crawl(next); }
crawl("/");
for (const route of pages.keys()) if (route !== "/404.html") check(reached.has(route), `Page isolée : ${route}`);
const report = { pages: pages.size, sitemapUrls: locations.length, images: imageCount, structuredPages, references: referenceCount, errors, metadata: Object.fromEntries(pages) };
await mkdir(".astro", { recursive: true });
await writeFile(".astro/seo-report.json", JSON.stringify(report, null, 2));
console.log(`${pages.size} pages, ${locations.length} URL sitemap, ${imageCount} images, ${structuredPages} pages JSON-LD, ${referenceCount} références : ${errors.length} erreur(s).`);
if (errors.length) { console.error(errors.join("\n")); process.exitCode = 1; }
