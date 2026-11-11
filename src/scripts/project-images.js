const root = document.querySelector(".project-detail");
if (root && "IntersectionObserver" in window) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const images = [...root.querySelectorAll(".project-opening-cover img, .project-lead-image img, .project-gallery-image img, .project-resources > div > a img")];
  const entered = new WeakSet();
  const animations = new Set();
  const loading = new Map();
  let observer;

  function reveal(image) {
    if (preference.matches || entered.has(image) || !image.animate) return;
    entered.add(image);
    const animation = image.animate([
      { opacity: 0, transform: "translateY(22px) scale(1.045)", clipPath: "inset(0 0 8% 0)" },
      { opacity: 1, transform: "translateY(0) scale(1)", clipPath: "inset(0)" },
    ], { duration: 1100, easing: "cubic-bezier(.22,1,.36,1)", fill: "backwards" });
    animations.add(animation);
    animation.onfinish = () => animations.delete(animation);
  }
  function stop() {
    observer?.disconnect();
    animations.forEach((animation) => animation.cancel());
    animations.clear();
    loading.forEach((callback, image) => image.removeEventListener("load", callback));
    loading.clear();
  }
  function start() {
    stop();
    if (preference.matches) return;
    observer = new window.IntersectionObserver((entries) => {
      entries.forEach(({ target: image, isIntersecting }) => {
        if (!isIntersecting) return;
        observer.unobserve(image);
        if (image.complete) reveal(image);
        else {
          const onLoad = () => { loading.delete(image); reveal(image); };
          loading.set(image, onLoad);
          image.addEventListener("load", onLoad, { once: true });
        }
      });
    }, { threshold: .08 });
    images.forEach((image) => { if (!entered.has(image)) observer.observe(image); });
  }
  // Images stay visible without JavaScript and when animations are disabled.
  preference.addEventListener("change", start);
  window.addEventListener("pagehide", stop);
  window.addEventListener("pageshow", start);
  start();
}
