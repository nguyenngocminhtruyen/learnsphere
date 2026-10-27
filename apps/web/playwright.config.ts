import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
const executablePath =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
  (existsSync("/usr/bin/google-chrome") ? "/usr/bin/google-chrome" : undefined);
export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: process.env.UI_BASE_URL || "http://localhost:3100",
    trace: "retain-on-failure",
    launchOptions: { executablePath },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
  ],
  webServer: process.env.UI_BASE_URL
    ? undefined
    : {
        command: "pnpm dev --port 3100",
        url: "http://localhost:3100",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
