import { test } from "@playwright/test";

test("capture screenshot for README", async ({ page }) => {
  await page.goto("/e2e/fork-me-control.html", { waitUntil: "load" });
  await page.waitForFunction(() => (window as any).__e2e != null, {
    timeout: 30_000,
  });
  await page.waitForTimeout(3000);
  await page.locator("#map").screenshot({ path: "assets/screenshot.png" });
});
