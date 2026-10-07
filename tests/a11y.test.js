import {describe, expect, it} from "vitest";
import axe from "axe-core";
import {mountPage} from "./helpers/page.js";

/** Turn axe's verbose output into something readable on failure. */
function summarise(violations) {
  return violations.map((v) => ({
    rule: v.id,
    impact: v.impact,
    problem: v.help,
    elements: v.nodes.map((n) => n.html),
    docs: v.helpUrl,
  }));
}

describe("accessibility audit", () => {
  it("has no WCAG 2.1 AA violations", async () => {
    await mountPage();

    const results = await axe.run(document, {
      // Run the legally meaningful rule sets. Without runOnly,
      // axe also runs "best practice" rules, which are useful
      // advice but not a standard you can fail a build on.
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
      },
      rules: {
        // jsdom has no layout engine and therefore no computed
        // colours, so this rule cannot produce a real result
        // here. Check contrast in a real browser instead —
        // see "Run it for real" below.
        "color-contrast": {enabled: false},
      },
    });

    expect(summarise(results.violations)).toEqual([]);
  }, 15_000); // axe needs more than the 5s default

  it("passes the best-practice rules too", async () => {
    await mountPage();

    const results = await axe.run(document, {
      runOnly: { type: "tag", values: ["best-practice"] },
      rules: { "color-contrast": { enabled: false } },
    });

    // These include: all content inside a landmark, one main
    // landmark, no positive tabindex, heading order, unique
    // landmark names. Everything this module taught.
    expect(summarise(results.violations)).toEqual([]);
  }, 15_000);
});
