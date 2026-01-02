import { resolve } from "node:path";
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@main": resolve("src/main"),
        "@shared-types/i18n": resolve("src/shared/i18n.ts"),
      },
    },
    build: {
      bytecode: {
        transformArrowFunctions: false,
      },
    },
  },
  preload: {
    build: {
      bytecode: {
        transformArrowFunctions: false,
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
      },
    },
    plugins: [
      react({
        babel: {
          plugins: [["babel-plugin-react-compiler"]],
        },
      }),
    ],
  },
});
