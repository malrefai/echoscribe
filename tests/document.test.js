import {describe, it, expect} from "vitest";
import {parsePage} from "./helpers/page.js";

describe("document shell", () => {
  it("declares its language on the root element", async () => {
    const doc = await parsePage("index.html");

    expect(doc.documentElement.getAttribute("lang")).toBe("en");
  });
});
