# API

## API 参考 {#api-reference}

Semaphore UI 提供两种格式的 API 文档，您可以选择最适合自己工作流的一种：

* [Swagger/OpenAPI](https://semaphoreui.com/api-docs) &mdash; 如果您偏好交互式的、基于浏览器的体验，这是理想选择。
* [官方 Postman 集合](https://www.postman.com/semaphoreui) &mdash; 在 Postman 中探索并测试所有端点。
* **内置 Swagger API 文档** &mdash; 由 Swagger UI 驱动的交互式 API 文档，可直接在您的实例上访问。

![](/assets/swagger-link.webp)

所有方式都包含可用端点、参数和示例响应的完整文档。

## API 入门 {#getting-started-with-the-api}

要开始使用 Semaphore API，您需要生成一个 API 令牌。
该令牌必须以如下形式包含在请求头中：

```http
Authorization: Bearer YOUR_API_TOKEN
```

### 创建 API 令牌 {#creating-an-api-token}

创建 API 令牌有两种方式：
- 通过 Web 界面
- 使用 HTTP 请求

#### 通过 Web 界面（2.14 起） {#through-the-web-interface-since-214}

打开侧边栏底部的账户菜单，选择 **API 令牌（API Tokens）**。该页面列出您的令牌；页面上的 **API 参考（API Reference）** 链接会打开实例内置的 Swagger UI。

![API 令牌](/assets/api-tokens.webp)

点击 **新建令牌（New Token）**，输入名称，选择令牌的过期时间，然后复制创建后显示的值。参见[您的账户](/user-guide/account#api-tokens)。

<div style={{maxWidth: 420}}>

![新建令牌对话框](/assets/api-token-new.webp)

</div>

#### 使用 HTTP 请求 {#using-http-request}

您也可以通过直接发送 HTTP 请求来完成认证并生成会话令牌。

登录 Semaphore（密码需要转义，例如使用 `slashy\\pass` 而不是 `slashy\pass`）：

```bash
curl -v -c /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{"auth": "YOUR_LOGIN", "password": "YOUR_PASSWORD"}' \
http://localhost:3000/api/auth/login
```

生成一个新令牌并获取它：

```bash
curl -v -b /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
http://localhost:3000/api/user/tokens
```

该命令应返回类似如下的内容：

```json
{
    "id": "YOUR_ACCESS_TOKEN",
    "created": "2025-05-21T02:35:12Z",
    "expired": false,
    "user_id": 3
}
```
---

## 使用令牌发起 API 请求 {#using-token-to-make-api-requests}

获得 API 令牌后，将其放入 **Authorization** 请求头中即可对请求进行认证。

### 启动任务 {#launch-a-task}

使用该令牌启动任务或执行其他任何操作：

```bash
curl -v -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
-d '{"template_id": 1}' \
http://localhost:3000/api/project/1/tasks
```

---

## 使 API 令牌过期 {#expiring-an-api-token}

如果您不再需要某个令牌，应当将其设为过期，以保障账户安全。

要手动吊销（过期）一个 API 令牌，请向令牌端点发送 DELETE 请求：

```bash
curl -v -XDELETE \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
http://localhost:3000/api/user/tokens/YOUR_ACCESS_TOKEN
```
