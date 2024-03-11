import eslint from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import globals from "globals";

import { FlatCompat } from "@eslint/eslintrc";
const compat = new FlatCompat();

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  eslint.configs.recommended,
  ...compat.config(react.configs.recommended),
  ...compat.config(reactHooks.configs.recommended),
  ...compat.extends("plugin:jsx-a11y/recommended"),
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    ignores: ["node_modules/*", "dist/*"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: "latest",
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: { "react-refresh": reactRefresh },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { vars: "local", args: "after-used" },
      ],
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },
];
