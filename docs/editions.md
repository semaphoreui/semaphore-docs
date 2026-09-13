---
title: Editions
description: What Semaphore Community, Pro, and Enterprise include, and which features require a paid subscription.
---

import EditionsTable from '@site/src/components/EditionsTable';

# Editions

Semaphore ships in three editions from a single code base and a single set of
documentation. Everything described in these docs is available in **Community**
unless the page or the section carries an edition badge.

| Edition | What it is |
|---|---|
| **Community** | The open-source edition. Free, self-hosted, no licence key. Everything not listed in the table below. |
| **Pro** | Adds workflows, project runners, external secret storages, container executors, and structured logging. |
| **Enterprise** | Adds high availability, extended RBAC with custom roles, the Kubernetes executor, and enterprise secret storages. |

Pro and Enterprise are activated with a licence key, see
[License](/admin-guide/license). The edition your server runs is shown in the
account menu, see [Your account](/user-guide/account).

## Feature matrix {#feature-matrix}

Features that require a paid edition. A feature not listed here is available in
every edition.

<EditionsTable />

## How editions are marked in these docs {#how-editions-are-marked}

A badge next to a heading means the feature below it needs that edition:

- <Pro /> marks a Pro feature.
- <Enterprise /> marks an Enterprise feature.

A badge may also carry the version in which the feature appeared, for example
<FeatureState feature="extended-rbac" />. Clicking a badge brings you back to
this page.
