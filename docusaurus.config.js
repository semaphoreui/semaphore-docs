const defaultLocale = 'en';
const locales = ['en', 'ru', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'pt', 'zh', 'sr'];
// `docusaurus start` without --locale sets this env var to the string "undefined".
const currentLocale = locales.includes(process.env.DOCUSAURUS_CURRENT_LOCALE)
  ? process.env.DOCUSAURUS_CURRENT_LOCALE
  : defaultLocale;

// The main website serves English at / and other languages at /<locale>/.
const websiteUrl = (path = '/') =>
  `https://semaphoreui.com${currentLocale === defaultLocale ? '' : `/${currentLocale}`}${path}`;

// Strings of the navbar's `html` items; labels are translated in i18n/*/navbar.json.
const strings = require('./src/data/navbarStrings')[currentLocale];
// Same for the footer's brand column; link labels are in i18n/*/footer.json.
const footerStrings = require('./src/data/footerStrings')[currentLocale];

// Product menu entry in the website header's layout: "Name | tag" over a description.
const productItem = (name, tag, desc, href) => ({
  type: 'html',
  value: `<a class="navbar-product" href="${href}"><span class="navbar-product__title"><strong>${name}</strong><span>${tag}</span></span><span class="navbar-product__desc">${desc}</span></a>`,
});

const categoryItem = (title, className) => ({
  type: 'html',
  className,
  value: `<div class="dropdown__category">${title}</div>`,
});

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Semaphore UI',
  tagline: 'Modern UI and powerful API for Ansible, Terraform, OpenTofu, PowerShell and other DevOps tools',
  favicon: 'img/favicon.png',

  // Set the production url of your site here
  url: 'https://semaphoreui.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/docs/',
  //trailingSlash: true,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'semaphoreui', // Usually your GitHub org/user name.
  projectName: 'semaphore-docs', // Usually your repo name.

  // Broken links and anchors fail the build. Any page move must be accompanied
  // by an entry in redirects.js, see the comment in that file.
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale,
    locales,
    localeConfigs: {
      en: { label: 'English', htmlLang: 'en' },
      ru: { label: 'Русский', htmlLang: 'ru' },
      es: { label: 'Español', htmlLang: 'es' },
      fr: { label: 'Français', htmlLang: 'fr' },
      de: { label: 'Deutsch', htmlLang: 'de' },
      it: { label: 'Italiano', htmlLang: 'it' },
      ja: { label: '日本語', htmlLang: 'ja' },
      ko: { label: '한국어', htmlLang: 'ko' },
      pt: { label: 'Português', htmlLang: 'pt' },
      zh: { label: '中文', htmlLang: 'zh-Hans' },
      sr: { label: 'Srpski', htmlLang: 'sr' },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/semaphoreui/semaphore-docs/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      // Mirrors the header of the main website (SiteHeader component there);
      // the styles live in src/css/custom.css under "Navbar".
      navbar: {
        logo: {
          alt: 'Semaphore UI Logo',
          src: 'img/semaphore-light.png',
          srcDark: 'img/semaphore-dark.png',
        },
        items: [
          {
            type: 'dropdown',
            label: 'Product',
            position: 'left',
            className: 'navbar-menu--product',
            items: [
              productItem('Pro', strings.proTag, strings.proDesc, websiteUrl('/pro')),
              productItem('Enterprise', strings.enterpriseTag, strings.enterpriseDesc, websiteUrl('/enterprise')),
              productItem('Community', strings.communityTag, strings.communityDesc, 'https://github.com/semaphoreui/semaphore'),
            ],
          },
          {
            type: 'dropdown',
            label: 'Features',
            href: websiteUrl('/features/'),
            target: '_self',
            position: 'left',
            className: 'navbar-menu--features',
            items: [
              categoryItem(strings.capabilities),
              ...[
                ['Task templates', '/features/task-templates/'],
                ['Workflows', '/features/workflows/'],
                ['Schedules', '/features/schedules/'],
                ['API & webhooks', '/features/api-webhooks/'],
                ['Secrets & credentials', '/features/secrets-management/'],
                ['Access control', '/features/access-control/'],
                ['Run history & logs', '/features/audit-and-logs/'],
                ['Notifications', '/features/notifications/'],
                ['Runners', '/features/project-runners/'],
                ['High availability', '/features/high-availability/'],
                ['Terraform provider', '/integrations/terraform-provider/'],
                ['MCP', '/mcp/'],
              ].map(([label, path]) => ({ label, href: websiteUrl(path), target: '_self' })),
              categoryItem(strings.tools, 'navbar-menu__tools'),
              ...['Ansible', 'Terraform', 'OpenTofu', 'Terragrunt', 'PowerShell', 'Python', 'Bash'].map((label) => ({
                label,
                href: websiteUrl(`/automation/${label.toLowerCase()}/`),
                target: '_self',
                className: 'navbar-menu__tool',
              })),
            ],
          },
          {
            label: 'Pricing',
            href: websiteUrl('/pricing/'),
            target: '_self',
            position: 'left',
          },
          {
            type: 'dropdown',
            label: 'Explore',
            position: 'left',
            className: 'navbar-menu--explore',
            items: [
              {
                label: 'Use cases',
                href: websiteUrl('/use-cases'),
                target: '_self',
              },
              {
                label: 'AWX migration',
                href: websiteUrl('/awx-migration/'),
                target: '_self',
              },
              {
                label: 'Case studies',
                href: websiteUrl('/case-studies'),
                target: '_self',
              },
              {
                label: 'Blog',
                href: websiteUrl('/blog/'),
                target: '_self',
              },
              {
                label: "What's new?",
                href: websiteUrl('/releases/'),
                target: '_self',
              },
              categoryItem(strings.comparison, 'navbar-menu__comparison'),
              ...['AWX', 'Rundeck', 'GitLab', 'Jenkins', 'Spacelift', 'Gaia', 'Tower (AAP)'].map((name) => ({
                label: `Semaphore UI vs ${name}`,
                href: websiteUrl(`/vs/${name.split(' ')[0].toLowerCase()}`),
                target: '_self',
                className: 'navbar-menu__comparison',
              })),
            ],
          },
          {
            type: 'dropdown',
            label: 'Help',
            position: 'left',
            className: 'navbar-menu--list',
            items: [
              {
                label: 'Installation',
                href: websiteUrl('/install'),
                target: '_self',
              },
              {
                label: 'Docs',
                to: '/',
              },
              {
                label: 'API References',
                href: websiteUrl('/api-docs/'),
                target: '_self',
              },
            ],
          },
          {
            type: 'dropdown',
            label: 'Company',
            position: 'left',
            className: 'navbar-menu--list',
            items: [
              { label: 'About us', href: websiteUrl('/about'), target: '_self' },
              { label: 'Partnership', href: websiteUrl('/partners/'), target: '_self' },
              { label: 'Careers', href: websiteUrl('/careers'), target: '_self' },
              { label: 'Contact', href: websiteUrl('/contact'), target: '_self' },
              { label: 'Legal', href: websiteUrl('/legal'), target: '_self' },
            ],
          },
          {
            type: 'html',
            position: 'right',
            className: 'navbar-github',
            value: `<a href="https://github.com/semaphoreui/semaphore" aria-label="${strings.starsAria}"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg><span>14k</span></a>`,
          },
          {
            href: 'https://portal.semaphoreui.com',
            target: '_self',
            label: 'Sign in',
            position: 'right',
            className: 'navbar-signin',
          },
          {
            type: 'localeDropdown',
            position: 'right',
            className: 'navbar-locale',
          },
          {
            href: 'https://portal.semaphoreui.com/start_trial',
            target: '_self',
            label: 'Start Pro trial',
            position: 'right',
            className: 'navbar-cta navbar-cta--trial',
          },
          {
            href: websiteUrl('/contact'),
            target: '_self',
            label: 'Contact sales',
            position: 'right',
            className: 'navbar-cta navbar-cta--contact',
          },
        ],
      },
      // Mirrors the footer of the main website (SiteFooter component there).
      // src/theme/Footer lays the columns out and turns them into accordions
      // on mobile; the styles live in src/css/custom.css under "Footer".
      footer: {
        style: 'light',
        links: [
          {
            title: ' ',
            items: [
              {
                html: `
                  <a class="footer__brand" href="${websiteUrl()}" aria-label="Semaphore UI">
                    <img class="footer__logo footer__logo--light" src="/docs/img/semaphore-light.png" alt="Semaphore UI" />
                    <img class="footer__logo footer__logo--dark" src="/docs/img/semaphore-dark.png" alt="Semaphore UI" />
                  </a>
                  <p class="footer__desc">${footerStrings.brandDesc}</p>
                  <div class="footer__contact">
                    <div class="footer__contactRow"><span class="footer__contactLabel">${footerStrings.sales}</span><a href="mailto:sales@semaphoreui.com">sales@semaphoreui.com</a></div>
                    <div class="footer__contactRow"><span class="footer__contactLabel">${footerStrings.partnership}</span><a href="mailto:partners@semaphoreui.com">partners@semaphoreui.com</a></div>
                    <div class="footer__contactRow"><span class="footer__contactLabel">${footerStrings.support}</span><a href="mailto:support@semaphoreui.com">support@semaphoreui.com</a></div>
                    <div class="footer__contactRow"><span class="footer__contactLabel">${footerStrings.security}</span><a href="mailto:security@semaphoreui.com">security@semaphoreui.com</a></div>
                    <div class="footer__contactRow"><span class="footer__contactLabel">${footerStrings.legal}</span><a href="mailto:legal@semaphoreui.com">legal@semaphoreui.com</a></div>
                  </div>
                `,
              },
            ],
          },
          // The order below is the order of the mobile accordions. On desktop
          // src/theme/Footer stacks Product over Help and Explore over Company.
          {
            title: 'Product',
            items: [
              { label: 'Community', href: 'https://github.com/semaphoreui/semaphore', target: '_self' },
              { label: 'Pro', href: websiteUrl('/pro'), target: '_self' },
              { label: 'Enterprise', href: websiteUrl('/enterprise'), target: '_self' },
              { label: 'Features', href: websiteUrl('/features'), target: '_self' },
              { label: 'Pricing', href: websiteUrl('/pricing/'), target: '_self' },
            ],
          },
          {
            title: 'Explore',
            items: [
              { label: 'Use cases', href: websiteUrl('/use-cases'), target: '_self' },
              { label: 'Case studies', href: websiteUrl('/case-studies'), target: '_self' },
              { label: 'Roadmap', href: websiteUrl('/roadmap'), target: '_self' },
              { label: "What's New", href: websiteUrl('/releases/'), target: '_self' },
            ],
          },
          {
            title: 'Help',
            items: [
              { label: 'Installation', href: websiteUrl('/install'), target: '_self' },
              { label: 'Documentation', to: '/' },
              { label: 'API References', href: websiteUrl('/api-docs/'), target: '_self' },
            ],
          },
          {
            title: 'Company',
            items: [
              { label: 'About us', href: websiteUrl('/about'), target: '_self' },
              { label: 'Partnership', href: websiteUrl('/partners/'), target: '_self' },
              { label: 'Careers', href: websiteUrl('/careers'), target: '_self' },
              { label: 'Contact', href: websiteUrl('/contact'), target: '_self' },
            ],
          },
          {
            title: 'Links',
            items: [
              { label: 'GitHub', href: 'https://github.com/semaphoreui/semaphore', target: '_self' },
              { label: 'X (ex. Twitter)', href: 'https://twitter.com/semaphoreui', target: '_self' },
              { label: 'Discord', href: 'https://discord.gg/5R6k7hNGcH', target: '_self' },
              { label: 'YouTube', href: 'https://www.youtube.com/@semaphoreui', target: '_self' },
              { label: 'LinkedIn', href: 'https://www.linkedin.com/company/semaphoreui', target: '_self' },
              { label: 'Facebook', href: 'https://facebook.com/semaphoreui', target: '_self' },
              { label: 'Snapcraft', href: 'https://snapcraft.io/semaphore', target: '_self' },
            ],
          },
          {
            title: 'Legal',
            items: [
              { label: 'Terms of Service', href: websiteUrl('/legal/terms-of-service'), target: '_self' },
              { label: 'Subscription Agreement', href: websiteUrl('/legal/subscription-agreement'), target: '_self' },
              { label: 'Acceptable Use Policy', href: websiteUrl('/legal/acceptable-use-policy'), target: '_self' },
              { label: 'Refund Policy', href: websiteUrl('/legal/refund-policy'), target: '_self' },
              { label: 'Privacy Policy', href: websiteUrl('/privacy/policy'), target: '_self' },
              { label: 'Cookie Policy', href: websiteUrl('/privacy/cookies'), target: '_self' },
              { label: 'Security Whitepaper', href: websiteUrl('/security/whitepaper'), target: '_self' },
              { label: 'Support Offering', href: websiteUrl('/legal/support-offering'), target: '_self' },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} Semaphore UI. All rights reserved.`,
      },
      prism: {
        additionalLanguages: ['powershell', 'bash', 'hcl'],
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'B71NA6DNHD',

        // Public API key: it is safe to commit it
        apiKey: 'bb1dabaeb79b08523ab98c9723afad04',

        indexName: 'docs',

        // Optional: see doc section below
        contextualSearch: false,

        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        // externalUrlRegex: 'external\\.com|domain\\.com',

        // Optional: Replace parts of the item URLs from Algolia. Useful when using the same search index for multiple deployments using a different baseUrl.
        // Uncomment and adjust if your Algolia index was crawled with different URLs
        // replaceSearchResultPathname: {
        //   from: '/docs/', // or as RegExp: /\/docs\//
        //   to: '/',
        // },

        // Optional: Algolia search parameters
        searchParameters: {
          facetFilters: [],
        },
        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',

        // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
        insights: false,

        //... other Algolia params
      },
    }),

  plugins: [
    // Redirects from old URLs of moved or removed pages. See redirects.js.
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: require('./redirects'),
      },
    ],
    // Non-default languages reuse the English copy of /docs/assets/* images.
    require('./plugins/shared-locale-assets'),
    // Webpack's persistent cache is keyed by bundle name, mode and locale, but
    // not by the directory Docusaurus generates its modules into. A build that
    // uses a non-default DOCUSAURUS_GENERATED_FILES_DIR_NAME therefore reuses
    // loader output that imports from the *other* directory, and every page
    // fails with "Can't resolve @site/.docusaurus/...". scripts/build-parallel.sh
    // needs both, so it points the cache somewhere of its own through this.
    // Any other non-default directory (npm start, a one-off build) gets a cache
    // named after it, so it can never poison the one a plain build uses.
    ...(process.env.SEMAPHORE_DOCS_WEBPACK_CACHE_DIR || process.env.DOCUSAURUS_GENERATED_FILES_DIR_NAME ? [
    function separateWebpackCache(context) {
      const cacheDirectory = process.env.SEMAPHORE_DOCS_WEBPACK_CACHE_DIR
        || `${context.siteDir}/node_modules/.cache/webpack-${process.env.DOCUSAURUS_GENERATED_FILES_DIR_NAME.replace(/[^\w.-]+/g, '_')}`;
      return {
        name: 'separate-webpack-cache',
        configureWebpack() {
          return {cache: {cacheDirectory}};
        },
      };
    },
    ] : []),
    ...(process.env.SEMAPHORE_DOCS_DEV_PROXY === 'true' ? [
    function localizedDevSocket(context) {
      const socketPath = `${context.baseUrl}__webpack_hmr`;
      return {
        name: 'localized-dev-socket',
        configureWebpack() {
          return {
            devServer: {
              client: { webSocketURL: { pathname: socketPath } },
              webSocketServer: { type: 'ws', options: { path: socketPath } },
            },
          };
        },
      };
    },
    ] : []),
  ],


  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
};

export default config;
