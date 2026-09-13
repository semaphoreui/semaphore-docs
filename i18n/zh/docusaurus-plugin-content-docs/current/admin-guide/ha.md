# 高可用

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
* 一个所有节点都能访问的 **Redis** 实例（或 Redis 集群）。
* 一个支持 HTTP 和 WebSocket 流量的**负载均衡器**。
* 两台或更多用于运行 Semaphore 实例的服务器。

所有 Semaphore 节点必须使用相同的数据库、Redis 实例和配置（`ha.node_id` 除外，它在每个节点上必须唯一）。

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

### 如果某个 Semaphore 节点发生故障会怎样？ {#what-happens-if-one-semaphore-node-fails}

负载均衡器会将流量路由到其余节点。正在运行的作业在其他实例上继续执行，新作业会由任意可用节点领取。

### 可以水平扩展吗？ {#can-i-scale-horizontally}

可以。你可以在负载均衡器后面添加 Semaphore 节点以提升 Web/API 容量，也可以添加[运行器](/admin-guide/runners)以提升任务执行容量。
