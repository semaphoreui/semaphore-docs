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

  // Phase 2: LDAP and OpenID Connect were two unrelated top-level entries even
  // though they answer the same question. They are now one Authentication
  // section, next to the local accounts they replace.
  {to: '/admin-guide/authentication/ldap', from: ['/admin-guide/ldap']},
  {to: '/admin-guide/authentication/ldap/ad', from: ['/admin-guide/ldap/ad']},
  {to: '/admin-guide/authentication/openid', from: ['/admin-guide/openid']},
  {to: '/admin-guide/authentication/openid/github', from: ['/admin-guide/openid/github']},
  {to: '/admin-guide/authentication/openid/google', from: ['/admin-guide/openid/google']},
  {to: '/admin-guide/authentication/openid/gitlab', from: ['/admin-guide/openid/gitlab']},
  {to: '/admin-guide/authentication/openid/gitea', from: ['/admin-guide/openid/gitea']},
  {to: '/admin-guide/authentication/openid/authelia', from: ['/admin-guide/openid/authelia']},
  {to: '/admin-guide/authentication/openid/authentik', from: ['/admin-guide/openid/authentik']},
  {to: '/admin-guide/authentication/openid/keycloak', from: ['/admin-guide/openid/keycloak']},
  {to: '/admin-guide/authentication/openid/okta', from: ['/admin-guide/openid/okta']},
  {to: '/admin-guide/authentication/openid/pingfederate', from: ['/admin-guide/openid/pingfederate']},
  {to: '/admin-guide/authentication/openid/azure', from: ['/admin-guide/openid/azure']},
  {to: '/admin-guide/authentication/openid/zitadel', from: ['/admin-guide/openid/zitadel']},
  {to: '/admin-guide/authentication/openid/pocket-id', from: ['/admin-guide/openid/pocket-id']},
];

module.exports = redirects;
