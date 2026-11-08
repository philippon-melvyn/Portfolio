import { asArray } from "./content.js";

export function projectDomains(value) {
  return [
    ...new Set(
      asArray(value)
        .map((item) => String(item).trim())
        .filter(Boolean),
    ),
  ];
}

export function filterProjects(items, domain) {
  return items.filter(
    (item) => domain === "all" || item.domains.includes(domain),
  );
}

export function nextProjectIndex(current, total, direction = 1) {
  return total > 0 ? (((current + direction) % total) + total) % total : 0;
}
