// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  tutorialSidebar: [
    'README',
    {
      type: 'category',
      label: 'Admin Guide',
      items: [
        'administration-guide/README',
        {
          type: 'category',
          label: 'Installation',
          items: [
            'administration-guide/installation.md',
            'administration-guide/installation/package-manager.md',
            'administration-guide/installation/docker.md',
            'administration-guide/installation/cloud.md',
            'administration-guide/installation/binary-file.md',
            'administration-guide/installation/k8s.md',
            'administration-guide/installation/snap.md',
            'administration-guide/installation_manually.md',
          ],
        },
        {
          type: 'category',
          label: 'Configuration',
          items: [
            'administration-guide/configuration.md',
            'administration-guide/configuration/config-file.md',
            'administration-guide/configuration/env-vars.md',
            'administration-guide/configuration/cli.md',
            'administration-guide/configuration/snap.md',
          ],
        },
        'administration-guide/upgrading.md',
        {
          type: 'category',
          label: 'Security',
          items: [
            'administration-guide/security.md',
            'administration-guide/security/database.md',
            'administration-guide/security/network.md',
            'administration-guide/security/nginx.md',
            'administration-guide/security/apache.md',
            'administration-guide/security/kerberos.md',
          ],
        },
        {
          type: 'category',
          label: 'CLI',
          items: [
            'administration-guide/cli.md',
            'administration-guide/cli/users.md',
            'administration-guide/cli/vaults.md',
            'administration-guide/cli/runners.md',
            'administration-guide/cli/migrations.md',
          ],
        },
        'administration-guide/ldap.md',
        {
          type: 'category',
          label: 'OpenID',
          items: [
            'administration-guide/openid.md',
            'administration-guide/openid/github.md',
            'administration-guide/openid/google.md',
            'administration-guide/openid/gitlab.md',
            'administration-guide/openid/gitea.md',
            'administration-guide/openid/authelia.md',
            'administration-guide/openid/authentik.md',
            'administration-guide/openid/keycloak.md',
            'administration-guide/openid/okta.md',
            'administration-guide/openid/azure.md',
            'administration-guide/openid/zitadel.md',
          ],
        },
        'administration-guide/api.md',
        'administration-guide/cicd.md',
        'administration-guide/runners.md',
        'administration-guide/logs.md',
        {
          type: 'category',
          label: 'Notifications',
          items: [
            'administration-guide/notifications.md',
            'administration-guide/notifications/email.md',
            'administration-guide/notifications/telegram.md',
            'administration-guide/notifications/slack.md',
            'administration-guide/notifications/teams.md',
            'administration-guide/notifications/rocket.md',
            'administration-guide/notifications/ding.md',
            'administration-guide/notifications/gotify.md',
          ],
        },
        'administration-guide/troubleshooting.md',
      ],
    },
    {
      type: 'category',
      label: 'User Guide',
      items: [
        'user-guide/README.md',
        'user-guide/projects.md',
        {
          type: 'category',
          label: 'Projects',
          items: [
            'user-guide/projects/history.md',
            'user-guide/projects/activity.md',
            'user-guide/projects/settings.md',
            'user-guide/projects/runners.md',
          ],
        },
        {
          type: 'category',
          label: 'Task Templates',
          items: [
            'user-guide/task-templates/README.md',
            'user-guide/task-templates/apps/ansible.md',
            {
              type: 'category',
              label: 'Terraform/OpenTofu',
              items: [
                'user-guide/task-templates/apps/terraform.md',
                'user-guide/task-templates/apps/terraform/workspaces.md',
                'user-guide/task-templates/apps/terraform/states.md',
              ],
            },
            'user-guide/task-templates/apps/bash.md',
            'user-guide/task-templates/apps/powershell.md',
            'user-guide/task-templates/apps/python.md',
            'user-guide/task-templates/survey-vars.md',
          ],
        },
        'user-guide/tasks.md',
        'user-guide/schedules.md',
        'user-guide/key-store.md',
        {
          type: 'category',
          label: 'Key Store',
          items: [
            'user-guide/key-store/gitlab.md',
          ],
        },
        'user-guide/inventory.md',
        {
          type: 'category',
          label: 'Inventory',
          items: [
            'user-guide/inventory/kerberos.md',
          ],
        },
        'user-guide/netbox-dynamic-inventory.md',
        'user-guide/environment.md',
        'user-guide/repositories.md',
        {
          type: 'category',
          label: 'Repositories',
          items: [
            'user-guide/repositories/bitbucket_access_token.md',
          ],
        },
        'user-guide/integrations.md',
        'user-guide/team.md',
      ],
    },
    {
      type: 'category',
      label: 'FAQ',
      items: [
        'faq/troubleshooting.md',
      ],
    },
  ],
};

export default sidebars;
