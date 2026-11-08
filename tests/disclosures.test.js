import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";

async function disclosureEnvironment() {
  function menu(label) {
    const listeners = {};
    const trigger = {
      attributes: {},
      focused: false,
      setAttribute(key, value) {
        this.attributes[key] = value;
      },
      focus() {
        this.focused = true;
      },
    };
    let open = false;
    const item = {
      dataset: { disclosureLabel: label },
      querySelector: () => trigger,
      contains: (target) => target?.owner === item,
      addEventListener(type, listener) {
        listeners[type] = listener;
      },
      emit(type, event) {
        listeners[type]?.(event);
      },
      trigger,
    };
    Object.defineProperty(item, "open", {
      get: () => open,
      set(value) {
        if (open === value) return;
        open = value;
        listeners.toggle?.();
      },
    });
    trigger.owner = item;
    return item;
  }
  const header = menu("le menu");
  const filters = menu("les filtres");
  const listeners = {};
  runInNewContext(await readFile("src/scripts/disclosures.js", "utf8"), {
    document: {
      querySelectorAll: () => [header, filters],
      addEventListener(type, listener) {
        listeners[type] = listener;
      },
    },
  });
  return { header, filters, emit: (type, event) => listeners[type](event) };
}

test("Menus : fermés au chargement, état accessible et une seule ouverture à la fois", async () => {
  const env = await disclosureEnvironment();
  assert.equal(env.header.open, false);
  assert.equal(env.filters.open, false);
  assert.equal(env.header.trigger.attributes["aria-expanded"], "false");
  env.header.open = true;
  assert.equal(env.header.trigger.attributes["aria-label"], "Fermer le menu");
  env.filters.open = true;
  assert.equal(env.header.open, false);
  assert.equal(env.filters.open, true);
  assert.equal(env.filters.trigger.attributes["aria-expanded"], "true");
});

test("Menus : Échap, clic extérieur, filtre choisi et retour de focus", async () => {
  const env = await disclosureEnvironment();
  env.header.open = true;
  env.emit("keydown", { key: "Escape" });
  assert.equal(env.header.open, false);
  assert.equal(env.header.trigger.focused, true);
  env.filters.open = true;
  env.emit("click", { target: {} });
  assert.equal(env.filters.open, false);
  assert.equal(env.filters.trigger.focused, false);
  env.filters.open = true;
  const action = {
    owner: env.filters,
    closest: () => action,
    matches: () => true,
  };
  env.emit("click", { target: action });
  assert.equal(env.filters.open, false);
  assert.equal(env.filters.trigger.focused, true);
});
