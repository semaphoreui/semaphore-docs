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
  // No page has moved yet. Add entries here as the documentation is restructured,
  // for example when LDAP and OpenID Connect merge into Admin Guide → Authentication:
  //
  // { to: '/admin-guide/authentication/ldap', from: ['/admin-guide/ldap'] },
  // { to: '/admin-guide/authentication/openid', from: ['/admin-guide/openid'] },
];

module.exports = redirects;
