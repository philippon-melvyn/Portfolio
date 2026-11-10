import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { introState } from "../src/lib/home-introduction.js";

test("Accueil : nom à gauche puis glissement de la texture sans zoom", () => {
  assert.equal(introState(0).nameOpacity, 1);
  assert.ok(introState(0).nameX === 0);
  assert.equal(introState(0).slide, 0);
  assert.equal(introState(.4).nameOpacity, 0);
  assert.equal(introState(.4).nameX, -48);
  assert.equal(introState(.54).slide, .5);
  assert.equal(introState(1).slide, 1);
  assert.deepEqual(introState(-1), introState(0));
  assert.deepEqual(introState(3), introState(1));
  let previous = 0;
  for (let p = 0; p <= 1; p += .01) {
    assert.ok(introState(p).slide >= previous);
    previous = introState(p).slide;
  }
});

test("Accueil : retour du scroll, une frame par rafale, restauration et mouvement réduit", async () => {
  const styles = new Map();
  const attributes = new Map();
  const frames = new Map();
  const listeners = {};
  let changePreference;
  let top = 0;
  let frameId = 0;
  const textAttributes = new Map();
  const text = {
    setAttribute: (key, value) => textAttributes.set(key, value),
    getAttribute: (key) => textAttributes.get(key),
    removeAttribute: (key) => textAttributes.delete(key),
    getBoundingClientRect: () => ({ top: 1500 }),
  };
  let reveal;
  const observed = new Set();
  const root = {
    style: { setProperty: (key, value) => styles.set(key, value), removeProperty: (key) => styles.delete(key) },
    setAttribute: (key, value) => attributes.set(key, value),
    removeAttribute: (key) => attributes.delete(key),
    getBoundingClientRect: () => ({ top }),
    querySelector: () => ({ offsetHeight: 1100, getBoundingClientRect: () => ({ width: 100 }) }),
  };
  const preference = { matches: false, addEventListener: (_event, callback) => { changePreference = callback; } };
  const source = (await readFile("src/scripts/home-introduction.js", "utf8")).replace(/^\uFEFF?import .*;\r?\n/, "");
  runInNewContext(source, {
    introState,
    IntersectionObserver: class {
      constructor(callback) { reveal = callback; }
      observe(target) { observed.add(target); }
      unobserve(target) { observed.delete(target); }
      disconnect() { observed.clear(); }
    },
    document: { querySelector: () => root, querySelectorAll: () => [text] },
    window: {
      innerWidth: 1440,
      innerHeight: 1000,
      matchMedia: () => preference,
      addEventListener: (type, callback) => { listeners[type] = callback; },
      requestAnimationFrame: (callback) => { frames.set(++frameId, callback); return frameId; },
      cancelAnimationFrame: (id) => frames.delete(id),
    },
  });
  function flush() { const batch = [...frames.values()]; frames.clear(); batch.forEach((callback) => callback()); }
  assert.equal(styles.get("--intro-slide"), "0");
  assert.equal(observed.has(text), true);
  reveal([{ target: text, isIntersecting: true }]);
  assert.equal(textAttributes.get("data-reveal-ready"), "visible");
  assert.equal(observed.size, 0);
  top = -594;
  listeners.scroll();
  listeners.scroll();
  assert.equal(frames.size, 1);
  flush();
  assert.ok(Math.abs(Number(styles.get("--intro-slide")) - .5) < .0001);
  assert.equal(styles.get("--intro-name-opacity"), "0");
  top = -2200;
  listeners.scroll();
  flush();
  assert.equal(styles.get("--intro-slide"), "1");
  top = 0;
  listeners.scroll();
  flush();
  assert.equal(styles.get("--intro-slide"), "0");
  assert.equal(styles.get("--intro-name-opacity"), "1");
  preference.matches = true;
  changePreference();
  assert.equal(attributes.has("data-intro-ready"), false);
  assert.equal(styles.size, 0);
  assert.equal(textAttributes.has("data-reveal-ready"), false);
  listeners.scroll();
  assert.equal(frames.size, 0);
  preference.matches = false;
  top = -1100;
  changePreference();
  assert.equal(styles.get("--intro-slide"), "1");
  listeners.scroll();
  listeners.pagehide();
  assert.equal(frames.size, 0);
  top = 0;
  listeners.pageshow();
  assert.equal(styles.get("--intro-slide"), "0");
});
