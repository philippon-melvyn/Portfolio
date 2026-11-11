const root = document.querySelector("[data-tool-carousel]");
if (root) {
  const rows = [...root.querySelectorAll("[data-tool-row]")];
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let enabled = false;
  let step = 1;
  let distance = 0;
  let frame;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function update() {
    frame = undefined;
    if (!enabled) return;
    const position = clamp(-root.getBoundingClientRect().top, 0, distance) / step;
    const current = Math.floor(position);
    const phase = clamp((position - current - .25) / .6, 0, 1);
    const mix = phase * phase * (3 - 2 * phase);
    rows.forEach((row, index) => {
      let opacity = 0;
      let offset = 48;
      if (index === current) { opacity = 1 - mix; offset = -mix * 48; }
      else if (index === current + 1) { opacity = mix; offset = (1 - mix) * 48; }
      row.style.setProperty("opacity", String(opacity));
      row.style.setProperty("transform", `translate3d(0, ${offset}px, 0)`);
    });
  }
  function requestUpdate() {
    if (enabled && frame === undefined) frame = window.requestAnimationFrame(update);
  }
  function configure() {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
    enabled = rows.length > 1 && !preference.matches;
    if (!enabled) {
      root.removeAttribute("data-tool-ready");
      root.style.removeProperty("height");
      rows.forEach((row) => {
        row.style.removeProperty("opacity");
        row.style.removeProperty("transform");
      });
      return;
    }
    step = clamp(window.innerHeight * .32, 180, 320);
    distance = (rows.length - 1) * step;
    root.setAttribute("data-tool-ready", "");
    root.style.setProperty("height", `${window.innerHeight + distance}px`);
    update();
  }
  // Scrolling controls the words inside the sticky stage; no autoplay or wheel lock.
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", configure, { passive: true });
  window.addEventListener("pageshow", configure);
  window.addEventListener("pagehide", () => {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
  });
  preference.addEventListener("change", configure);
  configure();
}
