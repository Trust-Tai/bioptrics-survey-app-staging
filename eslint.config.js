// ESLint configuration for TypeScript + React
import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import globals from "globals"; // Import the globals package

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  { 
    ignores: [
      "node_modules/",
      "build/",
      "dist/",
      ".meteor/"
    ]
  },
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: { // Explicitly add browser and node globals here
        ...globals.browser,
        ...globals.node,
      }
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react": reactPlugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactPlugin.configs.recommended.rules,
      // Add project-specific rules here
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
];
