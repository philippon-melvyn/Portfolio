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
  "Astro : contenu dans Projets, galerie, relations et champs facultatifs",
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
    const publicSkill = { id: "skill-public", titre: "Concevoir une interface de test", categorie: "technique ", publie: true };
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
      duree: "Trois semaines",
      contexte: "<strong>Texte brut à échapper</strong>\nDeuxième ligne",
      objectifs: "Objectifs de test",
      role: "Conception de test",
      equipe: "   ",
      recherche: "Recherche de test",
      realisation: "Réalisation de test",
      choix_technique: "Choix technique de test",
      galerie: ["cover-copy.webp", "gallery-a.webp", "gallery-a.webp", "gallery-b.webp", "gallery-b-copy.webp"],
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
    const minimalProject = {
      id: "minimalproject1",
      collectionName: "Projets",
      titre: "Projet minimal",
      slug: "projet-minimal",
      publie: true,
      domaines: [],
      annee: 0,
      introduction: null,
      contexte: null,
      objectifs: "   ",
      galerie: [],
      expand: {},
    };
    const media = await readFile("public/images/portrait.webp");
    const galleryA = await readFile("tests/fixtures/architecture-detail.webp");
    const galleryB = await readFile("tests/fixtures/architecture-tower.webp");
    const linkImage = await readFile("tests/fixtures/red-fabric.webp");
    const requests = [];
    const server = createServer((request, response) => {
      const url = new URL(request.url, "http://localhost");
      requests.push(url);
      if (url.pathname.startsWith("/api/files/")) {
        const filename = url.pathname.split("/").at(-1);
        const image = filename === "gallery-a.webp" ? galleryA
          : ["gallery-b.webp", "gallery-b-copy.webp"].includes(filename) ? galleryB
          : filename === "link.webp" ? linkImage : media;
        response.writeHead(200, {
          "Content-Type": "image/webp",
          "Content-Length": image.length,
        });
        response.end(image);
        return;
      }
      const collection = url.pathname.split("/")[3];
      const items =
        collection === "Projets"
          ? [project, minimalProject]
          : collection === "savoirs"
            ? [publicKnowledge]
            : collection === "competences"
              ? [publicSkill]
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
    for (const field of ["duree", "objectifs", "role", "recherche", "realisation", "choix_technique"]) {
      assert.ok(html.includes(project[field]), field);
    }
    assert.ok(!html.includes('id="project-equipe"'));
    assert.equal((html.match(/class="project-process-note /g) || []).length, 3);
    assert.ok(html.includes('class="project-opening '));
    assert.ok(html.includes('class="project-lead-image '));
    assert.ok(html.includes('class="project-image-grid '));
    assert.ok(html.indexOf('class="project-lead-image ') < html.indexOf('class="project-image-grid '));
    assert.ok(html.includes("visuel 2 sur 2"));
    assert.ok(!html.includes("visuel 3 sur"));
    assert.equal((html.match(/class="project-gallery-image /g) || []).length, 1, "Les fichiers identiques sont affichés une seule fois, même renommés");
    assert.ok(requests.some((url) => url.pathname === "/api/files/Projets/testproject0001/gallery-a.webp"));
    assert.ok(html.includes("Savoir de test"));
    assert.ok(!html.includes("Savoir brouillon masqué"));
    assert.ok(!html.includes("Compétences mobilisées"));
    assert.ok(html.includes("https://example.org/prototype"));
    assert.ok(!html.includes("https://example.org/incomplet"));
    assert.match(html, /srcset=/);
    assert.match(html, /width="1124" height="1231"/);
    assert.ok(html.includes("project-cover-verification-automatique"));
    const minimalHtml = await readFile(resolve(directory, "projets/projet-minimal/index.html"), "utf8");
    assert.ok(minimalHtml.includes("Projet minimal"));
    assert.ok(minimalHtml.includes("project-opening-no-story"));
    assert.ok(minimalHtml.includes("project-opening-no-cover"));
    for (const className of ["project-story", "project-category", "project-facts", "project-composition", "project-lead-image", "project-credits", "project-resources"]) {
      assert.ok(!new RegExp(`class="${className}(?:\\s|")`).test(minimalHtml), className);
    }
    const galleryHtml = await readFile(
      resolve(directory, "projets/index.html"),
      "utf8",
    );
    assert.ok(/class="[^"]*\bprojects-screen\b/.test(galleryHtml));
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
    const homeGallery = homeHtml.slice(
      homeHtml.indexOf('<section class="home-project-gallery'),
      homeHtml.indexOf('</section>', homeHtml.indexOf('<section class="home-project-gallery')),
    );
    assert.ok(homeGallery.includes('/projets/verification-automatique/'));
    assert.ok(homeGallery.includes('home-project-verification-automatique'));
    assert.ok(!homeGallery.includes('Ces projets ont enrichi mes compétences'));
    assert.ok(homeHtml.includes('class="home-project-summary '));
    assert.ok(homeHtml.includes('Au fil des expériences'));
    assert.ok(homeHtml.indexOf('class="home-project-summary ') > homeHtml.indexOf(homeGallery));
    const expertise = homeHtml.slice(homeHtml.indexOf('<section class="expertise '), homeHtml.indexOf('<footer'));
    assert.ok(expertise.includes(publicSkill.titre));
    assert.ok(expertise.includes(publicKnowledge.nom));
    assert.ok(!expertise.includes('<img'));
    assert.ok(!homeHtml.includes('href="tel:'));
    assert.ok(!homeHtml.includes('>Accueil</a>'));
    const footer = homeHtml.slice(homeHtml.indexOf('<footer'));
    assert.ok(!footer.includes('Étudiant en BUT MMI,'));
    assert.ok(!footer.includes('Création numérique · Design graphique'));
    assert.ok(!homeGallery.includes('<button'));
    assert.ok(!homeGallery.includes('Tous les projets'));
    assert.ok(!homeGallery.includes('Mes projets'));
    assert.ok(!homeHtml.includes('split-main home-summary'));
    assert.ok(!homeGallery.includes('home-project-caption'));
    assert.ok(
      requests
        .filter((url) => url.pathname.includes("/api/collections/Projets/"))
        .every((url) => url.searchParams.get("filter") === "publie=true"),
    );
    assert.ok(!requests.some((url) => url.pathname.includes("/sections_projet/")));
    const sitemap = await readFile(resolve(directory, "sitemap.xml"), "utf8");
    assert.ok(
      sitemap.includes(
        "https://portfolio.example.org/projets/verification-automatique/",
      ),
    );
  },
);
