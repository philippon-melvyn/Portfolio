import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";
import { validateSiteUrl } from "./src/lib/seo.js";

const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");
const pocketbase = env.POCKETBASE_URL ? new URL(env.POCKETBASE_URL) : null;
const publicSite = validateSiteUrl(env.SITE_URL);

export default defineConfig({
  site: publicSite,
  output: "static",
  trailingSlash: "always",
  integrations: [{
    name: "production-site-url",
    hooks: {
      "astro:config:setup": ({ command }) => {
        if (command === "build") validateSiteUrl(env.SITE_URL, { required: true });
      },
    },
  }],
  redirects: {
    "/projets/la-cimade": "/projets/lacimade/",
  },
  image: {
    remotePatterns: pocketbase
      ? [
          {
            protocol: pocketbase.protocol.slice(0, -1),
            hostname: pocketbase.hostname,
            port: pocketbase.port,
            pathname: "/api/files/**",
          },
        ]
      : [],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
