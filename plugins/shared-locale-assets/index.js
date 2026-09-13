// Share images between languages.
//
// Docusaurus builds every locale as an independent site, so each of them gets
// its own copy of `static/assets` and of the images bundled by webpack
// (`assets/images/*`). Those files are byte-identical across languages, only
// their URL prefix differs (/docs/<lang>/assets/...).
//
// For non-default locales this plugin:
//   1. rewrites image URLs to the default locale prefix (/docs/assets/...);
//   2. deletes the locale's own copies after the build.
// JS/CSS bundles contain translated content and stay per-language.
//
// Assumption: every image used by a translated page is also used by the
// default (English) build, otherwise it would be missing after deploy.
const path = require('path');
const fs = require('fs/promises');

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = function sharedLocaleAssets(context) {
  const {siteConfig, siteDir, i18n} = context;
  const isDefaultLocale = i18n.currentLocale === i18n.defaultLocale;
  const localePath = i18n.localeConfigs[i18n.currentLocale]?.path ?? i18n.currentLocale;
  // context.siteConfig.baseUrl is already localized (/docs/es/); strip the locale.
  const sharedBaseUrl = isDefaultLocale
    ? siteConfig.baseUrl
    : siteConfig.baseUrl.replace(new RegExp(`${escapeRegExp(localePath)}/$`), '');

  return {
    name: 'shared-locale-assets',

    configureWebpack(config) {
      // In `docusaurus start` each locale is served by its own dev server, so
      // keep the per-locale paths there.
      if (isDefaultLocale || config.mode !== 'production') return {};
      return {
        module: {
          rules: [
            {
              test: /\.(png|jpe?g|gif|webp|avif|svg|ico)$/i,
              enforce: 'post',
              loader: require.resolve('./publicPathLoader.js'),
              options: {publicPath: sharedBaseUrl},
            },
          ],
        },
      };
    },

    async postBuild({outDir}) {
      if (isDefaultLocale) return;
      const assetsDir = path.join(outDir, 'assets');

      // Images emitted by webpack (markdown images, imports, CSS url()).
      await fs.rm(path.join(assetsDir, 'images'), {recursive: true, force: true});

      // Verbatim copies of static/assets.
      for (const dir of siteConfig.staticDirectories) {
        let entries;
        try {
          entries = await fs.readdir(path.resolve(siteDir, dir, 'assets'));
        } catch {
          continue;
        }
        for (const entry of entries) {
          if (entry === 'js' || entry === 'css') continue;
          await fs.rm(path.join(assetsDir, entry), {recursive: true, force: true});
        }
      }
    },
  };
};
