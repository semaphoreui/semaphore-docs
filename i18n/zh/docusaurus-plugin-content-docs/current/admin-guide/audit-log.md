---
title: 审计日志
description: Semaphore 为登录、MFA、用户、权限、API 令牌和设置记录的安全审计日志,以及如何开启它。
---

# 审计日志

审计日志是一条安全审计追踪:谁在什么地方、对哪个对象做了什么、结果如何。安全分析师和合规团队会阅读它,
通常是在 SIEM 中。每个事件都有稳定且有文档的结构,因此分析师无需了解 Semaphore 的内部实现就能编写检测规则。

审计日志与[活动日志](/admin-guide/logs)是分开的。活动日志是面向项目用户的动态。审计日志是给检查系统是否被正确
使用的人看的追踪。

## 工作原理 {#overview}

开启审计日志后,Semaphore 会为通过 Web 界面或 API 发起的每个与安全相关的操作记录一个事件:登录和登出、MFA
校验、用户、项目成员、角色和权限的变更、API 令牌以及系统设置。被拒绝的请求也会被记录:登录失败、未知或已过期
的 API 令牌、被拒绝的权限、被拦截的跨站请求。

事件保存在 Semaphore 的数据库中。Semaphore Pro 可以把它们发送到 SIEM,请参阅[导出到 SIEM](#siem-export)。

## 事件结构 {#event-schema}

每个事件都是一个字段相同的 JSON 对象。事件列表及其结果、原因和元数据,请参阅
[审计事件](/reference/audit-events)。

| 字段 | 说明 |
| --- | --- |
| `event_id` | 事件的唯一 ID。在 SIEM 中用它去重。 |
| `seq` | 没有空缺、随每个事件递增的序号。用它对事件排序。 |
| `timestamp` | 事件时间(UTC)。 |
| `schema_version` | 本结构的版本。只有在字段被重命名、删除或改变类型时才会变化。 |
| `category` | `auth`、`iam`、`resource`、`secret`、`task`、`runner`、`system` 或 `audit`。 |
| `event_code` | 事件涉及的内容,例如 `iam.api_token`。 |
| `type` | 变更类型:`creation`、`change`、`deletion`、`access`、`start`、`end`、`denied` 或 `info`。 |
| `action` | 执行的操作,例如 `create`。 |
| `outcome` | `success` 或 `failure`。 |
| `reason` | 操作失败的原因,取自每个事件固定的列表。成功时为空。 |
| `actor` | 执行者:其 `type`(`user`、`anonymous`、`system`、`runner`、`integration`)、`id` 和 `name`。对于用户,还包括 `auth`(`session` 或 `api_token`);对于 API 令牌,还包括 `token_fingerprint`。 |
| `source` | 对于 Web 界面和 API 的请求:客户端的 `ip` 和 `user_agent`。 |
| `target` | 操作对象:其 `type`、`id` 和 `name`。 |
| `scope` | 项目内事件的 `project_id`。 |
| `request_id` | HTTP 请求的 ID。Semaphore 也会在响应头 `X-Request-ID` 中返回它。 |
| `instance_id` | 此 Semaphore 安装的名称,来自 `audit.instance_id`。 |
| `node_id` | 开启[高可用](/admin-guide/ha)时记录该事件的节点。 |
| `metadata` | 取决于事件的额外信息。 |

`timestamp` 是数据库时间,精确到微秒,在 SQLite 上精确到毫秒。请按 `seq` 对事件排序:两个事件的时间可能相同,
但 `seq` 永远不会相同。

在 MySQL 上,`audit_event` 表的 `created` 列使用连接选项 `loc` 的时区,默认为 UTC。
每个事件的 `timestamp` 始终为 UTC。

服务器每次启动都会记录动作为 `start` 的 `audit.lifecycle`。没有停止事件:停止、崩溃或关闭审计日志都表现为
下一个 `start` 之前的时间空缺。

## 永远不会记录的内容 {#never-recorded}

审计日志永远不包含密码、一次性验证码、TOTP 密钥和二维码、恢复码、会话 Cookie、令牌、OAuth 授权码和声明、
私钥、密码短语、密钥值、环境变量和问卷的值、Webhook 正文、任务输出、电子邮件地址或 URL。API 令牌只通过其
指纹识别:其 SHA-256 哈希的前 16 个十六进制字符。

用户 ID 和用户名用于识别执行者。登录失败时会记录输入的登录名,截断为 64 字节,因为调查失败的登录需要它。

## 开启审计日志 {#enable}

设置 `audit.enabled`,并在 `audit.instance_id` 中为此安装命名。名称由 1 到 255 个不含空格的可打印 ASCII
字符组成,会出现在每个事件中。

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

或使用环境变量:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

重启 Semaphore 使更改生效。所有选项请参阅[配置](/reference/configuration)。

## 反向代理后的客户端地址 {#trusted-proxies}

在反向代理之后,Semaphore 的直接对端是代理,客户端地址来自 `X-Forwarded-For` 或 `X-Real-IP` 请求头。只有当
直接对端位于 `audit.trusted_proxy_cidrs` 中时,Semaphore 才会读取这些请求头。否则它记录对端的地址,因此客户端
无法伪造自己的地址。

`audit.trusted_proxy_cidrs` 中只列出你的反向代理,不要列出客户端网络。位于受信任范围内的客户端可以在
`X-Forwarded-For` 中填入任何地址。

记录的地址是 `X-Forwarded-For` 中最右边的、不属于受信任代理的地址。
只有在没有 `X-Forwarded-For` 时才使用 `X-Real-IP`,而且它只能有一个值。

## 存储 {#storage}

事件保存在 Semaphore 的数据库中,永远不会被删除:此版本没有保留期限。请根据安装中的登录和变更数量规划数据库
大小。

## 合规映射 {#compliance}

Semaphore 会记录这些控制项所需的事件。它本身并不能让你的安装达到合规。

| 要求 | 覆盖方式 | 状态 |
| --- | --- | --- |
| PCI DSS 10.2.1.1 对敏感数据的访问(类比:密钥) | `iam.mfa/view_qr` | 可用 |
| PCI DSS 10.2.1.1 对敏感数据的访问(类比:密钥) | `resource.project_backup/export` | 计划中 |
| PCI DSS 10.2.1.2 管理员的操作 / ISO 27002 8.15 特权的使用 | `iam.*`, `system.*` | 可用 |
| PCI DSS 10.2.1.2 管理员的操作 / ISO 27002 8.15 特权的使用 | `resource.*`, `secret.*` | 计划中 |
| PCI DSS 10.2.1.2 管理员的操作 / ISO 27002 8.15 特权的使用 | `runner.*`, `task.control`, `task.history` | 计划中 |
| PCI DSS 10.2.1.3 对审计日志的访问 | 不适用:Semaphore 不提供对审计追踪的访问。 | — |
| PCI DSS 10.2.1.4 无效的逻辑访问尝试 / ISO 被拒绝的访问尝试 | `auth.login` failure, `auth.mfa` failure, `auth.api_token/reject`, `auth.authorization/deny`, `auth.csrf/block` | 可用 |
| PCI DSS 10.2.1.4 无效的逻辑访问尝试 / ISO 被拒绝的访问尝试 | `runner.lifecycle/register` failure | 计划中 |
| PCI DSS 10.2.1.5 身份识别和认证凭据的变更 | `iam.user*`, `iam.mfa`, `iam.api_token`, `iam.external_identity`, `iam.membership`, `iam.*role*` | 可用 |
| PCI DSS 10.2.1.5 身份识别和认证凭据的变更 | `runner.credential` | 计划中 |
| PCI DSS 10.2.1.6 审计日志的启动、停止和暂停 / ISO 安全系统的激活 | `audit.lifecycle/start`;停止表现为其之前的空缺 | 可用 |
| PCI DSS 10.2.1.7 系统级对象的创建和删除 | `resource.*` create/delete | 计划中 |
| PCI DSS 10.2.1.7 系统级对象的创建和删除 | `runner.lifecycle` create/delete | 计划中 |
| PCI DSS 10.2.2 必需字段 | `actor`、`event_code` 和 `action`、`timestamp`、`outcome`、`source` 或 `node_id`、`target` 或 `scope` | 可用 |
| PCI DSS 10.3.3 及时备份到中央日志服务器 | 通过 Syslog+TLS 导出到 SIEM | 可用 |
| PCI DSS 10.3.3 及时备份到中央日志服务器 | 通过 Splunk HEC 导出到 SIEM | 计划中 |

计划中的事件在此版本中不会被记录。

## 此版本不记录的内容 {#not-recorded}

- 在服务器上用 `semaphore` 命令执行的操作,例如 `user add` 或 `user token`。它们直接修改数据库,而能运行
  它们的人也能修改审计表。
- 移除许可证、应用运行时设置、清除 HA 任务状态、Terraform 清单别名、工作流运行以及项目邀请。它们目前还没有
  审计事件。

## 导出到 SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

Semaphore Pro 通过带 TLS 的 Syslog 将审计日志发送到 SIEM。它会为 SIEM 保存自己在日志中的位置,因此在 SIEM
不可达期间记录的事件会在 SIEM 恢复后发送。具体步骤请参阅
[将审计日志发送到 SIEM](/admin-guide/audit-log-siem)。

## 后续步骤 {#whats-next}

- [将审计日志发送到 SIEM](/admin-guide/audit-log-siem) — 通过 Syslog+TLS 导出事件。
- [审计事件](/reference/audit-events) — 每个事件及其结果、原因和元数据。
- [配置](/reference/configuration) — 所有 `audit.*` 选项。
