import { expect, test } from "@playwright/test";

const PAGE = "/e2e/fork-me-top-right.html";

async function initMap(page: import("@playwright/test").Page) {
  await page.goto(PAGE, { waitUntil: "load" });
  await page.waitForFunction(() => (window as any).__e2e != null, {
    timeout: 30_000,
  });
}

test.describe("ForkMeControl top-right E2E", () => {
  test("control initializes successfully", async ({ page }) => {
    await initMap(page);

    const result = await page.evaluate(() => ({
      ok: (window as any).__e2e?.ok,
      error: (window as any).__e2e?.error,
    }));
    expect(result.ok, result.error).toBe(true);
  });

  test("ribbon is displayed in the top-right corner", async ({ page }) => {
    await initMap(page);

    const img = page.locator(
      "#map .maplibregl-ctrl-top-right img[alt='Fork me on GitHub']",
    );
    await expect(img).toBeVisible();
  });

  test("top-right control group is shifted down", async ({ page }) => {
    await initMap(page);

    const top = await page
      .locator("#map .maplibregl-ctrl-top-right")
      .evaluate((el) => el.style.top);
    expect(top).toBe("149px");
  });

  test("removeControl restores top-right style", async ({ page }) => {
    await initMap(page);

    await page.evaluate(() => {
      const e = (window as any).__e2e;
      e.map.removeControl(e.ctrl);
    });

    const top = await page
      .locator("#map .maplibregl-ctrl-top-right")
      .evaluate((el) => el.style.top);
    expect(top).toBe("");
  });
});
