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
          link: { type: 'generated-index' },
          items: [
            'administration-guide/installation/package-manager',
            'administration-guide/installation/docker',
            'administration-guide/installation/cloud',
            'administration-guide/installation/binary-file',
            'administration-guide/installation/k8s',
            'administration-guide/installation/snap',
            'administration-guide/installation_manually',
          ],
        },
        {
          type: 'category',
          label: 'Configuration',
          link: { type: 'doc', id: 'administration-guide/configuration' },
          items: [
            'administration-guide/configuration/config-file',
            'administration-guide/configuration/env-vars',
            'administration-guide/configuration/cli',
            'administration-guide/configuration/snap',
          ],
        },
        'administration-guide/upgrading',
        {
          type: 'category',
          label: 'Security',
          link: { type: 'doc', id: 'administration-guide/security' },
          items: [
            'administration-guide/security/database',
            'administration-guide/security/network',
            'administration-guide/security/nginx',
            'administration-guide/security/apache',
            'administration-guide/security/kerberos',
          ],
        },
        {
          type: 'category',
          label: 'CLI',
          link: { type: 'doc', id: 'administration-guide/cli' },
          items: [
            'administration-guide/cli/users',
            'administration-guide/cli/vaults',
            'administration-guide/cli/runners',
            'administration-guide/cli/migrations',
          ],
        },
        'administration-guide/ldap',
        {
          type: 'category',
          label: 'OpenID',
          link: { type: 'doc', id: 'administration-guide/openid' },
          items: [
            'administration-guide/openid/github',
            'administration-guide/openid/google',
            'administration-guide/openid/gitlab',
            'administration-guide/openid/gitea',
            'administration-guide/openid/authelia',
            'administration-guide/openid/authentik',
            'administration-guide/openid/keycloak',
            'administration-guide/openid/okta',
            'administration-guide/openid/azure',
            'administration-guide/openid/zitadel',
          ],
        },
        'administration-guide/api',
        'administration-guide/cicd',
        'administration-guide/runners',
        'administration-guide/logs',
        {
          type: 'category',
          label: 'Notifications',
          link: { type: 'doc', id: 'administration-guide/notifications' },
          items: [
            'administration-guide/notifications/email',
            'administration-guide/notifications/telegram',
            'administration-guide/notifications/slack',
            'administration-guide/notifications/teams',
            'administration-guide/notifications/rocket',
            'administration-guide/notifications/ding',
            'administration-guide/notifications/gotify',
          ],
        },
        'administration-guide/troubleshooting',
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
          items: [
            'user-guide/task-templates/survey-vars',
          ],
        },
        {
          type: 'category',
          label: 'Supported Apps',
          link: { type: 'generated-index' },
          items: [
            'user-guide/apps/ansible',
            {
              type: 'category',
              label: 'Terraform/OpenTofu',
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
          items: [
            'user-guide/key-store/gitlab',
          ],
        },
        {
          type: 'category',
          label: 'Inventory',
          items: [
            'user-guide/inventory/kerberos',
          ],
        },
        'user-guide/netbox-dynamic-inventory',
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
