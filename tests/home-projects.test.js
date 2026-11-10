import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

test("Accueil : trois écrans de projets puis bilan rouge, scroll réversible et sortie libre", async () => {
  const events = {};
  const stageEvents = {};
  const rootStyles = new Map();
  const trackStyles = new Map();
  const attributes = new Map();
  const frames = new Map();
  const desktop = { matches: true, addEventListener() {} };
  let preferenceChanged;
  const reduced = { matches: false, addEventListener(_event, cb) { preferenceChanged = cb; } };
  let top = 0;
  let nextFrame = 0;
  const panelStyles = Array.from({ length: 4 }, () => new Map());
  const panels = Array.from({ length: 4 }, (_, index) => ({
    offsetLeft: index * 1200,
    contains: (target) => target === index,
    style: { setProperty: (key, value) => panelStyles[index].set(key, value), removeProperty: (key) => panelStyles[index].delete(key) },
  }));
  const track = { scrollWidth: 4800, style: { setProperty: (key, value) => trackStyles.set(key, value), removeProperty: (key) => trackStyles.delete(key) } };
  const stage = {
    clientWidth: 1200, offsetHeight: 800, scrollLeft: 0,
    addEventListener: (event, cb) => { stageEvents[event] = cb; },
    scrollTo: ({ left }) => { stage.scrollLeft = left; },
  };
  const root = {
    style: { setProperty: (key, value) => rootStyles.set(key, value), removeProperty: (key) => rootStyles.delete(key) },
    setAttribute: (key, value) => attributes.set(key, value),
    removeAttribute: (key) => attributes.delete(key),
    querySelector: (selector) => selector.includes("stage") ? stage : track,
    querySelectorAll: () => panels,
    getBoundingClientRect: () => ({ top }),
  };
  let scrolledTo;
  let horizontalDelta;
  runInNewContext(await readFile("src/scripts/home-projects.js", "utf8"), {
    document: { querySelector: () => root },
    window: {
      innerHeight: 800, scrollY: 4000,
      performance: { now: () => 0 },
      matchMedia: (query) => query.includes("min-width") ? desktop : reduced,
      addEventListener: (event, cb) => { events[event] = cb; },
      requestAnimationFrame: (cb) => { frames.set(++nextFrame, cb); return nextFrame; },
      cancelAnimationFrame: (id) => frames.delete(id),
      scrollTo: (options) => { scrolledTo = options.top; },
      scrollBy: (options) => { horizontalDelta = options.top; },
    },
  });
  function flush() { const batch = [...frames.values()]; frames.clear(); batch.forEach((cb) => cb()); }
  assert.equal(rootStyles.get("height"), "5000px");
  assert.equal(panelStyles[0].get("--home-panel-x"), "0px");
  assert.equal(panelStyles[1].get("--home-panel-x"), "1200px");
  top = -300;
  events.scroll(); flush();
  const startDistance = 1200 - parseFloat(panelStyles[1].get("--home-panel-x"));
  assert.ok(startDistance > 0 && startDistance < 180, "Départ lent sur le premier quart du scroll");
  top = -600;
  events.scroll(); flush();
  assert.equal(panelStyles[0].get("--home-panel-x"), "0px", "La première image reste immobile");
  assert.equal(panelStyles[1].get("--home-panel-x"), "600px", "La suivante vient recouvrir la première");
  assert.equal(panelStyles[2].get("--home-panel-x"), "1200px");
  top = -900;
  events.scroll(); flush();
  const remaining = parseFloat(panelStyles[1].get("--home-panel-x"));
  assert.ok(remaining > 0 && remaining < 180, "Freinage progressif sur le dernier quart");
  assert.ok(Math.abs(remaining - startDistance) < .01, "Accélération et freinage équilibrés");
  top = -300;
  events.scroll(); flush();
  assert.ok(Math.abs(1200 - parseFloat(panelStyles[1].get("--home-panel-x")) - startDistance) < .01, "Même courbe au retour arrière");
  top = -2400;
  events.scroll(); events.scroll();
  assert.equal(frames.size, 1);
  flush();
  assert.equal(panelStyles[0].get("--home-panel-x"), "0px");
  assert.equal(panelStyles[1].get("--home-panel-x"), "0px");
  assert.equal(panelStyles[2].get("--home-panel-x"), "0px");
  assert.equal(panelStyles[3].get("--home-panel-x"), "1200px");
  top = -3900;
  events.scroll(); flush();
  assert.equal(panelStyles[3].get("--home-panel-x"), "0px");
  let prevented = false;
  stageEvents.wheel({ deltaX: 100, deltaY: 0, preventDefault() { prevented = true; } });
  assert.equal(prevented, false, "La molette reste libre après le dernier panneau");
  top = -1200;
  events.scroll(); flush();
  assert.equal(panelStyles[1].get("--home-panel-x"), "0px");
  assert.equal(panelStyles[2].get("--home-panel-x"), "1200px");
  stageEvents.wheel({ deltaX: 80, deltaY: 0, deltaMode: 0, preventDefault() { prevented = true; } });
  assert.ok(frames.size > 0, "Une impulsion lance un déplacement complet animé");
  stageEvents.keydown({ key: "End", preventDefault() {} });
  assert.equal(scrolledTo, 6400);
  stageEvents.focusin({ target: 0 });
  assert.equal(scrolledTo, 2800);
  reduced.matches = true;
  preferenceChanged();
  assert.equal(attributes.has("data-horizontal-ready"), false);
  assert.equal(rootStyles.size, 0);
  assert.equal(trackStyles.size, 0);
  panelStyles.forEach((styles) => assert.equal(styles.size, 0));
  stageEvents.keydown({ key: "ArrowRight", preventDefault() {} });
  assert.equal(stage.scrollLeft, 1200, "Navigation horizontale native sans animation forcée");
});
