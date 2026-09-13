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
    { type: 'doc', id: 'README', className: 'sidebar-icon sidebar-icon--home' },
    {
      type: 'category',
      label: 'Introduction',
      className: 'sidebar-icon sidebar-icon--book',
      collapsed: true,
      link: { type: 'doc', id: 'introduction/README' },
      items: [
        'introduction/what-is-semaphore',
        'introduction/architecture',
        'introduction/concepts',
        'introduction/security-model',
        'editions',
        'introduction/prerequisites',
      ],
    },
    {
      type: 'doc', 
      id: 'getting-started/README', 
      className: 'sidebar-icon sidebar-icon--rocket' 
    },
    {
      type: 'category',
      label: 'Admin Guide',
      className: 'sidebar-icon sidebar-icon--server',
      collapsed: true,
      link: { type: 'doc', id: 'admin-guide/README' },
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
          label: 'Reverse proxy',
          link: { type: 'doc', id: 'admin-guide/reverse-proxy/README' },
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
            // 'admin-guide/security/kerberos',
          ],
        },
        {
          type: 'category',
          label: 'Authentication',
          link: { type: 'doc', id: 'admin-guide/authentication/README' },
          items: [
            'admin-guide/authentication/local',
            {
              type: 'category',
              label: 'LDAP and AD',
              link: { type: 'doc', id: 'admin-guide/authentication/ldap' },
              items: [
                'admin-guide/authentication/ldap/ad',
              ],
            },
            {
              type: 'category',
              label: 'OpenID Connect',
              link: { type: 'doc', id: 'admin-guide/authentication/openid' },
              items: [
                'admin-guide/authentication/openid/github',
                'admin-guide/authentication/openid/google',
                'admin-guide/authentication/openid/gitlab',
                'admin-guide/authentication/openid/gitea',
                'admin-guide/authentication/openid/authelia',
                'admin-guide/authentication/openid/authentik',
                'admin-guide/authentication/openid/keycloak',
                'admin-guide/authentication/openid/okta',
                'admin-guide/authentication/openid/pingfederate',
                'admin-guide/authentication/openid/azure',
                'admin-guide/authentication/openid/zitadel',
                'admin-guide/authentication/openid/pocket-id',
              ],
            },
          ],
        },
        'admin-guide/cicd',
        'admin-guide/runners',
        'admin-guide/logs',
        'admin-guide/metrics',
        { type: 'doc', id: 'admin-guide/ha', customProps: { edition: 'enterprise' } },
        'admin-guide/license',
        {
          type: 'category',
          label: 'Notifications',
          link: { type: 'doc', id: 'admin-guide/notifications' },
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
      className: 'sidebar-icon sidebar-icon--user',
      collapsed: true,
      link: { type: 'doc', id: 'user-guide/README' },
      items: [
        {
          type: 'category',
          label: 'Projects',
          link: { type: 'doc', id: 'user-guide/projects' },
          items: [
            'user-guide/projects/history',
            'user-guide/projects/stats',
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
            'user-guide/task-templates/build-deploy',
            'user-guide/task-templates/views',
            'user-guide/task-templates/survey-vars',
            'user-guide/task-templates/prompts',
            'user-guide/task-templates/jwt',
          ],
        },
        {
          type: 'category',
          label: 'Apps',
          link: { type: 'doc', id: 'user-guide/apps/README' },
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
            'user-guide/apps/terragrunt',
            'user-guide/apps/bash',
            'user-guide/apps/powershell',
            'user-guide/apps/python',
          ],
        },
        'user-guide/tasks',
        'user-guide/workflows',
        'user-guide/schedules',
        {
          type: 'category',
          label: 'Key Store',
          link: { type: 'doc', id: 'user-guide/key-store' },
          items: [
            'user-guide/key-store/env-and-file-sources',
            'user-guide/key-store/hashicorp-vault',
            'user-guide/key-store/openbao',
            { type: 'doc', id: 'user-guide/key-store/aws-secrets-manager', customProps: { edition: 'enterprise' } },
            { type: 'doc', id: 'user-guide/key-store/devolutions-server', customProps: { edition: 'enterprise' } },
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
          label: 'Repositories',
          link: { type: 'doc', id: 'user-guide/repositories' },
          items: [
            'user-guide/repositories/bitbucket_access_token',
          ],
        },
        'user-guide/integrations',
        'user-guide/team',
        'user-guide/account',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      className: 'sidebar-icon sidebar-icon--file-text',
      link: { type: 'doc', id: 'reference/README' },
      items: [
        'reference/configuration',
        {
          type: 'category',
          label: 'CLI',
          link: { type: 'doc', id: 'reference/cli/README' },
          items: [
            'reference/cli/commands',
            'reference/cli/users',
            'reference/cli/projects',
            'reference/cli/vaults',
            'reference/cli/runners',
            'reference/cli/migrations',
          ],
        },
        'reference/api',
      ],
    },
    {
      type: 'category',
      label: 'FAQ',
      className: 'sidebar-icon sidebar-icon--help',
      link: { type: 'generated-index' },
      items: [
        'faq/troubleshooting',
      ],
    },
  ],
};

export default sidebars;
