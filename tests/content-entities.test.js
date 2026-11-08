import test from "node:test";
import assert from "node:assert/strict";
import {
  plainText,
  editorHtml,
  decodeHtmlEntities,
} from "../src/lib/content.js";

test("Texte PocketBase : décoder les accents français et les apostrophes HTML", () => {
  assert.equal(
    plainText(
      "<p>Dans le cadre d&rsquo;un projet, nous avons &eacute;tudi&eacute; la m&eacute;nopause selon les g&eacute;n&eacute;rations : les plus &acirc;g&eacute;es.</p>",
    ),
    "Dans le cadre d’un projet, nous avons étudié la ménopause selon les générations : les plus âgées.",
  );
  assert.equal(
    decodeHtmlEntities(
      "&Eacute;lodie &agrave; No&euml;l : &#233; &#x153; &#8217; &amp;",
    ),
    "Élodie à Noël : é œ ’ &",
  );
  assert.equal(decodeHtmlEntities("&#1114112; &#xD800;"), "� �");
});

test("Editor : décoder les caractères puis échapper les balises encodées", () => {
  assert.equal(
    editorHtml("<p>L&rsquo;&eacute;t&eacute; &amp; l&rsquo;hiver.</p>"),
    "<p>L’été &amp; l’hiver.</p>",
  );
  const html = editorHtml(
    "<p>&lt;img src=x onerror=alert(1)&gt; &quot;Bonjour&quot;</p>",
  );
  assert.ok(!html.includes("<img"));
  assert.ok(html.includes("&lt;img"));
  assert.ok(html.includes("&quot;Bonjour&quot;"));
});
