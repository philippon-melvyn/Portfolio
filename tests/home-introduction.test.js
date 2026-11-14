import { pageScript, pageFunctions } from "./helpers/page-scripts.js";
import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
const { introState } = await pageFunctions("src/pages/index.astro", "home-introduction", ["introState"]);

test("Hero : présentation mobile et effet bureau conservé même en fenêtre basse", async () => {
  const source = await pageScript("src/pages/index.astro", "home-introduction");
  for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1024, 400], [1440, 600]]) {
    const styles = new Map();
    const attributes = new Map();
    const events = {};
    const frames = [];
    const textAttributes = new Map();
    const text = {
      getAttribute: (key) => textAttributes.get(key),
      setAttribute: (key, value) => textAttributes.set(key, value),
      removeAttribute: (key) => textAttributes.delete(key),
      getBoundingClientRect: () => ({ top: 2000 }),
    };
    const root = {
      style: { setProperty: (key, value) => styles.set(key, value), removeProperty: (key) => styles.delete(key) },
      querySelector: () => ({ offsetHeight: 0 }),
      getBoundingClientRect: () => ({ top: -300 }),
      setAttribute: (key, value) => attributes.set(key, value),
      removeAttribute: (key) => attributes.delete(key),
    };
    let mediaChange;
    const desktopExpected = width >= 900;
    const layout = { matches: desktopExpected, addEventListener: (_event, callback) => { mediaChange = callback; } };
    let observerCallback;
    runInNewContext(source, {
      document: { querySelector: () => root, querySelectorAll: () => [text] },
      IntersectionObserver: class {
        constructor(callback) { observerCallback = callback; }
        observe() {} unobserve() {} disconnect() {}
      },
      window: {
        innerWidth: width, innerHeight: height,
        matchMedia: (query) => {
          if (query.includes("prefers-reduced-motion")) return { matches: false, addEventListener() {} };
          const minimumWidth = Number(query.match(/min-width:\s*(\d+)px/)?.[1] || 0);
          const minimumHeight = Number(query.match(/min-height:\s*(\d+)px/)?.[1] || 0);
          layout.matches = width >= minimumWidth && height >= minimumHeight;
          return layout;
        },
        requestAnimationFrame: (callback) => { frames.push(callback); return frames.length; },
        cancelAnimationFrame() {},
        addEventListener: (event, callback) => { events[event] = callback; },
      },
    });
    assert.equal(attributes.has("data-intro-ready"), desktopExpected, `${width}×${height}`);
    assert.equal(styles.size, desktopExpected ? 4 : 0);
    events.scroll();
    assert.equal(frames.length, desktopExpected ? 1 : 0, "Le scroll pilote l’effet uniquement sur les largeurs bureau");
    observerCallback([{ target: text, isIntersecting: true }]);
    assert.equal(textAttributes.get("data-reveal-ready"), "visible");
    layout.matches = true; mediaChange();
    assert.equal(attributes.has("data-intro-ready"), true, "Le mode bureau revient si la fenêtre s’agrandit");
    layout.matches = false; mediaChange();
    assert.equal(attributes.has("data-intro-ready"), false);
    assert.equal(styles.size, 0, "Les transformations sont nettoyées en revenant au mobile");
  }
});

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
  const layout = { matches: true, addEventListener() {} };
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
  const source = (await pageScript("src/pages/index.astro", "home-introduction")).replace(/^\uFEFF?import .*;\r?\n/, "");
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
      matchMedia: (query) => query.includes("prefers-reduced-motion") ? preference : layout,
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
