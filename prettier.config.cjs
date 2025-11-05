const tailwindPlugin = require('prettier-plugin-tailwindcss');

module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  bracketSpacing: true,
  plugins: [tailwindPlugin],
  overrides: [
    {
      files: ['*.md', '*.mdx'],
      options: {
        printWidth: 90,
      },
    },
  ],
};
