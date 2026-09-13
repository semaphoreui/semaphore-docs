// Use the same locale build as Docusaurus 3.6.3, retaining automatic URL prefixes.
// The CLI's single --locale option disables those prefixes.
process.env.NODE_ENV = 'production';
process.env.BABEL_ENV = 'production';

const {buildLocale} = require('@docusaurus/core/lib/commands/build/buildLocale');
const [locale, outDir] = process.argv.slice(2);

buildLocale({
  siteDir: process.cwd(),
  locale,
  cliOptions: {outDir},
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
