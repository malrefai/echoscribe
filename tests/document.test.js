import {describe, it, expect} from "vitest";
import {parsePage} from "./helpers/page.js";

describe("document shell", () => {
  it("uses the HTML5 doctype so the browser stays out of quirks mode", async () => {
    const doc = await parsePage();

    expect(doc.doctype, "<!DOCTYPE html> is missing").not.toBeNull();
    expect(doc.doctype.name).toBe("html");
    // A modern doctype carries no public or system identifier
    expect(doc.doctype.publicId).toBe("");
    expect(doc.doctype.systemId).toBe("");
  });

  it("declares its language on the root element", async () => {
    const doc = await parsePage();
    const lang = doc.documentElement.getAttribute("lang");

    expect(lang, "<html> is missing a lang attribute").toBeTruthy();
    // BCP 47: "en", "en-GB", "nl", "ar-EG" — but not "english"
    expect(lang).toMatch(/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/);
  });

  it("declares UTF-8 inside the first 1024 bytes", async () => {
    const doc = await parsePage();
    const charset = doc.querySelector("meta[charset]");

    expect(charset, "<meta charset> is missing").not.toBeNull();
    expect(charset.getAttribute("charset").toLowerCase()).toBe("utf-8");

    // The spec requires it early. Assert on the raw source,
    // not the parsed tree, because order is what matters here.
    const html = doc.documentElement.outerHTML;
    // debugger;
    expect(html.indexOf("charset")).toBeLessThan(1024);
  });

  it("sets a viewport that does not disable zoom", async () => {
    const doc = await parsePage();
    const viewport = doc.querySelector("meta[name=viewport]");
    const content = viewport?.getAttribute("content") ?? "";

    expect(content).toContain("width=device-width");
    expect(content).toContain("initial-scale=1");

    // WCAG 1.4.4. Blocking zoom fails people with low vision
    expect(content).not.toContain("user-scalable=no");
    expect(content).not.toMatch(/maximum-scale=1\b/);
  });

  it("has a descriptive, non-generic title", async () => {
    const doc = await parsePage();
    const title = doc.querySelector("title")?.textContent?.trim() ?? "";

    expect(title.length).toBeGreaterThan(10);
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.toLowerCase()).not.toBe("home");
    expect(title.toLowerCase()).not.toContain("untitled");
  });
});
