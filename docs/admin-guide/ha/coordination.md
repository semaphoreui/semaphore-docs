---
title: Cluster coordination
description: How Semaphore HA nodes coordinate through Redis, with every key, lock and Pub/Sub channel they share and how long each of them lives.
---

# Cluster coordination <Enterprise />

Semaphore nodes never talk to each other directly. Everything they need to agree on goes through Redis: who is alive, which task belongs to which node, who fires a schedule, and which UI messages to relay. Each piece of that state is a small set of Redis keys with an expiry, so a crashed node cannot leave anything behind for long. The durable data (tasks, templates, logs, runners) always lives in the database; Redis only holds coordination state.

All keys use the fixed prefixes `ha:` and `tasks:`. They are not configurable, so two Semaphore clusters sharing one Redis server must use different database numbers (`ha.redis.db`).

## Node registry {#node-registry}

Every node registers itself at startup and then refreshes its record every 10 seconds. The record expires after 30 seconds, so a node that stops refreshing is considered dead after at most half a minute. On a graceful shutdown the node removes its record immediately.

| Key | Type | Purpose |
| --- | --- | --- |
| `ha:node:<node_id>` | string, JSON | Heartbeat of one node: `node_id`, `started_at`, `version`, `last_beat`. Expires 30 s after the last refresh. |
| `ha:nodes` | set | IDs of all registered nodes. Members whose heartbeat key has expired are pruned by the other nodes. |

The node registry is what the Cluster dashboard shows, and what the orphan cleaner (below) consults to decide whether a task's owner is still alive.

## Task queue and running tasks {#task-queue}

The task queue is shared, so a task started on one node can be dispatched, watched, and finalized by any other. Redis stores only task IDs and a few transient fields; the task itself is loaded from the database by whichever node needs it.

| Key | Type | Purpose |
| --- | --- | --- |
| `tasks:queue` | list | IDs of tasks waiting to be dispatched, in order. |
| `tasks:claim:<task_id>` | string | ID of the node that owns the task. Written atomically together with the removal from the queue, so a task is claimed by exactly one node. Expires after 5 minutes; the owner refreshes it every minute. |
| `tasks:running` | set | IDs of tasks that are currently running. |
| `tasks:active:<project_id>` | set | IDs of tasks that are active (waiting or running) in a project. Used for per-project concurrency limits. |
| `tasks:task_project` | hash | `task_id` → `project_id`, so that any node can load the task from the database. |
| `tasks:aliases` | hash | `alias` → `task_id` for tasks that are addressed by an alias. |
| `tasks:runtime:<task_id>` | hash | Fields that change while the task runs, such as the runner ID and the user who started it. |
| `tasks:finalize:<task_id>` | string | Lock taken by the node that writes the final result of a task that ran on a remote runner. Expires after 5 minutes. |

Entries in `tasks:task_project`, `tasks:aliases` and `tasks:runtime:*` are removed when the task finishes and additionally expire after 7 days as a safety net.

A node picks a task from the queue with a single atomic operation: it checks that the task is still queued, writes the claim, removes the task from the queue, and adds it to the running set. If two nodes try at the same time, only one succeeds.

**Orphan cleaner.** Once a minute every node reviews the running tasks whose owner is dead, meaning the claim has expired or the owner's heartbeat is gone. A task that the database already shows as finished is simply removed from Redis. A task that was never handed to a runner is put back into the queue so that a live node dispatches it. A task that is already executing on a runner is left alone: the runner keeps working, and the task is cleaned up once the database shows it finished.

## Locks {#locks}

Locks are single keys created with `SET NX`: the node that manages to create the key holds the lock. Every lock has an expiry, and long-held locks are refreshed by their owner, so a crashed node releases its locks automatically.

| Key | Expiry | Purpose |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 s | One lock per schedule per minute. The node that creates it fires the schedule; the others skip it. |
| `ha:wf:lock:<project_id>:<run_id>` | 30 s, refreshed every 10 s | Only one node advances a given workflow run at a time. |
| `ha:wf:start:<project_id>:<template_id>` | 10 s | Short lock while a new workflow run is created, so two nodes do not start the same workflow twice. |
| `ha:audit:export:<destination_id>` | 30 s, refreshed every 10 s | Only one node exports audit events to a given destination. If Redis is unavailable, no node exports, so events are never sent twice. |

Schedule and workflow locks fail open: if Redis cannot be reached, the node proceeds rather than skipping work, and the conditional updates in the database keep the result correct. The audit export lease fails closed, because a duplicated export cannot be undone.

## Pub/Sub channels {#pubsub-channels}

| Channel | Purpose |
| --- | --- |
| `ha:ws:broadcast` | WebSocket messages for the UI. A node delivers a message to its own connected browsers and publishes it here; the other nodes relay it to theirs. |
| `tasks:events` | Changes in the task queue and running set, runtime field updates, and force-stop requests. Nodes use these events to keep their in-memory view of the queue current and to stop a task that another node asked to stop. |

Messages carry the ID of the sending node, so a node ignores its own messages.

## Runner cache keys {#runner-cache-keys}

The `ha:runner:*` keys belong to the shared cache of runner records. For more information, see [Runner authentication cache](/admin-guide/ha/runner-cache).

## Related pages {#related-pages}

- [High Availability](/admin-guide/ha) — architecture, configuration and load balancer setup.
- [Runner authentication cache](/admin-guide/ha/runner-cache) — the shared cache of runner records.
