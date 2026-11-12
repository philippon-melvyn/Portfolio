import { pageScript } from "./helpers/page-scripts.js";
import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";

test("Outils : zone fixe, apparition/disparition au scroll et retour réversible", async () => {
  const events = {};
  const frames = new Map();
  const attributes = new Set();
  const styles = new Map();
  const rowStyles = Array.from({ length: 4 }, () => new Map());
  const style = (values) => ({ setProperty: (key, value) => values.set(key, value), removeProperty: (key) => values.delete(key) });
  let top = 0;
  let nextFrame = 0;
  let change;
  const preference = { matches: false, addEventListener: (_name, cb) => { change = cb; } };
  const root = {
    querySelectorAll: () => rowStyles.map((values) => ({ style: style(values) })),
    getBoundingClientRect: () => ({ top }),
    setAttribute: (name) => attributes.add(name), removeAttribute: (name) => attributes.delete(name),
    style: style(styles),
  };
  runInNewContext(await pageScript("src/pages/index.astro", "tool-directory"), {
    document: { querySelector: () => root },
    window: {
      innerHeight: 800,
      matchMedia: () => preference,
      addEventListener: (name, cb) => { events[name] = cb; },
      requestAnimationFrame: (cb) => { frames.set(++nextFrame, cb); return nextFrame; },
      cancelAnimationFrame: (id) => frames.delete(id),
    },
  });
  function flush() { const batch = [...frames.values()]; frames.clear(); batch.forEach((cb) => cb()); }
  function scroll(value) { top = -value; events.scroll(); flush(); }
  assert.equal(attributes.has("data-tool-ready"), true);
  assert.equal(styles.get("height"), "1568px");
  assert.equal(rowStyles[0].get("opacity"), "1");
  assert.equal(rowStyles[1].get("opacity"), "0");
  scroll(256 * .55);
  assert.ok(Math.abs(Number(rowStyles[0].get("opacity")) - .5) < .001);
  assert.ok(Math.abs(Number(rowStyles[1].get("opacity")) - .5) < .001);
  scroll(256);
  assert.equal(rowStyles[0].get("opacity"), "0");
  assert.equal(rowStyles[1].get("opacity"), "1");
  scroll(768);
  assert.equal(rowStyles[3].get("opacity"), "1");
  scroll(0);
  assert.equal(rowStyles[0].get("opacity"), "1");
  events.scroll(); events.scroll();
  assert.equal(frames.size, 1);
  events.pagehide();
  assert.equal(frames.size, 0);
  assert.equal(events.wheel, undefined);
  preference.matches = true; change();
  assert.equal(attributes.has("data-tool-ready"), false);
  assert.equal(styles.size, 0);
  rowStyles.forEach((values) => assert.equal(values.size, 0));
});
