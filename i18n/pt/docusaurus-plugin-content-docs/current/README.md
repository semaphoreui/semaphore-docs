---
title: Documentação do Semaphore UI
sidebar_label: Início
hide_table_of_contents: true
---

import Link from '@docusaurus/Link';

# Documentação do Semaphore UI

O Semaphore UI é uma interface web e API auto-hospedada para executar automações com **Ansible**, **Terraform/OpenTofu**, **Shell**, **PowerShell** e **Python**. Ele oferece à sua equipe um único lugar para executar playbooks e scripts, manter credenciais criptografadas, agendar jobs e ver quem executou o quê e quando.

Ele é distribuído como um único binário Go ou imagem Docker, roda em Linux, macOS e Windows e armazena os dados em SQLite, MySQL ou PostgreSQL.

É a primeira vez que usa o Semaphore? A [Introdução](/introduction) explica o que ele faz, como uma instalação é composta e o que preparar antes de instalá-lo.

:::tip[Início rápido]

Execute o Semaphore com SQLite em um único comando, depois abra [http://localhost:3000](http://localhost:3000) e faça login como `admin` / `changeme`.

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

Para produção, consulte [Instalação](/admin-guide/installation) para instalações com Docker Compose, pacotes, Kubernetes e binário. Em seguida, siga [Primeiros passos](/getting-started) para executar sua primeira tarefa.

:::

<div className="row home-cards">
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Instalar e configurar</h3></div>
      <div className="card__body">
        <p>Coloque um servidor em execução e conecte-o ao seu banco de dados, provedor de identidade e rede.</p>
        <ul>
          <li><Link to="/admin-guide/installation">Instalação</Link></li>
          <li><Link to="/admin-guide/configuration">Configuração</Link></li>
          <li><Link to="/admin-guide/reverse-proxy">Proxy reverso e TLS</Link></li>
          <li><Link to="/admin-guide/authentication/ldap">LDAP</Link> e <Link to="/admin-guide/authentication/openid">OpenID Connect</Link></li>
          <li><Link to="/admin-guide/security">Reforço de segurança</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Executar automação</h3></div>
      <div className="card__body">
        <p>Organize o trabalho em projetos, conecte repositórios e credenciais e execute tarefas sob demanda ou de forma agendada.</p>
        <ul>
          <li><Link to="/getting-started">Primeiros passos: primeira tarefa em seis etapas</Link></li>
          <li><Link to="/user-guide/projects">Projetos</Link> e <Link to="/user-guide/team">Equipes</Link></li>
          <li><Link to="/user-guide/task-templates">Modelos de tarefa</Link> e <Link to="/user-guide/tasks">Tarefas</Link></li>
          <li><Link to="/user-guide/key-store">Armazenamento de Chaves</Link>, <Link to="/user-guide/inventory">Inventário</Link>, <Link to="/user-guide/environment">Grupos de Variáveis</Link></li>
          <li><Link to="/user-guide/schedules">Agendamentos</Link> e <Link to="/user-guide/workflows">Workflows</Link> (Pro)</li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Operar em escala</h3></div>
      <div className="card__body">
        <p>Distribua a execução, opere com redundância e mantenha o serviço observável e atualizado.</p>
        <ul>
          <li><Link to="/admin-guide/runners">Runners</Link></li>
          <li><Link to="/admin-guide/ha">Alta disponibilidade</Link></li>
          <li><Link to="/admin-guide/upgrading">Atualização</Link></li>
          <li><Link to="/admin-guide/logs">Logs</Link> e <Link to="/admin-guide/metrics">Métricas</Link></li>
          <li><Link to="/admin-guide/notifications">Notificações</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Referência</h3></div>
      <div className="card__body">
        <p>Opções e endpoints exatos para quando você já sabe o que está procurando.</p>
        <ul>
          <li><Link to="/admin-guide/configuration/config-file">Arquivo de configuração</Link> e <Link to="/admin-guide/configuration/env-vars">Variáveis de ambiente</Link></li>
          <li><Link to="/reference/api">API REST</Link></li>
          <li><Link to="/reference/cli">CLI</Link></li>
          <li><Link to="/admin-guide/cicd">Integração com CI/CD</Link></li>
          <li><Link to="/faq/troubleshooting">FAQ de solução de problemas</Link></li>
        </ul>
      </div>
    </div>
  </div>
</div>

## Guias por ferramenta {#guides-by-tool}

<div className="home-tools margin-bottom--lg">
  <Link className="button button--outline button--primary" to="/user-guide/apps/ansible">Ansible</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/terraform">Terraform / OpenTofu</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/bash">Shell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/powershell">PowerShell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/python">Python</Link>
</div>

## Ajuda e comunidade {#help-and-community}

- **Perguntas:** pergunte no [Discord](https://discord.gg/5R6k7hNGcH).
- **Bugs e solicitações de recursos:** abra uma issue no [GitHub](https://github.com/semaphoreui/semaphore/issues).
- **Código-fonte:** [github.com/semaphoreui/semaphore](https://github.com/semaphoreui/semaphore).
- **Pro e Enterprise:** [Ativação de licença](/admin-guide/license).
