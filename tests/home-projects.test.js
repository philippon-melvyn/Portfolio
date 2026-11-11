import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

async function setup() {
  const events = {};
  const stageEvents = {};
  const styles = new Map();
  const trackStyles = new Map();
  const attributes = new Map();
  const frames = new Map();
  let nextFrame = 0;
  let scrollY = 1000;
  let preferenceChanged;
  const reduced = { matches: false, addEventListener(_event, cb) { preferenceChanged = cb; } };
  const panels = Array.from({ length: 4 }, (_, index) => ({ offsetLeft: index * 1200, contains: (target) => target === index }));
  const stage = {
    clientWidth: 1200, offsetHeight: 800, scrollLeft: 0,
    addEventListener: (event, cb) => { stageEvents[event] = cb; },
    scrollTo: ({ left }) => { stage.scrollLeft = left; },
  };
  const track = { style: { setProperty: (key, value) => trackStyles.set(key, value), removeProperty: (key) => trackStyles.delete(key) } };
  const root = {
    style: { setProperty: (key, value) => styles.set(key, value), removeProperty: (key) => styles.delete(key) },
    setAttribute: (key, value) => attributes.set(key, value), removeAttribute: (key) => attributes.delete(key),
    querySelector: (selector) => selector.includes("stage") ? stage : track,
    querySelectorAll: () => panels,
    getBoundingClientRect: () => ({ top: 1000 - scrollY }),
  };
  runInNewContext(await readFile("src/scripts/home-projects.js", "utf8"), {
    document: { querySelector: () => root },
    window: {
      get scrollY() { return scrollY; },
      matchMedia: (query) => query.includes("min-width") ? { matches: true, addEventListener() {} } : reduced,
      addEventListener: (event, cb) => { events[event] = cb; },
      requestAnimationFrame: (cb) => { frames.set(++nextFrame, cb); return nextFrame; },
      cancelAnimationFrame: (id) => frames.delete(id),
      scrollTo: ({ top }) => { scrollY = top; },
    },
  });
  function flush() { const batch = [...frames.values()]; frames.clear(); batch.forEach((cb) => cb()); }
  function scrollTo(top) { scrollY = top; events.scroll(); flush(); }
  return { events, stageEvents, styles, trackStyles, attributes, frames, stage, reduced, flush, scrollTo,
    reduce: () => { reduced.matches = true; preferenceChanged(); },
    get scrollY() { return scrollY; },
  };
}

test("Accueil : carrousel lateral direct, sans animation autonome ni interception de la molette", async () => {
  const view = await setup();
  assert.equal(view.styles.get("height"), "4400px");
  assert.equal(view.events.wheel, undefined);
  assert.equal(view.stageEvents.wheel, undefined);
  view.scrollTo(1300);
  assert.equal(view.trackStyles.get("transform"), "translate3d(-300px, 0, 0)");
  assert.equal(view.frames.size, 0, "Aucun mouvement ne continue apres le scroll");
  view.scrollTo(1600);
  assert.equal(view.trackStyles.get("transform"), "translate3d(-600px, 0, 0)");
  view.scrollTo(1400);
  assert.equal(view.trackStyles.get("transform"), "translate3d(-400px, 0, 0)", "Le retour suit immediatement le scroll");
  view.scrollTo(4900);
  assert.equal(view.trackStyles.get("transform"), "translate3d(-3600px, 0, 0)");
  assert.equal(view.scrollY, 4900, "La sortie reste libre");
});

test("Accueil : clavier, focus, mouvement reduit et nettoyage", async () => {
  const view = await setup();
  view.stageEvents.keydown({ key: "End", preventDefault() {} });
  assert.equal(view.scrollY, 4600);
  view.stageEvents.focusin({ target: 1 });
  assert.equal(view.scrollY, 2200);
  view.events.scroll();
  view.events.pagehide();
  assert.equal(view.frames.size, 0);
  view.reduce();
  assert.equal(view.attributes.has("data-horizontal-ready"), false);
  assert.equal(view.styles.size, 0);
  assert.equal(view.trackStyles.size, 0);
  view.stageEvents.keydown({ key: "ArrowRight", preventDefault() {} });
  assert.equal(view.stage.scrollLeft, 1200);
});
