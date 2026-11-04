import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    plugins: { "@typescript-eslint": tseslint },
    languageOptions: { parser: tsparser },
    rules: {
      ...tseslint.configs["recommended"].rules,
    },
  },
  {
    ignores: ["dist/", "node_modules/", "eslint.config.mjs"],
  },
];
