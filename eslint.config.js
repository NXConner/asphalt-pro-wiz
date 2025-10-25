import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import pluginSecurity from "eslint-plugin-security";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "scripts/**",
      "supabase/migrations/**",
      "supabase/functions/**",
      "deleted files/**",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    // Keep config simple and compatible with ESLint flat config
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
      security: pluginSecurity,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...(jsxA11y.configs?.recommended?.rules ?? {}),
      "security/detect-object-injection": "off",
      "security/detect-non-literal-fs-filename": "off",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-require-imports": "off",
      "no-empty": ["error", { allowEmptyCatch: true }],
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      // UI primitives manage their own semantics; suppress strict a11y rules here
      "jsx-a11y/heading-has-content": "off",
      "jsx-a11y/anchor-has-content": "off",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      // UI primitives may export helpers alongside components
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    rules: {
      // Allow mixed exports in lib modules (not just components)
      "react-refresh/only-export-components": "off",
    },
  },
);
