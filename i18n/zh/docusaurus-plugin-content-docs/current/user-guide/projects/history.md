# 历史

项目仪表盘的 **History** 选项卡列出项目（Project）的所有任务（Task），最新的排在最前。它是打开项目时的默认视图。

![项目历史](/assets/project-dashboard-history.webp)

## 列 {#columns}

| 列 | 内容 |
|---|---|
| **Task** | 任务编号、创建该任务所用的模板，以及所使用的仓库版本的提交信息。左侧的图标表示应用（Ansible、Terraform、Bash 等）。 |
| **Version** | 对于[构建和部署模板](../task-templates/build-deploy)：构建或部署的版本。对于其他模板仅显示状态图标。 |
| **Status** | 当前状态标记，请参阅[任务状态](../tasks#task-statuses)。 |
| **User** | 启动任务的用户。由计划任务或集成启动的任务没有用户。 |
| **Start** | 开始日期和时间，使用你浏览器的时区。 |
| **Duration** | 任务运行了多长时间。 |

列表是分页显示的。点击任务编号或模板名称可打开[任务窗口](../tasks#task-window)，查看日志、详情和摘要。点击任务窗口标题中的模板名称可跳转到模板页面。

## 任务保留 {#task-retention}

默认情况下，所有任务及其日志都会永久保留。要限制每个模板的历史记录数量，请在 `config.json` 中设置 `max_tasks_per_template`，或设置 `SEMAPHORE_MAX_TASKS_PER_TEMPLATE` 环境变量：

```json
{
  "max_tasks_per_template": 30
}
```

达到限制后，该模板最旧的任务会连同其日志一起被删除。完整选项列表请参阅[配置](/admin-guide/configuration)。

## 另请参阅 {#see-also}

- [统计](./stats)：按天汇总的任务结果。
- [活动](./activity)：项目变更的审计日志。
