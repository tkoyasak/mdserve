import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import ssrComponents from "vite-ssr-components/plugin";

export default defineConfig({
  plugins: [cloudflare(), ssrComponents()],
});
