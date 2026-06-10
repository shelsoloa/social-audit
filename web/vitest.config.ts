import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      // mirrors tsconfig compilerOptions.paths  "@/*" → "web/src/*"
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./src/tests/setup.ts"],
  },
});
