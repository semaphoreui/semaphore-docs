# 集成

当外部服务调用一个 Semaphore URL 时，集成会启动一个任务模板。调用方可以是 GitHub、GitLab、Bitbucket、监控系统，或任何能够发送 HTTP 请求的程序。请求不只是触发运行：其中的一部分内容——分支名、提交、发布标签——还可以作为变量带入任务。

![集成列表](/assets/integrations-list.webp)

每个集成由四个部分组成：

| 部分 | 回答的问题 |
|---|---|
| **别名** | 发送方调用哪个 URL？ |
| **认证方式** | 这个请求是否有权启动任何东西？ |
| **匹配器** | *这个*请求是不是集成在等待的那一个？ |
| **值提取器** | 请求的哪些字段会到达任务，又以什么形式到达？ |

要创建集成，在项目菜单中打开 **Integrations** 并点击 **New Integration**：填写名称，选择它运行的任务模板和认证方式。随后在列表中点击该集成，即可配置它的别名、匹配器和值提取器。

![集成详情](/assets/integration-detail.webp)

## 一次调用是如何处理的 {#how-a-call-is-handled}

1. 发送方以 `GET` 或 `POST` 调用 `/api/integrations/<alias>`。
2. Semaphore 根据别名解析出它可以启动的集成。该端点是公开的——保护它的只有别名和认证方式。
3. 这些集成各自用自己的**认证方式**检查请求。未通过检查的请求不会启动任何东西。
4. 如果调用是通过**项目别名**到达的，就会计算该集成的**匹配器**。它们必须全部匹配，否则该集成被跳过。
5. **值提取器**运行，把请求的一部分变成变量和任务参数。
6. 任务被创建并排入队列，与有人手动启动该模板完全一样。

一次被处理的调用会得到 `204 No Content` 和空响应体，无论是否启动了什么。启动了什么由响应头给出：

| 响应头 | 值 |
|---|---|
| `X-Semaphore-Task-ID` | 创建出的任务 |
| `X-Semaphore-Template-ID` | 它运行的模板 |
| `X-Semaphore-Project-ID` | 任务所属的项目 |
| `X-Semaphore-Integration-ID` | 启动它的集成 |
| `X-Semaphore-Inventory-ID` | 任务的清单（如果有） |

对已知别名的每一次调用都会写入[调用历史](#call-history)——当 webhook 的行为不符合预期时，就该去那里看。

## 别名 {#aliases}

别名是 webhook URL 中随机且无法猜测的那一段：`/api/integrations/<random_string>`。它接受 `GET` 和 `POST`。别名有两种，一个集成同一时间只使用其中一种。

**项目别名**用集成列表上方的 **Add Alias** 创建，由项目中所有打开了 **Use project alias** 开关的集成共享。一个到达的请求会提交给它们全部，每个集成通过自己的匹配器决定是否运行。这正是只需交给 GitHub 或 GitLab 一次的别名，之后再用匹配器按事件分流。

**集成别名**用集成自己页面上的 **Add Alias** 创建，只属于该集成。调用它会立即启动该集成——**匹配器完全不会被计算**。当发送方只服务于一件事，或者请求体的格式匹配器无法检查时，就用它。

:::warning
集成页面上的 **Use project alias** 开关决定哪种别名有效。开关打开时，集成响应项目别名，它自己的别名被忽略；开关关闭时，项目别名永远到不了该集成，它的匹配器也永远不会被用到。
:::

一个项目可以拥有多个两种别名。用旁边的垃圾桶图标删除别名会立刻停止其作用，而已经收到的调用仍留在历史中。

## 认证 {#authentication}

webhook 端点并不在登录之后，因此阻止陌生人启动你的任务的正是认证方式。在集成表单中选择它；**Auth secret** 是[密钥库](/user-guide/key-store)中的一个密钥。

| 认证方式 | Semaphore 检查什么 | Auth secret |
|---|---|---|
| **None** | 什么都不检查——任何知道 URL 的人都能启动该模板 | — |
| **GitHub Webhooks** | `X-Hub-Signature-256` 等于 `sha256=` 加上请求体的 HMAC-SHA256 | 字符串密钥，或登录/密码密钥的密码 |
| **Bitbucket Webhooks** | 以同样方式检查 `X-Hub-Signature` | 字符串密钥，或登录/密码密钥的密码 |
| **Token** | **Auth header** 指定的头等于该密文 | 字符串密钥，或登录/密码密钥的密码 |
| **HMAC** | **Auth header** 指定的头含有请求体的 HMAC-SHA256 | 字符串密钥，或登录/密码密钥的密码 |
| **HMAC (SHA-512)** | 同样的检查，但用 HMAC-SHA512 | 字符串密钥，或登录/密码密钥的密码 |
| **BasicAuth** | `Authorization` 头同时带有登录名*和*密码 | 只能用登录/密码密钥 |

**字符串**类型的密钥以自身的值作为共享密文；登录/密码密钥使用自己的密码，只有 BasicAuth 还会比较登录名。如果配置的密钥类型是该方式无法使用的，请求会被拒绝，而不是悄悄忽略这个不匹配。

### HMAC 认证 {#hmac-authentication}

HMAC 认证方式（`hmac` / SHA-256 与 `hmac-sha512` / SHA-512）校验 webhook 的请求体是否用共享密文签名。

需要配置：

1. **Auth header** — 携带签名的请求头（例如 `X-Signature` 或 `X-Hub-Signature-256`）。
2. **Auth secret** — 密钥库中的**字符串**密钥（其值即密文），或一份登录/密码凭据（其**密码**即密文）。

发送方必须把原始请求体的 HMAC 摘要以**纯十六进制**放进该头（不带 `sha256=` / `sha512=` 前缀；GitHub 与 Bitbucket 方式恰恰需要这个前缀，HMAC 方式不需要）。Semaphore 会把它与用所配置密文计算出的请求体 `HMAC-SHA256` 或 `HMAC-SHA512` 相比较。

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

匹配器是对到达请求的一个条件：*这个头等于某个值*、*这个 JSON 字段包含某段文字*。正因为有匹配器，一个项目别名才能服务许多集成：GitHub 把所有事件都发到同一个 URL，而由匹配器决定哪个集成响应哪个事件。

匹配器只决定集成是否运行。它从不改动任务，那是提取器的职责。

匹配器**只在调用通过项目别名到达时**才会被计算（**Use project alias** 开关打开）。调用集成自己的别名会直接启动它，根本不看匹配器。

### 匹配器的字段 {#matcher-fields}

| 字段 | 含义 |
|---|---|
| **Name** | 列表中的标签。自由文本，不参与比较 |
| **Match on** | **Body** 或 **Header** —— 值从哪里来 |
| **Body Data Format** | **JSON** 或 **String**，仅在 **Body** 时显示 |
| **Key** | 头的名称，或 JSON 请求体中某个字段的路径 |
| **Comparison Method** | `==`、`!=` 或 **Contains** |
| **Value** | 用来与请求中的值比较的文本 |

**Match on: Header** —— **Key** 是头名称，不区分大小写，因此 `X-GitHub-Event` 和 `x-github-event` 是同一个头。请求没有携带的头等同于缺失的值（见下文）。当同一个头出现多次时，只比较第一个值。

**Match on: Body, JSON** —— **Key** 是解析后请求体中的路径，见下一节。不是合法 JSON 的请求体，对任何键都给出缺失的值。

**Match on: Body, String** —— 整个原始请求体就是值，**Key** 被忽略。由于该字段是必填的，表单仍然要求填写，写一个短横线即可。这是比较非 JSON 请求体的唯一方式——请与 **Contains** 搭配使用。

**Key** 和 **Value** 都是必填的，所以匹配器无法检测空值。要对某个字段的缺失做出反应，就用 `!=` 把它与一个它绝不会取到的值比较。

### JSON 键 {#json-keys}

键是一条穿过 JSON 文档的路径。层级用点分隔，数组元素用方括号中的下标表示，从零开始计数。名称区分大小写。

```json
{
  "ref": "refs/heads/main",
  "repository": { "name": "semaphore", "private": false },
  "commits": [
    { "id": "9fceb02", "message": "Fix the deploy" },
    { "id": "1c4a7b8", "message": "Bump the version" }
  ]
}
```

| 键 | 指向的值 |
|---|---|
| `ref` | `refs/heads/main` |
| `repository.name` | `semaphore` |
| `repository.private` | `false` |
| `commits.[0].id` | `9fceb02` |
| `commits.[1].message` | `Bump the version` |
| `commits` | 整个数组 |
| `repository.url` | 什么都不指向——该字段不存在 |

值提取器的 **Key** 字段使用同样的语法。

### 匹配器如何比较值 {#how-a-matcher-compares-values}

来自请求的值会被转成文本，并作为文本与 **Value** 比较，因此 **Value** 字段从不需要引号、方括号或转义。

- **字符串**按字面比较，并且区分大小写：`Push` 不匹配 `push`。
- **数字**在没有小数部分时按不带小数的形式比较：请求体中的 `42` 匹配值 `42`，而不匹配 `42.0`。带小数的数字按写法比较，所以 `1.5` 匹配 `1.5`。
- **布尔值**匹配 `true` 和 `false`。
- **缺失的值**——头不存在、JSON 路径不存在、值为 `null`，或请求体不是合法 JSON——会被当作字面文本 `<nil>` 比较。由此得出一个值得记住的结论：`==` 永远不可能匹配一个缺失的字段，而 `!=` 则总是匹配它。
- **对象和数组**没有可读的文本形式，不要比较它们。应当把键指向其中的某个标量字段。
- **Contains** 是区分大小写的简单子串判断，没有通配符，也没有正则表达式。

### 多个匹配器 {#several-matchers}

一个集成可以有任意多个匹配器，它们以**与**的关系组合：只有每一个都匹配时集成才会运行。在一个集成内部无法表达*或*——为另一种条件在同一模板上再建一个集成。

:::warning
使用项目别名却**没有任何匹配器**的集成永远不会启动，因为没有任何东西可以匹配。给它至少一个匹配器，或者关闭 **Use project alias** 并调用该集成自己的别名。
:::

### 匹配器示例 {#matcher-examples}

| 目标 | Match on | 格式 | Key | 方法 | Value |
|---|---|---|---|---|---|
| 只要 GitHub 的 push | Header | — | `X-GitHub-Event` | `==` | `push` |
| 只要推送到 `main` | Body | JSON | `ref` | `==` | `refs/heads/main` |
| 除 `main` 以外的任何分支 | Body | JSON | `ref` | `!=` | `refs/heads/main` |
| 只要标签 | Body | JSON | `ref` | Contains | `refs/tags/` |
| 只要已合并的 GitLab 合并请求 | Body | JSON | `object_attributes.state` | `==` | `merged` |
| 忽略某个机器人的提交 | Body | JSON | `pusher.name` | `!=` | `dependabot` |
| 只要已发布的 GitHub release | Body | JSON | `action` | `==` | `published` |
| 提到磁盘的纯文本告警 | Body | String | `-` | Contains | `disk` |

前两行合在一起就是部署集成的惯用配置：事件类型取自头，分支取自请求体，两者都必须匹配。

## 值提取器 {#value-extractors}

值提取器把到达请求中的一小块内容复制到即将启动的任务里。webhook 正是这样把分支、提交哈希、作者或发布版本交给它所触发的自动化流程。

无论调用是通过哪种别名到达的，提取器总会运行，并且发生在认证与匹配器都通过之后。

### 提取器的字段 {#extractor-fields}

| 字段 | 含义 |
|---|---|
| **Name** | 列表中的标签。自由文本 |
| **Source of the Value** | **Body** 或 **Header** |
| **Data Type of Body** | **JSON** 或 **String**，仅在 **Body** 时显示 |
| **Key** | 头的名称，或一个 [JSON 键](#json-keys)——语法与匹配器相同 |
| **Variable Usage** | **Variables** 或 **Task Params** —— 值被送到哪里 |
| **Variable** | 该值在任务中的名字 |

在 **Body** 搭配 **String** 时，整个原始请求体成为值，**Key** 被忽略，与匹配器完全一样。

### 变量会收到什么 {#what-the-variable-receives}

与匹配器不同，提取器不会把任何东西转成文本：JSON 值保留自己的类型，数字仍是数字，对象仍是对象。

| 请求中的内容 | 变量得到的内容 |
|---|---|
| 一个头 | 它的文本；头不存在时是空字符串 |
| JSON 的字符串、数字或布尔值 | 同一个值，连类型一起 |
| JSON 的对象或数组 | 整个对象或数组，结构保持不变 |
| JSON 的 `null`、不存在的路径，或不是合法 JSON 的请求体 | 什么都没有——该变量**完全不会被设置**，模板自身定义的内容原样保留 |
| 作为 **String** 的请求体 | 整个原始请求体的文本 |

“空”和“未设置”的区别很重要：缺少的头会给任务一个空字符串，而缺少的 JSON 字段则让模板自己的值保持不动。

### Variable Usage：Variables {#variable-usage-variables}

该值加入任务的变量——与新建任务对话框中 **Variables** 字段填写的是同一组。Semaphore 把它们作为额外变量传给工具（Ansible 用 `--extra-vars`，Terraform 用 `-var`），并覆盖模板[变量组](/user-guide/environment)中同名的键。

把变量命名成与模板的[调查变量](/user-guide/task-templates/survey-vars)完全一致，webhook 就会代替人工填写那个调查变量。

### Variable Usage：Task Params {#variable-usage-task-params}

任务参数是模板内置的[提示项](/user-guide/task-templates/prompts)，而不是给 playbook 的变量。提取出的值会原样传递，因此它的 JSON 类型必须是参数期望的类型——是 `true`，而不是 `"true"`。

| 变量 | 适用于 | 期望 |
|---|---|---|
| `git_branch` | 所有应用 | 要检出的分支。开头的 `refs/heads/` 会被去掉，因此 GitHub 的 `ref` 可以直接使用 |
| `limit`、`tags`、`skip_tags` | Ansible | 字符串的列表 |
| `debug`、`dry_run`、`diff` | Ansible | `true` 或 `false` |
| `plan`、`destroy`、`auto_approve`、`upgrade`、`reconfigure` | Terraform、OpenTofu、Terragrunt | `true` 或 `false` |

要让该值生效，模板必须允许覆盖：`git_branch` 需要 **Allow override branch in task**，`limit`、`tags`、`skip_tags` 需要对应的提示项。没有这项许可时，值会被丢弃，任务按模板自身的设置运行。

### 提取器示例：GitHub push {#extractor-example-github-push}

GitHub 的 push webhook 发送的请求体开头是这样的：

```json
{
  "ref": "refs/heads/main",
  "after": "9fceb02d0ae598e95dc970b74767f19372d61af8",
  "repository": { "name": "semaphore", "default_branch": "main" },
  "pusher": { "name": "octocat", "email": "octocat@example.com" }
}
```

四个提取器就能把它变成一个描述完整的任务：

| Name | Source | 格式 | Key | Usage | Variable |
|---|---|---|---|---|---|
| Branch | Body | JSON | `ref` | Task Params | `git_branch` |
| Commit | Body | JSON | `after` | Variables | `COMMIT` |
| Author | Body | JSON | `pusher.name` | Variables | `AUTHOR` |
| Event | Header | — | `X-GitHub-Event` | Variables | `EVENT` |

于是任务会检出 `main`（`refs/heads/` 前缀已替你去掉），并带着 playbook 可用的变量 `COMMIT`、`AUTHOR` 和 `EVENT` 运行。想知道一次真实调用究竟送来了什么，就在 History 标签页中打开它，把请求体与你的键对照着看。

## 预设的任务参数 {#task-parameters}

在集成表单中选好模板后，该模板自身的运行选项就会出现：消息、它的调查变量、清单、在模板允许覆盖时的 Git 分支，以及应用的提示项。你在那里设置的内容会成为这个集成启动的每个任务的默认值，因此永不变化的值——某个清单、某条固定消息——应放在这里，而不是放进提取器。

提取器叠加在这些默认值之上：提取器产出的变量或任务参数会替换同名的预设值，而当提取器什么也没找到时，预设值得以保留。

## 工作流集成 <FeatureState feature="workflows" /> {#workflow-integrations}

集成也可以启动一个[工作流](/user-guide/workflows)，而不是单个模板。在集成表单中把 **Runs** 切换为 **Workflow**，然后选择工作流。

提取器的工作方式相同，只有一点不同：**Variable Usage** 会被忽略，每个提取出的值都以 **Variable** 中的名字作为工作流调查的答案送出。随后工作流校验这些答案，并通过各节点的绑定把它们送达，因此没有任何节点绑定的值永远到不了任务。成功的调用除任务相关的响应头外，还会给出 `X-Semaphore-Workflow-ID` 和 `X-Semaphore-Workflow-Run-ID`。

## 调用历史 {#call-history}

集成页面的 **History** 标签页按时间从新到旧列出项目通过任一别名收到的每一次调用。它保存在项目层面而非单个集成上，因此即使别名、集成以及它启动的任务都已不存在，历史仍然保留。

| 列 | 显示内容 |
|---|---|
| **Time** | 调用到达的时间 |
| **Integration** | 处理它的集成，下面是别名——点击别名可按它筛选列表 |
| **Source IP** | 调用来自的地址 |
| **Method** | `GET` 或 `POST` |
| **Status** | 集成如何处理了这次调用，以及原因 |
| **Task** | 启动的任务或工作流运行 |
| **Duration** | 集成处理这次调用花了多久 |

共有四种状态：

| 状态 | 含义 |
|---|---|
| `ok` | 一个任务或工作流运行已启动 |
| `unauthorized` | 请求未通过该集成的认证方式 |
| `skipped` | 匹配器没有匹配，或该别名没有启动任何集成 |
| `error` | 尝试启动但失败了——模板已不存在，调查拒绝了这些值 |

点击某一行会打开这次调用，其中包含收到时的请求体（最多前 64 KiB；如果更长，会同时显示已保存的大小和原始大小）。请求**头从不保存**：它们携带着发送方用于认证的签名或令牌。未通过认证的调用的请求体同样不会保存，因为任何知道 URL 的人都能发出这样的请求。

用表格上方的控件按集成和别名筛选列表，用下方的箭头翻页。历史没有保留期限——它会一直增长，直到项目被删除。

## 排查问题 {#troubleshooting}

| 现象 | 需要检查的内容 |
|---|---|
| History 中完全没有记录 | URL 中的别名写错了或已被删除。在 **Use project alias** 打开时调用集成自己的别名，也同样不会被记录在任何地方 |
| `unauthorized` | 认证头的名称、密钥库中的密钥，以及发送方是否按该方式的要求带上 `sha256=` 前缀发送签名。GitHub 与 Bitbucket 不受 **Auth header** 影响，使用它们自己的头 |
| `skipped`，原因为 *No integration matched the alias* | 别名确实存在，但项目中没有任何集成打开了 **Use project alias** |
| `skipped`，原因为 *No matcher matched the request* | 打开这次调用，把它的请求体与你的匹配器对照。记住缺失的字段永远不会以 `==` 匹配、键区分大小写，以及 **Contains** 没有通配符。完全没有匹配器的集成也因同样的原因被跳过 |
| 任务运行了，但某个变量为空或不存在 | JSON 键与载荷不符（打开调用查看请求体）、值为 `null`，或者 **Variable** 的名字与应填写的调查变量不一致 |
| 分支没有被覆盖 | 模板需要 **Allow override branch in task**，并且提取器必须写入 `git_branch` 任务参数 |
| 一次调用启动了多个任务 | 多个集成使用同一个项目别名，而它们的匹配器都匹配上了。把匹配器收紧，或为各集成分配自己的别名 |
