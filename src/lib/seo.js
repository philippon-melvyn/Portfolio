import { asArray, plainText } from "./content.js";

// Shared by Astro's configuration, the layout and the static endpoints.
export function validateSiteUrl(value, { required = false } = {}) {
  const input = String(value ?? "").trim();
  if (!input) {
    if (required) throw new Error("SITE_URL manque : définir le domaine HTTPS public dans .env avant le build.");
    return undefined;
  }
  let url;
  try { url = new URL(input); } catch { throw new Error("SITE_URL doit être une URL HTTPS absolue."); }
  const host = url.hostname.toLowerCase();
  const local = host === "localhost" || /^\[|^\d+(?:\.\d+){3}$/.test(host) || /\.(localhost|local|internal)$/.test(host);
  if (url.protocol !== "https:" || local || !host.includes(".") || url.username || url.password || url.port || url.pathname !== "/" || url.search || url.hash)
    throw new Error("SITE_URL doit être une origine HTTPS publique, sans identifiants, port, chemin, paramètres ni fragment.");
  return url.origin;
}

export function pageUrl(path, domain) {
  if (!domain) return undefined;
  if (!String(path).startsWith("/") || String(path).startsWith("//")) throw new Error("Chemin public invalide.");
  const url = new URL(path, domain);
  if (url.origin !== new URL(domain).origin) throw new Error("Le chemin public doit rester sur le domaine du site.");
  url.search = "";
  url.hash = "";
  if (!/\.[a-z\d]+$/i.test(url.pathname)) url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
  return url.href;
}

// Prefer complete sentences; if needed, shorten at a word boundary and say so.
export function conciseDescription(value, fallback, limit = 180) {
  const text = plainText(value ?? "") || plainText(fallback ?? "");
  if (text.length <= limit) return text;
  const sentences = [...text.matchAll(/[.!?](?:[»”"']?)(?=\s|$)/gu)].map((match) => match.index + match[0].length);
  const end = sentences.filter((index) => index >= Math.min(70, limit / 2) && index <= limit).at(-1);
  if (end) return text.slice(0, end);
  const head = text.slice(0, Math.max(1, limit - 1));
  const words = head.slice(0, Math.max(0, head.lastIndexOf(" "))).replace(/[,;:–—\s]+$/, "");
  // One exceptionally long word: use a complete, useful fallback instead.
  return words ? `${words}…` : plainText(fallback ?? "");
}

const projectCopy = {
  olyvia: {
    title: "Olyvia : identité visuelle et interfaces",
    description: "Projet universitaire collectif sur la ménopause : conception de l’identité visuelle d’Olyvia et de ses interfaces pour ordinateur et mobile.",
  },
  bargo: {
    title: "Bargo : identité de marque et interfaces",
    description: "Projet universitaire collectif : identité visuelle et interfaces de Bargo, une plateforme pour organiser des sorties entre amis et préparer le retour.",
  },
  tiktak: {
    title: "TikTak : conception et développement web",
    description: "Projet individuel en BUT MMI : identité visuelle, maquettes, développement et mise en ligne de TikTak, un site de personnalisation de montres connectées.",
  },
  aqita: {
    title: "AQITA : conception éditoriale et design mobile",
    description: "Projet individuel en BUT MMI : conception éditoriale et maquettes mobiles d’AQITA, autour de Marietta Blau et de la reconnaissance des femmes scientifiques.",
  },
  lacimade: {
    title: "La Cimade : proposition de refonte de logo et guide de marque",
    description: "Exercice de création graphique : proposition de refonte du logo de La Cimade et conception d’un guide de marque, sans identité officiellement adoptée.",
  },
};

export function projectSeo(project) {
  const name = plainText(project.titre ?? "") || "Projet";
  const domains = asArray(project.domaines).map((item) => plainText(item)).filter(Boolean);
  const copy = projectCopy[project.slug];
  return {
    title: copy?.title || `${name}${domains.length ? ` : ${domains.slice(0, 2).join(" et ").toLocaleLowerCase("fr")}` : " — projet de création numérique"}`,
    description: copy?.description || conciseDescription(project.introduction, `${name} : découvrez la démarche et les réalisations présentées dans le portfolio de Melvyn Philippon.`),
  };
}

export function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
}

export function sitemapXml(paths, domain) {
  const urls = [...new Set(paths.map((path) => pageUrl(path, validateSiteUrl(domain, { required: true }))))];
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<url><loc>${escapeXml(url)}</loc></url>`).join("")}</urlset>`;
}

export function serializeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}
