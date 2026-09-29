import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    // Run every test inside a jsdom document. Without this,
    // `document` is undefined and every DOM test throws.
    environment: "jsdom",

    // Runs once before each test FILE. Our matchers and
    // browser-API mocks are registered here.
    setupFiles: ["./tests/setup.js"],

    // Only these files are tests. Keeps Vitest away from
    // node_modules and build output.
    include: ["tests/**/*.test.js"],

    // Print each test name rather than a row of dots.
    // While learning, seeing the sentences is the point.
    reporters: ["verbose"],
  },
});
