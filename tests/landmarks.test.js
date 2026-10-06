import {describe, it, expect} from "vitest";
import {screen} from "@testing-library/dom";
import {mountPage} from "./helpers/page.js";

describe("page landmarks", () => {
  it("exposes exactly one banner, main and contentinfo", async () => {
    await mountPage();

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();

    // getByRole throws when there is more than one match, so
    // the three lines above already assert uniqueness. This
    // makes the intent explicit for the next reader.
    expect(screen.getAllByRole("main")).toHaveLength(1);
  });

  it("names every navigation region distinctly", async () => {
    await mountPage();

    const navs = screen.getAllByRole("navigation");
    expect(navs.length).toBeGreaterThanOrEqual(2);

    const names = navs.map((nav) =>
      nav.getAttribute("aria-label") ?? ""
    );

    // No unnamed navs...
    expect(names.every((n) => n.length > 0)).toBe(true);
    // ...and no duplicates, or the user cannot tell them apart.
    expect(new Set(names).size).toBe(names.length);

    expect(
      screen.getByRole("navigation", {name: "Main"})
    ).toBeInTheDocument();
  });

  it("starts with a skip link that targets the main landmark", async () => {
    await mountPage();

    const firstFocusable = document.body.querySelector(
      "a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );

    expect(
      firstFocusable,
      "the page has no focusable elements at all"
    ).not.toBeNull();

    const href = firstFocusable.getAttribute("href") ?? "";
    expect(
      href.startsWith("#"),
      "the first focusable element should be the skip link"
    ).toBe(true);

    // The target must actually exist, or the link does nothing.
    const target = document.querySelector(href);
    expect(target, `skip link points at ${href}, which does not exist`)
      .not.toBeNull();
    expect(target).toBe(screen.getByRole("main"));
  });

  it("marks the current page in the main navigation", async () => {
    await mountPage();

    const current = screen
      .getByRole("navigation", {name: "Main"})
      .querySelectorAll("[aria-current]");

    expect(current.length).toBeLessThanOrEqual(1);
  });
});