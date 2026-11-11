import { createHash } from "node:crypto";
import { imagesFor } from "./pocketbase.js";

// PocketBase gives a renamed file to each upload, even for identical images.
// Compare file contents while rendering, without modifying the records.
export async function projectMedia(project) {
  const cover = imagesFor(project, "couverture")[0];
  const gallery = imagesFor(project, "galerie");
  const moodboards = {
    olyvia: /^rectangle99_/,
    bargo: /^moodboard_/,
    aqita: /^moodboard_/,
  };
  const preferred = moodboards[project.slug];
  const leadIndex = preferred ? gallery.findIndex((url) => preferred.test(decodeURIComponent(url.split("/").at(-1)))) : -1;
  if (leadIndex > 0) gallery.unshift(...gallery.splice(leadIndex, 1));
  const linkImages = [1, 2].map((number) => imagesFor(project, `liens_img_${number}`)[0]);
  const urls = [...new Set([cover, ...gallery, ...linkImages].filter(Boolean))];
  const fingerprints = new Map(await Promise.all(urls.map(async (url) => {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Image du projet « ${project.titre} » : HTTP ${response.status}.`);
    const hash = createHash("sha256").update(Buffer.from(await response.arrayBuffer())).digest("hex");
    return [url, hash];
  })));
  const seen = new Set();
  function unique(url) {
    if (!url) return undefined;
    const fingerprint = fingerprints.get(url);
    if (seen.has(fingerprint)) return undefined;
    seen.add(fingerprint);
    return url;
  }
  return {
    cover: unique(cover),
    gallery: gallery.map(unique).filter(Boolean),
    linkImages: linkImages.map(unique),
  };
}
