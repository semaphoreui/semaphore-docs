/**
 * URL redirects for pages that moved or were removed.
 *
 * Every page move MUST add an entry here in the same commit. The documentation
 * is embedded into the Semaphore binary and translated into ten locales, so a
 * moved page without a redirect breaks links in the offline build and in every
 * translation at once.
 *
 * Format: { to: '<new path>', from: ['<old path>', ...] }
 * Paths are site-relative and must NOT include the `/docs/` baseUrl or a locale
 * prefix — Docusaurus adds both. Locale variants are generated automatically.
 *
 * Keep entries forever unless you are certain no external link points at the
 * old URL. Entries cost nothing at runtime: the plugin emits a small HTML file
 * per redirect at build time.
 */

/** @type {import('@docusaurus/plugin-client-redirects').Options['redirects']} */
const redirects = [
  // Phase 1: authored section landing pages replaced generated category indexes.
  // `admin-guide/introduction` duplicated the Admin Guide landing, and
  // `notifications_old` became the Notifications landing.
  {to: '/admin-guide', from: ['/admin-guide/introduction']},
  {to: '/admin-guide/notifications', from: ['/admin-guide/notifications_old']},
  // The hidden admin troubleshooting page was the fuller of the two; it is now
  // the single Troubleshooting page under FAQ.
  {to: '/faq/troubleshooting', from: ['/admin-guide/troubleshooting']},
  // Docusaurus generated these paths for categories that now have real pages.
  {to: '/admin-guide/reverse-proxy', from: ['/category/reverse-proxy']},
  {to: '/admin-guide/notifications', from: ['/category/notifications']},
  {to: '/admin-guide', from: ['/category/admin-guide']},
  {to: '/user-guide', from: ['/category/user-guide']},

  // The CLI and the REST API describe exact commands, flags and endpoints, so
  // they belong in Reference next to the generated pages rather than in the
  // Admin Guide, which explains tasks.
  {to: '/reference/cli', from: ['/admin-guide/cli']},
  {to: '/reference/cli/users', from: ['/admin-guide/cli/users']},
  {to: '/reference/cli/projects', from: ['/admin-guide/cli/projects']},
  {to: '/reference/cli/vaults', from: ['/admin-guide/cli/vaults']},
  {to: '/reference/cli/runners', from: ['/admin-guide/cli/runners']},
  {to: '/reference/cli/migrations', from: ['/admin-guide/cli/migrations']},
  {to: '/reference/api', from: ['/admin-guide/api']},
];

module.exports = redirects;
