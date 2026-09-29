---
title: 将审计日志发送到 SIEM
description: 配置 Semaphore Pro 通过带 TLS 的 Syslog 将审计事件发送到 SIEM,并配置 rsyslog 或 Vector 接收它们。
---

# 将审计日志发送到 SIEM <FeatureState feature="audit-siem-export" />

Semaphore Pro 将[审计日志](/admin-guide/audit-log)中的每个事件以基于 TLS 的 RFC 5424 Syslog 消息发送到 SIEM。

## 开始之前 {#before-you-begin}

- Semaphore Pro 许可证。
- [已开启的审计日志](/admin-guide/audit-log#enable)。
- 支持 TLS 的 Syslog 接收端,例如 rsyslog 或 Vector,请参阅[接收端示例](#receivers)。
- 签发接收端证书的 CA 证书(PEM 格式),如果它不在系统信任库中。

## 步骤 {#steps}

要将审计日志发送到 SIEM,请按以下步骤操作:

1. 在 `config.json` 中添加 `audit.syslog` 部分:

   ```json
   {
     "audit": {
       "enabled": true,
       "instance_id": "prod-eu",
       "syslog": {
         "id": "siem",
         "address": "siem.example.com:6514",
         "ca_file": "/etc/semaphore/siem-ca.pem",
         "server_name": "siem.example.com",
         "timeout": "10s"
       }
     }
   }
   ```

   或使用环境变量:

   ```bash
   SEMAPHORE_AUDIT_SYSLOG_ID=siem
   SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
   SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
   SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
   SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
   ```

   `id` 和 `address` 为必填项。`ca_file` 会把一个 CA 加入系统信任库。`server_name` 会替换接收端证书中校验的
   名称。`timeout` 限制连接和写入的时间,默认 10 秒。
2. 重启 Semaphore。CA 文件无法读取,或缺少 `id` 或 `address` 时,启动会因错误而中止。
3. 用错误的密码登录。SIEM 会收到一个结果为 `failure` 的 `auth.login` 事件。

## 事件如何投递 {#delivery}

- Semaphore 按 `id` 保存自己在日志中的位置。重启后会从该位置继续,接收端不可达期间记录的事件会在其恢复后发送。
  新的 `id` 从当前事件开始,不会发送更早的事件。
- 投递是尽力而为的:写入一个悄无声息断开的连接的事件可能丢失。
- 事件可能会到达两次,例如在网络错误或故障切换之后。请按 `event_id` 去重,并按 `seq` 对事件排序。
- 开启[高可用](/admin-guide/ha)时,同一时间只有一个节点发送。该节点停止后,另一个节点接替。

## 接收端示例 {#receivers}

Semaphore 发送使用八位组计数分帧(RFC 5425)的 RFC 5424 消息。消息正文是事件 JSON。Syslog 的 `HOSTNAME` 是节点
ID,没有 HA 时是实例 ID,`MSGID` 是 `event_code`。

### rsyslog {#rsyslog}

通过 TLS 接收事件,每行写入一个 JSON 事件:

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

### Vector {#vector}

通过 TLS 接收事件并解析事件 JSON:

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

## 后续步骤 {#whats-next}

- [审计日志](/admin-guide/audit-log) — 事件结构以及记录的内容。
- [审计事件](/reference/audit-events) — 每个事件及其结果、原因和元数据。
- [配置](/reference/configuration) — 所有 `audit.*` 选项。
