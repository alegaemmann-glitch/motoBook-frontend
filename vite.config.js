import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/",
  preview: {
    allowedHosts: ["moto-book-frontend-production.up.railway.app"],
  },
  plugins: [react()],
});
