import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  clientLogos,
  resolveTestimonials,
  testimonialDefinitions,
} from "../content/about-social-proof.ts";
import { siteCopy } from "../content/site-copy.ts";
import {
  getBoundedTestimonialIndex,
  getSwipeDirection,
} from "../lib/testimonial-slider.ts";

test("the five approved testimonials retain their editorial order", () => {
  assert.deepEqual(
    testimonialDefinitions.map(({ id }) => id),
    ["shawn-herald", "greg-williams", "bradley-farris", "clint-easley", "mark-miller"],
  );

  const testimonials = resolveTestimonials(siteCopy);
  assert.equal(testimonials.length, 5);
  assert.deepEqual(testimonials.at(-1), {
    ...testimonials.at(-1),
    name: "Mark Miller",
  });
  assert.ok(testimonials.every(({ quote, name, role, organization }) => quote && name && role && organization));
});

test("the twenty approved clients retain their Figma order and normalized paths", () => {
  assert.deepEqual(
    clientLogos.map(({ name }) => name),
    [
      "Bergara",
      "Eberlestock",
      "CZ Firearms",
      "TruckVault",
      "Fieldcraft Survival",
      "Vortex",
      "Hornady",
      "Magpul",
      "Christensen Arms",
      "PSE Archery",
      "Badlands",
      "Crispi",
      "Argali",
      "Initial Ascent",
      "Eastmans",
      "Field Ethos",
      "Ironclad",
      "Jack Carr",
      "Winfield Watch Company",
      "REVOL Entertainment",
    ],
  );
  assert.equal(clientLogos.length, 20);
  assert.equal(new Set(clientLogos.map(({ logoPath }) => logoPath)).size, 20);
  assert.equal(clientLogos[0].logoPath, "/brand/client-logos/bergara.svg");
  assert.equal(clientLogos[8].logoPath, "/brand/client-logos/christensen-arms.svg");
  assert.equal(clientLogos[10].logoPath, "/brand/client-logos/badlands.svg");
  assert.equal(clientLogos[13].logoPath, "/brand/client-logos/initial-ascent.svg");
  assert.ok(clientLogos.every(({ logoPath }) => /^\/brand\/client-logos\/[a-z0-9-]+\.svg$/.test(logoPath)));
});

test("production SVGs use normalized artwork bounds and contain no executable references", async () => {
  for (const { logoPath } of clientLogos) {
    const source = await readFile(`public${logoPath}`, "utf8");
    assert.doesNotMatch(source, /viewBox="0 0 960 960"/);
    assert.doesNotMatch(source, /<script|javascript:|<(?:image|use)\b|\b(?:href|xlink:href)=/i);
  }
});

test("testimonial navigation is bounded rather than wrapping", () => {
  assert.equal(getBoundedTestimonialIndex(0, -1, 5), 0);
  assert.equal(getBoundedTestimonialIndex(0, 1, 5), 1);
  assert.equal(getBoundedTestimonialIndex(4, 1, 5), 4);
  assert.equal(getBoundedTestimonialIndex(4, -1, 5), 3);
});

test("touch movement only navigates after a deliberate horizontal threshold", () => {
  assert.equal(getSwipeDirection(24), 0);
  assert.equal(getSwipeDirection(-39), 0);
  assert.equal(getSwipeDirection(40), -1);
  assert.equal(getSwipeDirection(-40), 1);
});
