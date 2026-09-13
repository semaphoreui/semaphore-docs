# 指标

:::info
指标端点自 **Semaphore 2.20 版本** 起可用。如果您运行的是更早的版本，请升级以使用此功能。
:::

Semaphore 提供一个 `GET /api/metrics` 端点，采用标准的 Prometheus 文本暴露格式，因此现有的 Prometheus + Grafana 环境无需任何外部轮询工具即可监控服务器。

暴露的指标分为两类：

- **进程指标：** Go 运行时和进程统计信息——goroutine 数量、内存（堆/常驻）、CPU 时间、GC 暂停。这些指标由 Prometheus 标准的 Go/进程收集器直接提供。
- **任务指标**，针对 Semaphore 自身的工作负载：
  - `semaphore_tasks_running`（gauge）：当前正在运行的任务（Task）数量。
  - `semaphore_tasks_total{status}`（counter）：已完成任务的总数，按结果细分：`success`、`error`、`stopped`。

两者都会随着任务状态变化实时更新——没有轮询延迟，因为计数器是在任务状态实际改变的那一刻直接在任务运行器内部更新的。

## 启用指标 {#enabling-metrics}

该端点默认禁用，并且需要使用静态的服务级凭据进行 HTTP Basic Auth 认证——该凭据不与任何用户账户绑定，因为 Prometheus 无法进行交互式登录：

```json
{
  "metrics": {
    "enabled": true,
    "username": "prometheus",
    "password": "changeme"
  }
}
```

或者使用环境变量：

```bash
SEMAPHORE_METRICS_ENABLED=true
SEMAPHORE_METRICS_USERNAME=prometheus
SEMAPHORE_METRICS_PASSWORD=changeme
```

### 指标选项 {#metrics-options}

| 参数       | 环境变量                       | 说明         |
| ---------- | ------------------------------ | ------------ |
| `enabled`  | `SEMAPHORE_METRICS_ENABLED`    | 开启或关闭 `/api/metrics` 端点。默认禁用。 |
| `username` | `SEMAPHORE_METRICS_USERNAME`   | 抓取该端点所需的 Basic Auth 用户名。 |
| `password` | `SEMAPHORE_METRICS_PASSWORD`   | 抓取该端点所需的 Basic Auth 密码（敏感信息）。 |

如果 `enabled` 保持为 `false`（默认值），或者凭据缺失或错误，对 `/api/metrics` 的每个请求都会返回 `401 Unauthorized`。

## 使用 Prometheus 抓取 {#scraping-with-prometheus}

使用上述凭据配置一个带 `basic_auth` 的抓取任务：

```yaml
scrape_configs:
  - job_name: semaphore
    metrics_path: /api/metrics
    basic_auth:
      username: prometheus
      password: changeme
    static_configs:
      - targets: ["<semaphore-host>:3000"]
```

## 在 Grafana 中查看指标 {#viewing-metrics-in-grafana}

Grafana 的 **Explore** 视图允许您直接对指标运行任意 PromQL 查询并查看原始结果，而无需先构建仪表盘：

![Grafana Explore 视图显示抓取到的 Semaphore 指标](/assets/semaphore-grafana-explore.png)

然后可以基于相同的指标构建仪表盘——此示例通过四个面板覆盖了两类指标：正在运行的任务、按结果统计的任务总数、goroutine 数量以及进程常驻内存。

![包含 Semaphore 面板的 Grafana 仪表盘](/assets/semaphore-grafana-dashboard.png)
