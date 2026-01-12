const path = require('path');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: [
      './tsconfig.json',
      './apps/*/tsconfig.json',
      './packages/*/tsconfig.json'
    ],
    tsconfigRootDir: __dirname, // ✅ 핵심
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ]
};