
// Simple constants for configuring rules
const DISABLED = 'off';
// const WARNING = ['warn'];
// const ERROR = ['error'];

// Lint config for test project
module.exports = {
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    createDefaultProgram: true, // WHY IS THIS SO MUCH WORK JUST TO LINT FILES
    project: 'test/tsconfig.json',
  },
  rules: {
    // Rules that are explicitly disabled
    '@typescript-eslint/explicit-function-return-type': DISABLED,

    // Rules that are explicitly a warning
    // - none at present -

    // Rules that are explicitly an error
    // - none at present -
  },
};
