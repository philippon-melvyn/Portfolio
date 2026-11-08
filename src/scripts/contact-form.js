import { contactMailto } from "../lib/contact-form.js";

const form = document.querySelector("[data-contact-form]");
if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = Object.fromEntries(new FormData(form));
    window.location.href = contactMailto(form.dataset.recipient, fields);
    document.querySelector("[data-form-status]").textContent =
      "Votre messagerie va s’ouvrir avec le message préparé. L’envoi se fait depuis votre messagerie.";
  });
}
