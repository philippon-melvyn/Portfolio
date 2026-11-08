import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

// Données synthétiques réservées au test. Aucun enregistrement n’est créé dans PocketBase.
// La construction de test est isolée dans .astro/verification/, jamais dans dist/.
test(
  "Astro : page dynamique, sections, images et champs facultatifs",
  { timeout: 60000 },
  async (t) => {
    const projectId = "testproject0001";
    const publicKnowledge = {
      id: "savoir-public",
      collectionName: "savoirs",
      nom: "Savoir de test",
      logo: "logo.webp",
      publie: true,
      ordre: 1,
    };
    const project = {
      id: projectId,
      collectionName: "Projets",
      titre: "Projet synthétique réservé au test",
      slug: "verification-automatique",
      publie: true,
      annee: 2026,
      domaines: ["Conception numérique"],
      couverture: "cover.webp",
      couverture_alt: "Couverture de test",
      introduction:
        "<p>Introduction <strong>formatée</strong></p><script>alert(1)</script>",
      liens_libelle_1: "Prototype de test",
      liens_url_1: "https://example.org/prototype",
      liens_img_1: "link.webp",
      liens_libelle_2: "",
      liens_url_2: "https://example.org/incomplet",
      expand: {
        savoirs: [
          publicKnowledge,
          { id: "draft", nom: "Savoir brouillon masqué", publie: false },
        ],
        competences: [],
      },
    };
    const sections = [
      {
        id: "testsection0001",
        collectionName: "sections_projet",
        projet: projectId,
        ordre: 1,
        disposition: "deux colonnes",
        titre: "Première section de test",
        texte_gauche: "<strong>Texte brut à échapper</strong>",
        texte_droite: "",
        image_gauche: [],
        image_droite: ["right-a.webp", "right-b.webp"],
        description_images: "Galerie de test",
      },
      {
        id: "testsection0002",
        collectionName: "sections_projet",
        projet: projectId,
        ordre: 2,
        disposition: "pleine largeur",
        titre: "Deuxième section de test",
        image_largeur: ["full-a.webp", "full-b.webp"],
      },
      {
        id: "testsection0003",
        collectionName: "sections_projet",
        projet: projectId,
        ordre: 3,
        disposition: "deux colonnes",
        titre: "",
        texte_gauche: "",
        texte_droite: "",
        image_gauche: [],
        image_droite: [],
      },
    ];
    const media = await readFile("public/images/portrait.webp");
    const requests = [];
    const server = createServer((request, response) => {
      const url = new URL(request.url, "http://localhost");
      if (url.pathname.startsWith("/api/files/")) {
        response.writeHead(200, {
          "Content-Type": "image/webp",
          "Content-Length": media.length,
        });
        response.end(media);
        return;
      }
      requests.push(url);
      const collection = url.pathname.split("/")[3];
      const items =
        collection === "Projets"
          ? [project]
          : collection === "sections_projet"
            ? sections
            : collection === "savoirs"
              ? [publicKnowledge]
              : [];
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          items,
          page: 1,
          perPage: 100,
          totalItems: items.length,
          totalPages: items.length ? 1 : 0,
        }),
      );
    });
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    t.after(() => server.close());
    const directory = resolve(".astro/verification");
    const child = spawn(
      process.execPath,
      ["node_modules/astro/bin/astro.mjs", "build", "--outDir", directory],
      {
        env: {
          ...process.env,
          POCKETBASE_URL: `http://127.0.0.1:${server.address().port}`,
          SITE_URL: "https://portfolio.example.org",
        },
        windowsHide: true,
      },
    );
    t.after(() => {
      if (child.exitCode === null) child.kill();
    });
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk;
    });
    child.stderr.on("data", (chunk) => {
      output += chunk;
    });
    const [code] = await once(child, "exit");
    assert.equal(code, 0, output);
    const html = await readFile(
      resolve(directory, "projets/verification-automatique/index.html"),
      "utf8",
    );
    assert.ok(html.includes("<strong>formatée</strong>"));
    assert.ok(!html.includes("alert(1)"));
    assert.ok(
      html.includes("&lt;strong&gt;Texte brut à échapper&lt;/strong&gt;"),
    );
    assert.ok(
      html.indexOf("Première section de test") <
        html.indexOf("Deuxième section de test"),
    );
    assert.equal(
      (html.match(/class="case-section"/g) || []).length,
      2,
      "La section vide doit disparaître",
    );
    assert.ok(html.includes("Galerie de test — visuel 2 sur 2"));
    assert.ok(html.includes("Savoir de test"));
    assert.ok(!html.includes("Savoir brouillon masqué"));
    assert.ok(!html.includes("Compétences mobilisées"));
    assert.ok(html.includes("https://example.org/prototype"));
    assert.ok(!html.includes("https://example.org/incomplet"));
    assert.match(html, /srcset=/);
    assert.match(html, /width="1124" height="1231"/);
    assert.ok(html.includes("project-cover-verification-automatique"));
    const galleryHtml = await readFile(
      resolve(directory, "projets/index.html"),
      "utf8",
    );
    assert.ok(galleryHtml.includes('class="projects-screen"'));
    assert.ok(galleryHtml.includes("data-project-browser"));
    assert.ok(galleryHtml.includes('data-project-axis="vertical"'));
    assert.ok(!galleryHtml.includes("data-project-autoplay"));
    assert.ok(!galleryHtml.includes("data-project-previous"));
    assert.ok(!galleryHtml.includes("data-project-next"));
    assert.ok(
      galleryHtml.includes('data-project-detail="verification-automatique"'),
    );
    assert.ok(galleryHtml.includes("data-project-domain"));
    assert.match(galleryHtml, /<details[^>]*data-project-filters[^>]*>/);
    assert.ok(
      !/<details[^>]*\sopen(?:\s|>)/.test(galleryHtml),
      "Les filtres et le menu doivent être fermés initialement",
    );
    assert.ok(galleryHtml.includes("hamburger-trigger"));
    assert.ok(!galleryHtml.includes('class="desktop-nav"'));
    assert.ok(galleryHtml.includes("project-cover-verification-automatique"));
    assert.ok(
      !galleryHtml.includes("<footer"),
      "La galerie plein écran ne doit pas ajouter un footer en dessous",
    );
    const homeHtml = await readFile(resolve(directory, "index.html"), "utf8");
    assert.ok(homeHtml.includes("home-project-gallery"));
    assert.ok(homeHtml.includes('data-project-axis="horizontal"'));
    assert.ok(homeHtml.includes("home-project-tile"));
    assert.ok(
      requests
        .filter((url) => url.pathname.includes("/Projets/"))
        .every((url) => url.searchParams.get("filter") === "publie=true"),
    );
    assert.ok(
      requests
        .filter((url) => url.pathname.includes("/sections_projet/"))
        .every(
          (url) => url.searchParams.get("filter") === `projet="${projectId}"`,
        ),
    );
    const sitemap = await readFile(resolve(directory, "sitemap.xml"), "utf8");
    assert.ok(
      sitemap.includes(
        "https://portfolio.example.org/projets/verification-automatique/",
      ),
    );
  },
);
