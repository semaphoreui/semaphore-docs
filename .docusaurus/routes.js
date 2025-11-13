import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/',
    component: ComponentCreator('/', '380'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', 'cbc'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', 'e13'),
            routes: [
              {
                path: '/administration-guide/',
                component: ComponentCreator('/administration-guide/', '870'),
                exact: true
              },
              {
                path: '/administration-guide/api',
                component: ComponentCreator('/administration-guide/api', 'bdd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/cicd',
                component: ComponentCreator('/administration-guide/cicd', '03a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/cli',
                component: ComponentCreator('/administration-guide/cli', '5e2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/cli/migrations',
                component: ComponentCreator('/administration-guide/cli/migrations', 'a29'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/cli/runners',
                component: ComponentCreator('/administration-guide/cli/runners', '821'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/cli/users',
                component: ComponentCreator('/administration-guide/cli/users', '666'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/cli/vaults',
                component: ComponentCreator('/administration-guide/cli/vaults', '132'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/configuration',
                component: ComponentCreator('/administration-guide/configuration', 'a7e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/configuration/cli',
                component: ComponentCreator('/administration-guide/configuration/cli', '48c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/configuration/config-file',
                component: ComponentCreator('/administration-guide/configuration/config-file', '2ba'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/configuration/env-vars',
                component: ComponentCreator('/administration-guide/configuration/env-vars', '64a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/configuration/snap',
                component: ComponentCreator('/administration-guide/configuration/snap', 'f25'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/installation',
                component: ComponentCreator('/administration-guide/installation', '651'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/installation_manually',
                component: ComponentCreator('/administration-guide/installation_manually', '10b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/installation/binary-file',
                component: ComponentCreator('/administration-guide/installation/binary-file', '187'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/installation/cloud',
                component: ComponentCreator('/administration-guide/installation/cloud', 'd7b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/installation/docker',
                component: ComponentCreator('/administration-guide/installation/docker', 'db3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/installation/k8s',
                component: ComponentCreator('/administration-guide/installation/k8s', '787'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/installation/package-manager',
                component: ComponentCreator('/administration-guide/installation/package-manager', '74c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/installation/snap',
                component: ComponentCreator('/administration-guide/installation/snap', '393'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/introduction',
                component: ComponentCreator('/administration-guide/introduction', '0fa'),
                exact: true
              },
              {
                path: '/administration-guide/ldap',
                component: ComponentCreator('/administration-guide/ldap', 'dba'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/logs',
                component: ComponentCreator('/administration-guide/logs', '390'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/notifications',
                component: ComponentCreator('/administration-guide/notifications', '33b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/notifications/ding',
                component: ComponentCreator('/administration-guide/notifications/ding', 'ed1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/notifications/email',
                component: ComponentCreator('/administration-guide/notifications/email', '4dd'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/notifications/gotify',
                component: ComponentCreator('/administration-guide/notifications/gotify', 'baf'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/notifications/rocket',
                component: ComponentCreator('/administration-guide/notifications/rocket', '480'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/notifications/slack',
                component: ComponentCreator('/administration-guide/notifications/slack', 'e24'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/notifications/teams',
                component: ComponentCreator('/administration-guide/notifications/teams', '970'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/notifications/telegram',
                component: ComponentCreator('/administration-guide/notifications/telegram', 'f51'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/openid',
                component: ComponentCreator('/administration-guide/openid', '69b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/openid/authelia',
                component: ComponentCreator('/administration-guide/openid/authelia', '4c6'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/openid/authentik',
                component: ComponentCreator('/administration-guide/openid/authentik', '882'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/openid/azure',
                component: ComponentCreator('/administration-guide/openid/azure', '4ad'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/openid/gitea',
                component: ComponentCreator('/administration-guide/openid/gitea', '63f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/openid/github',
                component: ComponentCreator('/administration-guide/openid/github', 'aef'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/openid/gitlab',
                component: ComponentCreator('/administration-guide/openid/gitlab', 'eb1'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/openid/google',
                component: ComponentCreator('/administration-guide/openid/google', '326'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/openid/keycloak',
                component: ComponentCreator('/administration-guide/openid/keycloak', 'da2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/openid/okta',
                component: ComponentCreator('/administration-guide/openid/okta', '986'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/openid/zitadel',
                component: ComponentCreator('/administration-guide/openid/zitadel', 'f1c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/runners',
                component: ComponentCreator('/administration-guide/runners', '4e4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/security',
                component: ComponentCreator('/administration-guide/security', '7a3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/security/apache',
                component: ComponentCreator('/administration-guide/security/apache', '6f3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/security/database',
                component: ComponentCreator('/administration-guide/security/database', 'a6d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/security/kerberos',
                component: ComponentCreator('/administration-guide/security/kerberos', 'b6a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/security/network',
                component: ComponentCreator('/administration-guide/security/network', '651'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/security/nginx',
                component: ComponentCreator('/administration-guide/security/nginx', '6f4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/troubleshooting',
                component: ComponentCreator('/administration-guide/troubleshooting', '4b4'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/administration-guide/upgrading',
                component: ComponentCreator('/administration-guide/upgrading', 'f8e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/faq/troubleshooting',
                component: ComponentCreator('/faq/troubleshooting', '16f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/',
                component: ComponentCreator('/user-guide/', 'ef7'),
                exact: true
              },
              {
                path: '/user-guide/admin/',
                component: ComponentCreator('/user-guide/admin/', '6c5'),
                exact: true
              },
              {
                path: '/user-guide/admin/runners',
                component: ComponentCreator('/user-guide/admin/runners', 'abd'),
                exact: true
              },
              {
                path: '/user-guide/admin/subscription',
                component: ComponentCreator('/user-guide/admin/subscription', 'c32'),
                exact: true
              },
              {
                path: '/user-guide/admin/tasks',
                component: ComponentCreator('/user-guide/admin/tasks', '965'),
                exact: true
              },
              {
                path: '/user-guide/admin/users',
                component: ComponentCreator('/user-guide/admin/users', '62b'),
                exact: true
              },
              {
                path: '/user-guide/apps/task-templates/apps/ansible',
                component: ComponentCreator('/user-guide/apps/task-templates/apps/ansible', 'a26'),
                exact: true
              },
              {
                path: '/user-guide/environment',
                component: ComponentCreator('/user-guide/environment', 'd69'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/integrations',
                component: ComponentCreator('/user-guide/integrations', 'a8a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/inventory',
                component: ComponentCreator('/user-guide/inventory', 'e4a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/inventory/kerberos',
                component: ComponentCreator('/user-guide/inventory/kerberos', '883'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/key-store',
                component: ComponentCreator('/user-guide/key-store', '90b'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/key-store/gitlab',
                component: ComponentCreator('/user-guide/key-store/gitlab', '9ab'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/netbox-dynamic-inventory',
                component: ComponentCreator('/user-guide/netbox-dynamic-inventory', 'ff8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/projects',
                component: ComponentCreator('/user-guide/projects', '23f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/projects/activity',
                component: ComponentCreator('/user-guide/projects/activity', 'c80'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/projects/history',
                component: ComponentCreator('/user-guide/projects/history', '60d'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/projects/runners',
                component: ComponentCreator('/user-guide/projects/runners', '051'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/projects/settings',
                component: ComponentCreator('/user-guide/projects/settings', '1b8'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/repositories',
                component: ComponentCreator('/user-guide/repositories', '436'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/repositories/bitbucket_access_token',
                component: ComponentCreator('/user-guide/repositories/bitbucket_access_token', '110'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/schedules',
                component: ComponentCreator('/user-guide/schedules', '75f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/task-templates/',
                component: ComponentCreator('/user-guide/task-templates/', 'd6a'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/task-templates/apps/ansible',
                component: ComponentCreator('/user-guide/task-templates/apps/ansible', 'a99'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/task-templates/apps/bash',
                component: ComponentCreator('/user-guide/task-templates/apps/bash', 'c09'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/task-templates/apps/powershell',
                component: ComponentCreator('/user-guide/task-templates/apps/powershell', '1d0'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/task-templates/apps/python',
                component: ComponentCreator('/user-guide/task-templates/apps/python', '8e3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/task-templates/apps/terraform',
                component: ComponentCreator('/user-guide/task-templates/apps/terraform', '80c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/task-templates/apps/terraform/states',
                component: ComponentCreator('/user-guide/task-templates/apps/terraform/states', 'fc7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/task-templates/apps/terraform/workspaces',
                component: ComponentCreator('/user-guide/task-templates/apps/terraform/workspaces', '551'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/task-templates/survey-vars',
                component: ComponentCreator('/user-guide/task-templates/survey-vars', '654'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/tasks',
                component: ComponentCreator('/user-guide/tasks', '0b5'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/user-guide/team',
                component: ComponentCreator('/user-guide/team', '4a7'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/',
                component: ComponentCreator('/', '72f'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
