module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',

  overrides: [
    {
      files: 'src/constant/s3.path.ts',
      options: {
        printWidth: 200,
      },
    },
  ],
};
