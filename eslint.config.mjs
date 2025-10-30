import manufacEslintConfig from "@manufac/eslint-config";

export default [
  ...manufacEslintConfig,
  {
    ignores: [".prettierrc.mjs", "*.config.js"],
  },
  {
    rules: {
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "unicorn/consistent-function-scoping": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "sonarjs/function-return-type": "off",
      "unicorn/no-null": "off",
      "sonarjs/single-return": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/consistent-return": "off",
      "consistent-return": "off",
      "single-return/single-return": "off",
    },
  },
];
