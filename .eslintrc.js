/** @type {import('eslint').Linter.Config} */
module.exports = {
   root: true,
   env: {
      browser: true,
      es2021: true,
      node: true,
   },
   parser: "@typescript-eslint/parser", // Parse TypeScript
   parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
   },
   settings: {
      next: {
         rootDir: ["apps/*/"], // If monorepo; remove if single app
      },
   },
   extends: [
      "next/core-web-vitals", // Next.js recommended rules
      "plugin:@typescript-eslint/recommended", // TypeScript rules
      "plugin:prettier/recommended", // Prettier plugin + config
   ],
   plugins: ["@typescript-eslint", "prettier"],
   rules: {
      // Prettier settings
      "prettier/prettier": [
         "error",
         {
            singleQuote: false,
            semi: false,
            tabWidth: 4,
            trailingComma: "es5",
            printWidth: 80,
         },
      ],

      // Example custom rules (optional)
      "@typescript-eslint/no-unused-vars": [
         "warn",
         { argsIgnorePattern: "^_" },
      ],
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
   },
}
