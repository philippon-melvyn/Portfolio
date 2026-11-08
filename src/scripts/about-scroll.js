const root = document.querySelector("[data-about-story]");
if (root) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 900px)");
  const animations = new Set();
  const statement = root.querySelector(".about-statement");
  let frame;

  function play(element, frames, options) {
    if (!element?.animate || preference.matches) return;
    const animation = element.animate(frames, {
      duration: 850,
      easing: "cubic-bezier(.16,1,.3,1)",
      fill: "backwards",
      ...options,
    });
    animations.add(animation);
    animation.onfinish = () => animations.delete(animation);
  }

  // Aucun contenu n’est masqué avant l’observation : le texte reste accessible
  // sans JavaScript, avec mouvement réduit, et après annulation des animations.
  if ("IntersectionObserver" in window) {
    const delays = new Map();
    const sections = new Set(root.querySelectorAll("[data-about-section]"));
    const observer = new window.IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const block = entry.target;
        observer.unobserve(block);
        block.setAttribute("data-entered", "");
        if (sections.has(block)) {
          if (block.id === "about-inspirations")
            play(block, [{ backgroundColor: "#792a2d" }, { backgroundColor: "#101113" }], { duration: 1200, easing: "cubic-bezier(.22,1,.36,1)" });
          return;
        }
        const delay = delays.get(block) || 0;
        if (block.dataset.aboutEffect === "lines") {
          block.querySelectorAll(".about-line-content").forEach((line, index) => {
            play(line, [
              { transform: "translateY(110%) rotate(1.5deg)", opacity: 0.3 },
              { transform: "translateY(0) rotate(0)", opacity: 1 },
            ], { duration: 1000, delay: index * 110 });
          });
        } else if (block.dataset.aboutEffect === "portrait") {
          play(block.querySelector("img"), [
            { clipPath: "inset(0 0 100% 0)", transform: "scale(1.06)" },
            { clipPath: "inset(0)", transform: "scale(1)" },
          ], { duration: 1100, easing: "cubic-bezier(.76,0,.24,1)" });
          play(block.querySelector("figcaption"), [{ opacity: 0 }, { opacity: 1 }], { delay: 450 });
        } else if (block.dataset.aboutEffect === "step") {
          block.querySelectorAll("span, h3, p").forEach((part, index) => {
            play(part, [
              { opacity: 0, transform: "translateX(26px)" },
              { opacity: 1, transform: "translateX(0)" },
            ], { delay: index * 95, duration: 800 });
          });
        } else {
          play(block, [
            { opacity: 0, transform: "translateY(26px)" },
            { opacity: 1, transform: "translateY(0)" },
          ], { delay });
        }
      });
    }, { threshold: 0.15 });
    sections.forEach((section) => {
      observer.observe(section);
      section.querySelectorAll("[data-about-reveal]").forEach((block, index) => {
        delays.set(block, (index % 3) * 75);
        observer.observe(block);
      });
    });
  }

  function updateDrift() {
    frame = undefined;
    if (!statement) return;
    if (preference.matches || !desktop.matches) {
      statement.style.removeProperty("--about-drift");
      return;
    }
    const bounds = statement.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > window.innerHeight) return;
    const progress = (window.innerHeight / 2 - bounds.top - bounds.height / 2) / window.innerHeight;
    statement.style.setProperty("--about-drift", `${Math.max(-16, Math.min(16, progress * 32))}px`);
  }
  function requestDrift() {
    if (frame === undefined) frame = window.requestAnimationFrame(updateDrift);
  }
  window.addEventListener("scroll", requestDrift, { passive: true });
  window.addEventListener("resize", requestDrift, { passive: true });
  preference.addEventListener("change", () => {
    if (preference.matches) {
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      statement?.style.removeProperty("--about-drift");
    }
    requestDrift();
  });
  window.addEventListener("pagehide", () => {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
    animations.forEach((animation) => animation.cancel());
    animations.clear();
  });
  window.addEventListener("pageshow", requestDrift);
  requestDrift();
}
