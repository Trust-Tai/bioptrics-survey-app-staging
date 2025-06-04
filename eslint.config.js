// ESLint configuration for TypeScript + React
const js = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const reactPlugin = require("eslint-plugin-react");
const globals = require("globals"); // Import the globals package

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
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
