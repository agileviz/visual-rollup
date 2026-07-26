// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // Underscore-prefixed parameters are deliberately unused: mocks and
      // callbacks must keep a parameter in place to match the real signature
      // (e.g. getWorkItems(request, _project)) even when the body ignores it.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
);