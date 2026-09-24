# 计划任务

Semaphore 的计划任务（Schedule）功能允许按预定义的时间间隔自动执行模板（例如运行 playbook）。借助该功能，你可以实现常规自动化任务，例如定期备份、合规检查、系统更新等。

修改配置后请务必重启 Semaphore 服务，更改才会生效。

[//]: # (## Setup and configuration)

## 时区配置 {#timezone-configuration}

默认情况下，计划任务功能按 UTC 时区运行。不过，你可以将其自定义为本地时区或满足特定需求。

你可以通过更新配置文件或设置环境变量来更改时区：

1. **使用配置文件**：  
    在 Semaphore 配置文件中添加或更新 `timezone` 字段：
    ```json
    {
      "schedule": {
        "timezone": "America/New_York"
      }
    }
    ```

2. **使用环境变量**：  
    设置 `SEMAPHORE_SCHEDULE_TIMEZONE` 环境变量：
    ```bash
    export SEMAPHORE_SCHEDULE_TIMEZONE="America/New_York"
    ```

有效时区值的列表请参阅 [IANA 时区数据库](https://www.iana.org/time-zones)。

### 访问计划任务功能 {#accessing-the-schedule-feature}

1. 登录 Semaphore Web 界面
2. 在主导航菜单中进入 "Schedule" 选项卡
3. 点击右上角的 "New Schedule" 按钮创建新的计划任务

![](/assets/schedule01.png)

### 创建新的计划任务 {#creating-a-new-schedule}

创建新的计划任务时，你需要配置以下选项：

| 字段 | 说明 |
|-------|-------------|
| Name | 计划任务的描述性名称 |
| Template | 要执行的具体任务模板（Task Template） |
| Timing | 使用 cron 格式以获得更高的灵活性，或使用内置选项设置常见的时间间隔 |

![](/assets/schedule02.png) ![](/assets/schedule03.png)

### 告警 {#alerts}

计划任务可以使用其模板的告警，也可以使用另一组项目告警，使计划任务启动的任务报告到与手动运行不同的地方。参见[计划任务告警](./alerts#schedule-alerts)。

### Cron 格式语法 {#cron-format-syntax}

计划任务使用标准的五字段 cron 语法：

```
┌─────── minute (0-59)
│ ┌────── hour (0-23)
│ │ ┌───── day of month (1-31)
│ │ │ ┌───── month (1-12)
│ │ │ │ ┌───── day of week (0-6) (Sunday=0)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

示例：
- `*/15 * * * *` - 每 15 分钟运行一次
- `0 2 * * *` - 每天凌晨 2:00 运行
- `0 0 * * 0` - 每周日午夜运行
- `0 9 1 * *` - 每月 1 日上午 9:00 运行

非常实用的 cron 表达式生成器：[https://crontab.guru/](https://crontab.guru/)

## 使用场景 {#use-cases}

### 系统维护 {#system-maintenance}

```yaml
# Example playbook for system updates
---
- hosts: all
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes

    - name: Upgrade all packages
      apt:
        upgrade: yes

    - name: Remove dependencies that are no longer required
      apt:
        autoremove: yes
```

将此 playbook 安排在每周的非工作时间运行，以确保系统保持最新。

### 备份操作 {#backup-operations}

为数据库备份创建不同频率的计划任务：
- 每日备份，保留一周
- 每周备份，保留一个月
- 每月备份，保留一年

### 合规检查 {#compliance-checks}

定期安排合规扫描，确保系统满足安全要求：

```yaml
# Example compliance check playbook
---
- hosts: all
  tasks:
    - name: Run compliance checks
      script: /path/to/compliance_script.sh

    - name: Collect compliance reports
      fetch:
        src: /var/log/compliance-report.log
        dest: reports/{{ inventory_hostname }}/
        flat: yes
```

### 环境创建与清理 {#environment-provisioning-and-cleanup}

适用于开发或测试环境。安排在早上创建云环境、晚上销毁，以优化成本。

## 最佳实践 {#best-practices}

* 为计划任务使用既能体现功能又能体现时间的描述性名称（例如 "Weekly-Backup-Sunday-2AM"）
* 避免同时安排过多资源密集型任务
* 考虑长时间运行的计划任务对其他计划任务的影响
* 在设置时间间隔较长的生产计划任务之前，先用较短的时间间隔进行测试
* 记录计划任务的目的和预期结果

---

## 任务参数 {#task-parameters}

计划任务可以向任务传递参数。在模板中为所需字段启用提示（Prompts），然后在计划任务配置中定义参数值，这样每次运行都会提供所需的覆盖值（例如分支、变量、标志）。
