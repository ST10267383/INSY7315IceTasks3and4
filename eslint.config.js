// eslint.config.js
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  // Ignore big/compiled folders
  {
    ignores: ['node_modules/', 'coverage/', 'dist/', 'build/', '.circleci/', 'ssl/'],
  },

  js.configs.recommended,

  // App JS files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'commonjs',
      globals: { ...globals.node, ...globals.es2021 },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },

  // Test files (expose Jest globals)
  {
    files: ['test/**/*.test.js', '**/__tests__/**/*.js'],
    languageOptions: {
      globals: { ...globals.jest },
    },
  },
];