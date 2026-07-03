import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const SITE = process.env.SITE_URL || "https://wenzelt-cg.github.io";
const BASE = process.env.BASE_PATH || "/idea_base_ai";

export default defineConfig({
  site: SITE,
  base: BASE,
  output: "static",
  integrations: [sitemap()],
});
