import { pageScript, pageFunctions, serverFunction } from "./helpers/page-scripts.js";
import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
const { createGalleryMotion } = await pageFunctions("src/pages/projets/index.astro", "project-browser", ["createGalleryMotion"]);
const { projectDomains } = await serverFunction("src/pages/projets/index.astro", "projectDomains");
const { filterProjects, nextProjectIndex } = await pageFunctions("src/pages/projets/index.astro", "project-browser", ["filterProjects", "nextProjectIndex"]);

test("Galerie projets : domaines multiples et navigation circulaire", () => {
  assert.deepEqual(projectDomains([" Identité ", "Numérique", "Identité"]), [
    "Identité",
    "Numérique",
  ]);
  const projects = [
    { domains: ["Identité", "Numérique"] },
    { domains: ["Numérique"] },
    { domains: [] },
  ];
  assert.equal(filterProjects(projects, "Numérique").length, 2);
  assert.equal(filterProjects(projects, "all").length, 3);
  assert.equal(filterProjects(projects, "Absent").length, 0);
  assert.equal(nextProjectIndex(2, 3), 0);
  assert.equal(nextProjectIndex(0, 3, -1), 2);
  assert.equal(nextProjectIndex(0, 1), 0);
  assert.equal(nextProjectIndex(0, 0), 0);
});

async function galleryEnvironment({
  count = 3,
  reduced = false,
} = {}) {
  const element = (extra = {}) => ({
    hidden: false,
    disabled: false,
    textContent: "",
    listeners: {},
    attributes: {},
    addEventListener(type, callback) {
      (this.listeners[type] ||= []).push(callback);
    },
    emit(type, event = {}) {
      this.listeners[type]?.forEach((callback) => callback(event));
    },
    setAttribute(key, value) {
      this.attributes[key] = value;
    },
    ...extra,
  });
  const cards = Array.from({ length: count }, (_, index) => {
    const link = element({
      href: `http://localhost/projets/projet-${index}/`,
      focus() {},
    });
    const card = element({
      dataset: {
        projectSlug: `projet-${index}`,
        projectDomains: JSON.stringify(
          index < 2 ? ["Numérique"] : ["Identité"],
        ),
      },
      querySelector: (selector) =>
        ["h2", "[data-project-title]"].includes(selector)
          ? { textContent: `Projet ${index}` }
          : link,
      offsetHeight: 240,
    });
    return { card, link };
  });
  const track = {
    children: cards.map(({ card }) => card),
    prepend(...nodes) { this.children.unshift(...nodes); },
    append(...nodes) { this.children.push(...nodes); },
  };
  function setupCard(card) {
    card.parentElement = track;
    card.remove = () => { track.children = track.children.filter((node) => node !== card); };
    card.removeAttribute = (key) => { delete card.attributes[key]; };
    card.matches = () => false;
    card.querySelectorAll = () => [];
    card.cloneNode = () => {
      const copy = element({ dataset: { ...card.dataset }, offsetHeight: card.offsetHeight });
      setupCard(copy);
      return copy;
    };
    Object.defineProperty(card, "offsetLeft", {
      get: () =>
        track.children.filter((node) => !node.hidden).indexOf(card) * 320,
    });
    Object.defineProperty(card, "offsetTop", { get: () => card.offsetLeft });
  }
  cards.forEach(({ card }) => setupCard(card));
  const details = cards.map((item, index) =>
    element({
      dataset: { projectDetail: `projet-${index}` },
      hidden: index > 0,
    }),
  );
  const filters = ["all", "Numérique", "Identité"].map((domain) =>
    element({ dataset: { projectDomain: domain } }),
  );
  const status = element();
  const viewport = element({
    scrollLeft: 0,
    scrollTop: 0,
    clientWidth: 500,
    clientHeight: 500,
    style: { setProperty() {} },
    scrollTo({ left, top }) {
      if (left !== undefined)
        this.scrollLeft = Math.max(
          0,
          Math.min(left, this.scrollWidth - this.clientWidth),
        );
      if (top !== undefined)
        this.scrollTop = Math.max(
          0,
          Math.min(top, this.scrollHeight - this.clientHeight),
        );
      this.emit("scroll");
    },
    scrollBy({ left, top }) {
      this.scrollTo({
        left: left === undefined ? undefined : this.scrollLeft + left,
        top: top === undefined ? undefined : this.scrollTop + top,
      });
    },
    contains: () => false,
  });
  Object.defineProperty(viewport, "scrollHeight", {
    get: () => viewport.scrollWidth,
  });
  Object.defineProperty(viewport, "scrollWidth", {
    get: () =>
      Math.max(500, track.children.filter((card) => !card.hidden).length * 320),
  });
  const map = {
    "[data-project-viewport]": viewport,
    "[data-project-status]": status,
    "[data-project-filters]": element(),
    "[data-project-details]": element(),
  };
  const root = element({
    classList: {
      add: (value) => classes.add(value),
      remove: (value) => classes.delete(value),
    },
    querySelector: (selector) => map[selector],
    querySelectorAll: (selector) =>
      ({
        "[data-project-tile]": cards.map((item) => item.card),
        "[data-project-domain]": filters,
        "[data-project-link]": cards.map((item) => item.link),
        "[data-project-detail]": details,
      })[selector],
  });
  const timers = new Map();
  const frames = new Map();
  let frameId = 0;
  let clock = 0;
  let timerId = 0;
  const media = element({ matches: reduced });
  const classes = new Set();
  const document = element({
    hidden: false,
    querySelector: () => root,
    querySelectorAll: () => [root],
    body: {
      classList: {
        add: (value) => classes.add(value),
        remove: (value) => classes.delete(value),
      },
    },
  });
  const window = element({
    matchMedia: () => media,
    performance: { now: () => clock },
    requestAnimationFrame: (callback) => {
      frames.set(++frameId, callback);
      return frameId;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
    setTimeout: (callback, delay) => {
      timers.set(++timerId, { callback, delay });
      return timerId;
    },
    clearTimeout: (id) => timers.delete(id),
    location: {
      assign(url) {
        this.url = url;
      },
    },
  });
  const storage = new Map();
  const source = (
    await pageScript("src/pages/projets/index.astro", "project-browser")
  ).replace(/^import .*;\r?\n/gm, "");
  runInNewContext(source, {
    filterProjects,
    nextProjectIndex,
    createGalleryMotion,
    document,
    window,
    sessionStorage: {
      getItem: (key) => storage.get(key),
      setItem: (key, value) => storage.set(key, value),
    },
  });
  const flushFrames = () => {
    let count = 0;
    while (frames.size && count++ < 200) {
      clock += 16;
      const batch = [...frames.values()];
      frames.clear();
      batch.forEach((callback) => callback(clock));
    }
    assert.equal(frames.size, 0, "Le mouvement doit se terminer");
  };
  flushFrames();
  const fireTimer = (finish = true) => {
    const [id, timer] = [...timers][0];
    timers.delete(id);
    timer.callback();
    if (finish) flushFrames();
  };
  return {
    cards,
    track,
    root,
    details,
    filterDrawer: map["[data-project-filters]"],
    filters,
    status,
    viewport,
    timers,
    media,
    document,
    window,
    classes,
    fireTimer,
    flushFrames,
    stepFrame(delta) {
      clock += delta;
      const batch = [...frames.values()];
      frames.clear();
      batch.forEach((callback) => callback(clock));
    },
  };
}

test("Galerie projets : filtres, défilement automatique et pauses réelles", async () => {
  const env = await galleryEnvironment();
  assert.equal(env.timers.size, 1);
  env.fireTimer();
  assert.ok(env.viewport.scrollTop > 0);
  env.viewport.emit("pointerenter");
  assert.equal(env.timers.size, 1);
  env.viewport.emit("pointerleave");
  assert.equal(env.timers.size, 1);
  env.viewport.emit("focusin");
  assert.equal(env.timers.size, 0);
  env.viewport.emit("focusout", { relatedTarget: null });
  assert.equal(env.timers.size, 1);
  env.document.hidden = true;
  env.document.emit("visibilitychange");
  assert.equal(env.timers.size, 0);
  env.document.hidden = false;
  env.document.emit("visibilitychange");
  assert.equal(env.timers.size, 1);
  env.filters[2].emit("click");
  assert.equal(env.cards.filter((item) => !item.card.hidden).length, 1);
  assert.equal(env.viewport.scrollTop, 0);
  assert.equal(env.filters[2].attributes["aria-pressed"], "true");
  assert.equal(env.status.textContent, "1 projet affiché.");
  assert.equal(env.timers.size, 0);
});

test("Galerie projets : pas d’automatisme sans autre projet ou en mouvement réduit", async () => {
  const single = await galleryEnvironment({ count: 1 });
  assert.equal(single.timers.size, 0);
  const reduced = await galleryEnvironment({ reduced: true });
  assert.equal(reduced.timers.size, 0);
  reduced.viewport.emit("keydown", { key: "ArrowDown", preventDefault() {}, target: { closest: () => null } });
  assert.ok(reduced.viewport.scrollTop > 0);
});

test("Galerie : la touche Espace met en pause et reprend le défilement", async () => {
  const env = await galleryEnvironment();
  env.viewport.emit("keydown", { key: " ", preventDefault() {} });
  assert.equal(env.timers.size, 0);
  assert.match(env.status.textContent, /pause/);
  env.viewport.emit("keydown", { key: " ", preventDefault() {} });
  assert.equal(env.timers.size, 1);
});

test("Galerie projets : garder les clics modifiés et animer le repli de navigation", async () => {
  const env = await galleryEnvironment();
  let prevented = false;
  env.cards[0].link.emit("click", {
    button: 0,
    ctrlKey: true,
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(prevented, false);
  env.cards[0].link.emit("click", {
    button: 0,
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(prevented, true);
  assert.equal(env.classes.has("is-project-leaving"), true);
  assert.equal(env.timers.size, 1);
  env.fireTimer();
  assert.equal(env.window.location.url, env.cards[0].link.href);
});

test("Galerie verticale : défilement haut/bas et texte du projet centré synchronisé", async () => {
  const env = await galleryEnvironment({});
  assert.equal(env.details[0].hidden, false);
  env.fireTimer();
  assert.ok(env.viewport.scrollTop > 0);
  assert.equal(env.viewport.scrollLeft, 0);
  assert.equal(env.details[1].hidden, false);
  assert.equal(env.details[0].hidden, true);
  env.viewport.emit("keydown", {
    key: "ArrowUp",
    preventDefault() {},
    target: { closest: () => null },
  });
  env.flushFrames();
  assert.equal(env.viewport.scrollTop, env.cards[0].card.offsetTop);
  assert.equal(env.details[0].hidden, false);
  let prevented = false;
  env.root.emit("wheel", {
    ctrlKey: false,
    deltaY: 120,
    deltaMode: 0,
    target: { closest: () => null },
    preventDefault() {
      prevented = true;
    },
  });
  env.flushFrames();
  assert.equal(prevented, true);
  assert.ok(env.viewport.scrollTop > 0);
  env.filters[2].emit("click");
  assert.equal(env.details[2].hidden, false);
  assert.equal(env.status.textContent, "1 projet affiché.");
});

test("Galerie : la molette du viewport reste native et les filtres suspendent l’auto", async () => {
  const env = await galleryEnvironment();
  let prevented = false;
  env.viewport.emit("wheel", {
    ctrlKey: false,
    deltaY: 100,
    deltaX: 0,
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(prevented, false);
  assert.equal(env.viewport.scrollLeft, 0);
  assert.equal(env.timers.size, 1);
  env.filterDrawer.open = true;
  env.filterDrawer.emit("toggle");
  assert.equal(env.timers.size, 0);
  env.filterDrawer.open = false;
  env.filterDrawer.emit("toggle");
  assert.equal(env.timers.size, 1);
});

test("Galerie verticale : auto toutes les sept secondes, sans commandes, et reprise après la molette", async () => {
  const env = await galleryEnvironment({  });
  assert.equal([...env.timers.values()][0].delay, 7000);
  env.viewport.emit("pointerenter");
  assert.equal(
    env.timers.size,
    1,
    "Un survol ne doit pas couper définitivement l’auto",
  );
  env.root.emit("wheel", {
    deltaY: 120,
    deltaMode: 0,
    target: { closest: () => null },
    preventDefault() {},
  });
  // Plusieurs événements de la même impulsion ne doivent pas relancer le mouvement.
  env.root.emit("wheel", {
    deltaY: 120,
    deltaMode: 0,
    target: { closest: () => null },
    preventDefault() {},
  });
  env.flushFrames();
  assert.equal(env.details[1].hidden, false);
  assert.equal(env.details[2].hidden, true);
  assert.equal(env.timers.size, 1);
  assert.equal([...env.timers.values()][0].delay, 7000);
});

test("Texte synchronisé : garder l’ancien projet au départ et basculer à l’accélération", async () => {
  const env = await galleryEnvironment({  });
  env.fireTimer(false);
  env.stepFrame(500);
  assert.equal(env.details[0].hidden, false);
  assert.equal(env.details[1].hidden, true);
  env.stepFrame(200);
  assert.equal(env.details[0].hidden, true);
  assert.equal(env.details[1].hidden, false);
  env.flushFrames();
  assert.equal(env.details[1].hidden, false);
});

test("Boucle verticale : le premier arrive par le bas après le dernier, sur plusieurs tours", async () => {
  const env = await galleryEnvironment({ count: 2 });
  for (let turn = 0; turn < 3; turn += 1) {
    env.fireTimer();
    assert.equal(env.details[1].hidden, false);
    const lastOffset = env.viewport.scrollTop;
    env.fireTimer(false);
    env.stepFrame(700);
    assert.ok(env.viewport.scrollTop > lastOffset, "Le raccord continue vers le bas");
    assert.equal(env.details[0].hidden, false);
    env.flushFrames();
    assert.equal(env.viewport.scrollTop, env.cards[0].card.offsetTop);
    assert.equal(env.details[0].hidden, false);
  }
  assert.equal(env.track.children.length, 6, "Les copies ne s’accumulent pas");
  assert.equal(env.track.children[0].attributes["aria-hidden"], "true");
});

test("Boucle verticale : retour vers le haut et reconstruction après filtrage", async () => {
  const env = await galleryEnvironment({  });
  const firstOffset = env.viewport.scrollTop;
  env.viewport.emit("keydown", {
    key: "ArrowUp", preventDefault() {}, target: { closest: () => null },
  });
  env.stepFrame(700);
  assert.ok(env.viewport.scrollTop < firstOffset);
  env.flushFrames();
  assert.equal(env.viewport.scrollTop, env.cards[2].card.offsetTop);
  assert.equal(env.details[2].hidden, false);
  env.filters[1].emit("click");
  assert.equal(env.track.children.length, 7);
  env.fireTimer();
  env.fireTimer();
  assert.equal(env.details[0].hidden, false);
  env.filters[2].emit("click");
  assert.equal(env.track.children.length, 3);
  assert.equal(env.timers.size, 0);
  assert.equal(env.details[2].hidden, false);
});

test("Boucle verticale : inverser la molette pendant le raccord revient au dernier sans tour supplémentaire", async () => {
  const env = await galleryEnvironment({ count: 2 });
  env.fireTimer();
  const lastOffset = env.viewport.scrollTop;
  env.fireTimer(false);
  env.stepFrame(500);
  const intermediate = env.viewport.scrollTop;
  env.root.emit("wheel", {
    deltaY: -120, deltaMode: 0,
    target: { closest: () => null }, preventDefault() {},
  });
  env.stepFrame(700);
  assert.ok(env.viewport.scrollTop < intermediate);
  assert.ok(env.viewport.scrollTop >= lastOffset);
  env.flushFrames();
  assert.equal(env.viewport.scrollTop, lastOffset);
  assert.equal(env.details[1].hidden, false);
});
