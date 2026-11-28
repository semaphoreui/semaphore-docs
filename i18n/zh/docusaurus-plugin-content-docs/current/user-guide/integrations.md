---
title: 集成
description: 通过端点、集成组、认证方式、匹配器和值提取器，从传入的 Webhook 启动模板和工作流。
---

# 集成

集成（Integration）允许 GitHub、GitLab 或 CI 服务器等外部服务通过调用 Webhook URL 在 Semaphore 中启动任务。一个集成由三个对象描述：**端点**定义请求到达的位置及其认证方式，**集成组**定义从该端点运行哪些集成，**集成**定义要启动什么以及使用哪些参数。

![集成列表](/assets/integrations-list.webp)

## 工作原理 {#how-it-works}

| 对象 | 包含内容 | 位置 |
|---|---|---|
| **端点** | 名称和描述、一个或多个**别名**（格式为 `/api/integrations/<random_string>` 的公开 URL），以及用于检查发往这些 URL 的每个请求的**认证**方式。 | 项目 → **Endpoints** |
| **集成组** | 从同一个端点运行的一组集成。组通常继承端点的认证；也可以用自己的方式和密钥**覆盖**它。 | 项目 → **Integrations**，每个组一个区块 |
| **集成** | 要启动的模板或工作流（Pro）、任务参数、过滤请求的[匹配器](#matchers)以及向任务传递数据的[值提取器](#value-extractors)。 | 在其所属的组内 |

当请求到达某个别名时，Semaphore 会找到对应的端点，使用每个组的认证（端点的或该组自己的）检查请求，然后启动已授权组中所有匹配器均接受该请求的每个集成。没有匹配器的集成会在每个已授权请求上运行。响应始终为 `204 No Content`；`X-Semaphore-Endpoint-ID`、`X-Semaphore-Integration-Group-ID`、`X-Semaphore-Integration-ID` 和 `X-Semaphore-Task-ID` 标头指明启动了什么。支持 `GET` 和 `POST` 请求。

![集成详情](/assets/integration-detail.webp)

对于无认证的端点，别名字符串是唯一的秘密：请像对待密码一样对待该 URL，删除别名即可撤销它。一个端点可以拥有多个别名，因此你可以为每个发送方提供单独的 URL，并逐个撤销。

## 认证 {#authentication}

端点（或覆盖它的组）使用以下方式之一检查请求：

* **GitHub Webhooks** — `X-Hub-Signature-256` 标头，使用密钥计算的请求正文 HMAC-SHA256
* **Bitbucket Webhooks** — `x-hub-signature` 标头，请求正文的 HMAC-SHA256
* **Token** — 你指定的标头的值必须等于密钥
* **HMAC (SHA-256)** 和 **HMAC (SHA-512)** — 你指定的标头携带请求正文的签名
* **BasicAuth** — 登录名/密码凭据中的登录名和密码
* **无认证** — 任何使用有效别名 URL 的请求都会通过

密钥来自项目的[密钥存储](./key-store)：**字符串**密钥（其值即为密钥）或**登录名/密码**凭据（其密码即为密钥）。BasicAuth 是例外：它还会检查登录名，因此需要登录名/密码凭据。表单只提供类型与认证方式匹配的密钥，API 会拒绝其他密钥。

## HMAC 认证 {#hmac-authentication}

HMAC 认证方式（`hmac` / SHA-256 和 `hmac-sha512` / SHA-512）用于验证 Webhook 请求正文是否使用共享密钥签名。

在端点（或覆盖它的组）上配置：

1. **Auth header** — 用于携带签名的请求标头（例如 `X-Signature`）。
2. **Auth secret** — 密钥存储中的**字符串**密钥或登录名/密码凭据。

发送方必须将原始请求正文的 HMAC 摘要以**不带前缀的十六进制值**放入该标头（不使用 `sha256=` / `sha512=` 前缀）。Semaphore 会使用配置的密钥计算正文的 `HMAC-SHA256` 或 `HMAC-SHA512`，并与该值进行比较。

使用 OpenSSL 的 SHA-512 示例：

```bash
SECRET='your-webhook-secret'
BODY='{"event":"deploy"}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "$SECRET" | awk '{print $2}')"

curl -X POST "https://semaphore.example.com/api/integrations/<alias>" \
  -H "Content-Type: application/json" \
  -H "X-Signature: ${SIG}" \
  --data "$BODY"
```

## 匹配器 {#matchers}

匹配器描述集成响应哪些请求：将标头或请求体字段（JSON 路径或作为字符串的整个请求体）与某个值进行比较。集成的所有匹配器都必须匹配；没有匹配器的集成会在其所属组放行的每个请求上运行。使用匹配器可以让同一个端点的不同集成针对不同事件运行——例如一个模板用于 `push`，另一个用于 `release`。

## 值提取器 {#value-extractors}

通过提取器，你可以从请求头或请求体（JSON 字段或字符串）中获取数据，并将其传递给任务（Task）。每个提取的值都有一个**变量类型**（Variable type）：

* **Environment**：该值会被添加到任务的环境变量中，并覆盖变量组中的同名变量。
* **Task parameter**：该值成为任务参数，例如调查变量或提示值。

## 任务参数 {#task-parameters}

集成可以带参数触发任务。使用值提取器构建任务参数的 JSON 负载，并将模板配置为接受提示输入的值。

## 从旧版本升级 {#upgrading-from-older-versions}

在 2.20.19 版本之前，集成自带认证，别名要么属于整个项目，要么属于单个集成。升级会转换这些配置，而不改变任何现有 URL 的行为：

| 升级前 | 升级后 |
|---|---|
| 项目别名（集成列表上方的 URL） | 一个名为 **Default** 的无认证端点，包含所有这些别名 |
| 通过项目别名访问的集成（已开启“Use project alias”） | **Default** 端点上的一个独立组。如果该集成有认证，则该组用它**覆盖**端点的认证 |
| 拥有自己别名的集成 | 一个以该集成命名的端点（包含其别名和认证），以及该端点上的一个独立组 |
| 匹配器和值提取器 | 保持不变 |

每个集成最终都会单独位于一个以其命名的组中；之后可以根据需要合并组或重命名端点。有两处细节与旧行为不同：位于项目别名之后且没有匹配器的集成以前从不运行，现在会在每个已授权请求上运行；同时使用项目别名的集成自己的别名（它们从未匹配任何请求）会被丢弃。使用旧版本创建的项目备份在恢复时会以同样的方式转换。
