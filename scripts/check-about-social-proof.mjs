import fs from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.ABOUT_QA_URL || "http://localhost:3000/about";
const outputDir = process.env.ABOUT_QA_OUTPUT || "/tmp/als-about-social-proof-qa";
const widths = [390, 768, 1024, 1440, 1760];
const expected = {
  390: { gutter: 24, columns: 2, cellHeight: 120 },
  768: { gutter: 40, columns: 3, cellHeight: 130 },
  1024: { gutter: 56, columns: 4, cellHeight: 140 },
  1440: { gutter: 80, columns: 4, cellHeight: 150 },
  1760: { gutter: 80, columns: 5, cellHeight: 150 },
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

await fs.mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 1200 }, reducedMotion: "reduce" });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.locator(".testimonial-section").scrollIntoViewIfNeeded();
    await page.locator(".client-wall").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll(".client-logo-grid img")].every((image) => image.complete && image.naturalWidth > 0));

    const metrics = await page.evaluate(() => {
      const slider = document.querySelector(".testimonial-slider");
      const wall = document.querySelector(".client-wall-inner");
      const grid = document.querySelector(".client-logo-grid");
      const firstCell = grid?.querySelector("li");
      const previous = document.querySelector(".testimonial-controls button:first-child");
      const next = document.querySelector(".testimonial-controls button:last-child");
      if (!slider || !wall || !grid || !firstCell || !previous || !next) throw new Error("Social-proof markup is incomplete");
      const sliderRect = slider.getBoundingClientRect();
      const wallRect = wall.getBoundingClientRect();
      const cellRect = firstCell.getBoundingClientRect();
      const previousRect = previous.getBoundingClientRect();
      const nextRect = next.getBoundingClientRect();
      return {
        sliderLeft: sliderRect.left,
        sliderRight: innerWidth - sliderRect.right,
        wallLeft: wallRect.left,
        wallRight: innerWidth - wallRect.right,
        columns: getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        cellHeight: cellRect.height,
        logoCount: grid.querySelectorAll("li img").length,
        loadedLogoCount: [...grid.querySelectorAll("li img")].filter((image) => image.complete && image.naturalWidth > 0).length,
        decorativeCellDisplay: getComputedStyle(grid, "::after").display,
        decorativeCellContent: getComputedStyle(grid, "::after").content,
        decorativeCellHeight: Number.parseFloat(getComputedStyle(grid, "::after").height),
        previousDisabled: previous.disabled,
        nextDisabled: next.disabled,
        previousTarget: [previousRect.width, previousRect.height],
        nextTarget: [nextRect.width, nextRect.height],
        horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
      };
    });

    const contract = expected[width];
    for (const [name, actual] of [
      ["testimonial left gutter", metrics.sliderLeft],
      ["testimonial right gutter", metrics.sliderRight],
      ["client-wall left gutter", metrics.wallLeft],
      ["client-wall right gutter", metrics.wallRight],
    ]) assert(Math.abs(actual - contract.gutter) <= 1, `${width}: ${name} was ${actual}, expected ${contract.gutter}`);
    assert(metrics.columns === contract.columns, `${width}: found ${metrics.columns} client columns, expected ${contract.columns}`);
    assert(Math.abs(metrics.cellHeight - contract.cellHeight) <= 1, `${width}: client cell height was ${metrics.cellHeight}, expected ${contract.cellHeight}`);
    assert(metrics.logoCount === 20 && metrics.loadedLogoCount === 20, `${width}: not all twenty logos loaded`);
    assert(metrics.horizontalOverflow <= 0, `${width}: page has ${metrics.horizontalOverflow}px horizontal overflow`);
    assert(metrics.previousDisabled && !metrics.nextDisabled, `${width}: initial bounded controls are incorrect`);
    assert(metrics.previousTarget[0] >= 44 && metrics.previousTarget[1] >= 44, `${width}: Previous target is smaller than 44px`);
    assert(metrics.nextTarget[0] >= 44 && metrics.nextTarget[1] >= 44, `${width}: Next target is smaller than 44px`);
    if (width === 768) {
      assert(metrics.decorativeCellDisplay !== "none" && metrics.decorativeCellContent !== "none", "768: decorative matrix cell is missing");
      assert(Math.abs(metrics.decorativeCellHeight - 130) <= 1, "768: decorative matrix cell has the wrong height");
    } else {
      assert(metrics.decorativeCellDisplay === "none" || metrics.decorativeCellContent === "none", `${width}: decorative matrix cell should be hidden`);
    }

    const slider = page.locator(".testimonial-slider");
    await slider.focus();
    await slider.press("ArrowRight");
    await page.waitForFunction(() => document.querySelector(".testimonial-attribution strong")?.textContent === "Greg Williams");
    assert((await page.locator(".testimonial-attribution strong").allTextContents()).some((text) => text.trim() === "Greg Williams"), `${width}: ArrowRight did not advance`);
    for (let index = 0; index < 3; index += 1) await page.getByRole("button", { name: "Next testimonial" }).click();
    await page.waitForFunction(() => document.querySelector(".testimonial-attribution strong")?.textContent === "Mark Miller");
    assert((await page.locator(".testimonial-attribution strong").allTextContents()).some((text) => text.trim() === "Mark Miller"), `${width}: fifth testimonial attribution is incorrect`);
    assert(await page.getByRole("button", { name: "Next testimonial" }).isDisabled(), `${width}: Next should be disabled on state five`);
    await slider.press("ArrowLeft");
    await page.waitForFunction(() => document.querySelector(".testimonial-attribution strong")?.textContent === "Clint Easley");
    assert((await page.locator(".testimonial-attribution strong").allTextContents()).some((text) => text.trim() === "Clint Easley"), `${width}: ArrowLeft did not move backward`);
    const focusOutline = await slider.evaluate((element) => getComputedStyle(element).outlineStyle);
    assert(focusOutline !== "none", `${width}: keyboard focus is not visibly indicated`);
    if (width === 390) {
      await slider.dispatchEvent("touchstart", { changedTouches: [{ identifier: 0, target: null, clientX: 100, clientY: 100 }] });
      await slider.dispatchEvent("touchend", { changedTouches: [{ identifier: 0, target: null, clientX: 160, clientY: 102 }] });
      await page.waitForFunction(() => document.querySelector(".testimonial-attribution strong")?.textContent === "Bradley Farris");
      assert((await page.locator(".testimonial-attribution strong").allTextContents()).some((text) => text.trim() === "Bradley Farris"), "390: right swipe did not move backward");
      await slider.dispatchEvent("touchstart", { changedTouches: [{ identifier: 0, target: null, clientX: 160, clientY: 100 }] });
      await slider.dispatchEvent("touchend", { changedTouches: [{ identifier: 0, target: null, clientX: 100, clientY: 102 }] });
      await page.waitForFunction(() => document.querySelector(".testimonial-attribution strong")?.textContent === "Clint Easley");
      assert((await page.locator(".testimonial-attribution strong").allTextContents()).some((text) => text.trim() === "Clint Easley"), "390: left swipe did not move forward");
    }

    await page.locator(".testimonial-section").screenshot({ path: `${outputDir}/testimonials-${width}.png` });
    await page.locator(".client-wall").screenshot({ path: `${outputDir}/clients-${width}.png` });
    results.push({ width, ...metrics, interaction: "pass" });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
