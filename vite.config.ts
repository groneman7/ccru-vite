import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

import path from "path";

export default defineConfig({
  envPrefix: ["BETTER_AUTH_", "CONVEX_", "GOOGLE_"],
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "api": path.resolve(__dirname, "convex/_generated/api"),
    },
  },
});
