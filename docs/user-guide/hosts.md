---
title: Hosts
description: Which hosts your Ansible tasks reach, how each of them ended, and where to look when a host fails or is never reached.
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

The **Hosts** page of a project lists every host that the project's Ansible tasks reached, with the
result of the last run on it. Open it when you want to know which hosts fail, which cannot be
reached, and which no task has touched for a while, without opening task logs one by one.

## How it works {#how-it-works}

You do not add hosts by hand. After every Ansible task, Semaphore records each host of the play with
its result on that host: `ok`, `changed`, `failed` or `unreachable`. Tasks on the server, on runners
and in Docker or Kubernetes executors all count. Tasks of other applications, such as Terraform or
Bash, do not add hosts.

A host is its inventory name. `web-01` in two inventories is one host, and `Web-01` is the same host
as `web-01`. A host that tasks of several projects reach is listed in each project with that
project's own numbers. A host stays in the list after it leaves your inventory, together with its
history.

## Find a host {#find-a-host}

- **Search** finds hosts by name.
- **Failing now** shows hosts whose last run failed. **Unreachable** shows hosts Ansible could not
  connect to. **Not seen 30 days** shows hosts no task touched for a month.
- **Template** narrows the list to the hosts of one template.

Click a host to open its card: when it was first seen, how many runs it had, how many of the last
10 runs failed, and the tasks that reached it with the result on this host. Click a task to open
its log.

The **Summary** tab of a task shows the same for one run: select **All servers** to see every host
of that task with its counters.

## What's next {#whats-next}

- [Hosts for administrators](/admin-guide/hosts) — all projects, the license count and decommissioning.
- [Inventory](/user-guide/inventory) — define the hosts that your tasks run against.
