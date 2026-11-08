import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

async function environment(reduced = false) {
  const animations = [];
  const curtains = [];
  const stored = new Map();
  const windowEvents = {};
  function element(extra = {}) {
    return {
      listeners: {}, attributes: {},
      addEventListener(name, callback) { this.listeners[name] = callback; },
      setAttribute(name, value) { this.attributes[name] = value; },
      remove() { const index = curtains.indexOf(this); if (index >= 0) curtains.splice(index, 1); },
      animate(frames, options) {
        const animation = { frames, options, cancelled: false, cancel() { this.cancelled = true; } };
        animations.push(animation);
        return animation;
      },
      ...extra,
    };
  }
  const trigger = element();
  const close = element();
  const links = [element({ href: "http://localhost/projets/" }), element({ href: "mailto:contact@example.org" })];
  const filter = { open: true };
  const media = element({ matches: reduced });
  const style = { overflow: "clip" };
  const panel = element({
    open: false,
    showModal() { this.open = true; },
    close() { this.open = false; this.listeners.close?.(); },
    append(element) { curtains.push(element); },
    querySelector: (selector) => selector === "[data-close-menu]" ? close : element(),
    querySelectorAll: (selector) => selector === "a[href]" ? links : selector === ".menu-route-curtain" ? [...curtains] : [element(), element(), element(), element()],
  });
  const location = { href: "http://localhost/a-propos/", origin: "http://localhost", assign(url) { this.url = url; } };
  const source = await readFile("src/scripts/fullscreen-menu.js", "utf8");
  runInNewContext(source, {
    URL,
    document: {
      documentElement: { style },
      createElement: () => element(),
      querySelector: (selector) => selector === "[data-fullscreen-menu]" ? panel : trigger,
      querySelectorAll: () => [filter],
    },
    window: {
      location,
      sessionStorage: { setItem: (key, value) => stored.set(key, value) },
      matchMedia: () => media,
      getComputedStyle: () => ({ clipPath: "inset(0)" }),
      addEventListener: (name, callback) => { windowEvents[name] = callback; },
    },
  });
  return { panel, trigger, close, links, filter, media, style, animations, location, windowEvents, curtains, stored };
}

test("Menu plein écran : fermer les filtres, bloquer le scroll, animer Échap et restaurer l’état", async () => {
  const env = await environment();
  env.trigger.listeners.click();
  assert.equal(env.panel.open, true);
  assert.equal(env.filter.open, false);
  assert.equal(env.style.overflow, "hidden");
  assert.equal(env.trigger.attributes["aria-expanded"], "true");
  assert.ok(env.animations.length > 4);
  let prevented = false;
  env.panel.listeners.cancel({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(env.panel.open, true, "Le dialogue reste ouvert pendant sa sortie");
  const exit = env.animations.at(-1);
  exit.onfinish();
  assert.equal(env.panel.open, false);
  assert.equal(env.style.overflow, "clip");
  assert.equal(env.trigger.attributes["aria-expanded"], "false");
});

test("Menu plein écran : conserver les clics modifiés et naviguer après la fermeture", async () => {
  const env = await environment();
  env.trigger.listeners.click();
  let prevented = false;
  env.links[0].listeners.click({ button: 0, ctrlKey: true, preventDefault() { prevented = true; } });
  assert.equal(prevented, false);
  assert.equal(env.panel.open, true);
  env.links[0].listeners.click({ button: 0, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(env.location.url, undefined);
  assert.equal(env.curtains.length, 1);
  env.animations.at(-1).onfinish();
  assert.equal(env.location.url, env.links[0].href);
  assert.equal(env.panel.open, true, "Le menu reste couvert pendant le chargement");
  assert.equal(JSON.parse(env.stored.get("portfolio-menu-transition")).path, "/projets/");
  env.windowEvents.pagehide();
  assert.equal(env.curtains.length, 0);
  assert.equal(env.style.overflow, "clip");
});

test("Menu plein écran : mouvement réduit, fermeture directe et nettoyage à la sortie", async () => {
  const env = await environment(true);
  env.trigger.listeners.click();
  assert.equal(env.animations.length, 0);
  env.close.listeners.click();
  assert.equal(env.panel.open, false);
  assert.equal(env.style.overflow, "clip");
  env.media.matches = false;
  env.trigger.listeners.click();
  env.windowEvents.pagehide();
  assert.equal(env.panel.open, false);
  assert.equal(env.style.overflow, "clip");
  assert.ok(env.animations.every((animation) => animation.cancelled));
});
