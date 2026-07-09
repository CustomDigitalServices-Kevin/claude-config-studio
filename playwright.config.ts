import { defineConfig, devices } from "@playwright/test";

/**
 * E2E navigateur reel (headless Chromium, independant du profil msedge du MCP).
 * Tests isoles dans `e2e/` (hors `src/`) pour ne pas croiser Vitest (`src/**`).
 * En CI : on teste le BUILD de production servi par `vite preview` (port 4173).
 * En local : dev server (port 5173), reutilise s'il tourne deja.
 */
const isCI = !!process.env.CI;
const port = isCI ? 4173 : 5173;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: isCI ? "npm run build && npm run preview" : "npm run dev",
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
