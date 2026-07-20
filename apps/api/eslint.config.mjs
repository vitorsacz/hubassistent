import base from "@hubassistent/eslint-config";

export default [
  ...base,
  {
    languageOptions: {
      parserOptions: {
        sourceType: "commonjs",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
