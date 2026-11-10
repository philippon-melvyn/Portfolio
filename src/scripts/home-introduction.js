import { introState } from "../lib/home-introduction.js";

const root = document.querySelector("[data-home-introduction]");
if (root) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const space = root.querySelector("[data-intro-zoom-space]");
  const texts = [...(document.querySelectorAll?.("[data-home-reveal]") || [])];
  const properties = ["slide", "name-opacity", "name-x", "shade"];
  let frame;
  let lastProgress;
  let observer;

  function update(force = false) {
    frame = undefined;
    if (preference.matches) return;
    const progress = Math.max(0, Math.min(1, -root.getBoundingClientRect().top / Math.max(1, space.offsetHeight)));
    if (!force && progress === lastProgress) return;
    lastProgress = progress;
    const state = introState(progress);
    const values = { slide: state.slide, "name-opacity": state.nameOpacity, "name-x": `${state.nameX}px`, shade: state.shade };
    for (const [name, value] of Object.entries(values)) root.style.setProperty(`--intro-${name}`, String(value));
  }
  function requestUpdate() {
    if (frame === undefined && !preference.matches) frame = window.requestAnimationFrame(() => update());
  }
  function configure() {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
    observer?.disconnect();
    if (preference.matches) {
      root.removeAttribute("data-intro-ready");
      properties.forEach((name) => root.style.removeProperty(`--intro-${name}`));
      texts.forEach((text) => text.removeAttribute("data-reveal-ready"));
      lastProgress = undefined;
      return;
    }
    root.setAttribute("data-intro-ready", "");
    update(true);
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-reveal-ready", "visible");
          observer.unobserve(entry.target);
        });
      }, { threshold: 0, rootMargin: "0px 0px -6% 0px" });
      texts.forEach((text) => {
        if (text.getAttribute("data-reveal-ready") === "visible") return;
        // Text already above the viewport must remain readable after restoration.
        if (text.getBoundingClientRect().top < window.innerHeight * .94) {
          text.setAttribute("data-reveal-ready", "visible");
        } else {
          text.setAttribute("data-reveal-ready", "");
          observer.observe(text);
        }
      });
    }
  }
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", configure, { passive: true });
  window.addEventListener("pageshow", configure);
  window.addEventListener("pagehide", () => {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
    observer?.disconnect();
  });
  preference.addEventListener("change", configure);
  configure();
}
