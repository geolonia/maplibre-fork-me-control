import { expect, test } from "@playwright/test";

const PAGE = "/e2e/fork-me-local-image.html";

async function initMap(page: import("@playwright/test").Page) {
  await page.goto(PAGE, { waitUntil: "load" });
  await page.waitForFunction(() => (window as any).__e2e != null, {
    timeout: 30_000,
  });
}

test.describe("ForkMeControl local image E2E", () => {
  test("control initializes with local SVG image", async ({ page }) => {
    await initMap(page);

    const result = await page.evaluate(() => ({
      ok: (window as any).__e2e?.ok,
      error: (window as any).__e2e?.error,
    }));
    expect(result.ok, result.error).toBe(true);
  });

  test("local SVG image is loaded and rendered", async ({ page }) => {
    await initMap(page);

    const img = page.locator(
      "#map .maplibregl-ctrl img[alt='Fork me on GitHub']",
    );
    await expect(img).toBeVisible();

    // 画像が実際に読み込まれたことを naturalWidth で確認
    const loaded = await img.evaluate(
      (el) =>
        new Promise<boolean>((resolve) => {
          const imgEl = el as HTMLImageElement;
          if (imgEl.complete && imgEl.naturalWidth > 0) {
            resolve(true);
            return;
          }
          imgEl.addEventListener("load", () => resolve(true));
          imgEl.addEventListener("error", () => resolve(false));
        }),
    );
    expect(loaded).toBe(true);
  });

  test("image src points to local SVG", async ({ page }) => {
    await initMap(page);

    const src = await page
      .locator("#map .maplibregl-ctrl img[alt='Fork me on GitHub']")
      .getAttribute("src");
    expect(src).toBe("/assets/forkme_left_darkblue.svg");
  });
});
