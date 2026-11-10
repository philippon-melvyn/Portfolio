import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

test("Slider : une impulsion par image, inertie absorbée, retour et sortie sans blocage", async () => {
  let now = 0;
  let scrollY = 1000;
  let nextFrame = 0;
  const frames = new Map();
  const listeners = {};
  const stageListeners = {};
  const panelStyles = Array.from({ length: 4 }, () => new Map());
  const panels = panelStyles.map((styles, i) => ({
    offsetLeft: i * 1200,
    style: { setProperty: (key, value) => styles.set(key, value), removeProperty: (key) => styles.delete(key) },
    contains: () => false,
  }));
  const stage = {
    clientWidth: 1200, offsetHeight: 800, scrollLeft: 0,
    addEventListener: (name, cb) => { stageListeners[name] = cb; },
  };
  const root = {
    style: { setProperty() {}, removeProperty() {} },
    setAttribute() {}, removeAttribute() {},
    querySelector: () => stage, querySelectorAll: () => panels,
    getBoundingClientRect: () => ({ top: 1000 - scrollY }),
  };
  const window = {
    innerHeight: 800,
    get scrollY() { return scrollY; },
    performance: { now: () => now },
    matchMedia: (query) => ({ matches: query.includes("min-width"), addEventListener() {} }),
    addEventListener: (name, cb) => { listeners[name] = cb; },
    requestAnimationFrame: (cb) => { frames.set(++nextFrame, cb); return nextFrame; },
    cancelAnimationFrame: (id) => frames.delete(id),
    scrollTo: ({ top }) => { scrollY = top; },
  };
  runInNewContext(await readFile("src/scripts/home-projects.js", "utf8"), { window, document: { querySelector: () => root } });
  function advance(duration) {
    const end = now + duration;
    while (now < end) {
      now = Math.min(now + 16, end);
      const batch = [...frames.values()]; frames.clear();
      batch.forEach((cb) => cb(now));
    }
  }
  function wheel(deltaY) {
    let prevented = false;
    stageListeners.wheel({ deltaY, deltaX: 0, preventDefault() { prevented = true; } });
    return prevented;
  }
  assert.equal(wheel(80), true);
  advance(250);
  assert.ok(scrollY > 1000 && scrollY < 2200);
  for (let i = 0; i < 5; i++) { assert.equal(wheel(12), true); advance(20); }
  advance(900);
  assert.equal(scrollY, 2200, "Une rafale ne saute pas le deuxième écran");
  assert.equal(panelStyles[1].get("--home-panel-x"), "0px");
  assert.equal(wheel(80), true);
  advance(1250);
  assert.equal(scrollY, 3400);
  assert.equal(wheel(-80), true);
  advance(1250);
  assert.equal(scrollY, 2200, "Le retour termine exactement sur une image entière");
  wheel(80); advance(1250);
  wheel(80); advance(1250);
  assert.equal(scrollY, 4600);
  assert.equal(panelStyles[3].get("--home-panel-x"), "0px");
  assert.equal(wheel(80), false, "Le panneau final laisse sortir de la séquence");
  advance(20);
  assert.equal(wheel(80), false, "Les impulsions suivantes restent libres");
  wheel(-80); advance(200);
  listeners.pagehide();
  const stoppedAt = scrollY;
  advance(1500);
  assert.equal(scrollY, stoppedAt, "La sortie de page annule le mouvement");
});
