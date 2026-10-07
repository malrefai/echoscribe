import {describe, it, expect} from "vitest";
import {screen, within} from "@testing-library/dom";
import {mountPage, headingLevels} from "./helpers/page.js";

describe("page content", () => {
  it("has exactly one h1", async () => {
    await mountPage();

    const levels = headingLevels();
    expect(levels.filter((l) => l === 1)).toHaveLength(1);
  });

  it("never skips a heading level going down", async () => {
    await mountPage();

    const levels = headingLevels();

    for (let i = 1; i < levels.length; i++) {
      const jump = levels[i] - levels[i - 1];
      expect(
        jump,
        `heading ${i + 1} jumps from h${levels[i - 1]} to h${levels[i]}`
      ).toBeLessThanOrEqual(1);
    }
  });

  it("gives every section landmark an accessible name", async () => {
    await mountPage();

    // An unnamed <section> is not a region, so querying by role
    // only returns the named ones. Compare against the raw count.
    const sections = document.querySelectorAll("main > section");
    const regions = screen.queryAllByRole("region");

    expect(regions.length).toBe(sections.length);
    regions.forEach((r) => expect(r).toHaveAccessibleName());
  });

  it("gives every image an alt attribute", async () => {
    await mountPage();

    document.querySelectorAll("img").forEach((img) => {
      expect(
        img.hasAttribute("alt"),
        `<img src="${img.getAttribute("src")}"> has no alt attribute`
      ).toBe(true);
    });
  });

  it("uses link text that makes sense out of context", async () => {
    await mountPage();

    const vague = /^(click here|here|read more|more|link|this)$/i;

    screen.getAllByRole("link").forEach((link) => {
      const name = link.textContent.trim();
      expect(name.length, "a link has no text").toBeGreaterThan(0);
      expect(name, `"${name}" is meaningless in a list of links`)
        .not.toMatch(vague);
    });
  });

  it("describes each feature in its own article", async () => {
    await mountPage();

    const features = within(
      screen.getByRole("region", { name: /what you get/i })
    ).getAllByRole("article");

    expect(features.length).toBeGreaterThanOrEqual(3);
    features.forEach((a) => expect(a).toHaveAccessibleName());
  });
});
