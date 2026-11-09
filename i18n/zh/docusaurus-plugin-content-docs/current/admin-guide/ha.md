---
title: "高可用"
---

# 高可用 <Enterprise />

:::info
高可用功能在 **Semaphore Enterprise** 版本中提供。
:::

Semaphore UI 支持双活（active-active）高可用（HA）部署：多个实例同时运行在负载均衡器之后。每个实例都能完整地处理 UI 请求、API 调用、计划作业和任务执行。如果某个实例发生故障，其余节点会继续运行而不会中断。

## 架构 {#architecture}

典型的双活部署由以下组件组成：

**负载均衡器** —— 用户通过负载均衡器（例如 NGINX、HAProxy 或云负载均衡器）连接。负载均衡器将 HTTP 和 WebSocket 流量分发到可用的 Semaphore 节点。

**Semaphore 节点** —— 每个节点运行一个完全相同的 Semaphore UI 实例。任何节点都可以接收用户请求、启动自动化作业、处理计划任务并发送实时更新。所有节点地位平等——没有主节点或备用节点之分。

**共享数据库** —— 所有实例连接到同一个共享的 PostgreSQL 或 MySQL 数据库。数据库是项目（Project）、模板、清单（Inventory）、计划任务（Schedule）、任务历史、用户账户和 RBAC 配置的唯一事实来源。

:::warning
HA 部署不支持 SQLite 和 BoltDB。请使用 PostgreSQL 或 MySQL。
:::

**Redis** —— Redis 提供协调层，使多个节点能够表现为一个统一的系统。它承担三项职能：

* **分布式锁**确保同一作业在同一时刻只由一个实例执行，防止任务重复执行。
* **共享任务队列状态**维护任务队列，使每个作业恰好被一个工作节点领取。所有节点看到同一个队列并协调执行。
* **发布/订阅消息**允许节点广播事件，例如任务更新、集群通知、缓存失效和 UI 状态变化。这使所有节点保持实时同步。

## 前提条件 {#prerequisites}

在设置 HA 之前，你需要：

* **Semaphore Enterprise** 订阅密钥。
* 一个所有节点都能访问的共享 **PostgreSQL** 或 **MySQL** 数据库。
* 一个所有节点都能访问的 **Redis** 服务器，或 **Redis Sentinel** 部署。不支持 Redis Cluster。
* 一个支持 HTTP 和 WebSocket 流量的**负载均衡器**。
* 两台或更多用于运行 Semaphore 实例的服务器。

所有 Semaphore 节点必须使用相同的数据库、Redis 后端和配置（`ha.node_id` 除外，它在每个节点上必须唯一）。

## 配置 {#configuration}

在每个节点的 `config.json` 中添加 `ha` 块以启用 HA：

```json
{
  "dialect": "postgres",
  "postgres": {
    "host": "db.example.com:5432",
    "name": "semaphore",
    "user": "semaphore",
    "pass": "***"
  },

  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "redis": {
      "addr": "redis.example.com:6379",
      "db": 0,
      "pass": "***"
    }
  },

  "cookie_hash": "...",
  "cookie_encryption": "...",
  "access_key_encryption": "..."
}
```

每个节点必须拥有唯一的 `ha.node_id`。其他所有配置在各节点之间应保持一致。

### 环境变量 {#environment-variables}

或者，也可以使用环境变量配置 HA：

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_REDIS_ADDR=redis.example.com:6379
SEMAPHORE_HA_REDIS_DB=0
SEMAPHORE_HA_REDIS_PASS=***
```

### Redis Sentinel {#redis-sentinel}

为了能够承受 Redis 服务器自身发生故障的情况，可以让集群指向一个 [Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/) 部署，而不是单个地址。将 `ha.engine` 设置为 `redis_sentinel`，并在 `ha.redis_sentinel` 中描述 Sentinel 的部署信息：

```json
{
  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "engine": "redis_sentinel",
    "redis_sentinel": {
      "master_name": "mymaster",
      "addrs": ["sentinel-1.example.com:26379", "sentinel-2.example.com:26379", "sentinel-3.example.com:26379"],
      "pass": "***"
    }
  }
}
```

每个节点都会向 sentinel 查询当前的主节点，并且无需重启即可跟随故障转移：在主节点切换期间正在运行的任务会继续运行，新的任务、计划任务和实时更新会在被提升的副本上继续进行。

使用环境变量实现相同的配置（sentinel 列表为 JSON 数组）：

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_ENGINE=redis_sentinel
SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME=mymaster
SEMAPHORE_HA_REDIS_SENTINEL_ADDRS='["sentinel-1.example.com:26379","sentinel-2.example.com:26379","sentinel-3.example.com:26379"]'
SEMAPHORE_HA_REDIS_SENTINEL_PASS=***
```

注意事项：

* `ha.engine` 决定读取哪个块。`redis`（默认值）读取 `ha.redis`；`redis_sentinel` 读取 `ha.redis_sentinel`。另一个块即使存在也会被忽略，并在启动时记录一条警告。
* 使用 `redis_sentinel` 时，`master_name` 和 `addrs` 中至少一个地址是必填项；缺少它们时节点将拒绝启动。
* `user` 和 `pass` 用于在 Redis 数据节点上进行身份验证。如果 sentinel 自身需要身份验证（`sentinel.conf` 中的 `requirepass`），还需要设置 `sentinel_user` 和 `sentinel_pass`。
* `tls` 和 `tls_skip_verify` 同时适用于 Sentinel 连接和 Redis 数据节点连接。

### 配置参考 {#configuration-reference}

| 配置文件选项 | 环境变量 | 说明 |
| --- | --- | --- |
| `ha.enabled` | `SEMAPHORE_HA_ENABLED` | 启用高可用模式。 |
| `ha.node_id` | `SEMAPHORE_HA_NODE_ID` | 此节点的唯一标识符。 |
| `ha.redis.addr` | `SEMAPHORE_HA_REDIS_ADDR` | Redis 服务器地址（例如 `localhost:6379`）。 |
| `ha.redis.db` | `SEMAPHORE_HA_REDIS_DB` | Redis 数据库编号。 |
| `ha.redis.pass` | `SEMAPHORE_HA_REDIS_PASS` | Redis 服务器密码。 |
| `ha.redis.user` | `SEMAPHORE_HA_REDIS_USER` | Redis 服务器用户名。 |
| `ha.redis.tls` | `SEMAPHORE_HA_REDIS_TLS` | 为 Redis 连接启用 TLS。 |
| `ha.redis.tls_skip_verify` | `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` | 跳过 Redis 的 TLS 证书验证。 |
| `ha.engine` | `SEMAPHORE_HA_ENGINE` | Redis 后端：`redis`（单个服务器，默认值）或 `redis_sentinel`。 |
| `ha.redis_sentinel.master_name` | `SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME` | Sentinel 中配置的被监控主节点的名称。 |
| `ha.redis_sentinel.addrs` | `SEMAPHORE_HA_REDIS_SENTINEL_ADDRS` | Sentinel 地址，格式为 `host:port`。在环境变量中为 JSON 数组。 |
| `ha.redis_sentinel.sentinel_user` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_USER` | Sentinel 节点自身的用户名。 |
| `ha.redis_sentinel.sentinel_pass` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_PASS` | Sentinel 节点自身的密码。 |
| `ha.redis_sentinel.db` | `SEMAPHORE_HA_REDIS_SENTINEL_DB` | 数据节点上的 Redis 数据库编号。 |
| `ha.redis_sentinel.user` | `SEMAPHORE_HA_REDIS_SENTINEL_USER` | Redis 数据节点的用户名。 |
| `ha.redis_sentinel.pass` | `SEMAPHORE_HA_REDIS_SENTINEL_PASS` | Redis 数据节点的密码。 |
| `ha.redis_sentinel.tls` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS` | 为 Sentinel 和 Redis 连接启用 TLS。 |
| `ha.redis_sentinel.tls_skip_verify` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS_SKIP_VERIFY` | 跳过 Sentinel 和 Redis 连接的 TLS 证书验证。 |

完整的可用选项列表请参阅[配置](/admin-guide/configuration)。

## 负载均衡器 {#load-balancer}

在 Semaphore 节点前面放置一个负载均衡器来分发流量。负载均衡器必须支持 **WebSocket 连接**，以便实现 UI 的实时更新。

### NGINX 示例 {#nginx-example}

```nginx
upstream semaphore {
    server node1.example.com:3000 max_fails=3 fail_timeout=10s;
    server node2.example.com:3000 max_fails=3 fail_timeout=10s;
    server node3.example.com:3000 max_fails=3 fail_timeout=10s;
}

server {
    listen 443 ssl;
    server_name semaphore.example.com;

    ssl_certificate     /etc/ssl/certs/semaphore.crt;
    ssl_certificate_key /etc/ssl/private/semaphore.key;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_pass http://semaphore;

        proxy_connect_timeout 3s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }


    location /api/ws {
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://semaphore;
        
        proxy_connect_timeout 3s;
        proxy_send_timeout 1h;
        proxy_read_timeout 1h;

        proxy_next_upstream error timeout http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }
}
```

更多 NGINX 配置细节请参阅[反向代理](/admin-guide/reverse-proxy/nginx)。

## 作业执行的工作原理 {#how-job-execution-works}

在多节点部署中，任务（Task）执行遵循一个协调的流程：

1. **用户触发任务。**用户通过 UI 或 API 启动作业。该请求可能落到任意一个 Semaphore 节点上。
2. **存储任务元数据。**接收请求的节点将任务元数据写入数据库，并通过 Redis 发出工作信号。
3. **某个节点领取任务。**一个可用节点从 Redis 中取出任务，获取分布式锁，并在数据库中将其标记为运行中。
4. **执行任务。**该节点在本地运行任务，或将其委派给[远程运行器（Runner）](/admin-guide/runners)。进度和日志会写回数据库。
5. **广播结果。**任务更新通过 Redis 发布/订阅传播，使所有节点和已连接的 UI 客户端保持同步。

## HA 的底层工作原理 {#under-the-hood}

Semaphore 节点之间从不直接通信。它们需要达成一致的所有事情都通过 Redis 进行：谁还活着、哪个任务属于哪个节点、谁来触发计划任务，以及要转发哪些 UI 消息。这些状态中的每一部分都是一小组带过期时间的 Redis 键，因此崩溃的节点不会长时间留下任何残留。持久化数据（任务、模板、日志、运行器）始终存放在数据库中；Redis 只保存协调状态。

所有键都使用固定前缀 `ha:` 和 `tasks:`。这些前缀不可配置，因此共享同一台 Redis 服务器的两个 Semaphore 集群必须使用不同的数据库编号（`ha.redis.db`）。

### 节点注册表 {#node-registry}

每个节点在启动时注册自己，然后每 10 秒刷新一次自己的记录。记录在 30 秒后过期，因此停止刷新的节点最多在半分钟后就会被视为已死亡。正常关闭时，节点会立即删除自己的记录。

| 键 | 类型 | 用途 |
| --- | --- | --- |
| `ha:node:<node_id>` | string，JSON | 单个节点的心跳：`node_id`、`started_at`、`version`、`last_beat`。在最后一次刷新 30 s 后过期。 |
| `ha:nodes` | set | 所有已注册节点的 ID。心跳键已过期的成员会被其他节点清理掉。 |

节点注册表就是集群仪表盘所显示的内容，也是孤儿清理器（见下文）用来判断某个任务的所有者是否仍然存活的依据。

### 任务队列与运行中的任务 {#task-queue}

任务队列是共享的，因此在一个节点上启动的任务可以由任何其他节点分派、监视和完成。Redis 只存储任务 ID 和少量临时字段；任务本身由需要它的节点从数据库加载。

| 键 | 类型 | 用途 |
| --- | --- | --- |
| `tasks:queue` | list | 等待分派的任务 ID，按顺序排列。 |
| `tasks:claim:<task_id>` | string | 拥有该任务的节点 ID。与从队列中移除的操作一起原子写入，因此一个任务恰好被一个节点领取。5 分钟后过期；所有者每分钟刷新一次。 |
| `tasks:running` | set | 当前正在运行的任务 ID。 |
| `tasks:active:<project_id>` | set | 某个项目中处于活动状态（等待中或运行中）的任务 ID。用于按项目限制并发数。 |
| `tasks:task_project` | hash | `task_id` → `project_id`，使任何节点都能从数据库加载该任务。 |
| `tasks:aliases` | hash | `alias` → `task_id`，用于通过别名寻址的任务。 |
| `tasks:runtime:<task_id>` | hash | 任务运行期间会变化的字段，例如运行器 ID 和启动任务的用户。 |
| `tasks:finalize:<task_id>` | string | 由写入远程运行器上所执行任务最终结果的节点获取的锁。5 分钟后过期。 |

`tasks:task_project`、`tasks:aliases` 和 `tasks:runtime:*` 中的条目在任务结束时被删除，并且作为安全兜底，还会在 7 天后过期。

节点通过单个原子操作从队列中取出任务：它检查任务是否仍在队列中，写入领取记录，将任务从队列中移除，并将其加入运行中集合。如果两个节点同时尝试，只有一个会成功。

**孤儿清理器。**每个节点每分钟检查一次所有者已死亡的运行中任务，即领取记录已过期或所有者的心跳已消失。数据库中已显示为完成的任务会直接从 Redis 中删除。从未交给运行器的任务会被放回队列，以便由存活的节点分派。已经在运行器上执行的任务则保持不动：运行器继续工作，待数据库显示该任务完成后再进行清理。

### 锁 {#locks}

锁是用 `SET NX` 创建的单个键：成功创建该键的节点持有锁。每个锁都有过期时间，长时间持有的锁由其所有者刷新，因此崩溃的节点会自动释放其锁。

| 键 | 过期时间 | 用途 |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 s | 每个计划任务每分钟一个锁。创建它的节点触发该计划任务；其他节点跳过。 |
| `ha:wf:lock:<project_id>:<run_id>` | 30 s，每 10 s 刷新一次 | 同一时刻只有一个节点推进某个给定的工作流运行。 |
| `ha:wf:start:<project_id>:<template_id>` | 10 s | 创建新的工作流运行时的短暂锁，防止两个节点将同一个工作流启动两次。 |
| `ha:audit:export:<destination_id>` | 30 s，每 10 s 刷新一次 | 只有一个节点向给定目标导出审计事件。如果 Redis 不可用，则没有节点进行导出，因此事件永远不会被发送两次。 |

计划任务锁和工作流锁采用失败开放（fail open）策略：如果无法连接 Redis，节点会继续执行而不是跳过工作，数据库中的条件更新会保证结果正确。审计导出租约则采用失败关闭（fail closed）策略，因为重复的导出无法撤销。

### 发布/订阅频道 {#pubsub-channels}

| 频道 | 用途 |
| --- | --- |
| `ha:ws:broadcast` | 发送给 UI 的 WebSocket 消息。节点将消息投递给自己连接的浏览器，并发布到此频道；其他节点再将其转发给各自的浏览器。 |
| `tasks:events` | 任务队列和运行中集合的变化、运行时字段更新以及强制停止请求。节点利用这些事件使其内存中的队列视图保持最新，并停止其他节点要求停止的任务。 |

消息携带发送节点的 ID，因此节点会忽略自己发出的消息。

### 运行器缓存键 {#runner-cache-keys}

`ha:runner:*` 键属于[运行器缓存](#runner-cache)，将在下一节中介绍。

## 运行器缓存 {#runner-cache}

[运行器](/admin-guide/runners)发送给服务器的每个请求都携带其令牌，服务器必须先将该令牌解析为运行器记录，然后才能做任何其他事情。运行器每隔几秒轮询一次，并在作业运行期间每秒上报一次进度，因此如果没有缓存，每一个这样的请求都要付出一次数据库查询的代价。运行器缓存从内存中应答其中的大部分请求。

单个节点将缓存保存在自己的内存中。在 HA 模式下这还不够：如果你在节点 A 上编辑了一个运行器，节点 B 就不能继续提供旧记录。因此在 HA 模式下，缓存存放在 Redis 中并由所有节点共享，通过任何节点所做的更改都会立即对所有节点可见。

:::note
此缓存不是运行器页面上的**清除缓存**操作。该操作是要求运行器自身删除其机器上的工作目录。
:::

### 缓存的内容及其保存时长 {#runner-cache-ttl}

缓存的值是去掉标签和令牌的运行器记录。令牌永远不会到达 Redis：键由令牌的 SHA-256 哈希派生而来，并且在存储记录之前令牌字段会被清空。

一个条目最多存活 30 秒。实际上它会更早被丢弃，因为通过 Semaphore 所做的每一次更改都会立即使缓存失效：

* 创建、更新、删除或重新注册运行器，或删除项目，都会丢弃所有节点上**全部**已缓存的运行器。
* 运行器心跳**只丢弃该运行器自己的**条目，因此所存储的"最后在线"时间保持最新，而不影响其他条目。心跳的写入间隔最多为 `runners.offline_timeout_sec` 的三分之一一次，上限为 45 秒；在默认超时为 120 秒的情况下，即每 40 秒一次。

30 秒的过期时间只对绕过 Semaphore 所做的更改有意义，例如直接编辑 `runner` 表或恢复备份。

### 如何防止过期写入 {#runner-cache-generation}

未命中缓存的查找会从数据库读取运行器，然后将其存入缓存。在这两步之间，另一个节点可能更改了该运行器。为了确保查找永远不会缓存它在更改之前读取的内容，缓存维护了一个在每次失效时递增的计数器。查找会记住它在访问数据库之前看到的计数器值，如果在此期间计数器已经变化，则存储操作会被拒绝。每一步都作为一个 Lua 脚本在 Redis 中运行，因此计数器和条目是一起读取和写入的。

### Redis 键 {#runner-cache-redis-keys}

| 键 | 类型 | 用途 |
| --- | --- | --- |
| `ha:runner:gen` | string，整数 | 计数器。每次失效时加一，无论是整个缓存失效还是单个运行器失效。 |
| `ha:runner:inv` | string，整数 | 最近一次全量失效时的计数器值。它是每个条目键的一部分，因此一次全量失效会立即使所有现有条目不可达；随后它们会自行过期。 |
| `ha:runner:token:<inv>:<sha256(token)>` | string，二进制 | 缓存的运行器记录。30 s 后过期。 |
| `ha:runner:forgot:<sha256(token)>` | string，整数 | 该运行器最近一次心跳时的计数器值。在心跳之前开始的查找无法存储心跳前的记录。30 s 后过期。 |

集群仪表盘将 `ha:runner:token:*` 键的数量报告为运行器缓存的大小。

### Redis 出现问题时的行为 {#runner-cache-failures}

缓存永远不会导致运行器请求失败。每次缓存操作都限制在 500 毫秒以内；如果 Redis 缓慢或不可达，查找会被视为未命中并转而访问数据库，且不会存储任何内容。唯一需要注意的情况是：在运行器被更改的那一刻 Redis 恰好宕机，导致失效操作失败；此时其他节点可能会继续提供旧记录，直到它过期为止，最多 30 秒。该失败会以错误级别记录到日志中。

## 使用运行器扩展 {#scaling-with-runners}

HA 还支持任务执行的水平扩展。除了仅在 Semaphore 节点自身上运行作业之外，还可以将执行委派给多个[运行器](/admin-guide/runners)。这让你能够：

* 将工作负载分布到整个基础设施。
* 独立于 Web/API 层扩展自动化能力。
* 隔离执行环境以限制影响范围。
* 在多个节点上并行运行任务。

设置说明请参阅[运行器](/admin-guide/runners)。

## 优势 {#benefits}

* **更高的可靠性** —— 如果某个实例发生故障，其他实例会继续处理流量并执行作业。
* **零停机维护** —— 可以逐个更新或重启节点，而无需停止整个系统。
* **水平可扩展性** —— 在负载均衡器后面添加 Semaphore 节点即可提升容量。
* **不依赖主节点** —— 所有节点地位平等，无需复杂的故障转移机制。
* **一致的集群状态** —— 共享数据库和 Redis 协调使所有实例保持同步。

## 常见问题 {#faq}

### 什么是双活高可用？ {#what-is-active-active-high-availability}

双活 HA 意味着多个应用实例同时运行，并且全部都在处理请求。没有主节点——任何实例都可以处理流量并执行作业。

### 为什么 Semaphore 在 HA 模式下使用 Redis？ {#why-does-semaphore-use-redis-in-ha-mode}

Redis 充当实例之间的协调层。它提供分布式锁、共享任务队列状态和发布/订阅消息，以确保各节点不会同时执行同一个作业。

### HA 部署应该使用什么数据库？ {#what-database-should-i-use-for-ha-deployments}

Semaphore 支持使用 PostgreSQL 和 MySQL 作为共享数据库。SQLite 和 BoltDB 不能在 HA 模式下使用，因为它们不支持多个进程的并发访问。

### 如果 Redis 发生故障会怎样？ {#what-happens-if-redis-fails}

在使用单个 Redis 服务器（`ha.engine: redis`）时，各节点在 Redis 恢复之前无法进行协调。使用 [Redis Sentinel](#redis-sentinel) 时，sentinel 会提升一个副本，每个 Semaphore 节点都会自动切换到它，通常在几秒内完成，无需重启。

### 如果某个 Semaphore 节点发生故障会怎样？ {#what-happens-if-one-semaphore-node-fails}

负载均衡器会将流量路由到其余节点。正在运行的作业在其他实例上继续执行，新作业会由任意可用节点领取。

### 可以水平扩展吗？ {#can-i-scale-horizontally}

可以。你可以在负载均衡器后面添加 Semaphore 节点以提升 Web/API 容量，也可以添加[运行器](/admin-guide/runners)以提升任务执行容量。
