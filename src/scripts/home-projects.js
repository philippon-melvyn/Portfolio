const root = document.querySelector("[data-home-projects]");
if (root) {
  const stage = root.querySelector("[data-home-project-stage]");
  const panels = [...root.querySelectorAll("[data-home-project-panel]")];
  const desktop = window.matchMedia("(min-width: 900px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let enabled = false;
  let distance = 0;
  let position = 0;
  let frame;
  let motionFrame;
  let lastWheelAt = -Infinity;
  let wheelDirection = 0;

  function cancelMotion() {
    if (motionFrame !== undefined) window.cancelAnimationFrame(motionFrame);
    motionFrame = undefined;
  }

  function update() {
    frame = undefined;
    if (!enabled) return;
    position = Math.max(0, Math.min(distance, -root.getBoundingClientRect().top));
    panels.forEach((panel, index) => {
      // Once covered, a panel stays still. Only the next panel slides over it.
      const progress = Math.max(0, Math.min(1, position / stage.clientWidth - index + 1));
      // Smooth acceleration and braking, with no speed jump between slides.
      const eased = progress ** 3 * (progress * (6 * progress - 15) + 10);
      const x = stage.clientWidth * (1 - eased);
      panel.style.setProperty("--home-panel-x", `${x}px`);
    });
  }
  function requestUpdate() {
    if (enabled && frame === undefined) frame = window.requestAnimationFrame(update);
  }
  function configure() {
    cancelMotion();
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
    enabled = desktop.matches && !reduced.matches;
    if (!enabled) {
      root.removeAttribute("data-horizontal-ready");
      root.style.removeProperty("height");
      panels.forEach((panel) => panel.style.removeProperty("--home-panel-x"));
      return;
    }
    root.setAttribute("data-horizontal-ready", "");
    stage.scrollLeft = 0;
    distance = Math.max(0, (panels.length - 1) * stage.clientWidth);
    // Keep the last red panel in view long enough to read before normal scrolling resumes.
    root.style.setProperty("height", `${stage.offsetHeight + distance + window.innerHeight * .75}px`);
    update();
  }
  function goTo(index, animate = false) {
    const target = Math.max(0, Math.min(panels.length - 1, index));
    const panel = panels[target];
    if (!panel) return;
    cancelMotion();
    if (enabled) {
      const destination = window.scrollY + root.getBoundingClientRect().top + target * stage.clientWidth;
      const from = window.scrollY;
      if (!animate || Math.abs(destination - from) < 1) {
        window.scrollTo({ top: destination, behavior: "instant" });
        update();
        return;
      }
      const started = window.performance.now();
      function step(now) {
        const t = Math.max(0, Math.min(1, (now - started) / 1050));
        const eased = t < .5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2;
        window.scrollTo({ top: from + (destination - from) * eased, behavior: "instant" });
        update();
        if (t < 1) motionFrame = window.requestAnimationFrame(step);
        else motionFrame = undefined;
      }
      motionFrame = window.requestAnimationFrame(step);
    } else {
      stage.scrollTo({ left: panel.offsetLeft, behavior: reduced.matches ? "instant" : "smooth" });
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
  stage.addEventListener("wheel", (event) => {
    if (!enabled || event.ctrlKey || event.defaultPrevented) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    const direction = Math.sign(delta);
    const now = window.performance.now();
    const sameGesture = direction === wheelDirection && (motionFrame !== undefined || now - lastWheelAt < 180);
    if (sameGesture) {
      lastWheelAt = now;
      event.preventDefault();
      return;
    }
    function snap(index) {
      lastWheelAt = now;
      wheelDirection = direction;
      event.preventDefault();
      goTo(index, true);
    }
    const top = root.getBoundingClientRect().top;
    if (top > 1) {
      if (direction > 0 && top < window.innerHeight * .8) {
        snap(0);
      }
      return;
    }
    if (top < -distance) {
      if (direction < 0 && top > -distance - window.innerHeight * .75) {
        snap(panels.length - 1);
      }
      return;
    }
    update();
    if ((position <= 1 && direction < 0) || (position >= distance - 1 && direction > 0)) return;
    const index = position / Math.max(1, stage.clientWidth);
    snap(direction > 0 ? Math.floor(index + .001) + 1 : Math.ceil(index - .001) - 1);
  }, { passive: false });
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", configure, { passive: true });
  window.addEventListener("pageshow", configure);
  window.addEventListener("pagehide", () => {
    cancelMotion();
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
  });
  desktop.addEventListener("change", configure);
  reduced.addEventListener("change", configure);
  configure();
}
