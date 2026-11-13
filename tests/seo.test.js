import test from "node:test";
import assert from "node:assert/strict";
import { validateSiteUrl, pageUrl, conciseDescription, projectSeo, escapeXml, sitemapXml, serializeJsonLd } from "../src/lib/seo.js";

const domain = "https://portfolio.melvyn-philippon.fr";

test("SEO : domaine de production obligatoire, HTTPS public et sans chemin", () => {
  assert.equal(validateSiteUrl(""), undefined);
  assert.equal(validateSiteUrl(` ${domain}/ `), domain);
  for (const value of ["", "invalid", "http://example.org", "https://localhost", "https://127.0.0.1", "https://10.0.0.1", "https://[::1]", `${domain}/sous-dossier`, `${domain}?a=1`, `${domain}#fragment`, "https://user:secret@example.org", "https://example.org:8443"])
    assert.throws(() => validateSiteUrl(value, { required: true }), /SITE_URL/);
});

test("SEO : URL canonique sans paramètres, slash final et ressources conservées", () => {
  assert.equal(pageUrl("/projets/olyvia?utm_source=test#galerie", domain), `${domain}/projets/olyvia/`);
  assert.equal(pageUrl("/", domain), `${domain}/`);
  assert.equal(pageUrl("/sitemap.xml", domain), `${domain}/sitemap.xml`);
  assert.equal(pageUrl("/_astro/photo.jpg", domain), `${domain}/_astro/photo.jpg`);
  assert.equal(pageUrl("/", undefined), undefined);
  assert.throws(() => pageUrl("//other.example.org/", domain));
  assert.throws(() => pageUrl("/\\other.example.org/", domain));
});

test("SEO : descriptions propres, complètes et repli sans valeur vide", () => {
  const fallback = "Découvrez le projet et sa démarche graphique.";
  assert.equal(conciseDescription('<p>Identit&eacute;&nbsp;visuelle &amp; interfaces.</p><script>alert(1)</script>', fallback), "Identité visuelle & interfaces.");
  for (const value of [null, undefined, "", "<p> </p>"]) assert.equal(conciseDescription(value, fallback), fallback);
  const sentence = "Ce projet présente une identité visuelle et une interface conçues dans un cadre universitaire.";
  assert.equal(conciseDescription(`${sentence} ${"Une autre phrase beaucoup plus longue. ".repeat(9)}`, fallback, 110), sentence);
  const shortened = conciseDescription("Une démarche de conception graphique détaillée ".repeat(10), fallback, 100);
  assert.ok(shortened.length <= 100);
  assert.ok(shortened.endsWith("…"));
  assert.ok(!shortened.includes("undefined"));
  assert.equal(conciseDescription("x".repeat(300), fallback), fallback);
});

test("SEO : projets actuels fidèles et futurs projets sans configuration obligatoire", () => {
  const cimade = projectSeo({ titre: "La Cimade", slug: "lacimade" });
  assert.match(cimade.title, /proposition de refonte/i);
  assert.match(cimade.description, /Exercice/);
  assert.match(projectSeo({ titre: "AQITA", slug: "aqita" }).title, /design mobile/);
  const future = projectSeo({ titre: "Nouveau projet", slug: "nouveau", domaines: ["Identité de marque"], introduction: "<p>Une démarche graphique documentée.</p>" });
  assert.equal(future.title, "Nouveau projet : identité de marque");
  assert.equal(future.description, "Une démarche graphique documentée.");
  assert.ok(projectSeo({ titre: "Projet minimal" }).description.includes("Projet minimal"));
});

test("SEO : XML échappé, URL dédupliquées et domaine requis pour le sitemap", () => {
  assert.equal(escapeXml(`&<>"'`), "&amp;&lt;&gt;&quot;&apos;");
  const xml = sitemapXml(["/", "/projets/test", "/projets/test/", "/projets/arts&design/"], domain);
  assert.equal((xml.match(/<loc>/g) || []).length, 3);
  assert.ok(xml.includes("arts&amp;design/"));
  assert.throws(() => sitemapXml(["/"], ""), /SITE_URL/);
});

test("SEO : JSON-LD valide sans fermeture de script injectée", () => {
  const data = { name: '</script><script>alert("x")</script>', description: "Texte\u2028suite\u2029fin" };
  const serialized = serializeJsonLd(data);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), data);
});
