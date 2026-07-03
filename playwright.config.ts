import { defineConfig, devices } from "@playwright/test";

/**
 * E2E navigateur reel (headless Chromium, independant du profil msedge du MCP).
 * Tests isoles dans `e2e/` (hors `src/`) pour ne pas croiser Vitest (`src/**`).
 * Le webServer reutilise le dev server local s'il tourne deja, en demarre un en CI.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
