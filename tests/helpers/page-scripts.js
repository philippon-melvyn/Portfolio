import { readFile } from "node:fs/promises";

export async function pageScript(page, name) {
  const source = await readFile(page, "utf8");
  const block = [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].find((match) => match[1].includes("// " + name + "\n"));
  if (!block) throw new Error("Script absent : " + name);
  return block[1];
}

export async function pageFunctions(page, name, exports) {
  const source = (await pageScript(page, name)).split("// Interactions")[0];
  return import("data:text/javascript;base64," + Buffer.from(source + "\nexport { " + exports.join(", ") + " };").toString("base64"));
}

export async function serverFunction(page, name) {
  const source = await readFile(page, "utf8");
  const declaration = source.split("\n").find((line) => line.startsWith("const " + name + " ="));
  return import("data:text/javascript;base64," + Buffer.from(declaration + "\nexport { " + name + " };").toString("base64"));
}
