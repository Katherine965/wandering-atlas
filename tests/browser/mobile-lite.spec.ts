import { test, expect } from "@playwright/test";
import { geoOrthographic } from "d3-geo";
import { TRAVEL_GLOBE_GEOMETRY, TRAVEL_GLOBE_INITIAL_ROTATION } from "../../app/travel/travel-geometry";

for (const viewport of [{ width: 390, height: 844 }, { width: 375, height: 667 }, { width: 430, height: 932 }]) {
  test(`Cyber Mobile Lite ${viewport.width}: cold requests, idle, country, touch, markers and timeline`, async ({ browser }, info) => {
    const context = await browser.newContext({ viewport, isMobile: true, hasTouch: true, reducedMotion: "no-preference", baseURL: info.project.use.baseURL });
    await context.addInitScript(() => {
      localStorage.setItem("wandering-atlas-theme", "fairy-tale");
      const original = window.requestAnimationFrame.bind(window);
      const counters = { callbacks: 0 };
      Object.assign(window, { atlasRafCounters: counters });
      window.requestAnimationFrame = callback => original(time => { counters.callbacks++; callback(time); });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors: string[] = [], requests: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    page.on("request", r => requests.push(new URL(r.url()).pathname));
    try {
      await page.goto("/", { waitUntil: "networkidle" });
      await page.bringToFront();
      const initialResources = await page.evaluate(() => performance.getEntriesByType("resource").map(entry => {
        const r = entry as PerformanceResourceTiming;
        return { url: new URL(r.name).pathname, bytes: r.encodedBodySize, duration: r.duration };
      }));
      await expect(page.locator("[data-travel-theme]")).toHaveAttribute("data-travel-theme", "cyber");
      await expect(page.locator(".travel-globe-map")).toHaveAttribute("data-globe-render-mode", "mobile-lite");
      await expect(page.getByRole("button", { name: "Change Atlas" })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Enable editing" })).toBeDisabled();
      const editToggle = await page.getByRole("button", { name: "Enable editing" }).boundingBox();
      expect(editToggle!.x).toBeGreaterThanOrEqual(0);
      expect(editToggle!.width).toBeGreaterThanOrEqual(44);
      await expect(page.locator("canvas,.travel-globe-map image")).toHaveCount(0);
      await expect(page.locator(".travel-timeline-year-cell")).toHaveCount(3);
      await expect(page.locator(".travel-explorer-tools button")).toHaveCount(3);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
      const cssSphere = await page.locator(".travel-mobile-globe-sphere").boundingBox();
      const hit = await page.locator(".travel-globe-hit-surface").boundingBox();
      expect(Math.abs(cssSphere!.width - hit!.width)).toBeLessThan(1);
      expect(Math.abs(cssSphere!.x - hit!.x)).toBeLessThan(1);
      expect(hit!.x).toBeGreaterThanOrEqual(0);
      expect(hit!.x + hit!.width).toBeLessThanOrEqual(viewport.width);
      expect(await page.locator('.travel-globe-land').evaluate(e => getComputedStyle(e).filter)).toBe('none');
      if (process.env.ATLAS_CAPTURE === "1") await page.screenshot({ path: info.outputPath(`cyber-lite-${viewport.width}-initial.png`), animations: "disabled", timeout:30000 });

      const idle = async () => page.evaluate(async () => {
        const counters = (window as unknown as { atlasRafCounters: { callbacks: number } }).atlasRafCounters;
        const before = counters.callbacks;
        let mutations = 0;
        const observer = new MutationObserver(records => { mutations += records.length; });
        observer.observe(document.querySelector(".travel-globe-map")!, { subtree: true, attributes: true, attributeFilter: ["d", "style"] });
        await new Promise(resolve => setTimeout(resolve, 600));
        observer.disconnect();
        return { callbacks: counters.callbacks - before, mutations };
      });
      await page.waitForTimeout(200);
      expect(await idle()).toEqual({ callbacks: 0, mutations: 0 });
      // Click a known point in France through the actual SVG screen transform.
      const projection = geoOrthographic().translate([TRAVEL_GLOBE_GEOMETRY.centerX, TRAVEL_GLOBE_GEOMETRY.centerY]).scale(TRAVEL_GLOBE_GEOMETRY.diameter / 2).rotate(TRAVEL_GLOBE_INITIAL_ROTATION);
      const projected = projection([-0.58, 44.84])!;
      const point = await page.locator(".travel-globe-interaction").evaluate((svg, p) => {
        const screen = new DOMPoint(p[0], p[1]).matrixTransform((svg as SVGSVGElement).getScreenCTM()!);
        return { x: screen.x, y: screen.y };
      }, projected);
      await page.touchscreen.tap(point.x, point.y);
      await expect(page.locator(".travel-mobile-country-label")).toHaveText("France");
      await expect(page.locator(".travel-globe-selected-country")).toHaveCount(1);

      const marker = page.locator(".travel-marker:not([hidden])").first();
      const name = await marker.getAttribute("aria-label");
      await marker.tap();
      await expect(page.locator(".travel-postcard")).toBeVisible();
      expect(name).toContain(await page.locator("#travel-postcard-title").innerText());
      await page.locator(".travel-postcard-close").tap();
      const cdp = await context.newCDPSession(page);
      const send = (type: "touchStart" | "touchMove" | "touchEnd", points: { x: number; y: number; id: number }[]) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
      const cx = hit!.x + hit!.width / 2, cy = hit!.y + hit!.height / 2;
      const before = await page.locator("#travel-globe-land-geometry").getAttribute("d");
      await send("touchStart", [{ x: cx - 40, y: cy, id: 1 }]);
      for (let i = 1; i <= 6; i++) await send("touchMove", [{ x: cx - 40 + i * 12, y: cy + i, id: 1 }]);
      await send("touchEnd", []);
      await expect(page.locator("#travel-globe-land-geometry")).not.toHaveAttribute("d", before!);
      await send("touchStart", [{ x: cx - 45, y: cy, id: 1 }, { x: cx + 45, y: cy, id: 2 }]);
      await send("touchMove", [{ x: cx - 80, y: cy, id: 1 }, { x: cx + 80, y: cy, id: 2 }]);
      await send("touchEnd", []);
      expect(await page.locator(".travel-globe-map").evaluate(e => Number(getComputedStyle(e).getPropertyValue("--travel-globe-zoom")))).toBeGreaterThan(1);
      await page.waitForTimeout(200);
      expect(await idle()).toEqual({ callbacks: 0, mutations: 0 });
      const focus = page.locator(".travel-timeline-year-cell>button.is-focused");
      const year = Number(await focus.getAttribute("aria-label"));
      expect(await page.evaluate(() => window.visualViewport?.scale)).toBe(1);
      await page.getByRole("button", { name: "Next year", exact: true }).tap();
      expect(Number(await focus.getAttribute("aria-label"))).toBe(year + 1);
      await page.getByRole("button", { name: "Previous year", exact: true }).tap();
      expect(Number(await focus.getAttribute("aria-label"))).toBe(year);
      const resources = await page.evaluate(() => performance.getEntriesByType("resource").map(entry => {
        const r = entry as PerformanceResourceTiming;
        return { url: new URL(r.name).pathname, bytes: r.encodedBodySize, duration: r.duration };
      }));
      expect(requests.filter(r => r.includes("/travel/themes/") && !r.includes("/cyber/"))).toEqual([]);
      expect(requests.filter(r => /globe_land|globe_ocean|three.module|TravelCopperGlobeSurface|TravelFairyFeltGlobeSurface|country-detail-10m/.test(r))).toEqual([]);
      expect(errors).toEqual([]);
      await info.attach("resources", { body: JSON.stringify({ initialResources, resources, requests, errors }, null, 2), contentType: "application/json" });
      if (process.env.ATLAS_CAPTURE === "1") await page.screenshot({ path: info.outputPath(`cyber-lite-${viewport.width}.png`), animations: "disabled", timeout:30000 });
    } finally { await context.close(); }
  });
}
