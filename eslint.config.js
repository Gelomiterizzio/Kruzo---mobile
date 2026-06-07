// Flat ESLint config (ESLint 9) using Expo's shared config. `eslint-config-prettier`
// is appended last to disable stylistic rules that would conflict with Prettier
// (formatting is owned by Prettier; ESLint focuses on correctness).
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const eslintConfigPrettier = require('eslint-config-prettier')

module.exports = defineConfig([
  expoConfig,
  eslintConfigPrettier,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'coverage/*', 'babel.config.js'],
  },
])
