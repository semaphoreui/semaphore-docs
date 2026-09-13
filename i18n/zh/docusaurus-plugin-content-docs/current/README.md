---
title: Semaphore UI 文档
sidebar_label: 首页
hide_table_of_contents: true
---

import Link from '@docusaurus/Link';

# Semaphore UI 文档

Semaphore UI 是一个自托管的 Web 界面和 API，用于运行 **Ansible**、**Terraform/OpenTofu**、**Shell**、**PowerShell** 和 **Python** 自动化。它为您的团队提供一个统一的地方来运行 playbook 和脚本、加密保存凭据、调度作业，并查看谁在何时运行了什么。

它以单个 Go 二进制文件或 Docker 镜像的形式发布，可运行于 Linux、macOS 和 Windows，并将数据存储在 SQLite、MySQL 或 PostgreSQL 中。

第一次使用 Semaphore？[简介](/introduction)介绍了它能做什么、一次部署由哪些部分组成，以及安装前需要准备什么。

:::tip[快速开始]

用一条命令以 SQLite 方式运行 Semaphore，然后打开 [http://localhost:3000](http://localhost:3000)，使用 `admin` / `changeme` 登录。

```bash
docker run -d -p 3000:3000 \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME=Admin \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -v semaphore-data:/var/lib/semaphore \
  semaphoreui/semaphore:latest
```

生产环境请参阅[安装](/admin-guide/installation)，了解 Docker Compose、软件包、Kubernetes 和二进制文件安装方式。然后按照[快速入门](/getting-started)运行您的第一个任务。

:::

<div className="row home-cards">
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>安装与配置</h3></div>
      <div className="card__body">
        <p>启动服务器并将其连接到您的数据库、身份提供方和网络。</p>
        <ul>
          <li><Link to="/admin-guide/installation">安装</Link></li>
          <li><Link to="/admin-guide/configuration">配置</Link></li>
          <li><Link to="/admin-guide/reverse-proxy">反向代理与 TLS</Link></li>
          <li><Link to="/admin-guide/authentication/ldap">LDAP</Link> 和 <Link to="/admin-guide/authentication/openid">OpenID Connect</Link></li>
          <li><Link to="/admin-guide/security">安全加固</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>运行自动化</h3></div>
      <div className="card__body">
        <p>将工作组织为项目，连接代码仓库和凭据，并按需或按计划运行任务。</p>
        <ul>
          <li><Link to="/getting-started">快速入门：六步运行第一个任务</Link></li>
          <li><Link to="/user-guide/projects">项目（Project）</Link>和<Link to="/user-guide/team">团队（Team）</Link></li>
          <li><Link to="/user-guide/task-templates">任务模板（Task Templates）</Link>和<Link to="/user-guide/tasks">任务（Tasks）</Link></li>
          <li><Link to="/user-guide/key-store">密钥库（Key Store）</Link>、<Link to="/user-guide/inventory">清单（Inventory）</Link>、<Link to="/user-guide/environment">变量组（Variable Groups）</Link></li>
          <li><Link to="/user-guide/schedules">计划任务（Schedule）</Link>和<Link to="/user-guide/workflows">工作流（Workflow）</Link>（Pro）</li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>规模化运维</h3></div>
      <div className="card__body">
        <p>分布式执行、冗余运行，并保持服务可观测且持续更新。</p>
        <ul>
          <li><Link to="/admin-guide/runners">运行器（Runner）</Link></li>
          <li><Link to="/admin-guide/ha">高可用</Link></li>
          <li><Link to="/admin-guide/upgrading">升级</Link></li>
          <li><Link to="/admin-guide/logs">日志</Link>和<Link to="/admin-guide/metrics">指标</Link></li>
          <li><Link to="/admin-guide/notifications">通知</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>参考</h3></div>
      <div className="card__body">
        <p>当您已经明确要找什么时，可在此查阅精确的选项和端点。</p>
        <ul>
          <li><Link to="/admin-guide/configuration/config-file">配置文件</Link>和<Link to="/admin-guide/configuration/env-vars">环境变量</Link></li>
          <li><Link to="/reference/api">REST API</Link></li>
          <li><Link to="/reference/cli">CLI</Link></li>
          <li><Link to="/admin-guide/cicd">CI/CD 集成</Link></li>
          <li><Link to="/faq/troubleshooting">故障排查 FAQ</Link></li>
        </ul>
      </div>
    </div>
  </div>
</div>

## 按工具分类的指南 {#guides-by-tool}

<div className="home-tools margin-bottom--lg">
  <Link className="button button--outline button--primary" to="/user-guide/apps/ansible">Ansible</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/terraform">Terraform / OpenTofu</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/bash">Shell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/powershell">PowerShell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/python">Python</Link>
</div>

## 帮助与社区 {#help-and-community}

- **提问：**请在 [Discord](https://discord.gg/5R6k7hNGcH) 上提问。
- **缺陷与功能请求：**请在 [GitHub](https://github.com/semaphoreui/semaphore/issues) 上提交 issue。
- **源代码：**[github.com/semaphoreui/semaphore](https://github.com/semaphoreui/semaphore)。
- **Pro 与企业版：**[许可证激活](/admin-guide/license)。
