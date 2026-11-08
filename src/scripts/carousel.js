// Sans JavaScript, les éléments restent accessibles à la suite dans la page.
document.querySelectorAll("[data-carousel]").forEach((carousel) => {
  const slides = [...carousel.querySelectorAll("[data-slide]")];
  if (!slides.length) return;
  let current = 0;
  function show(index, animate = true) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.hidden = slideIndex !== current;
    });
    if (
      animate &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      slides[current].classList.remove("carousel-appear");
      void slides[current].offsetWidth;
      slides[current].classList.add("carousel-appear");
    }
    carousel.querySelectorAll("[data-slide-select]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(Number(button.dataset.slideSelect) === current),
      );
    });
    const status = carousel.querySelector("[data-carousel-status]");
    if (status)
      status.textContent = `${String(current + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  }
  carousel
    .querySelector("[data-previous]")
    ?.addEventListener("click", () => show(current - 1));
  carousel
    .querySelector("[data-next]")
    ?.addEventListener("click", () => show(current + 1));
  carousel.querySelectorAll("[data-slide-select]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.slideSelect);
      show(index);
      slides[current]
        .querySelector(`[data-slide-select="${index}"]`)
        ?.focus({ preventScroll: true });
    });
  });
  show(0, false);
});
