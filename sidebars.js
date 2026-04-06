/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    'README',
    {
      type: 'category',
      label: 'Admin Guide',
      collapsed: false,
      link: { type: 'generated-index' },
      items: [
        {
          type: 'category',
          label: 'Installation',
          link: { type: 'doc', id: 'admin-guide/installation' },
          items: [
            'admin-guide/installation/package-manager',
            'admin-guide/installation/docker',
            // 'admin-guide/installation/cloud',
            'admin-guide/installation/binary-file',
            'admin-guide/installation/k8s',
            // 'admin-guide/installation/snap',
            'admin-guide/installation_manually',
          ],
        },
        {
          type: 'category',
          label: 'Configuration',
          link: { type: 'doc', id: 'admin-guide/configuration' },
          items: [
            'admin-guide/configuration/config-file',
            'admin-guide/configuration/env-vars',
            // 'admin-guide/configuration/cli',
            // 'admin-guide/configuration/snap',
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
            'admin-guide/security/network',
            // 'admin-guide/security/kerberos',
          ],
        },
        {
          type: 'category',
          label: 'CLI',
          link: { type: 'doc', id: 'admin-guide/cli' },
          items: [
            'admin-guide/cli/users',
            'admin-guide/cli/vaults',
            'admin-guide/cli/runners',
            'admin-guide/cli/migrations',
          ],
        },
        'admin-guide/ldap',
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
            'admin-guide/openid/azure',
            'admin-guide/openid/zitadel',
          ],
        },
        'admin-guide/api',
        'admin-guide/cicd',
        'admin-guide/runners',
        'admin-guide/logs',
        'admin-guide/ha',
        {
          type: 'category',
          label: 'Notifications',
          // link: { type: 'doc', id: 'admin-guide/notifications' },
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
        // 'admin-guide/troubleshooting',
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      collapsed: false,
      link: { type: 'generated-index' },
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
        {
          type: 'category',
          label: 'Task Templates',
          link: { type: 'doc', id: 'user-guide/task-templates/README' },
          items: [
            'user-guide/task-templates/survey-vars',
            'user-guide/task-templates/prompts',
          ],
        },
        {
          type: 'category',
          label: 'apps',
          link: { type: 'generated-index' },
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
        {
          type: 'category',
          label: 'Key Store',
          link: { type: 'doc', id: 'user-guide/key-store' },
          items: [
            'user-guide/key-store/hashicorp-vault',
            'user-guide/key-store/devolutions-server',
          ],
        },
        {
          type: 'category',
          label: 'Inventory',
          items: [
            'user-guide/inventory/kerberos',
            'user-guide/inventory/netbox-dynamic-inventory',
          ],
        },
        'user-guide/environment',
        {
          type: 'category',
          label: 'Repositories',
          items: [
            'user-guide/repositories/bitbucket_access_token',
          ],
        },
        'user-guide/integrations',
        'user-guide/team',
      ],
    },
    {
      type: 'category',
      label: 'FAQ',
      link: { type: 'generated-index' },
      items: [
        'faq/troubleshooting',
      ],
    },
  ],
};

export default sidebars;
