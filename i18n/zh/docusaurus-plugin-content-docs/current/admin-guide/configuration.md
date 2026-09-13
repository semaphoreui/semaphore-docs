# 配置

Semaphore 可以通过以下几种方式进行配置：

* [在线配置生成器](https://semaphoreui.com/install) &mdash; 用于在线生成配置的 Web 界面。
* [配置文件](/admin-guide/configuration/config-file) &mdash; 配置 Semaphore 的主要且最灵活的方式。
* [环境变量](/admin-guide/configuration/env-vars) &mdash; 适用于容器化或云原生部署。


## 配置选项 {#configuration-options}

每个选项及其环境变量、类型和默认值都列在[配置选项参考](/reference/configuration)中。
该页面由 Semaphore 源码生成，因此始终与您正在运行的版本一致。

取值只有一个解析顺序：环境变量优先于配置文件，内置默认值仅在两者都未设置时生效。

## 常见问题 {#frequently-asked-questions}

### 1. 如何为 Semaphore UI 配置公开 URL {#1-how-to-configure-a-public-url-for-semaphore-ui}

如果你在 Semaphore 前面使用 nginx 或其他 Web 服务器，则应提供配置选项 `web_host`。

例如，你在服务器上配置了 NGINX，将请求代理到 Semaphore。

服务器地址为 `https://example.com`，并且你将所有发往 `https://example.com/semaphore` 的请求代理到 Semaphore。

那么你的 `web_host` 应为 `https://example.com/semaphore`。
