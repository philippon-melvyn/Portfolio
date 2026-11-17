// Run with Node, not Bun: do not preload the developer's .env into process.env.
import { appendFile, realpath } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { loadEnv } from "vite";

const [directory, output] = process.argv.slice(2);
if (!directory || !output) throw new Error("Expected configuration directory and GITHUB_ENV path.");
const source = await realpath(directory);
if (source === await realpath(process.cwd())) {
  throw new Error("Server configuration must be isolated outside the working directory.");
}

// Preserve Vite's .env < .env.local < .env.production < .env.production.local
// priority and variable expansion, without passing unrelated server secrets on.
const env = loadEnv("production", source, "");
const keys = ["CONTACT_EMAIL", "LINKEDIN_URL", "GITHUB_URL", "BEHANCE_URL", "INSTAGRAM_URL", "CV_URL"];
let settings = "";
for (const key of keys) {
  if (!(key in env)) continue;
  const value = env[key];
  if (/[\r\n\0]/.test(value)) throw new Error(`Invalid multiline production setting: ${key}`);
  if (value && process.env.GITHUB_ACTIONS === "true") {
    // GitHub masks these in subsequent step headers as well as command output.
    console.log(`::add-mask::${value.replaceAll("%", "%25")}`);
  }
  const delimiter = `portfolio_${randomUUID()}`;
  settings += `${key}<<${delimiter}\n${value}\n${delimiter}\n`;
}
await appendFile(resolve(output), settings, { mode: 0o600 });
console.log("Production settings prepared; server-only variables excluded.");
