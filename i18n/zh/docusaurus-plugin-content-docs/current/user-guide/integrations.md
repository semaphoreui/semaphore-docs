# 集成

集成（Integration）用于建立 Semaphore 与外部服务（例如 GitHub 和 GitLab）之间的交互。

![集成列表](/assets/integrations-list.webp)

项目（Project）的 Webhook URL 显示在列表上方。每个集成都有一个名称以及它所启动的模板；点击某个集成即可配置其匹配器和值提取器。

![集成详情](/assets/integration-detail.webp)

通过集成，你可以调用一个特殊的端点（别名）来触发指定模板，并为其配置以下认证方式之一：
* GitHub Webhooks
* Token
* HMAC
* 无认证

别名是如下格式的 URL：`/api/integrations/<random_string>`。支持 `GET` 和 `POST` 请求。

## 匹配器 {#matchers}

通过匹配器，你可以定义传入请求的参数。当这些参数匹配时，模板就会被调用。

## 值提取器 {#value-extractors}

通过提取器，你可以从请求头或请求体（JSON 字段或字符串）中获取数据，并将其传递给任务（Task）。每个提取的值都有一个**变量类型**（Variable type）：

* **Environment**：该值会被添加到任务的环境变量中，并覆盖变量组中的同名变量。
* **Task parameter**：该值成为任务参数，例如调查变量或提示值。

## 任务参数 {#task-parameters}

集成可以带参数触发任务。使用值提取器构建任务参数的 JSON 负载，并将模板配置为接受提示输入的值。

## 关于别名和匹配器的说明 {#notes-on-aliases-and-matchers}

项目别名（集成列表上方的 URL）由项目中的所有集成共享：Semaphore 会检查每个集成的匹配器，并启动匹配器匹配的那些模板。集成也可以拥有自己的别名；对该别名的请求会直接启动该集成，而不评估匹配器。请根据需要优先使用 Token/HMAC 认证，并通过提取器传递参数。
