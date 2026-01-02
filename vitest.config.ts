import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    watch: false,
    bail: 1,
    testTimeout: 1800000, // 30 minutes
  },
});
