const panel = document.querySelector("[data-fullscreen-menu]");
const trigger = document.querySelector("[data-open-menu]");
if (panel && trigger) {
  const closeButton = panel.querySelector("[data-close-menu]");
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const animations = new Set();
  let closing = false;
  let pendingUrl;
  let previousOverflow;
  let navigating = false;

  function stopAnimations() {
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  }
  function play(element, frames, options) {
    if (!element?.animate || preference.matches) return null;
    const animation = element.animate(frames, options);
    animations.add(animation);
    animation.onfinish = () => animations.delete(animation);
    return animation;
  }
  function restore() {
    stopAnimations();
    closing = false;
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Ouvrir le menu");
    if (previousOverflow !== undefined) document.documentElement.style.overflow = previousOverflow;
    previousOverflow = undefined;
  }
  function finish() {
    const url = pendingUrl;
    pendingUrl = undefined;
    panel.close();
    restore();
    if (url) window.location.assign(url);
  }
  function open() {
    if (panel.open) return;
    navigating = false;
    document.querySelectorAll("[data-disclosure][open]").forEach((disclosure) => { disclosure.open = false; });
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    panel.showModal();
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-label", "Fermer le menu");
    play(panel, [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0)" }], { duration: 650, easing: "cubic-bezier(.76,0,.24,1)" });
    panel.querySelectorAll("[data-menu-reveal]").forEach((label, index) => {
      play(label, [{ transform: "translateY(115%) skewY(3deg)" }, { transform: "translateY(0) skewY(0)" }], { duration: 900, delay: 140 + index * 100, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
    });
  }
  function close(url) {
    if (!panel.open || closing) return;
    closing = true;
    pendingUrl = url;
    const snapshot = window.getComputedStyle(panel).clipPath;
    stopAnimations();
    if (url && !preference.matches) {
      // Le rideau appartient au dialogue pour rester dans sa couche supérieure.
      navigating = true;
      play(panel, [{ clipPath: snapshot === "none" ? "inset(0)" : snapshot }, { clipPath: "inset(0)" }], { duration: 250, fill: "forwards" });
      const curtain = document.createElement("div");
      curtain.className = "menu-route-curtain menu-route-curtain-departure";
      curtain.setAttribute("aria-hidden", "true");
      panel.append(curtain);
      const cover = play(curtain, [{ transform: "translateY(101%)" }, { transform: "translateY(0)" }], { duration: 750, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" });
      function handoff() {
        try {
          const destination = new URL(url, window.location.href);
          window.sessionStorage.setItem("portfolio-menu-transition", JSON.stringify({ path: destination.pathname + destination.search, expires: Date.now() + 12000 }));
        } catch { /* La page choisie reste accessible sans stockage. */ }
        // Garder le menu couvert jusqu’au changement de document évite un flash.
        window.location.assign(url);
      }
      if (cover) cover.onfinish = handoff;
      else handoff();
      return;
    }
    const animation = play(panel, [{ clipPath: snapshot === "none" ? "inset(0)" : snapshot }, { clipPath: "inset(0 0 100% 0)" }], { duration: 450, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" });
    if (animation) animation.onfinish = finish;
    else finish();
  }
  trigger.addEventListener("click", open);
  closeButton.addEventListener("click", () => close());
  panel.addEventListener("cancel", (event) => { event.preventDefault(); close(); });
  panel.addEventListener("close", restore);
  panel.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === "_blank") return;
      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin) {
        event.preventDefault();
        close(url.href);
      } else close();
    });
  });
  preference.addEventListener("change", () => {
    if (!preference.matches) return;
    if (closing) finish();
    else stopAnimations();
  });
  window.addEventListener("pagehide", () => {
    pendingUrl = undefined;
    panel.querySelectorAll(".menu-route-curtain").forEach((curtain) => curtain.remove());
    if (panel.open) finish();
  });
  window.addEventListener("pageswap", (event) => {
    if (navigating) event.viewTransition?.skipTransition();
  });
}
