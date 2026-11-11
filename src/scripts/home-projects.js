const root = document.querySelector("[data-home-projects]");
if (root) {
  const stage = root.querySelector("[data-home-project-stage]");
  const track = root.querySelector("[data-home-project-track]");
  const panels = [...root.querySelectorAll("[data-home-project-panel]")];
  const desktop = window.matchMedia("(min-width: 900px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let enabled = false;
  let distance = 0;
  let position = 0;
  let frame;

  function update() {
    frame = undefined;
    if (!enabled) return;
    position = Math.max(0, Math.min(distance, -root.getBoundingClientRect().top));
    track.style.setProperty("transform", `translate3d(${-position}px, 0, 0)`);
  }
  function requestUpdate() {
    if (enabled && frame === undefined) frame = window.requestAnimationFrame(update);
  }
  function configure() {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
    enabled = desktop.matches && !reduced.matches;
    track.style.removeProperty("transform");
    if (!enabled) {
      root.removeAttribute("data-horizontal-ready");
      root.style.removeProperty("height");
      return;
    }
    root.setAttribute("data-horizontal-ready", "");
    stage.scrollLeft = 0;
    distance = Math.max(0, (panels.length - 1) * stage.clientWidth);
    root.style.setProperty("height", `${stage.offsetHeight + distance}px`);
    update();
  }
  function goTo(index) {
    const target = Math.max(0, Math.min(panels.length - 1, index));
    if (!panels[target]) return;
    if (enabled) {
      window.scrollTo({
        top: window.scrollY + root.getBoundingClientRect().top + target * stage.clientWidth,
        behavior: "instant",
      });
      update();
    } else {
      stage.scrollTo({ left: panels[target].offsetLeft, behavior: "instant" });
    }
  }
  stage.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const current = Math.round((enabled ? position : stage.scrollLeft) / Math.max(1, stage.clientWidth));
    const target = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: panels.length - 1 }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    goTo(target);
  });
  stage.addEventListener("focusin", (event) => {
    const index = panels.findIndex((panel) => panel.contains(event.target));
    if (index >= 0 && enabled) goTo(index);
  });
  // The browser owns the wheel: no forced destination, timer or gesture lock.
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", configure, { passive: true });
  window.addEventListener("pageshow", configure);
  window.addEventListener("pagehide", () => {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
  });
  desktop.addEventListener("change", configure);
  reduced.addEventListener("change", configure);
  configure();
}
