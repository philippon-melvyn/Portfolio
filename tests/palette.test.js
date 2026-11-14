import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { relativeLuminance } from "../src/lib/header-contrast.js";

test("Palette : contrastes des textes sur les fonds communs", async () => {
  const css = await readFile("src/styles/global.css", "utf8");
  const palette = Object.fromEntries([...css.matchAll(/--color-([\w-]+):\s*#([\da-f]{6});/gi)].map(([, name, hex]) => [name, hex]));
  const luminance = (name) => relativeLuminance(palette[name].match(/../g).map((channel) => parseInt(channel, 16)));
  for (const [text, background] of [["ink", "paper"], ["muted", "paper"], ["soft", "ink"], ["paper", "ink"], ["paper", "brick"]]) {
    const values = [luminance(text), luminance(background)].sort((a, b) => b - a);
    const ratio = (values[0] + 0.05) / (values[1] + 0.05);
    assert.ok(ratio >= 4.5, `${text} sur ${background} : ${ratio.toFixed(2)}:1`);
  }
});
