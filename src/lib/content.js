export function asArray(value) {
  return Array.isArray(value) ? value : value ? [value] : [];
}

const htmlEntities = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  laquo: "«",
  raquo: "»",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  bull: "•",
  middot: "·",
  euro: "€",
  copy: "©",
  reg: "®",
  agrave: "à",
  acirc: "â",
  auml: "ä",
  aacute: "á",
  atilde: "ã",
  aring: "å",
  aelig: "æ",
  ccedil: "ç",
  eacute: "é",
  egrave: "è",
  ecirc: "ê",
  euml: "ë",
  iacute: "í",
  igrave: "ì",
  icirc: "î",
  iuml: "ï",
  ntilde: "ñ",
  oacute: "ó",
  ograve: "ò",
  ocirc: "ô",
  ouml: "ö",
  otilde: "õ",
  oelig: "œ",
  uacute: "ú",
  ugrave: "ù",
  ucirc: "û",
  uuml: "ü",
  yuml: "ÿ",
  szlig: "ß",
};

export function decodeHtmlEntities(value = "") {
  return String(value).replace(
    /&(#x[\da-f]+|#\d+|[a-z][a-z\d]+);/gi,
    (entity, code) => {
      if (code[0] === "#") {
        const point =
          code[1].toLowerCase() === "x"
            ? parseInt(code.slice(2), 16)
            : Number(code.slice(1));
        return point > 0 &&
          point <= 0x10ffff &&
          !(point >= 0xd800 && point <= 0xdfff)
          ? String.fromCodePoint(point)
          : "\uFFFD";
      }
      if (Object.hasOwn(htmlEntities, code)) return htmlEntities[code];
      const lower = code.toLowerCase();
      // Les noms accentués HTML existent aussi avec leur initiale en majuscule.
      if (
        code[0] !== lower[0] &&
        Object.hasOwn(htmlEntities, lower) &&
        /^[a-z]+(?:grave|acute|circ|uml|tilde|ring|cedil|elig)$/.test(lower)
      )
        return htmlEntities[lower].toUpperCase();
      return entity;
    },
  );
}

export function plainText(value = "") {
  const text = String(value)
    .replace(/<(script|style|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<[^>]*>/g, " ");
  return decodeHtmlEntities(text).replace(/\s+/g, " ").trim();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// L’Editor conserve sa mise en forme simple, sans attributs, scripts, liens ou médias injectés.
// Les champs Text sont affichés directement par Astro, qui les échappe automatiquement.
export function editorHtml(value = "") {
  const allowed = new Set([
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "ul",
    "ol",
    "li",
    "blockquote",
    "h3",
    "h4",
  ]);
  const source = String(value).replace(
    /<(script|style|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,
    "",
  );
  return source
    .split(/(<[^>]*>)/g)
    .map((token) => {
      if (!token.startsWith("<")) {
        return escapeHtml(decodeHtmlEntities(token));
      }
      const tag = token.match(/^<(\/?)([a-z][a-z0-9]*)\b[^>]*>$/i);
      if (!tag || !allowed.has(tag[2].toLowerCase())) return "";
      return `<${tag[1]}${tag[2].toLowerCase()}>`;
    })
    .join("");
}

export function safeLink(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

export function sectionLayout(value) {
  // Valeurs réelles avec espaces ; compatibilité avec les libellés du brief.
  return String(value || "")
    .trim()
    .replace(/\s+/g, "_");
}

export function resolvedSectionLayout(section) {
  const layout = sectionLayout(section.disposition);
  // Cas non ambigu : seules des images pleine largeur sont renseignées.
  const hasColumns =
    section.texte_gauche?.trim() ||
    section.texte_droite?.trim() ||
    asArray(section.image_gauche).length ||
    asArray(section.image_droite).length;
  return !layout && !hasColumns && asArray(section.image_largeur).length
    ? "pleine_largeur"
    : layout;
}
