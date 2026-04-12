import { expect, test } from "@playwright/test";

const PAGE = "/e2e/fork-me-control.html";

async function initMap(page: import("@playwright/test").Page) {
  await page.goto(PAGE, { waitUntil: "load" });
  await page.waitForFunction(() => (window as any).__e2e != null, {
    timeout: 30_000,
  });
}

test.describe("ForkMeControl E2E", () => {
  test("control initializes successfully", async ({ page }) => {
    await initMap(page);

    const result = await page.evaluate(() => ({
      ok: (window as any).__e2e?.ok,
      error: (window as any).__e2e?.error,
    }));
    expect(result.ok, result.error).toBe(true);
  });

  test("ribbon image is displayed inside the map", async ({ page }) => {
    await initMap(page);

    const img = page.locator(
      "#map .maplibregl-ctrl img[alt='Fork me on GitHub']",
    );
    await expect(img).toBeVisible();
  });

  test("ribbon links to the correct URL", async ({ page }) => {
    await initMap(page);

    const anchor = page.locator("a", {
      has: page.locator("img[alt='Fork me on GitHub']"),
    });
    const href = await anchor.getAttribute("href");
    expect(href).toBe("https://github.com/geolonia/maplibre-fork-me-control");
  });

  test("ribbon link opens in a new tab", async ({ page }) => {
    await initMap(page);

    const anchor = page.locator("a", {
      has: page.locator("img[alt='Fork me on GitHub']"),
    });
    await expect(anchor).toHaveAttribute("target", "_blank");
    await expect(anchor).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("top-left control group is shifted down", async ({ page }) => {
    await initMap(page);

    const top = await page
      .locator("#map .maplibregl-ctrl-top-left")
      .evaluate((el) => el.style.top);
    expect(top).toBe("149px");
  });

  test("removeControl restores top-left style", async ({ page }) => {
    await initMap(page);

    await page.evaluate(() => {
      const e = (window as any).__e2e;
      e.map.removeControl(e.ctrl);
    });

    const top = await page
      .locator("#map .maplibregl-ctrl-top-left")
      .evaluate((el) => el.style.top);
    expect(top).toBe("");
  });

  test("ribbon is removed from DOM after removeControl", async ({ page }) => {
    await initMap(page);

    const img = page.locator(
      "#map .maplibregl-ctrl img[alt='Fork me on GitHub']",
    );
    await expect(img).toBeVisible();

    await page.evaluate(() => {
      const e = (window as any).__e2e;
      e.map.removeControl(e.ctrl);
    });

    await expect(img).not.toBeVisible();
  });
});
