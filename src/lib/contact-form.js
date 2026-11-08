export function contactMailto(email, fields) {
  const subject = String(fields.sujet || "Prise de contact").replace(
    /[\r\n]+/g,
    " ",
  );
  const name = [fields.prenom, fields.nom]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ");
  const body = `${String(fields.message || "").trim()}\n\n${name}\n${String(fields.email || "").trim()}`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
