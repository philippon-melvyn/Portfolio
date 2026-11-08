import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

test("Transition menu : raccord avant affichage uniquement pour la destination, une seule fois", async () => {
  const component = await readFile("src/components/MenuTransition.astro", "utf8");
  const source = component.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
  for (const [path, expires, reduced, expected] of [
    ["/projets/", 13000, false, true],
    ["/contact/", 13000, false, false],
    ["/projets/", 100, false, false],
    ["/projets/", 13000, true, false],
  ]) {
    const html = { dataset: {} };
    const storage = new Map([["portfolio-menu-transition", JSON.stringify({ path, expires })]]);
    runInNewContext(source, {
      document: { documentElement: html },
      location: { pathname: "/projets/", search: "" },
      Date: { now: () => 1000 },
      Number,
      sessionStorage: { getItem: (key) => storage.get(key), removeItem: (key) => storage.delete(key) },
      matchMedia: () => ({ matches: reduced }),
      addEventListener() {}, setTimeout() {},
    });
    assert.equal(html.dataset.menuArrival === "pending", expected);
    assert.equal(storage.size, 0);
  }
});

test("Transition menu : lever le rideau sur le contenu et nettoyer au retour arrière", async () => {
  const animations = [];
  const nodes = new Set();
  const frames = [];
  const listeners = {};
  const preference = { matches: false, addEventListener() {} };
  function element() {
    return {
      setAttribute() {},
      remove() { nodes.delete(this); },
      animate(keyframes, options) {
        const animation = { keyframes, options, cancelled: false, cancel() { this.cancelled = true; } };
        animations.push(animation);
        return animation;
      },
    };
  }
  const html = { dataset: { menuArrival: "pending" } };
  const main = element();
  runInNewContext(await readFile("src/scripts/menu-arrival.js", "utf8"), {
    document: {
      documentElement: html,
      body: { append: (node) => nodes.add(node) },
      createElement: element,
      querySelector: () => main,
      querySelectorAll: () => [],
    },
    window: {
      matchMedia: () => preference,
      setTimeout() {},
      requestAnimationFrame: (callback) => frames.push(callback),
      addEventListener: (type, callback) => { listeners[type] = callback; },
    },
  });
  assert.equal(nodes.size, 1, "Le rideau couvre la page avant son animation");
  assert.equal(html.dataset.menuArrival, undefined);
  await new Promise((resolve) => setImmediate(resolve));
  frames.forEach((callback) => callback());
  assert.equal(animations.length, 2);
  assert.equal(animations[0].keyframes[1].transform, "translateY(-101%)");
  animations[0].onfinish();
  assert.equal(nodes.size, 0);
  listeners.pagehide();
  assert.ok(animations.every((animation) => animation.cancelled));
});
