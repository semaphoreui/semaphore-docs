---
title: Semaphore UI Documentation
sidebar_label: Home
hide_table_of_contents: true
---

import Link from '@docusaurus/Link';

# Semaphore UI Documentation

Semaphore UI is a self-hosted web UI and API for running **Ansible**, **Terraform/OpenTofu**, **Shell**, **PowerShell**, and **Python** automation. It gives your team one place to run playbooks and scripts, keep credentials encrypted, schedule jobs, and see who ran what and when.

It ships as a single Go binary or Docker image, runs on Linux, macOS, and Windows, and stores data in SQLite, MySQL, or PostgreSQL.

:::tip[Quick start]

Run Semaphore with SQLite in one command, then open [http://localhost:3000](http://localhost:3000) and log in as `admin` / `changeme`.

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

For production, see [Installation](/admin-guide/installation) for Docker Compose, packages, Kubernetes, and binary installs. Then follow [Getting Started](/getting-started) to run your first task.

:::

<div className="row home-cards">
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Install and configure</h3></div>
      <div className="card__body">
        <p>Get a server running and connect it to your database, identity provider, and network.</p>
        <ul>
          <li><Link to="/admin-guide/installation">Installation</Link></li>
          <li><Link to="/admin-guide/configuration">Configuration</Link></li>
          <li><Link to="/category/reverse-proxy">Reverse proxy and TLS</Link></li>
          <li><Link to="/admin-guide/ldap">LDAP</Link> and <Link to="/admin-guide/openid">OpenID Connect</Link></li>
          <li><Link to="/admin-guide/security">Security hardening</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Run automation</h3></div>
      <div className="card__body">
        <p>Organize work into projects, connect repositories and credentials, and run tasks on demand or on a schedule.</p>
        <ul>
          <li><Link to="/getting-started">Getting started: first task in six steps</Link></li>
          <li><Link to="/user-guide/projects">Projects</Link> and <Link to="/user-guide/team">Teams</Link></li>
          <li><Link to="/user-guide/task-templates">Task templates</Link> and <Link to="/user-guide/tasks">Tasks</Link></li>
          <li><Link to="/user-guide/key-store">Key Store</Link>, <Link to="/user-guide/inventory">Inventory</Link>, <Link to="/user-guide/environment">Variable Groups</Link></li>
          <li><Link to="/user-guide/schedules">Schedules</Link> and <Link to="/user-guide/workflows">Workflows</Link> (Pro)</li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Operate at scale</h3></div>
      <div className="card__body">
        <p>Distribute execution, run redundantly, and keep the service observable and up to date.</p>
        <ul>
          <li><Link to="/admin-guide/runners">Runners</Link></li>
          <li><Link to="/admin-guide/ha">High availability</Link></li>
          <li><Link to="/admin-guide/upgrading">Upgrading</Link></li>
          <li><Link to="/admin-guide/logs">Logs</Link> and <Link to="/admin-guide/metrics">Metrics</Link></li>
          <li><Link to="/category/notifications">Notifications</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Reference</h3></div>
      <div className="card__body">
        <p>Exact options and endpoints when you already know what you are looking for.</p>
        <ul>
          <li><Link to="/admin-guide/configuration/config-file">Configuration file</Link> and <Link to="/admin-guide/configuration/env-vars">Environment variables</Link></li>
          <li><Link to="/admin-guide/api">REST API</Link></li>
          <li><Link to="/admin-guide/cli">CLI</Link></li>
          <li><Link to="/admin-guide/cicd">CI/CD integration</Link></li>
          <li><Link to="/faq/troubleshooting">Troubleshooting FAQ</Link></li>
        </ul>
      </div>
    </div>
  </div>
</div>

## Guides by tool {#guides-by-tool}

<div className="home-tools margin-bottom--lg">
  <Link className="button button--outline button--primary" to="/user-guide/apps/ansible">Ansible</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/terraform">Terraform / OpenTofu</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/bash">Shell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/powershell">PowerShell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/python">Python</Link>
</div>

## Help and community {#help-and-community}

- **Questions:** ask on [Discord](https://discord.gg/5R6k7hNGcH).
- **Bugs and feature requests:** open an issue on [GitHub](https://github.com/semaphoreui/semaphore/issues).
- **Source code:** [github.com/semaphoreui/semaphore](https://github.com/semaphoreui/semaphore).
- **Pro and Enterprise:** [License activation](/admin-guide/license).
