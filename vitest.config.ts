import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@api": path.resolve(__dirname, "src/api"),
      "@generators": path.resolve(__dirname, "src/generators"),
      "@services": path.resolve(__dirname, "src/services"),
      "@config": path.resolve(__dirname, "src/config"),
      "@utils": path.resolve(__dirname, "src/utils"),
      "@interface": path.resolve(__dirname, "src/interface"),
      "@themes": path.resolve(__dirname, "src/themes"),
      "@data": path.resolve(__dirname, "src/data"),
      "@cache": path.resolve(__dirname, "src/cache"),
    },
  },
});
