import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

test("À propos : animations distinctes, une seule frame de scroll et arrêt en mouvement réduit", async () => {
  const animations = [];
  const frames = new Map();
  const windowEvents = {};
  let observerCallback;
  let preferenceCallback;
  let frameId = 0;
  function node(extra = {}) {
    return {
      dataset: {},
      setAttribute() {},
      animate(keyframes, options) {
        const animation = { keyframes, options, cancelled: false, cancel() { this.cancelled = true; } };
        animations.push(animation);
        return animation;
      },
      ...extra,
    };
  }
  const lines = [node(), node()];
  const image = node();
  const caption = node();
  const steps = [node(), node(), node()];
  const blocks = [
    node({ dataset: { aboutEffect: "lines" }, querySelectorAll: () => lines }),
    node({ dataset: { aboutEffect: "portrait" }, querySelector: (selector) => selector === "img" ? image : caption }),
    node({ dataset: { aboutEffect: "step" }, querySelectorAll: () => steps }),
    node(),
  ];
  const section = node({ id: "about-inspirations", querySelectorAll: () => blocks });
  const properties = new Map();
  const statement = {
    style: { setProperty: (name, value) => properties.set(name, value), removeProperty: (name) => properties.delete(name) },
    getBoundingClientRect: () => ({ top: 100, bottom: 300, height: 200 }),
  };
  const preference = { matches: false, addEventListener: (_name, callback) => { preferenceCallback = callback; } };
  const root = { querySelector: () => statement, querySelectorAll: () => [section] };
  const window = {
    innerHeight: 800,
    matchMedia: (query) => query.includes("reduced") ? preference : { matches: true },
    IntersectionObserver: class {
      constructor(callback) { observerCallback = callback; }
      observe() {}
      unobserve() {}
    },
    addEventListener: (name, callback) => { windowEvents[name] = callback; },
    requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame: (id) => frames.delete(id),
  };
  runInNewContext(await readFile("src/scripts/about-scroll.js", "utf8"), { document: { querySelector: () => root }, window });
  observerCallback([section, ...blocks].map((target) => ({ target, isIntersecting: true })));
  assert.equal(animations.length, 8);
  assert.ok(animations.some((animation) => animation.keyframes[0].clipPath));
  assert.ok(!animations.some((animation) => animation.keyframes[0].backgroundColor), "Le fond reste stable pendant les apparitions");
  assert.ok(animations.some((animation) => animation.options.delay === 190));
  windowEvents.scroll();
  windowEvents.scroll();
  assert.equal(frames.size, 1, "Les impulsions de scroll partagent une seule frame");
  const callbacks = [...frames.values()];
  frames.clear();
  callbacks.forEach((callback) => callback());
  assert.ok(properties.has("--about-drift"));
  preference.matches = true;
  preferenceCallback();
  assert.ok(animations.every((animation) => animation.cancelled));
  assert.equal(properties.has("--about-drift"), false);
  const count = animations.length;
  observerCallback([{ target: blocks[3], isIntersecting: true }]);
  assert.equal(animations.length, count);
  windowEvents.pagehide();
  assert.equal(frames.size, 0);
});
