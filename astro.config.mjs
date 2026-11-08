import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");
const pocketbase = env.POCKETBASE_URL ? new URL(env.POCKETBASE_URL) : null;

export default defineConfig({
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
