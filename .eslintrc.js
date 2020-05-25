module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ["prettier", "prettier/@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
};
