import react from "@hubassistent/eslint-config/react";

export default [
  ...react,
  {
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
      },
    },
  },
];
