module.exports = {
  env: { es2021: true, node: true },
  // "env": { "browser": true, "es2021": true },
  // "extends": ["standard", "airbnb-base"],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'airbnb-base', 'airbnb-typescript/base'],
  parser: '@typescript-eslint/parser',
  // "parserOptions": { "ecmaVersion": "latest", "sourceType": "module" },
  ignorePatterns: ['package.json'],
  parserOptions: {
    ecmaVersion: 'latest',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },

  // "plugins": ["@typescript-eslint", "prettier"],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-var-requires': 0,
    'no-console': 'error',
    'linebreak-style': 0,
    semi: 'off',
    'no-shadow': ['error', { hoist: 'functions' }],
    'arrow-body-style': 'off',
    'max-len': [
      'error',
      {
        code: 160,
        tabWidth: 2,
        ignoreComments: true, // "comments": 80
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    'no-restricted-syntax': 'off',
    'import/prefer-default-export': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.ts', '.tsx', '.js'],
        moduleDirectory: ['src', 'node_modules'],
      },
    },
  },
};
