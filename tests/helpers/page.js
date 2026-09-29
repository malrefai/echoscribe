import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {dirname, resolve} from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");

/** Read a project file as a UTF-8 string. */
export function readPage(relativePath = "index.html") {
  return readFile(resolve(ROOT, relativePath), "utf8");
}

/**
 * Parse into a standalone Document.
 * Keeps the doctype, <html lang> and the whole <head> —
 * all of which innerHTML would throw away.
 */
export async function parsePage(relativePath = "index.html") {
  const html = await readPage(relativePath);
  return new DOMParser().parseFromString(html, "text/html");
}

/**
 * Copy the page into the LIVE jsdom document, because
 * Testing Library's `screen` and axe both inspect the global
 * document rather than a document you hand them.
 */
export async function mountPage(relativePath = "index.html") {
  const parsed = await parsePage(relativePath);

  document.documentElement.setAttribute(
    "lang",
    parsed.documentElement.getAttribute("lang") ?? ""
  );
  document.head.innerHTML = parsed.head.innerHTML;
  document.body.innerHTML = parsed.body.innerHTML;

  return document;
}

/** Every heading in the body, as numeric levels, in order. */
export function headingLevels(doc = document) {
  return [...doc.body.querySelectorAll("h1, h2, h3, h4, h5, h6")]
    .map((h) => Number(h.tagName.slice(1)));
}
