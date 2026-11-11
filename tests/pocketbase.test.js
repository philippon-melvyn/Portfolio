import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import {
  editorHtml,
  safeLink,
  sectionLayout,
  resolvedSectionLayout,
} from "../src/lib/content.js";

test("PocketBase : pagination, erreurs et relations publiques", async (t) => {
  const requests = [];
  const server = createServer((request, response) => {
    const url = new URL(request.url, "http://localhost");
    requests.push(url);
    response.setHeader("Content-Type", "application/json");
    if (
      url.pathname.includes("/competences/") &&
      url.searchParams.get("sort")?.split(",").includes("ordre")
    ) {
      response
        .writeHead(400)
        .end(JSON.stringify({ message: "Invalid sort field" }));
      return;
    }
    if (url.pathname.includes("/inaccessible/")) {
      response.writeHead(403).end(JSON.stringify({ message: "Forbidden" }));
      return;
    }
    if (url.pathname.includes("/invalide/")) {
      response.end(JSON.stringify({ items: null }));
      return;
    }
    const page = Number(url.searchParams.get("page"));
    response.end(
      JSON.stringify({ items: [{ id: `record-${page}` }], totalPages: 2 }),
    );
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => server.close());
  process.env.POCKETBASE_URL = `http://127.0.0.1:${server.address().port}`;
  const api = await import("../src/lib/pocketbase.js");

  const records = await api.getRecords("pagination");
  assert.equal(records.length, 2);
  assert.equal(requests[1].searchParams.get("page"), "2");
  assert.equal(requests[0].searchParams.get("sort"), "ordre,id");
  await api.getSkills();
  assert.equal(requests.at(-1).searchParams.get("sort"), "titre,id");
  assert.equal(requests.at(-1).searchParams.get("filter"), "publie=true");
  await assert.rejects(api.getRecords("inaccessible"), /HTTP 403/);
  await assert.rejects(
    api.getRecords("invalide"),
    /Réponse PocketBase invalide/,
  );
  assert.equal(
    api.fileUrl({ id: "test", collectionName: "savoirs" }, ""),
    null,
  );
  assert.match(
    api.fileUrl({ id: "test", collectionName: "savoirs" }, "logo test.svg"),
    /logo%20test.svg$/,
  );
  assert.deepEqual(api.imagesFor({}, "image_gauche"), []);
  assert.deepEqual(
    api
      .relatedRecords(
        {
          expand: {
            savoirs: [
              { id: "draft", publie: false, ordre: 0 },
              { id: "second", publie: true, ordre: 2 },
              { id: "first", publie: true, ordre: 1 },
            ],
          },
        },
        "savoirs",
      )
      .map((item) => item.id),
    ["first", "second"],
  );
});

test("Contenus Editor et URL : pas de script ou de protocole exécutable", () => {
  const html = editorHtml(
    '<p onclick="alert(1)">Texte &amp; <strong>gras</strong></p><script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">Lien</a>',
  );
  assert.equal(html, "<p>Texte &amp; <strong>gras</strong></p>Lien");
  assert.equal(safeLink("javascript:alert(1)"), null);
  assert.equal(safeLink(""), null);
  assert.equal(
    safeLink("https://example.org/prototype"),
    "https://example.org/prototype",
  );
  assert.equal(sectionLayout("deux colonnes"), "deux_colonnes");
  assert.equal(sectionLayout("pleine largeur"), "pleine_largeur");
  assert.equal(
    resolvedSectionLayout({ disposition: "", image_largeur: ["a.webp"] }),
    "pleine_largeur",
  );
  assert.equal(
    resolvedSectionLayout({
      disposition: "",
      image_largeur: ["a.webp"],
      texte_gauche: "Texte",
    }),
    "",
  );
  assert.equal(resolvedSectionLayout({ disposition: "inconnue" }), "inconnue");
});
