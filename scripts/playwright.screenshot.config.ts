import { defineConfig, devices } from "@playwright/test";
import path from "node:path";

const rootDir = path.resolve(__dirname, "..");

export default defineConfig({
  testDir: ".",
  testMatch: "screenshot.ts",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:5176",
    ...devices["Desktop Chrome"],
    launchOptions: {
      args: ["--use-gl=angle", "--use-angle=swiftshader"],
    },
  },
  webServer: {
    command: `npx http-server ${rootDir} -p 5176 -c-1 --silent`,
    port: 5176,
    reuseExistingServer: true,
    timeout: 10000,
  },
});
