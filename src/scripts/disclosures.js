const disclosures = [...document.querySelectorAll("[data-disclosure]")];

disclosures.forEach((menu) => {
  const trigger = menu.querySelector("summary");
  function update() {
    trigger.setAttribute("aria-expanded", String(menu.open));
    trigger.setAttribute(
      "aria-label",
      `${menu.open ? "Fermer" : "Ouvrir"} ${menu.dataset.disclosureLabel}`,
    );
    if (menu.open)
      disclosures.forEach((other) => {
        if (other !== menu) other.open = false;
      });
  }
  menu.addEventListener("toggle", update);
  menu.addEventListener("focusout", (event) => {
    if (event.relatedTarget && !menu.contains(event.relatedTarget))
      menu.open = false;
  });
  update();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  disclosures.forEach((menu) => {
    if (menu.open) {
      menu.open = false;
      menu.querySelector("summary").focus();
    }
  });
});

document.addEventListener("click", (event) => {
  disclosures.forEach((menu) => {
    if (!menu.open) return;
    if (!menu.contains(event.target)) {
      menu.open = false;
      return;
    }
    const action = event.target.closest?.("a, [data-close-disclosure]");
    if (action && menu.contains(action)) {
      menu.open = false;
      if (action.matches("[data-close-disclosure]"))
        menu.querySelector("summary").focus();
    }
  });
});
