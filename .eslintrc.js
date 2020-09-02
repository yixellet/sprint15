module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2020: true,
  },
  extends: 'airbnb-base',
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'no-underscore-dangle': 0,
    'consistent-return': 0,
  },
};
