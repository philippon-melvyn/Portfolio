const html = document.documentElement;
if (html.dataset.menuArrival === "pending") {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (preference.matches) {
    delete html.dataset.menuArrival;
  } else {
    const curtain = document.createElement("div");
    curtain.className = "menu-route-curtain menu-route-curtain-arrival [content:''] fixed inset-0 [background:#a33333] pointer-events-auto z-2147483647 motion-reduce:hidden";
    curtain.setAttribute("aria-hidden", "true");
    document.body.append(curtain);
    delete html.dataset.menuArrival;
    const motions = [];
    let disposed = false;
    function cleanup() {
      disposed = true;
      motions.forEach((animation) => animation.cancel());
      curtain.remove();
    }
    function reveal() {
      if (disposed) return;
      if (preference.matches || !curtain.animate) return cleanup();
      const wipe = curtain.animate(
        [{ transform: "translateY(0)" }, { transform: "translateY(-101%)" }],
        { duration: 1050, easing: "cubic-bezier(.76,0,.16,1)", fill: "forwards" },
      );
      motions.push(wipe);
      const main = document.querySelector("main");
      const entrance = main?.animate?.(
        [{ opacity: .7, transform: "translateY(28px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 1100, delay: 100, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" },
      );
      if (entrance) motions.push(entrance);
      wipe.onfinish = () => curtain.remove();
    }
    // Laisser au visuel prioritaire un court délai pour se décoder sous le rideau.
    const images = [...document.querySelectorAll('main img[fetchpriority="high"]')];
    const decoded = Promise.allSettled(images.map((image) => image.decode?.()));
    Promise.race([decoded, new Promise((resolve) => window.setTimeout(resolve, 350))]).then(() => {
      window.requestAnimationFrame(reveal);
    });
    preference.addEventListener("change", () => { if (preference.matches) cleanup(); });
    window.addEventListener("pagehide", cleanup, { once: true });
  }
}
