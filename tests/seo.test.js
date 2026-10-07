import {describe, it, expect} from "vitest";
import {parsePage} from "./helpers/page.js"

const CANONICAL_ORIGIN = "https://echoscribe.app";

describe("search and social metadata", () => {
  it("has a description within the length search engine show", async () => {
    const doc = await parsePage();
    const content = doc
      .querySelector('meta[name="description"]')
      ?.getAttribute("content")
      .trim();

    expect(content, "<meta name=\"description\" is missing").toBeTruthy();
    expect(content.length).toBeGreaterThan(50);
    expect(content.length).toBeLessThan(160);

  });

  it("declares one absolute canonical URL", async () => {
    const doc = await parsePage();
    const links = doc.querySelectorAll('link[rel="canonical"]');

    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toMatch(/^https:\/\//);
  });

  it("provides Open Graph tags for link previews", async () => {
    const doc = await parsePage();

    // Note property=, not name=. Using name= is the single most
    // common Open Graph mistake and silently breaks every card.
    const og = (prop) =>
      doc.querySelector(`meta[property="og:${prop}"]`)
        ?.getAttribute("content");

    expect(og("title")).toBeTruthy();
    expect(og("description")).toBeTruthy();
    expect(og("type")).toBe("website");
    expect(og("url")).toMatch(/^https:\/\//);

    // Social platforms ignore relative image paths entirely.
    expect(og("image")).toMatch(/^https:\/\//);
    expect(og("image:alt"), "the preview image needs alt text")
      .toBeTruthy();
  });

  it("keeps the title and og:title in agreement", async () => {
    const doc = await parsePage();

    const title = doc.querySelector("title").textContent.trim();
    const ogTitle = doc
      .querySelector('meta[property="og:title"]')
      .getAttribute("content")
      .trim();

    expect(ogTitle).toBe(title);
  });

  it("ships valid, matching JSON-LD", async () => {
    const doc = await parsePage();
    const script = doc.querySelector('script[type="application/ld+json"]');

    expect(script, "no JSON-LD block found").not.toBeNull();

    // Invalid JSON here is invisible in the browser and simply
    // drops you from rich results. Parse it in the test.
    let data;
    expect(() => {
      data = JSON.parse(script.textContent);
    }, "JSON-LD is not valid JSON").not.toThrow();

    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBeTruthy();
    expect(data.name).toBeTruthy();
    expect(data.url).toContain(CANONICAL_ORIGIN);

    // Structured data must describe what is on the page.
    const title = doc.querySelector("title").textContent;
    expect(title).toContain(data.name);
  });
});