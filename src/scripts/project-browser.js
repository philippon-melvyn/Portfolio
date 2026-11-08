import { filterProjects, nextProjectIndex } from "../lib/project-browser.js";
import { createGalleryMotion } from "../lib/gallery-motion.js";

const AUTO_DELAY = 7000;
const MOVE_DURATION = 1400;

document.querySelectorAll("[data-project-browser]").forEach((root) => {
  const vertical = root.dataset.projectAxis === "vertical";
  const scrollKey = vertical ? "scrollTop" : "scrollLeft";
  const offsetKey = vertical ? "offsetTop" : "offsetLeft";
  const scrollSize = vertical ? "scrollHeight" : "scrollWidth";
  const clientSize = vertical ? "clientHeight" : "clientWidth";
  const viewport = root.querySelector("[data-project-viewport]");
  const cards = [...root.querySelectorAll("[data-project-tile]")].map(
    (element) => ({
      element,
      domains: JSON.parse(element.dataset.projectDomains),
    }),
  );
  const filters = [...root.querySelectorAll("[data-project-domain]")];
  const previous = root.querySelector("[data-project-previous]");
  const next = root.querySelector("[data-project-next]");
  const autoplay = root.querySelector("[data-project-autoplay]");
  const position = root.querySelector("[data-project-position]");
  const status = root.querySelector("[data-project-status]");
  const filterDrawer = root.querySelector("[data-project-filters]");
  const controls = root.querySelector("[data-project-controls]");
  const details = [...root.querySelectorAll("[data-project-detail]")];
  const detailPanel = root.querySelector("[data-project-details]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const storageKey =
    root.dataset.projectStorageKey ||
    `portfolio-project-gallery-${vertical ? "vertical" : "horizontal"}`;
  let visible = cards;
  let domain = "all";
  let current = 0;
  let activeDetail;
  let timer;
  let settleTimer;
  let paused = reducedMotion.matches;
  let hovering = false;
  let focused = false;
  let dragging = false;
  let navigating = false;
  let scheduled = false;
  let inView = !("IntersectionObserver" in window);
  let autoDirection = 1;
  let motionDirection = 0;
  let wheelDelta = 0;
  let loopCopies = [];

  // Deux bandes identiques entourent les originaux : le raccord reste hors champ.
  function rebuildLoop() {
    loopCopies.forEach((copy) => copy.remove());
    loopCopies = [];
    if (!vertical || visible.length < 2) return;
    const track = cards[0].element.parentElement;
    for (const side of ["before", "after"]) {
      const copies = visible.map(({ element }) => {
        const copy = element.cloneNode(true);
        copy.hidden = false;
        copy.setAttribute("aria-hidden", "true");
        copy.removeAttribute("data-project-tile");
        for (const node of [copy, ...copy.querySelectorAll("*")]) {
          node.removeAttribute("id");
          node.style?.removeProperty("view-transition-name");
          if (node.matches("a, button, [tabindex]")) node.tabIndex = -1;
        }
        copy.querySelectorAll("[data-project-link]").forEach(bindProjectLink);
        loopCopies.push(copy);
        return copy;
      });
      if (side === "before") track.prepend(...copies);
      else track.append(...copies);
    }
  }
  function loopSpan() {
    return loopCopies.length
      ? loopCopies[visible.length][offsetKey] - visible[0].element[offsetKey]
      : 0;
  }
  function normalizeLoop() {
    const span = loopSpan();
    if (!span) return;
    const start = visible[0].element[offsetKey];
    const boundary = start - (visible[1].element[offsetKey] - start) / 2;
    const offset = viewport[scrollKey];
    if (offset < boundary || offset >= boundary + span)
      viewport[scrollKey] = boundary + (((offset - boundary) % span) + span) % span;
  }

  const motion = createGalleryMotion({
    read: () => viewport[scrollKey],
    write: (value) => {
      viewport[scrollKey] = value;
    },
    requestFrame: (callback) => window.requestAnimationFrame(callback),
    cancelFrame: (id) => window.cancelAnimationFrame(id),
    now: () => window.performance.now(),
  });
  viewport.setAttribute("data-animated-scroll", "true");

  function stopTimer() {
    window.clearTimeout(timer);
    timer = undefined;
  }
  function clearSettle() {
    window.clearTimeout(settleTimer);
    settleTimer = undefined;
  }
  function saveState() {
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify({ domain, offset: viewport[scrollKey], index: current }),
      );
    } catch {
      /* Stockage facultatif. */
    }
  }
  function canTravel() {
    return (
      visible.length > 1 && viewport[scrollSize] > viewport[clientSize] + 1
    );
  }
  function scheduleAutoplay() {
    stopTimer();
    if (
      paused ||
      (!vertical && hovering) ||
      focused ||
      dragging ||
      navigating ||
      reducedMotion.matches ||
      document.hidden ||
      !inView ||
      filterDrawer?.open ||
      !canTravel()
    )
      return;
    timer = window.setTimeout(() => {
      if (!vertical) {
        if (current === visible.length - 1) autoDirection = -1;
        if (current === 0) autoDirection = 1;
      }
      move(autoDirection, false);
      scheduleAutoplay();
    }, AUTO_DELAY);
  }
  function updateControls() {
    const several = canTravel();
    [previous, next].forEach((button) => {
      if (button) {
        button.hidden = !several;
        button.disabled = !several;
      }
    });
    if (autoplay) {
      autoplay.hidden = !several;
      autoplay.disabled = reducedMotion.matches;
      autoplay.setAttribute("aria-pressed", String(paused));
      autoplay.textContent = paused ? "Défilement auto" : "Pause";
      autoplay.setAttribute(
        "aria-label",
        paused
          ? "Activer le défilement automatique"
          : "Mettre le défilement automatique en pause",
      );
    }
    if (position)
      position.textContent = visible.length
        ? `${String(current + 1).padStart(2, "0")} / ${String(visible.length).padStart(2, "0")}`
        : "00 / 00";
  }
  function nearestIndex() {
    if (!visible.length) return 0;
    normalizeLoop();
    const index = visible.reduce(
      (best, card, i) =>
        Math.abs(card.element[offsetKey] - viewport[scrollKey]) <
        Math.abs(visible[best].element[offsetKey] - viewport[scrollKey])
          ? i
          : best,
      0,
    );
    const maximum = viewport[scrollSize] - viewport[clientSize];
    return maximum > 1 && viewport[scrollKey] >= maximum - 2
      ? visible.length - 1
      : index;
  }
  function markCurrent() {
    visible.forEach((card, index) =>
      card.element.setAttribute("data-current", String(index === current)),
    );
    loopCopies.forEach((copy) =>
      copy.setAttribute(
        "data-current",
        String(copy.dataset.projectSlug === visible[current]?.element.dataset.projectSlug),
      ),
    );
  }
  function cancelTextAnimations() {
    details.forEach((detail) =>
      detail.getAnimations?.().forEach((animation) => animation.cancel()),
    );
  }
  function stopMotion() {
    motion.cancel();
    cancelTextAnimations();
    current = nearestIndex();
    showDetail(current);
    updateControls();
  }
  function detailFor(index) {
    return details.find(
      (detail) =>
        detail.dataset.projectDetail ===
        visible[index]?.element.dataset.projectSlug,
    );
  }
  function showDetail(index, animate = false, direction = 1) {
    const target = detailFor(index);
    const changed = target !== activeDetail;
    details.forEach((detail) => {
      detail.hidden = detail !== target;
    });
    activeDetail = target;
    if (changed && animate && !reducedMotion.matches)
      target?.animate?.(
        [
          { opacity: 0, transform: `translateY(${24 * direction}px)` },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 700, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" },
      );
    markCurrent();
  }
  function textTransition(index, direction) {
    const target = detailFor(index);
    const old = activeDetail;
    const snapshot = old && window.getComputedStyle?.(old);
    const from = {
      opacity: snapshot?.opacity || 1,
      transform: snapshot?.transform || "translateY(0)",
    };
    cancelTextAnimations();
    if (!target) return () => {};
    if (target === old) {
      target.hidden = false;
      if (!reducedMotion.matches)
        target.animate?.([from, { opacity: 1, transform: "translateY(0)" }], {
          duration: 500,
          easing: "ease-out",
          fill: "both",
        });
      return () => {};
    }
    if (!reducedMotion.matches)
      old?.animate?.(
        [from, { opacity: 0, transform: `translateY(${-22 * direction}px)` }],
        {
          duration: 630,
          easing: "cubic-bezier(.55,0,1,.45)",
          fill: "forwards",
        },
      );
    let switched = false;
    return (progress) => {
      if (switched || progress < 0.45) return;
      switched = true;
      showDetail(index, true, direction);
    };
  }
  function measureCurrent() {
    scheduled = false;
    if (motion.running) return;
    const old = current;
    current = nearestIndex();
    updateControls();
    showDetail(current, true, current >= old ? 1 : -1);
  }
  function requestMeasure() {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(measureCurrent);
    }
  }
  function centerVerticalCards() {
    if (!vertical || !visible.length) return;
    const height = visible[0].element.offsetHeight;
    if (Number.isFinite(height))
      viewport.style.setProperty(
        "--gallery-inset",
        `${Math.max(0, (viewport.clientHeight - height) / 2)}px`,
      );
  }
  function manualInteraction() {
    paused = vertical ? false : true;
    stopTimer();
    updateControls();
    if (vertical) scheduleAutoplay();
  }
  function goTo(index, manual = true, travelDirection = 0) {
    if (!visible.length) return;
    if (manual) manualInteraction();
    clearSettle();
    current = Math.max(0, Math.min(index, visible.length - 1));
    normalizeLoop();
    let destination = visible[current].element[offsetKey];
    const span = loopSpan();
    if (span && travelDirection) {
      const candidates = [destination - span, destination, destination + span]
        .filter((value) =>
          (value - viewport[scrollKey]) * travelDirection >= -0.5,
        )
        .sort((a, b) =>
          Math.abs(a - viewport[scrollKey]) - Math.abs(b - viewport[scrollKey]),
        );
      destination = candidates[0] ?? destination;
    }
    const target = Math.max(
      0,
      Math.min(
        destination,
        viewport[scrollSize] - viewport[clientSize],
      ),
    );
    motionDirection = target >= viewport[scrollKey] ? 1 : -1;
    const syncText = textTransition(current, motionDirection);
    motion.to(target, {
      duration: reducedMotion.matches ? 0 : MOVE_DURATION,
      onUpdate: syncText,
      onComplete: () => {
        normalizeLoop();
        motionDirection = 0;
        showDetail(current);
        updateControls();
        saveState();
      },
    });
    updateControls();
    if (manual && status)
      status.textContent = `${current + 1} sur ${visible.length} : ${(visible[current].element.querySelector("[data-project-title]") || visible[current].element.querySelector("h2")).textContent}.`;
  }
  function move(direction, manual = true) {
    const index = nextProjectIndex(current, visible.length, direction);
    goTo(index, manual, vertical ? direction : 0);
  }
  function applyFilter(value, announce = true) {
    motion.cancel();
    clearSettle();
    stopTimer();
    cancelTextAnimations();
    domain = value;
    visible = filterProjects(cards, domain);
    const selected = new Set(visible);
    cards.forEach((card) => {
      card.element.hidden = !selected.has(card);
    });
    rebuildLoop();
    filters.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.projectDomain === domain),
      ),
    );
    current = 0;
    viewport[scrollKey] = 0;
    showDetail(current);
    centerVerticalCards();
    if (vertical && visible.length)
      viewport[scrollKey] = visible[0].element[offsetKey];
    updateControls();
    if (announce && status)
      status.textContent = `${visible.length} projet${visible.length > 1 ? "s" : ""} affiché${visible.length > 1 ? "s" : ""}.`;
    saveState();
    scheduleAutoplay();
  }
  function settle() {
    clearSettle();
    if (!vertical || dragging || motion.running || !visible.length) return;
    settleTimer = window.setTimeout(() => {
      goTo(nearestIndex(), false);
      scheduleAutoplay();
    }, 180);
  }

  filters.forEach((button) =>
    button.addEventListener("click", () =>
      applyFilter(button.dataset.projectDomain),
    ),
  );
  filterDrawer?.addEventListener("toggle", () => {
    if (filterDrawer.open) stopTimer();
    else scheduleAutoplay();
  });
  previous?.addEventListener("click", () => move(-1));
  next?.addEventListener("click", () => move(1));
  autoplay?.addEventListener("click", () => {
    paused = !paused;
    updateControls();
    scheduleAutoplay();
  });
  viewport.addEventListener("pointerenter", () => {
    hovering = true;
    if (!vertical) stopTimer();
  });
  viewport.addEventListener("pointerleave", () => {
    hovering = false;
    scheduleAutoplay();
  });
  viewport.addEventListener(
    "pointerdown",
    () => {
      dragging = true;
      stopMotion();
      clearSettle();
      manualInteraction();
    },
    { passive: true },
  );
  function releasePointer() {
    if (!dragging) return;
    dragging = false;
    settle();
    scheduleAutoplay();
  }
  window.addEventListener("pointerup", releasePointer, { passive: true });
  window.addEventListener("pointercancel", releasePointer, { passive: true });
  viewport.addEventListener("focusin", (event) => {
    focused = event.target?.matches
      ? event.target.matches(":focus-visible")
      : true;
    if (focused) {
      stopMotion();
      if (!vertical) paused = true;
      stopTimer();
      updateControls();
    }
  });
  viewport.addEventListener("focusout", (event) => {
    if (!viewport.contains(event.relatedTarget)) {
      focused = false;
      scheduleAutoplay();
    }
  });
  detailPanel?.addEventListener("focusin", () => {
    focused = true;
    stopTimer();
  });
  detailPanel?.addEventListener("focusout", (event) => {
    if (!detailPanel.contains(event.relatedTarget)) {
      focused = false;
      scheduleAutoplay();
    }
  });
  viewport.addEventListener(
    "scroll",
    () => {
      if (!motion.running) {
        requestMeasure();
        settle();
      }
    },
    { passive: true },
  );
  viewport.addEventListener(
    "wheel",
    (event) => {
      if (!vertical && !event.ctrlKey && canTravel()) manualInteraction();
    },
    { passive: true },
  );
  if (vertical)
    root.addEventListener(
      "wheel",
      (event) => {
        if (
          event.ctrlKey ||
          event.target.closest("[data-project-filters]") ||
          !canTravel()
        )
          return;
        event.preventDefault();
        manualInteraction();
        const delta =
          event.deltaY *
          (event.deltaMode === 1
            ? 20
            : event.deltaMode === 2
              ? viewport.clientHeight
              : 1);
        if (!delta) return;
        const direction = Math.sign(delta);
        if (motion.running && direction === motionDirection) return;
        if (Math.sign(wheelDelta) !== direction) wheelDelta = 0;
        wheelDelta += delta;
        if (Math.abs(wheelDelta) < 24) return;
        wheelDelta = 0;
        move(direction);
      },
      { passive: false },
    );
  viewport.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const back = vertical ? "ArrowUp" : "ArrowLeft";
    const forward = vertical ? "ArrowDown" : "ArrowRight";
    if (![back, forward, "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") goTo(0);
    else if (event.key === "End") goTo(visible.length - 1);
    else move(event.key === back ? -1 : 1);
    if (event.target.closest("[data-project-link]"))
      visible[current]?.element
        .querySelector("a")
        .focus({ preventScroll: true });
  });
  function bindProjectLink(link) {
    link.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      navigating = true;
      motion.cancel();
      stopTimer();
      clearSettle();
      saveState();
      if (reducedMotion.matches || "onpageswap" in window) return;
      event.preventDefault();
      root.classList.add("is-project-leaving");
      window.setTimeout(() => window.location.assign(link.href), 240);
    });
  }
  root.querySelectorAll("[data-project-link]").forEach(bindProjectLink);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopTimer();
      stopMotion();
    } else {
      measureCurrent();
      scheduleAutoplay();
    }
  });
  reducedMotion.addEventListener("change", () => {
    stopMotion();
    paused = reducedMotion.matches;
    updateControls();
    scheduleAutoplay();
  });
  window.addEventListener("resize", () => {
    stopMotion();
    centerVerticalCards();
    requestMeasure();
    scheduleAutoplay();
  });
  window.addEventListener("pagehide", () => {
    stopMotion();
    stopTimer();
    clearSettle();
    saveState();
  });
  window.addEventListener("pageshow", () => {
    navigating = false;
    root.classList.remove("is-project-leaving");
    requestMeasure();
    scheduleAutoplay();
  });

  let saved;
  try {
    saved = JSON.parse(sessionStorage.getItem(storageKey) || "null");
  } catch {
    /* Stockage facultatif. */
  }
  if (filterDrawer) filterDrawer.hidden = !cards.length;
  if (controls) controls.hidden = !cards.length;
  applyFilter(
    filters.some((button) => button.dataset.projectDomain === saved?.domain)
      ? saved.domain
      : "all",
    false,
  );
  if (vertical && Number.isInteger(saved?.index) && visible[saved.index])
    viewport[scrollKey] = visible[saved.index].element[offsetKey];
  else if (saved && Number.isFinite(saved.offset) && saved.offset > 0)
    viewport[scrollKey] = saved.offset;
  // Un changement de hauteur des cartes ne doit pas laisser le projet restauré décentré.
  if (vertical && visible.length) {
    current = nearestIndex();
    viewport[scrollKey] = visible[current].element[offsetKey];
    showDetail(current);
  }
  if ("IntersectionObserver" in window) {
    new window.IntersectionObserver(
      (entries) => {
        inView = entries[0].isIntersecting;
        if (inView) scheduleAutoplay();
        else {
          stopTimer();
          stopMotion();
        }
      },
      { threshold: 0.15 },
    ).observe(root);
  }
  if (vertical && "ResizeObserver" in window)
    new window.ResizeObserver(() => {
      centerVerticalCards();
      requestMeasure();
    }).observe(viewport, { box: "border-box" });
  requestMeasure();
  scheduleAutoplay();
});
