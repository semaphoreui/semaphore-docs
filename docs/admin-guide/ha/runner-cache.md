---
title: Runner authentication cache
description: Why Semaphore caches runner records by token, how HA nodes share the cache through Redis, when entries are invalidated, and what happens when Redis fails.
---

# Runner authentication cache

Every request a [runner](/admin-guide/runners) sends to the server carries its token, and the server has to turn that token into a runner record before it can do anything else. Runners poll every few seconds and report progress every second while a job runs, so without a cache every one of those requests would cost a database query. The runner cache answers most of them from memory.

A single node keeps the cache in its own memory. In HA mode that is not enough: if you edit a runner on node A, node B must not keep serving the old record. So in HA mode the cache lives in Redis and is shared by all nodes, and a change made through any node is visible to all of them at once.

:::note
This cache is not the **Clear cache** action on the Runners page. That action asks the runner itself to delete the working directories on its machine.
:::

## What is cached and for how long {#runner-cache-ttl}

The cached value is the runner record without its tags and without the token. The token never reaches Redis: the key is derived from a SHA-256 hash of the token, and the token field is blanked before the record is stored.

An entry lives for at most 30 seconds. In practice it is dropped much earlier, because every change made through Semaphore invalidates the cache right away:

* Creating, updating, deleting, or re-registering a runner, or deleting a project, drops **every** cached runner on all nodes.
* A runner heartbeat drops **only that runner's** entry, so the stored "last seen" time stays fresh without touching the others. A heartbeat is written at most once per interval that is a third of `runners.offline_timeout_sec`, capped at 45 seconds; with the default timeout of 120 seconds that is every 40 seconds.

The 30-second expiry only matters for changes made around Semaphore, for example by editing the `runner` table directly or restoring a backup.

## How stale writes are prevented {#runner-cache-generation}

A lookup that misses the cache reads the runner from the database and then stores it. Between those two steps another node may change the runner. To make sure the lookup never caches what it read before the change, the cache keeps a counter that grows on every invalidation. The lookup remembers the counter value it saw before going to the database, and the store is rejected if the counter has moved on in the meantime. Each step runs as one Lua script in Redis, so the counter and the entry are read and written together.

## Redis keys {#runner-cache-redis-keys}

| Key | Type | Purpose |
| --- | --- | --- |
| `ha:runner:gen` | string, integer | The counter. Grows by one on every invalidation, whether of the whole cache or of a single runner. |
| `ha:runner:inv` | string, integer | Counter value at the last full invalidation. It is part of every entry key, so a full invalidation makes all existing entries unreachable at once; they then expire on their own. |
| `ha:runner:token:<inv>:<sha256(token)>` | string, binary | The cached runner record. Expires after 30 s. |
| `ha:runner:forgot:<sha256(token)>` | string, integer | Counter value at the last heartbeat of this runner. A lookup that started before the heartbeat cannot store the pre-heartbeat record. Expires after 30 s. |

The Cluster dashboard reports the number of `ha:runner:token:*` keys as the size of the runner cache.

## Behaviour on Redis problems {#runner-cache-failures}

The cache never makes a runner request fail. Every cache operation is bounded to 500 milliseconds; if Redis is slow or unreachable, the lookup is treated as a miss and goes to the database, and nothing is stored. The one case to be aware of is an invalidation that fails because Redis is down at the moment a runner is changed: other nodes may then serve the old record until it expires, at most 30 seconds later. The failure is logged at error level.

## Related pages {#related-pages}

- [High Availability](/admin-guide/ha) — architecture, configuration and load balancer setup.
- [Cluster coordination](/admin-guide/ha/coordination) — the Redis keys, locks and channels shared by the nodes.
- [Runners](/admin-guide/runners) — registering and configuring runners.
