// Adds readable DOM matchers to `expect`:
//   toBeInTheDocument, toBeVisible, toHaveAttribute,
//   toHaveAccessibleName, toBeRequired, toBeInvalid ...
// The "/vitest" entry point wires them into Vitest's expect.
import "@testing-library/jest-dom/vitest";
import {vi, beforeEach, afterEach} from "vitest";

/**
 * jsdom implements no layout engine, so window.matchMedia is
 * absent. Install a spec-shaped stand-in so any code that
 * feature-detects dark mode or reduced motion does not throw.
 */
export function createMatchMedia(matches = false) {
  return vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

beforeEach(() => {
  vi.stubGlobal("matchMedia", createMatchMedia(false));

  // Every test starts from a clean document. Without this,
  // one test's markup bleeds into the next and you get
  // failures that depend on file order.
  document.documentElement.removeAttribute("lang");
  document.head.innerHTML = "";
  document.body.innerHTML = "";
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
