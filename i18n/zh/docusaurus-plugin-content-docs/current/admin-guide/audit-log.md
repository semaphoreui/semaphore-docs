---
title: 审计日志
description: 启用审计日志，查看谁在 Semaphore 中做了什么，并将审计事件从 Semaphore Pro 发送到 SIEM。
---

# 审计日志

审计日志记录 Semaphore 中的重要操作：谁登录了，谁修改了用户或角色，谁创建了 API 令牌。每个事件都会显示操作者、时间、来源地址以及操作是否成功。你可以用它来了解安装中发生了什么，也可以把事件发送到 SIEM，与其他日志放在一起。

所有版本都提供审计日志。将事件发送到 SIEM 需要 Semaphore Pro。

## 记录的内容 {#recorded-events}

目前 Semaphore 记录登录、账户和项目活动：

- 登录、失败的登录尝试、注销和第二因素验证；
- 被拒绝的 API 令牌、被拒绝的请求和被阻止的跨站请求；
- 用户、密码、双因素认证、外部身份和 API 令牌的更改；
- 项目成员、角色和模板权限的更改；
- 项目、清单、代码仓库、模板、计划任务、集成、主机配置、环境、凭据和机密存储的更改，以及项目备份的导出和还原；
- 系统设置的更改和 Pro 许可证的激活；
- 每次服务器启动。

后续版本会加入更多事件。完整列表请参阅 [审计事件](/reference/audit-events)。

密码、令牌、机密值和任务输出永远不会出现在审计事件中。API 令牌以指纹而不是其值显示。登录失败时会保留输入的登录名，因此其中可能包含电子邮件地址。

代码仓库 URL、主机配置 URL 和集成别名同样不会被记录。如果环境已保存但其中一个机密失败，API 会返回错误，但环境已经存在。此时该事件记为成功，并带有 `metadata.partial=true` 和 `reason=secret_failed`。清单步骤失败的模板（`reason=inventory_failed`）和设置失败的项目（`reason=setup_failed`）也以同样方式记录。

## 启用审计日志 {#enable}

审计日志默认关闭。要启用它，请设置 `audit.enabled`，并在 `audit.instance_id` 中为你的安装命名：

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

或者使用环境变量：

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

实例 ID 为 1 到 255 个不含空格的字符。它会添加到每个事件中，这样当多个安装向同一位置发送事件时，你也能区分它们。

重启 Semaphore。记录从重启后开始，之前的操作不会补录。所有选项请参阅 [配置选项](/reference/configuration#audit-log)。

## 在代理后记录客户端地址 {#trusted-proxies}

如果 Semaphore 运行在反向代理之后，事件中显示的是代理的地址而不是用户的地址。要记录真实的客户端地址，请在 `audit.trusted_proxy_cidrs` 中列出代理所在的网络：

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

或者使用环境变量：

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

这样 Semaphore 会从 `X-Forwarded-For` 或 `X-Real-IP` 获取客户端地址，但仅限来自这些网络的请求。如果请求经过多个代理，请把它们全部列出。不要列出用户连接所在的网络：这些网络中的任何人都可以在这些请求头中填入任意地址。

## 存储 {#storage}

事件存储在 Semaphore 数据库中，因此常规的数据库备份会包含它们。Semaphore 不会在界面中显示审计事件，也不会删除旧事件，请留意数据库的大小。

审计日志从不妨碍用户的操作。如果某个事件无法保存，Semaphore 会在服务器日志中写入错误，操作照常继续。

## 导出到 SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro 可以通过 TLS 将审计事件发送到 Syslog 接收器，例如 rsyslog 或 Vector。接收器可以存储这些事件，也可以转发给你的 SIEM。

你需要准备：

- 接收器的主机名和端口；
- 此目标的名称，例如 `security-syslog`；
- 接收器的 CA 证书（如果 Semaphore 主机尚未信任它）。

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

或者使用环境变量：

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` 和 `address` 为必填项。Semaphore 会记住已经向每个目标发送了哪些事件，因此更改地址或证书时请保持相同的 `id`。新的 `id` 会从新事件开始发送。

Semaphore 始终验证接收器的证书，并使用 TLS 1.2 或更高版本。`ca_file` 将你的 CA 添加到受信任的证书中，`server_name` 在证书中要验证的名称与地址不同时指定该名称。

重启 Semaphore。如果设置无效或无法读取 CA 文件，Semaphore 将不会启动。

### 确认事件已送达 {#verify-siem-delivery}

Semaphore 每次启动时都会记录一个事件。重启后，在接收器中查找它：`event_code` 为 `audit.lifecycle`，`action` 为 `start`，`metadata.destinations` 中包含你的目标 ID。

### 事件的投递方式 {#delivery}

- 如果接收器不可用，事件会在数据库中等待，待接收器恢复后再发送。用户不会察觉到任何变化。
- 在网络错误、重启或 HA 故障转移之后，部分事件可能会到达两次。使用 `event_id` 去除重复事件，使用 `seq` 排列事件顺序。
- 如果连接在没有报错的情况下中断，当时发送的事件可能会丢失。
- 在 [HA 安装](/admin-guide/ha) 中，同一时间只有一个节点发送事件。如果 Redis 不可用，发送会暂停，但事件仍会继续记录。

每个事件都以 RFC 5424 Syslog 消息发送，消息正文为事件 JSON。`HOSTNAME` 是 HA 节点 ID（单节点时为实例 ID），`MSGID` 是事件代码。

### rsyslog 示例 {#rsyslog}

此 rsyslog 配置接受 TLS 连接，并每行写入一个事件：

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

### Vector 示例 {#vector}

此 Vector 配置接受 TLS 连接，读取事件 JSON 并写入文件：

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

### 导出故障排除 {#troubleshoot-export}

- **Semaphore 无法启动。** 检查是否同时设置了 `audit.syslog.id` 和 `audit.syslog.address`，以及 CA 文件是否包含 PEM 证书。
- **TLS 连接失败。** 检查接收器证书是否与 `server_name` 匹配，并由 Semaphore 信任的 CA 签发。
- **事件没有到达。** 检查 Semaphore 服务器日志和接收器日志。失败后，Semaphore 会稍等片刻再重试。
- **部分事件到达两次。** 这可能在重试和故障转移后发生。按 `event_id` 去除重复事件。

## 不记录的内容 {#not-recorded}

命令行工具 `semaphore` 直接操作数据库，因此 `user add`、`user token` 等命令不会被记录。

界面中的部分操作目前还不会记录：移除许可证、应用设置、清除 HA 任务状态、Terraform 清单别名、删除 Terraform 状态、工作流运行和项目邀请。模板描述、视图、清除项目缓存和计划的机密存储同步同样不会记录。后续版本计划加入的事件请参阅 [审计事件](/reference/audit-events)。

## 后续步骤 {#whats-next}

- [审计事件](/reference/audit-events) — 事件格式以及所有记录的事件。
- [配置选项](/reference/configuration#audit-log) — 所有 `audit.*` 选项和环境变量。
- [日志](/admin-guide/logs) — 服务器日志、活动日志和任务日志。
