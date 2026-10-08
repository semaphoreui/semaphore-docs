---
title: 查看审计日志
description: "在 Web 界面中查看审计日志：最新事件、事件的全部字段，以及 Semaphore Pro 中的筛选和导出为 CSV 或 JSON Lines。"
---

# 查看审计日志

管理员从用户菜单打开 **Audit log**。最新的事件排在最前面，每页 50 条。

![审计日志，最新事件在前](/assets/audit-log-list.png)

点击某个事件可查看它的所有字段。复制按钮会按 Semaphore 发送到 SIEM 的格式复制该事件。

![显示全部字段的事件](/assets/audit-log-card.png)

## 筛选和导出 <FeatureState feature="audit-log-filters" /> {#filter-export}

可以按时间段、用户、事件类型、结果、项目或 IP 地址筛选。在事件中，用户、地址、对象和项目都是链接，点击后会按它们筛选日志。

![按某个事件的地址筛选的日志](/assets/audit-log-filters.png)

当一组筛选条件找到的事件很少时，Semaphore 每次搜索两秒，并显示已经回溯到多久以前。点击 **Search older** 继续搜索。

**Export** 会把符合筛选条件的所有事件保存为 CSV 或 JSON Lines 文件。每次导出都会记录为一个 `audit.log/export` 事件。

![导出为 CSV 或 JSON Lines](/assets/audit-log-export.png)
