import { test } from "@playwright/test";

test("capture screenshot for README", async ({ page }) => {
  await page.goto("/e2e/fork-me-control.html", { waitUntil: "load" });
  await page.waitForFunction(() => (window as any).__e2e != null, {
    timeout: 30_000,
  });

  // マップのタイル読み込み完了を待つ
  await page.waitForFunction(
    () => {
      const map = (window as any).__e2e?.map;
      return map && typeof map.loaded === "function" && map.loaded();
    },
    { timeout: 60_000 },
  );

  // レンダリング安定のため少し待つ
  await page.waitForTimeout(1000);

  await page.locator("#map").screenshot({ path: "assets/screenshot.png" });
});
