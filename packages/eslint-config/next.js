/** @type {import('eslint').Linter.Config} */
module.exports = {
  ...require('./base.js'),
  extends: [
    ...require('./base.js').extends,
    'plugin:@next/next/recommended',
  ],
  rules: {
    ...require('./base.js').rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
  },
};
