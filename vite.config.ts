/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: "./" => chemins relatifs => deployable en static (GitHub Pages / Vercel) ou ouvrable en file://
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      // react + react-dom + scheduler isoles dans un chunk vendor stable (cache long,
      // chunk principal < 500 Ko). Forme fonction : capture react-dom/client, non matche
      // par la forme objet ["react","react-dom"].
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "react-vendor";
          }
          return undefined;
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
