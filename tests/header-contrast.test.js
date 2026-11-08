import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { compositeColors, relativeLuminance, headerInk, imageSamplePoint } from "../src/lib/header-contrast.js";

test("Header : blanc sur noir et rouge, noir sur clair, sans oscillation sur le gris", () => {
  assert.equal(headerInk(relativeLuminance([250, 250, 248])), "black");
  assert.equal(headerInk(relativeLuminance([16, 17, 19])), "white");
  assert.equal(headerInk(relativeLuminance([163, 51, 51])), "white");
  assert.equal(headerInk(0.18, "white"), "white");
  assert.equal(headerInk(0.18, "black"), "black");
  assert.deepEqual(compositeColors([255, 255, 255, .5], [0, 0, 0, 1]), [127.5, 127.5, 127.5, 1]);
  assert.deepEqual(compositeColors([0, 0, 0, 0], [250, 250, 248, 1]), [250, 250, 248, 1]);
});

test("Header : échantillonner la bonne zone des images recadrées", () => {
  const image = { naturalWidth: 200, naturalHeight: 100 };
  const bounds = { left: 0, top: 0, width: 100, height: 100 };
  assert.deepEqual(imageSamplePoint(image, bounds, 0, 50, "cover"), { u: .25, v: .5 });
  assert.deepEqual(imageSamplePoint(image, bounds, 0, 50, "cover", "0% 50%"), { u: 0, v: .5 });
  assert.equal(imageSamplePoint(image, bounds, 50, 0, "contain"), null);
  assert.deepEqual(imageSamplePoint(image, bounds, 50, 50, "contain"), { u: .5, v: .5 });
});

test("Header : couleurs indépendantes, mesure du fond sous les contrôles et arrêt hors page", async () => {
  const frames = new Map();
  const documentEvents = {};
  const windowEvents = {};
  const colors = { paper: [250, 250, 248, 255], night: [16, 17, 19, 255] };
  const background = (color) => ({ parentElement: null, style: { opacity: "1", visibility: "visible", backgroundColor: color } });
  const left = background("paper");
  const right = background("night");
  const controls = [0, 100].map((x, index) => ({
    isHeader: true,
    dataset: { headerInk: index ? "black" : "white" },
    getBoundingClientRect: () => ({ left: x, top: 16, width: 25, height: 42 }),
  }));
  const header = { contains: (element) => element.isHeader, querySelectorAll: () => controls };
  let id = 0;
  const document = {
    hidden: false, body: {},
    querySelector: () => header,
    elementsFromPoint: (x) => [controls[x < 50 ? 0 : 1], x < 50 ? left : right],
    createElement: () => ({ getContext: () => ({
      clearRect() {}, fillRect() {},
      getImageData() { return { data: colors[this.fillStyle] }; },
    }) }),
    addEventListener: (name, callback) => { documentEvents[name] = callback; },
  };
  const window = {
    performance: { now: () => 0 },
    getComputedStyle: (element) => element.style,
    requestAnimationFrame: (callback) => { frames.set(++id, callback); return id; },
    cancelAnimationFrame: (frameId) => frames.delete(frameId),
    addEventListener: (name, callback) => { windowEvents[name] = callback; },
  };
  const source = (await readFile("src/scripts/header-contrast.js", "utf8")).replace(/^import .*;\r?\n/, "");
  runInNewContext(source, { document, window, MutationObserver: class { observe() {} }, compositeColors, relativeLuminance, headerInk, imageSamplePoint });
  function step(time) {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(time));
  }
  step(16);
  assert.equal(controls[0].dataset.headerInk, "black");
  assert.equal(controls[1].dataset.headerInk, "white");
  left.style.backgroundColor = "night";
  right.style.backgroundColor = "paper";
  documentEvents.scroll();
  documentEvents.scroll();
  assert.equal(frames.size, 1);
  step(96);
  assert.equal(controls[0].dataset.headerInk, "white");
  assert.equal(controls[1].dataset.headerInk, "black");
  windowEvents.pagehide();
  assert.equal(frames.size, 0);
});
