import { defineConfig } from "vite-plus";
import { playwright } from "vite-plus/test/browser-playwright";

export default defineConfig({
  server: {
    port: 8000,
  },
  build: {
    target: "es2020",
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    plugins: ["eslint", "typescript", "unicorn", "oxc", "import"],
    ignorePatterns: ["dist/**", "node_modules/**"],
    options: { typeAware: true, typeCheck: true },
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      "typescript/no-explicit-any": "error",
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  test: {
    include: ["tests/**/*.spec.ts"],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
    },
  },
});
