/**
 * Feature registry: which Semaphore edition a feature requires.
 *
 * This is the single source of truth for edition markers in the documentation.
 * The <Pro/>, <Enterprise/> and <FeatureState/> MDX components read it, and the
 * Editions page renders it as a table. Never write "(Pro)" by hand in a page:
 * add the feature here and use the component, otherwise the markers drift apart
 * across 100+ pages and ten locales.
 *
 * Fields:
 *   key       unique slug, used as <FeatureState feature="workflows" />
 *   name      human-readable feature name shown in the Editions table
 *   edition   'community' | 'pro' | 'enterprise' (the minimum edition required)
 *   since     optional Semaphore version in which the feature became available
 *   doc       optional docs path, linked from the Editions table
 *
 * Every entry below reflects what the documentation currently states. Entries
 * marked `verify: true` were inferred from a badge or a parenthetical in prose
 * and should be confirmed against the licence matrix before the next release.
 */

/** @type {{key: string, name: string, edition: 'community'|'pro'|'enterprise', since?: string, doc?: string, verify?: boolean}[]} */
const features = [
  // Execution
  {
    key: 'workflows',
    name: 'Workflows',
    edition: 'pro',
    doc: '/user-guide/workflows',
  },
  {
    key: 'project-runners',
    name: 'Project runners',
    edition: 'pro',
    doc: '/user-guide/projects/runners',
  },
  {
    key: 'runner-tags',
    name: 'Runner tags',
    edition: 'pro',
    doc: '/admin-guide/runners',
  },
  {
    key: 'docker-executor',
    name: 'Docker executor',
    edition: 'pro',
    doc: '/user-guide/task-templates#executor-image-docker-and-kubernetes-runners',
  },
  {
    key: 'k8s-executor',
    name: 'Kubernetes executor',
    edition: 'enterprise',
    doc: '/user-guide/task-templates#executor-image-docker-and-kubernetes-runners',
  },
  {
    key: 'task-summary',
    name: 'Task summary',
    edition: 'pro',
    doc: '/user-guide/tasks#task-window',
  },

  // Secrets
  {
    key: 'secret-storages',
    name: 'External secret storages',
    edition: 'pro',
    doc: '/user-guide/key-store#secret-storages',
  },
  {
    key: 'vault-storage',
    name: 'HashiCorp Vault storage',
    edition: 'pro',
    doc: '/user-guide/key-store/hashicorp-vault',
  },
  {
    key: 'openbao-storage',
    name: 'OpenBao storage',
    edition: 'pro',
    doc: '/user-guide/key-store/openbao',
    verify: true,
  },
  {
    key: 'aws-secrets-manager',
    name: 'AWS Secrets Manager storage',
    edition: 'enterprise',
    doc: '/user-guide/key-store/aws-secrets-manager',
  },
  {
    key: 'devolutions-storage',
    name: 'Devolutions Server storage',
    edition: 'enterprise',
    doc: '/user-guide/key-store/devolutions-server',
    verify: true,
  },
  {
    key: 'env-file-sources',
    name: 'Environment and file secret sources',
    edition: 'pro',
    doc: '/user-guide/key-store/env-and-file-sources',
  },
  {
    key: 'secret-sync',
    name: 'Secret sync from external storages',
    edition: 'pro',
    doc: '/user-guide/key-store/secret-sync',
    verify: true,
  },

  // Access control
  {
    key: 'extended-rbac',
    name: 'Extended RBAC and custom roles',
    edition: 'enterprise',
    since: '2.17',
    doc: '/user-guide/team#extended-rbac-enterprise',
  },

  // Infrastructure
  {
    key: 'high-availability',
    name: 'High availability',
    edition: 'enterprise',
    doc: '/admin-guide/ha',
  },
  {
    key: 'structured-logging',
    name: 'Structured and syslog logging',
    edition: 'pro',
    doc: '/admin-guide/logs',
  },

  // Terraform
  {
    key: 'terraform-backend',
    name: 'Terraform HTTP state backend',
    edition: 'pro',
    doc: '/user-guide/apps/terraform/states',
  },
];

const editionLabels = {
  community: 'Community',
  pro: 'Pro',
  enterprise: 'Enterprise',
};

/** Feature entry by key, or undefined. */
function getFeature(key) {
  return features.find((f) => f.key === key);
}

module.exports = { features, editionLabels, getFeature };
