// eslint.config.js
module.exports = [
  {
    ignores: ["node_modules/", "tests/"],
  },
  {
    languageOptions: {
      globals: {
        node: true,
        jest: true,
      },
    },
    rules: {
      "no-unused-vars": "off", 
      "no-console": "off",
    },
  },
];