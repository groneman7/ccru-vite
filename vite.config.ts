import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

import path from "path";

export default defineConfig({
    envPrefix: ["CONVEX_", "CLERK_"],
    plugins: [
        tanstackRouter({
            target: "react",
            autoCodeSplitting: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: { "@": path.resolve(__dirname, "."), api: path.resolve(__dirname, "convex/_generated/api") },
    },
});
