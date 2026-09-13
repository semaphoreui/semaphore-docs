---
title: Документация Semaphore UI
sidebar_label: Главная
hide_table_of_contents: true
---

import Link from '@docusaurus/Link';

# Документация Semaphore UI

Semaphore UI — это самостоятельно размещаемый веб-интерфейс и API для запуска автоматизации на **Ansible**, **Terraform/OpenTofu**, **Shell**, **PowerShell** и **Python**. Он даёт вашей команде единое место, где можно запускать playbook'и и скрипты, хранить учётные данные в зашифрованном виде, планировать задания и видеть, кто, что и когда запускал.

Поставляется в виде одного бинарного файла на Go или Docker-образа, работает на Linux, macOS и Windows и хранит данные в SQLite, MySQL или PostgreSQL.

:::tip[Быстрый старт]

Запустите Semaphore с SQLite одной командой, затем откройте [http://localhost:3000](http://localhost:3000) и войдите как `admin` / `changeme`.

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

Для продуктивной среды см. раздел [Установка](/admin-guide/installation), где описаны Docker Compose, пакеты, Kubernetes и установка из бинарного файла. Затем следуйте разделу [Начало работы](/getting-started), чтобы запустить первую задачу.

:::

<div className="row home-cards">
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Установка и настройка</h3></div>
      <div className="card__body">
        <p>Запустите сервер и подключите его к базе данных, провайдеру идентификации и сети.</p>
        <ul>
          <li><Link to="/admin-guide/installation">Установка</Link></li>
          <li><Link to="/admin-guide/configuration">Настройка</Link></li>
          <li><Link to="/category/reverse-proxy">Обратный прокси и TLS</Link></li>
          <li><Link to="/admin-guide/ldap">LDAP</Link> и <Link to="/admin-guide/openid">OpenID Connect</Link></li>
          <li><Link to="/admin-guide/security">Усиление безопасности</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Запуск автоматизации</h3></div>
      <div className="card__body">
        <p>Организуйте работу в проекты, подключите репозитории и учётные данные и запускайте задачи по запросу или по расписанию.</p>
        <ul>
          <li><Link to="/getting-started">Начало работы: первая задача за шесть шагов</Link></li>
          <li><Link to="/user-guide/projects">Проекты</Link> и <Link to="/user-guide/team">Команды</Link></li>
          <li><Link to="/user-guide/task-templates">Шаблоны задач</Link> и <Link to="/user-guide/tasks">Задачи</Link></li>
          <li><Link to="/user-guide/key-store">Хранилище ключей</Link>, <Link to="/user-guide/inventory">Инвентарь</Link>, <Link to="/user-guide/environment">Группы переменных</Link></li>
          <li><Link to="/user-guide/schedules">Расписания</Link> и <Link to="/user-guide/workflows">Workflows</Link> (Pro)</li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Эксплуатация в масштабе</h3></div>
      <div className="card__body">
        <p>Распределяйте выполнение, работайте с резервированием и поддерживайте наблюдаемость и актуальность сервиса.</p>
        <ul>
          <li><Link to="/admin-guide/runners">Runner'ы</Link></li>
          <li><Link to="/admin-guide/ha">Высокая доступность</Link></li>
          <li><Link to="/admin-guide/upgrading">Обновление</Link></li>
          <li><Link to="/admin-guide/logs">Журналы</Link> и <Link to="/admin-guide/metrics">Метрики</Link></li>
          <li><Link to="/category/notifications">Уведомления</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Справочник</h3></div>
      <div className="card__body">
        <p>Точные параметры и конечные точки, когда вы уже знаете, что ищете.</p>
        <ul>
          <li><Link to="/admin-guide/configuration/config-file">Файл конфигурации</Link> и <Link to="/admin-guide/configuration/env-vars">Переменные окружения</Link></li>
          <li><Link to="/admin-guide/api">REST API</Link></li>
          <li><Link to="/admin-guide/cli">CLI</Link></li>
          <li><Link to="/admin-guide/cicd">Интеграция с CI/CD</Link></li>
          <li><Link to="/faq/troubleshooting">Частые вопросы: устранение неполадок</Link></li>
        </ul>
      </div>
    </div>
  </div>
</div>

## Руководства по инструментам {#guides-by-tool}

<div className="home-tools margin-bottom--lg">
  <Link className="button button--outline button--primary" to="/user-guide/apps/ansible">Ansible</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/terraform">Terraform / OpenTofu</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/bash">Shell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/powershell">PowerShell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/python">Python</Link>
</div>

## Помощь и сообщество {#help-and-community}

- **Вопросы:** задавайте в [Discord](https://discord.gg/5R6k7hNGcH).
- **Ошибки и запросы функций:** создайте issue на [GitHub](https://github.com/semaphoreui/semaphore/issues).
- **Исходный код:** [github.com/semaphoreui/semaphore](https://github.com/semaphoreui/semaphore).
- **Pro и Enterprise:** [Активация лицензии](/admin-guide/license).
