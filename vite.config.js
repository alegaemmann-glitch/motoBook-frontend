import { defineConfig } from "vite";

export default defineConfig({
  base: "/",
  preview: {
    allowedHosts: ["moto-book-frontend-production.up.railway.app"],
  },
});
