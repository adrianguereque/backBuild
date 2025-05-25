import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // General config for all JS files
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      js,
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
  // Test config with Jest globals
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.jest, // ⬅️ Add this line
      },
    },
    rules: {
      "no-unused-expressions": "off",
    },
  },
]);
