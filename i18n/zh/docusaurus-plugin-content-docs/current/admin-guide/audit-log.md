---
title: 审计日志
description: 启用安全审计日志，了解其记录内容，并通过带 TLS 的 Syslog 将审计事件从 Semaphore Pro 发送到 SIEM。
---

# 审计日志

审计日志记录与安全相关的活动：谁执行了操作、执行了什么操作、影响了哪个对象、
请求来自何处，以及操作是否成功。运维人员使用它调查变更，安全团队则利用其记录在案的事件格式
制定检测规则并提供合规证据。

Semaphore Community 支持审计事件的采集和本地存储。Semaphore Pro 还可以将采集到的
事件发送到安全信息和事件管理（SIEM）系统。

## 与其他日志的区别 {#log-types}

| 日志 | 用途 |
| --- | --- |
| 服务器日志 | 诊断 Semaphore 的启动、配置和运行时错误。 |
| 活动日志 | 向项目用户展示项目活动动态。 |
| 任务日志和历史记录 | 查看任务执行情况、状态和输出。 |
| 审计日志 | 调查整个安装中的身份验证和管理操作。 |

审计日志独立于[活动日志](/admin-guide/logs#activity-log)。启用或导出其中一种日志
不会启用或导出另一种日志。

## 记录的内容 {#recorded-events}

当前版本会记录支持的身份验证和身份管理事件，包括：

- 成功和失败的登录、退出及 TOTP 验证；
- 被拒绝的 API 令牌、被拒绝的权限和被阻止的跨站请求；
- 对用户、密码、TOTP 注册、外部身份和 API 令牌的更改；
- 对项目成员、角色和模板权限的更改；
- 对系统设置和 Pro 许可证激活的更改；
- 随服务器启动而开始的审计采集。

成功登录会在用户完成包括 TOTP 在内的所有必要身份验证步骤后记录。
有关所有可用事件以及计划在后续版本中提供的事件，请参阅
[审计事件](/reference/audit-events)。

## 事件中排除的敏感数据 {#sensitive-data}

审计事件会标识操作，但不会复制操作所用的凭据或机密载荷。事件不包含密码、
验证码、TOTP 密钥和二维码、恢复码、会话 Cookie、原始令牌、OAuth 授权码和声明、
私钥、密码短语、机密值、环境变量值和问卷值、Webhook 正文、任务输出及
仓库 URL。

API 令牌通过指纹而非令牌值来标识。登录失败事件会包含提交的
登录标识符，并截断至 64 字节。如果用户使用电子邮件地址登录，该标识符可能包含
电子邮件地址。

## 启用审计日志 {#enable}

为安装选择一个稳定的名称，然后在 `config.json` 中设置 `audit.enabled` 和
`audit.instance_id`：

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

实例 ID 必须包含 1 到 255 个不带空格的可打印 ASCII 字符。它会出现在每个事件中，
并让 SIEM 能够区分多个 Semaphore 安装。

也可以使用环境变量：

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

重启 Semaphore 以应用更改。重启后才会开始采集；此前的活动不会添加到
审计日志中。第一个事件是操作为 `start` 的 `audit.lifecycle`。

有关所有选项和环境变量，请参阅
[配置选项](/reference/configuration#audit-log)。

## 记录代理后的客户端地址 {#trusted-proxies}

默认情况下，HTTP 审计事件会记录直接连接到 Semaphore 的地址。如果该地址
属于反向代理，请仅将代理网络添加到 `audit.trusted_proxy_cidrs`：

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

或者设置：

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Semaphore 仅信任来自这些网络的 `X-Forwarded-For` 和 `X-Real-IP`。不要添加客户端网络：
受信任网络中的客户端可以自行指定其事件中记录的源地址。当多个代理
追加 `X-Forwarded-For` 时，Semaphore 会记录最右侧不属于受信任代理的地址。

## 存储和限制 {#storage}

Semaphore 将审计事件存储在其数据库中。当前版本没有审计查看器、审计 API、自动
保留或清理功能。请监控数据库增长情况，并将审计数据纳入数据库备份策略。

审计记录不会阻止正在记录的操作。如果事件存储失败，Semaphore 会向服务器日志写入
错误并继续执行原操作。本地记录与 Semaphore 的其他数据受相同的
数据库访问控制保护；它们并非不可变，也不具备篡改取证能力。

服务器每次启动都会记录 `audit.lifecycle/start`。没有停止事件。关闭、崩溃或禁用
审计日志时，会表现为后续启动事件之前的一段事件空白期。

## 导出到 SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro 可以将成功采集的事件发送到现有的 TLS Syslog 接收端，例如 rsyslog 或
Vector。接收端可以存储这些事件，也可以将其转发到 SIEM。

开始之前，请准备：

- 接收端的主机名和端口；
- 稳定的目标 ID，例如 `security-syslog`；
- 签署接收端证书的 CA 证书（如果 Semaphore 主机尚不信任该 CA）。

在 `config.json` 中添加 `audit.syslog`：

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "syslog": {
      "id": "security-syslog",
      "address": "siem.example.com:6514",
      "ca_file": "/etc/semaphore/siem-ca.pem",
      "server_name": "siem.example.com",
      "timeout": "10s"
    }
  }
}
```

也可以使用环境变量：

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` 和 `address` 为必填项。更改接收端地址或证书时，请保持 ID 不变，以便
Semaphore 从保存的位置继续发送。新 ID 会从目标初始化之后记录的事件开始；
届时已存储的事件不会发送到该目标。

`ca_file` 会将证书添加到系统信任存储区。`server_name` 会覆盖接收端证书中接受检查的
主机名。Semaphore 要求使用 TLS 1.2 或更高版本，并始终验证服务器证书。它
不支持禁用验证，也不支持为此连接使用客户端证书。

重启 Semaphore。无效的目标设置或无法读取的 CA 文件会导致 Semaphore 无法启动。

### 验证投递 {#verify-siem-delivery}

重启后，在接收端找到新事件并确认：

- `event_code` 为 `audit.lifecycle`；
- `action` 为 `start`；
- `outcome` 为 `success`；
- `instance_id` 与配置的安装名称一致；
- `metadata.destinations` 包含目标 ID。

### 投递行为 {#delivery}

- 如果接收端不可用，Semaphore 会将采集的事件保留在本地，并在接收端恢复后重试
  发送。用户请求会继续正常处理。
- Syslog 投递采用尽力而为方式。写入某个连接的事件，如果该连接在未通知 Semaphore 的情况下
  失败，则该事件可能会丢失。
- 网络错误、重启和 HA 故障转移可能造成重复投递。请按
  `event_id` 去重，并按 `seq` 排序事件。
- 在[高可用安装](/admin-guide/ha)中，通常同一时间只有一个节点向一个目标发送数据。如果 Redis
  不可用，导出会暂停，但共享数据库中的采集会继续进行。

Semaphore 发送采用 TLS 和八位组计数分帧的 RFC 5424 消息。消息正文包含审计
事件 JSON。`HOSTNAME` 是 HA 节点 ID，在单节点上则是实例 ID；`MSGID` 是 `event_code`。

### rsyslog 接收端示例 {#rsyslog}

以下 rsyslog 配置片段接受 TLS 连接，并将每个事件 JSON 对象写入单独一行：

```text
global(
  DefaultNetstreamDriver="gtls"
  DefaultNetstreamDriverCAFile="/etc/rsyslog.d/ca.pem"
  DefaultNetstreamDriverCertFile="/etc/rsyslog.d/cert.pem"
  DefaultNetstreamDriverKeyFile="/etc/rsyslog.d/key.pem"
)

module(load="imtcp" StreamDriver.Name="gtls" StreamDriver.Mode="1" StreamDriver.AuthMode="anon")
input(type="imtcp" port="6514" ruleset="semaphore-audit")

template(name="semaphore-audit-json" type="string" string="%msg%\n")

ruleset(name="semaphore-audit") {
  action(type="omfile" file="/var/log/semaphore-audit.json" template="semaphore-audit-json")
}
```

### Vector 接收端示例 {#vector}

以下 Vector 配置接受 TLS 连接、解析事件 JSON 并将其写入文件：

```toml
[sources.semaphore_audit]
type = "syslog"
mode = "tcp"
address = "0.0.0.0:6514"
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[transforms.semaphore_audit_event]
type = "remap"
inputs = ["semaphore_audit"]
source = ". = parse_json!(.message)"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_event"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### 排查导出问题 {#troubleshoot-export}

- 如果 Semaphore 无法启动，请检查是否同时设置了 `audit.syslog.id` 和 `audit.syslog.address`，
  并确认 CA 文件包含可读取的 PEM 证书。
- 如果 TLS 失败，请检查接收端证书对 `server_name` 是否有效，以及证书链是否可追溯到系统或
  配置的 CA。
- 如果事件尚未到达，请检查 Semaphore 服务器日志和接收端的接收日志。导出
  失败后会延迟一段时间再重试。
- 如果事件出现两次，请按 `event_id` 去重；某些重试和
  故障转移后出现重复事件是预期行为。

## 未覆盖审计的操作 {#not-recorded}

`semaphore` 命令会直接更改数据库，因此服务器端 CLI 操作（如 `user add` 和
`user token`）不会被记录。必须单独控制对服务器和数据库的访问。

当前版本也不会为以下操作生成审计事件：移除许可证、更改应用运行时设置、清除 HA 任务状态、
Terraform 清单别名、工作流运行或项目邀请。
[事件目录](/reference/audit-events)会标明计划在后续版本中提供的事件。

## 后续步骤 {#whats-next}

- [审计事件](/reference/audit-events) — 事件字段、可用和计划中的事件，以及合规覆盖范围。
- [配置选项](/reference/configuration#audit-log) — 所有 `audit.*` 选项和环境变量。
- [日志](/admin-guide/logs) — 服务器日志、活动日志和任务日志。
