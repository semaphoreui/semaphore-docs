---
title: Hosts
description: The administrator view of the hosts of all projects, the Nodes count of the license, and how to decommission a host you no longer manage.
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

The administrator **Hosts** page lists the hosts of all projects in one place and shows which of
them count toward the **Nodes** of your license. Open the Admin menu in the lower-left corner and
select **Hosts**.

How hosts get into the list, the statuses, the search and the host card are the same as on the
project page. For more information, see [Hosts](/user-guide/hosts). Here a host is one row for all
projects, and its card lists the projects and the tasks that reached it.

## License count {#license-count}

Your license includes a number of hosts. The **Nodes** row of **Subscription & Billing** shows how
many are in use, for example `42 / 50`. A host is in use when an Ansible task reached it in the last
month and nobody has decommissioned it. A host that was only ever unreachable is not in use.

Hosts that are not in use show **Not counted** in the list. They come back into the count by
themselves the next time a task reaches them.

When more hosts are in use than the license includes, the **Nodes** row turns red with
**(limit exceeded)** and this page shows a warning. Decommission the hosts you no longer manage, or
extend your license. For more information, see [License activation](/admin-guide/license).

## Decommission a host {#decommission}

When you have removed a host from your infrastructure, click **Decommission** at the end of its row
and confirm. The host leaves the count at once, shows **Decommissioned**, and keeps its history in
every project. If a task reaches it again later, Semaphore removes the mark and the host is in use
again.

## What's next {#whats-next}

- [Hosts](/user-guide/hosts) — the project page, statuses and the host card.
- [License activation](/admin-guide/license) — activate and replace the license key.
