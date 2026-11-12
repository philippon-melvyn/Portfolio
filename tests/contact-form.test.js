import { pageScript, pageFunctions } from "./helpers/page-scripts.js";
import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
const { contactMailto } = await pageFunctions("src/pages/contact.astro", "contact-form", ["contactMailto"]);

test("Contact : changer de côté, rendre uniquement le panneau actif accessible et revenir par Échap", async () => {
  const node = () => ({
    attributes: {},
    listeners: {},
    addEventListener(type, handler) { this.listeners[type] = handler; },
    setAttribute(name, value) { this.attributes[name] = value; },
    focus(options) { focused = this; assert.equal(options.preventScroll, true); },
  });
  let focused;
  const info = node();
  const editor = node();
  const open = node();
  const back = node();
  const root = {
    dataset: { contactView: "details" },
    querySelector: (selector) => ({
      "[data-contact-info]": info,
      "[data-contact-editor]": editor,
      "[data-open-contact]": open,
      "[data-close-contact]": back,
    })[selector],
  };
  const source = await pageScript("src/pages/contact.astro", "contact-switch");
  runInNewContext(source, { document: { querySelector: () => root } });
  open.listeners.click();
  assert.equal(root.dataset.contactView, "message");
  assert.equal(info.inert, true);
  assert.equal(editor.inert, false);
  assert.equal(info.attributes["aria-hidden"], "true");
  assert.equal(editor.attributes["aria-hidden"], "false");
  assert.equal(open.attributes["aria-expanded"], "true");
  assert.equal(focused, editor);
  let prevented = false;
  editor.listeners.keydown({ key: "Escape", preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(root.dataset.contactView, "details");
  assert.equal(info.inert, false);
  assert.equal(editor.inert, true);
  assert.equal(open.attributes["aria-expanded"], "false");
  assert.equal(focused, open);
  open.listeners.click();
  back.listeners.click();
  assert.equal(focused, open);
  assert.equal(root.dataset.contactView, "details");
  runInNewContext(source, { document: { querySelector: () => null } });
});

test("Contact Figma : préparer l’e-mail sans simuler un envoi", () => {
  const result = contactMailto("contact@example.org", {
    nom: " Martin ",
    prenom: " Léa ",
    email: "lea@example.org",
    sujet: "Projet & identité",
    message: "Bonjour,\nUne idée ?",
  });
  const url = new URL(result);
  assert.equal(url.protocol, "mailto:");
  assert.equal(url.pathname, "contact@example.org");
  assert.equal(url.searchParams.get("subject"), "Projet & identité");
  assert.equal(
    url.searchParams.get("body"),
    "Bonjour,\nUne idée ?\n\nLéa Martin\nlea@example.org",
  );
  assert.ok(
    !contactMailto("contact@example.org", {
      sujet: "Test\r\nBcc: autre@example.org",
    }).includes("\n"),
  );
});

test("Contact Figma : valider les champs puis ouvrir le brouillon dans la messagerie", async () => {
  let onSubmit;
  let valid = false;
  const form = {
    dataset: { recipient: "contact@example.org" },
    reportValidity: () => valid,
    addEventListener: (_type, listener) => {
      onSubmit = listener;
    },
  };
  const status = {};
  const window = { location: { href: "" } };
  const source = (
    await pageScript("src/pages/contact.astro", "contact-form")
  ).replace(/^import .*;\r?\n/, "");
  runInNewContext(source, {
    contactMailto,
    window,
    document: {
      querySelector: (selector) =>
        selector === "[data-contact-form]" ? form : status,
    },
    FormData: class {
      *[Symbol.iterator]() {
        yield ["message", "Bonjour"];
        yield ["sujet", "Projet"];
      }
    },
  });
  onSubmit({ preventDefault() {} });
  assert.equal(window.location.href, "");
  valid = true;
  onSubmit({ preventDefault() {} });
  assert.match(
    window.location.href,
    /^mailto:contact@example.org\?subject=Projet&body=Bonjour/,
  );
  assert.match(status.textContent, /L’envoi se fait depuis votre messagerie/);
});
