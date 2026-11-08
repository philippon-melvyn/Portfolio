import { compositeColors, relativeLuminance, headerInk, imageSamplePoint } from "../lib/header-contrast.js";

const header = document.querySelector(".site-header");
if (header) {
  const controls = [...header.querySelectorAll("[data-header-contrast]")];
  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = colorCanvas.height = 1;
  const colorContext = colorCanvas.getContext("2d", { willReadFrequently: true });
  const colors = new Map();
  const imageCanvases = new WeakMap();
  let frame;
  let until = 0;
  let lastSample = -Infinity;

  function colorOf(value) {
    if (colors.has(value)) return colors.get(value);
    if (!colorContext) return [0, 0, 0, 0];
    colorContext.clearRect(0, 0, 1, 1);
    colorContext.fillStyle = value;
    colorContext.fillRect(0, 0, 1, 1);
    const pixel = [...colorContext.getImageData(0, 0, 1, 1).data];
    pixel[3] /= 255;
    colors.set(value, pixel);
    return pixel;
  }

  function sampleImage(image, x, y, style) {
    if (!image.complete || !image.naturalWidth) return null;
    const point = imageSamplePoint(image, image.getBoundingClientRect(), x, y, style.objectFit, style.objectPosition);
    if (!point) return null;
    const source = image.currentSrc || image.src;
    let cached = imageCanvases.get(image);
    if (!cached || cached.source !== source) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 64;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      cached = { source, context, readable: false };
      try {
        context.drawImage(image, 0, 0, 64, 64);
        context.getImageData(0, 0, 1, 1);
        cached.readable = true;
      } catch { /* Une image externe protégée utilise le fond CSS en repli. */ }
      imageCanvases.set(image, cached);
    }
    if (!cached.readable) return null;
    const pixel = [...cached.context.getImageData(Math.min(63, Math.floor(point.u * 64)), Math.min(63, Math.floor(point.v * 64)), 1, 1).data];
    pixel[3] /= 255;
    return pixel;
  }

  function measure() {
    // Le dialogue possède son propre logo blanc. Ne pas mesurer le fond
    // du menu pour les deux contrôles de la page située derrière lui.
    if (header.querySelector?.("[data-fullscreen-menu]")?.open) return;
    const styles = new Map();
    const styleOf = (element) => {
      if (!styles.has(element)) styles.set(element, window.getComputedStyle(element));
      return styles.get(element);
    };
    function backgroundAt(x, y) {
      let result = [0, 0, 0, 0];
      for (const element of document.elementsFromPoint(x, y)) {
        if (header.contains(element)) continue;
        const style = styleOf(element);
        let opacity = 1;
        for (let ancestor = element; ancestor; ancestor = ancestor.parentElement)
          opacity *= Number(styleOf(ancestor).opacity);
        if (opacity < 0.01 || style.visibility !== "visible") continue;
        let color = colorOf(style.backgroundColor);
        if (element.tagName === "IMG") {
          const pixel = sampleImage(element, x, y, style);
          if (pixel) color = compositeColors(pixel, color);
        }
        result = compositeColors(result, [color[0], color[1], color[2], color[3] * opacity]);
        if (result[3] > 0.999) break;
      }
      return relativeLuminance(compositeColors(result, [255, 255, 255, 1]));
    }
    controls.forEach((control) => {
      const bounds = control.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = bounds.left + bounds.width / 2;
      const luminance = [0.25, 0.5, 0.75].reduce((sum, ratio) => sum + backgroundAt(x, bounds.top + bounds.height * ratio), 0) / 3;
      control.dataset.headerInk = headerInk(luminance, control.dataset.headerInk);
    });
  }

  function tick(now) {
    frame = undefined;
    if (document.hidden) return;
    if (now - lastSample >= 64) {
      measure();
      lastSample = now;
    }
    if (now < until) frame = window.requestAnimationFrame(tick);
  }
  function schedule(duration = 1600) {
    until = Math.max(until, window.performance.now() + duration);
    if (frame === undefined && !document.hidden) frame = window.requestAnimationFrame(tick);
  }
  function pause() {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
    until = 0;
  }
  document.addEventListener("scroll", () => schedule(), { capture: true, passive: true });
  window.addEventListener("resize", () => schedule());
  document.addEventListener("load", () => schedule(400), true);
  document.addEventListener("close", () => schedule(500), true);
  ["transitionrun", "transitionend", "animationstart", "animationend"].forEach((name) =>
    document.addEventListener(name, (event) => { if (!header.contains(event.target)) schedule(2200); }, true),
  );
  new MutationObserver((mutations) => {
    if (mutations.some((mutation) => !header.contains(mutation.target))) schedule();
  }).observe(document.body, {
    subtree: true, childList: true, attributes: true,
    attributeFilter: ["class", "style", "hidden", "open", "data-current", "data-contact-view"],
  });
  document.addEventListener("visibilitychange", () => { if (document.hidden) pause(); else schedule(); });
  window.addEventListener("pagehide", pause);
  window.addEventListener("pageshow", () => schedule());
  schedule();
}
