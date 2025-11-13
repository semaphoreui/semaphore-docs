import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Semaphore Docs',
  tagline: 'Modern UI and powerful API for Ansible, Terraform, OpenTofu, PowerShell and other DevOps tools',
  favicon: 'img/favicon.png',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://semaphoreui.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'semaphoreui',
  projectName: 'semaphore-docs',

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // Serve docs at the root
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/semaphoreui/semaphore-docs/edit/main/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-SXDFVHLVBM',
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/semaphore-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Semaphore',
      logo: {
        alt: 'Semaphore Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'adminGuideSidebar',
          position: 'left',
          label: 'Admin Guide',
        },
        {
          type: 'docSidebar',
          sidebarId: 'userGuideSidebar',
          position: 'left',
          label: 'User Guide',
        },
        {
          type: 'docSidebar',
          sidebarId: 'faqSidebar',
          position: 'left',
          label: 'FAQ',
        },
        {
          href: 'https://github.com/semaphoreui/semaphore',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Admin Guide',
              to: '/administration-guide',
            },
            {
              label: 'User Guide',
              to: '/user-guide',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/5R6k7hNGcH',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/semaphoreui/semaphore',
            },
            {
              label: 'Docker Hub',
              href: 'https://hub.docker.com/r/semaphoreui/semaphore',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Issue Tracking',
              href: 'https://github.com/semaphoreui/semaphore/issues',
            },
            {
              label: 'Contact',
              href: 'mailto:denis@semaphoreui.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Semaphore UI. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'json', 'powershell', 'python', 'hcl', 'docker'],
    },
    algolia: {
      // If you have Algolia search set up, configure it here
      // Otherwise, use the default search
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'semaphore',
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
