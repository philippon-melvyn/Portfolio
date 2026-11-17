import { htmlElement } from "./dom.js";

/** @param {HTMLFormElement | null} form */
export function setupContactForm(form) {
  if (!form) return;
  const endpoint = form.dataset.endpoint;
  if (!endpoint) return;
  const status = htmlElement(form, "[data-form-status]");
  const fallback = htmlElement(form, "[data-contact-fallback]");
  const label = htmlElement(form, "[data-submit-label]");
  const button = /** @type {HTMLButtonElement | null} */ (
    form.querySelector('button[type="submit"]')
  );
  if (!status || !label || !button) return;

  let sending = false;
  form.addEventListener("input", (event) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      event.target.setCustomValidity("");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;

    for (const name of ["prenom", "nom", "email", "message"]) {
      const field = /** @type {HTMLInputElement | HTMLTextAreaElement | null} */ (
        form.elements.namedItem(name)
      );
      field?.setCustomValidity(field.value.trim() ? "" : "Merci de renseigner ce champ.");
    }
    if (!form.reportValidity()) return;

    const payload = Object.fromEntries(new FormData(form));
    payload._subject = `Portfolio — ${String(payload.sujet || "Prise de contact")}`;
    sending = true;
    button.disabled = true;
    label.textContent = "Envoi en cours…";
    form.setAttribute("aria-busy", "true");
    status.dataset.state = "sending";
    delete status.dataset.reason;
    if (fallback) fallback.hidden = true;
    status.textContent = "Transmission de votre message…";

    let failure = "network";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) {
        failure = response.status === 429 ? "rate-limit" : "provider";
        throw new Error("Contact service unavailable");
      }
      failure = "provider";
      const result = await response.json();
      if (result.success !== true && result.success !== "true") {
        failure = /activat/i.test(String(result.message || "")) ? "activation" : "rejected";
        throw new Error("Message not accepted");
      }
      status.dataset.state = "success";
      status.textContent = "Votre message a été transmis. Merci, je vous répondrai par e-mail.";
      form.reset();
    } catch (error) {
      status.dataset.state = "error";
      status.dataset.reason = failure;
      const timedOut = error instanceof Error && error.name === "TimeoutError";
      status.textContent = failure === "activation"
        ? "Le formulaire est en attente d’activation. Votre message est conservé. Vous pouvez me contacter directement par e-mail."
        : failure === "rate-limit"
          ? "Trop de tentatives rapprochées. Patientez quelques minutes ou contactez-moi directement par e-mail. Votre message est conservé."
          : timedOut
            ? "Le service met trop de temps à répondre. L’envoi n’a pas pu être confirmé. Votre message est conservé."
            : "L’envoi n’a pas pu être confirmé. Votre message est conservé : réessayez ou contactez-moi directement par e-mail.";
      if (fallback) fallback.hidden = false;
    } finally {
      sending = false;
      button.disabled = false;
      label.textContent = "Envoyer";
      form.removeAttribute("aria-busy");
    }
  });
}
