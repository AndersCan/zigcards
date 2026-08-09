import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:8000",
    viewport: { width: 390, height: 844 }, // mobile-first
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
  webServer: {
    command: "npm run build && node scripts/serve.mjs",
    url: "http://localhost:8000",
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
