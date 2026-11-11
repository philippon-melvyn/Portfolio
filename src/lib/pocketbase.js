import { asArray } from "./content.js";

const configuredUrl =
  import.meta.env?.POCKETBASE_URL || process.env.POCKETBASE_URL;
const baseUrl = configuredUrl?.replace(/\/+$/, "");

function requireBaseUrl() {
  if (!baseUrl)
    throw new Error(
      "POCKETBASE_URL manque. Renseigner .env à partir de .env.example.",
    );
  const url = new URL(baseUrl);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("POCKETBASE_URL doit être une URL HTTP ou HTTPS.");
  return baseUrl;
}

export function fileUrl(record, filename) {
  if (!record?.id || !filename) return null;
  const collection = record.collectionId || record.collectionName;
  if (!collection) return null;
  return `${requireBaseUrl()}/api/files/${encodeURIComponent(collection)}/${encodeURIComponent(record.id)}/${encodeURIComponent(filename)}`;
}

export function imagesFor(record, field) {
  return asArray(record?.[field])
    .filter(Boolean)
    .map((filename) => fileUrl(record, filename));
}

// Pas de SDK ni d’authentification administrateur : uniquement l’API REST publique.
export async function getRecords(collection, options = {}) {
  const records = [];
  let page = 1;
  let totalPages = 1;
  do {
    const url = new URL(
      `${requireBaseUrl()}/api/collections/${encodeURIComponent(collection)}/records`,
    );
    const parameters = {
      perPage: "100",
      sort: "ordre,id",
      ...options,
      page: String(page),
    };
    for (const [key, value] of Object.entries(parameters))
      if (value) url.searchParams.set(key, value);
    let response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    } catch (error) {
      throw new Error(
        `PocketBase inaccessible pour ${collection} : ${error.message}`,
      );
    }
    if (!response.ok)
      throw new Error(
        `PocketBase ${collection} : HTTP ${response.status}. Vérifier l’URL et les règles API.`,
      );
    const data = await response.json();
    if (!Array.isArray(data.items) || !Number.isInteger(data.totalPages))
      throw new Error(`Réponse PocketBase invalide pour ${collection}.`);
    records.push(...data.items);
    totalPages = data.totalPages;
    page += 1;
  } while (page <= totalPages);
  return records;
}

export async function getProjects() {
  const projects = await getRecords("Projets", {
    filter: "publie=true",
    expand: "competences,savoirs",
  });
  const slugs = new Set();
  for (const project of projects) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug || "")) {
      throw new Error(
        `Le projet « ${project.titre} » doit avoir un slug unique, en minuscules et avec des tirets.`,
      );
    }
    if (slugs.has(project.slug))
      throw new Error(`Slug de projet dupliqué : ${project.slug}`);
    slugs.add(project.slug);
  }
  return projects;
}

export function getSkills() {
  // La collection actuelle ne possède pas de champ ordre.
  return getRecords("competences", { filter: "publie=true", sort: "titre,id" });
}

export function getKnowledge() {
  return getRecords("savoirs", {
    filter: "publie=true",
    expand: "competences_liees",
  });
}

export function relatedRecords(project, field) {
  return asArray(project.expand?.[field])
    .filter((record) => record.publie === true)
    .sort(
      (a, b) => (a.ordre || 0) - (b.ordre || 0) || a.id.localeCompare(b.id),
    );
}
