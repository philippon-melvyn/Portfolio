const root = document.querySelector("#contact-page");
const info = root?.querySelector("[data-contact-info]");
const editor = root?.querySelector("[data-contact-editor]");
const openButton = root?.querySelector("[data-open-contact]");
const returnButton = root?.querySelector("[data-close-contact]");

if (root && info && editor && openButton && returnButton) {
  function setView(message) {
    // Le panneau sortant quitte immédiatement la navigation clavier.
    // Les champs sont conservés lors des allers-retours.
    info.inert = message;
    editor.inert = !message;
    info.setAttribute("aria-hidden", String(message));
    editor.setAttribute("aria-hidden", String(!message));
    openButton.setAttribute("aria-expanded", String(message));
    root.dataset.contactView = message ? "message" : "details";
    (message ? editor : openButton).focus({ preventScroll: true });
  }

  openButton.addEventListener("click", () => setView(true));
  returnButton.addEventListener("click", () => setView(false));
  editor.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setView(false);
    }
  });
}
