import tsParser from '@typescript-eslint/parser';
import parser from 'astro-eslint-parser';
import eslintPluginAstro from 'eslint-plugin-astro';

/** @type { import("eslint").Linter.Config[] } */
export default [
  ...eslintPluginAstro.configs.recommended,
  {
    languageOptions: {
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: parser,
      ecmaVersion: 5,
      sourceType: 'script',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.astro'],
      },
    },

    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-console': [2, { allow: ['warn', 'error', 'info'] }],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/ban-types': [
        'error',
        {
          types: {
            '{}': false,
          },
          extendDefaults: true,
        },
      ],
    },
  },
];
