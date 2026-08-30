import js from '@eslint/js';

export default [
  { ignores: ['.next/**', 'node_modules/**', 'src/**'] },
  {
    files: ['app/**/*.js', 'components/**/*.js', 'lib/**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { window: 'readonly', document: 'readonly', localStorage: 'readonly', setInterval: 'readonly', clearInterval: 'readonly', setTimeout: 'readonly', process: 'readonly', URL: 'readonly', BroadcastChannel: 'readonly', navigator: 'readonly' }
    },
    rules: { ...js.configs.recommended.rules, 'no-unused-vars': 'off' }
  }
];
