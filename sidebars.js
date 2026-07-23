// @ts-check

/**
 * Sidebar structure rules (see CLAUDE.md "Docs style guide"):
 * - Every page under docs/ must be registered here, either as an item or as a
 *   category `link` doc. Orphan pages are not allowed (checked by
 *   scripts/check-orphans.js).
 * - Top-level order: Getting Started → User Guide → Admin Guide → Reference → FAQ.
 */

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'README',
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      link: { type: 'doc', id: 'getting-started/what-is-semaphore' },
      items: [
        'getting-started/core-concepts',
        'getting-started/quickstart',
        {
          type: 'category',
          label: 'Tutorials',
          link: { type: 'generated-index', slug: '/getting-started/tutorials' },
          items: [
            'getting-started/tutorials/run-ansible-playbook',
            'getting-started/tutorials/run-terraform-code',
            'getting-started/tutorials/run-scripts',
          ],
        },
        'getting-started/glossary',
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      collapsed: false,
      link: { type: 'doc', id: 'user-guide/README' },
      items: [
        {
          type: 'category',
          label: 'Projects',
          link: { type: 'doc', id: 'user-guide/projects' },
          items: [
            'user-guide/projects/history',
            'user-guide/projects/activity',
            'user-guide/projects/settings',
            'user-guide/projects/runners',
          ],
        },
        'user-guide/team',
        {
          type: 'category',
          label: 'Repositories',
          link: { type: 'doc', id: 'user-guide/repositories' },
          items: [
            'user-guide/repositories/bitbucket-access-token',
          ],
        },
        {
          type: 'category',
          label: 'Key Store',
          link: { type: 'doc', id: 'user-guide/key-store' },
          items: [
            'user-guide/key-store/hashicorp-vault',
            'user-guide/key-store/openbao',
            'user-guide/key-store/devolutions-server',
            'user-guide/key-store/secret-sync',
          ],
        },
        {
          type: 'category',
          label: 'Inventory',
          link: { type: 'doc', id: 'user-guide/inventory' },
          items: [
            'user-guide/inventory/kerberos',
            'user-guide/inventory/netbox-dynamic-inventory',
            'user-guide/inventory/consul-dynamic-inventory',
          ],
        },
        'user-guide/environment',
        {
          type: 'category',
          label: 'Task Templates',
          link: { type: 'doc', id: 'user-guide/task-templates/README' },
          items: [
            'user-guide/task-templates/survey-vars',
            'user-guide/task-templates/prompts',
            'user-guide/task-templates/jwt',
          ],
        },
        {
          type: 'category',
          label: 'Apps',
          link: { type: 'generated-index', slug: '/user-guide/apps' },
          items: [
            'user-guide/apps/ansible',
            {
              type: 'category',
              label: 'Terraform/OpenTofu',
              link: { type: 'doc', id: 'user-guide/apps/terraform/README' },
              items: [
                'user-guide/apps/terraform/workspaces',
                'user-guide/apps/terraform/states',
              ],
            },
            'user-guide/apps/bash',
            'user-guide/apps/powershell',
            'user-guide/apps/python',
          ],
        },
        'user-guide/tasks',
        'user-guide/schedules',
        'user-guide/integrations',
      ],
    },
    {
      type: 'category',
      label: 'Admin Guide',
      collapsed: false,
      link: { type: 'doc', id: 'admin-guide/README' },
      items: [
        {
          type: 'category',
          label: 'Installation',
          link: { type: 'doc', id: 'admin-guide/installation' },
          items: [
            'admin-guide/installation/package-manager',
            'admin-guide/installation/docker',
            'admin-guide/installation/cloud',
            'admin-guide/installation/binary-file',
            'admin-guide/installation/k8s',
            'admin-guide/installation/snap',
            'admin-guide/installation/manual',
          ],
        },
        {
          type: 'category',
          label: 'Configuration',
          link: { type: 'doc', id: 'admin-guide/configuration' },
          items: [
            'admin-guide/configuration/config-file',
            'admin-guide/configuration/env-vars',
            'admin-guide/configuration/cli',
            'admin-guide/configuration/snap',
          ],
        },
        'admin-guide/upgrading',
        {
          type: 'category',
          label: 'Reverse-proxy',
          link: { type: 'generated-index' },
          items: [
            'admin-guide/reverse-proxy/nginx',
            'admin-guide/reverse-proxy/apache',
            'admin-guide/reverse-proxy/caddy',
          ],
        },
        {
          type: 'category',
          label: 'Security',
          link: { type: 'doc', id: 'admin-guide/security' },
          items: [
            'admin-guide/security/encryption',
            'admin-guide/security/database',
            'admin-guide/security/network',
            'admin-guide/security/jwt',
          ],
        },
        {
          type: 'category',
          label: 'CLI',
          link: { type: 'doc', id: 'admin-guide/cli' },
          items: [
            'admin-guide/cli/users',
            'admin-guide/cli/projects',
            'admin-guide/cli/vaults',
            'admin-guide/cli/runners',
            'admin-guide/cli/migrations',
          ],
        },
        {
          type: 'category',
          label: 'LDAP and AD',
          link: { type: 'doc', id: 'admin-guide/ldap' },
          items: [
            'admin-guide/ldap/ad',
          ],
        },
        {
          type: 'category',
          label: 'OpenID Connect',
          link: { type: 'doc', id: 'admin-guide/openid' },
          items: [
            'admin-guide/openid/github',
            'admin-guide/openid/google',
            'admin-guide/openid/gitlab',
            'admin-guide/openid/gitea',
            'admin-guide/openid/authelia',
            'admin-guide/openid/authentik',
            'admin-guide/openid/keycloak',
            'admin-guide/openid/okta',
            'admin-guide/openid/pingfederate',
            'admin-guide/openid/azure',
            'admin-guide/openid/zitadel',
            'admin-guide/openid/pocket-id',
          ],
        },
        {
          type: 'category',
          label: 'Runners',
          link: { type: 'doc', id: 'admin-guide/runners' },
          items: [
            'admin-guide/runners/executors',
            'admin-guide/runners/docker-executor',
            'admin-guide/runners/k8s-executor',
          ],
        },
        'admin-guide/logs',
        'admin-guide/ha',
        'admin-guide/license',
        {
          type: 'category',
          label: 'Notifications',
          link: { type: 'generated-index' },
          items: [
            'admin-guide/notifications/email',
            'admin-guide/notifications/telegram',
            'admin-guide/notifications/slack',
            'admin-guide/notifications/teams',
            'admin-guide/notifications/rocket',
            'admin-guide/notifications/ding',
            'admin-guide/notifications/gotify',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      link: { type: 'generated-index', slug: '/reference' },
      items: [
        'reference/configuration-options',
        'admin-guide/api',
        'reference/cicd',
      ],
    },
    'troubleshooting',
  ],
};

export default sidebars;
