import { pageScript } from "./helpers/page-scripts.js";
import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";

test("Images projet : apparition unique, attente du chargement et mouvement réduit", async () => {
  let onIntersection;
  let onPreferenceChange;
  const events = {};
  const played = [];
  const cancelled = [];
  const loads = new Map();
  const images = [true, false].map((complete) => ({
    complete,
    animate: (_frames, options) => {
      played.push(options);
      return { cancel() { cancelled.push(true); } };
    },
    addEventListener: (_event, cb) => loads.set(complete, cb),
    removeEventListener: () => loads.delete(complete),
  }));
  const preference = { matches: false, addEventListener: (_name, cb) => { onPreferenceChange = cb; } };
  runInNewContext(await pageScript("src/pages/projets/[slug].astro", "project-images"), {
    document: { querySelector: () => ({ querySelectorAll: () => images }) },
    window: {
      matchMedia: () => preference,
      addEventListener: (name, cb) => { events[name] = cb; },
      IntersectionObserver: class {
        constructor(cb) { onIntersection = cb; }
        observe() {} unobserve() {} disconnect() {}
      },
    },
  });
  onIntersection(images.map((target) => ({ target, isIntersecting: true })));
  assert.equal(played.length, 1);
  loads.get(false)();
  assert.equal(played.length, 2);
  assert.equal(played[0].fill, "backwards", "Aucun style masquant ne persiste après l’animation");
  onIntersection([{ target: images[0], isIntersecting: true }]);
  assert.equal(played.length, 2);
  preference.matches = true;
  onPreferenceChange();
  assert.equal(cancelled.length, 2);
  events.pagehide();
  events.pageshow();
  assert.equal(played.length, 2);
});
