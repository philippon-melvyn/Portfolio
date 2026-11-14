import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import { __unstable__loadDesignSystem } from "tailwindcss";

const require = createRequire(import.meta.url);

test("Hero bureau : le CSS applique le scroll jusqu’à la pleine largeur", async () => {
  const theme = resolve("src/styles/global.css");
  const design = await __unstable__loadDesignSystem(await readFile(theme, "utf8"), {
    base: dirname(theme),
    loadStylesheet: async (id, base) => {
      const file = id === "tailwindcss" ? require.resolve("tailwindcss/index.css") : resolve(base, id);
      return { path: file, base: dirname(file), content: await readFile(file, "utf8") };
    },
  });
  const component = await readFile("src/components/HomeIntroduction.astro", "utf8");
  const classes = component.match(/<figure\s+class="([^"]+)"/)?.[1].split(/\s+/);
  assert.ok(classes?.length);
  // Use Tailwind's generated rules and cascade order, not the order of class
  // names in the template: the old responsive 50% rule won over the scroll.
  const ordered = design.getClassOrder(classes).filter(([, order]) => order !== null).sort((a, b) => a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0);
  function translateAt(width) {
    let value;
    for (const [name] of ordered) {
      const css = design.candidatesToCss([name])[0];
      if (!css || /@media print/.test(css)) continue;
      const min = css.match(/@media\s*\((?:width\s*>=\s*|min-width:\s*)([\d.]+)px\)/);
      if (min && width < Number(min[1])) continue;
      const declarations = [...css.matchAll(/\btranslate:\s*([^;]+);/g)];
      if (declarations.length) value = declarations.at(-1)[1];
    }
    return value;
  }
  for (const width of [900, 1024, 1440]) {
    const value = translateAt(width);
    assert.ok(value, `Translation absente à ${width}px`);
    for (const slide of [0, 0.5, 1]) {
      const resolved = value.replace(/var\(--intro-slide(?:,\s*0)?\)/g, String(slide));
      let actual;
      if (resolved.startsWith("calc(")) {
        let depth = 1, end = 5;
        for (; depth && end < resolved.length; end++) {
          if (resolved[end] === "(") depth++;
          if (resolved[end] === ")") depth--;
        }
        const arithmetic = resolved.slice(5, end - 1).replace(/%/g, "");
        assert.match(arithmetic, /^[\d\s.+*/()-]+$/);
        actual = runInNewContext(arithmetic, {}, { timeout: 100 });
      } else actual = parseFloat(resolved);
      assert.equal(actual, 50 * (1 - slide), `L’image doit suivre le scroll à ${width}px, progression ${slide}`);
    }
  }
  assert.equal(translateAt(390), undefined, "Le hero mobile reste indépendant du glissement bureau");
});
