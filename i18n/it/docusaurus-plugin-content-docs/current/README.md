---
title: Documentazione di Semaphore UI
sidebar_label: Home
hide_table_of_contents: true
---

import Link from '@docusaurus/Link';

# Documentazione di Semaphore UI

Semaphore UI è un'interfaccia web e un'API self-hosted per eseguire automazioni **Ansible**, **Terraform/OpenTofu**, **Shell**, **PowerShell** e **Python**. Offre al team un unico punto da cui eseguire playbook e script, conservare le credenziali cifrate, pianificare i job e vedere chi ha eseguito cosa e quando.

Viene distribuito come singolo binario Go o immagine Docker, funziona su Linux, macOS e Windows e memorizza i dati in SQLite, MySQL o PostgreSQL.

È la prima volta che usa Semaphore? L'[Introduzione](/introduction) spiega che cosa fa, com'è composta un'installazione e che cosa preparare prima di installarlo.

:::tip[Avvio rapido]

Avviare Semaphore con SQLite con un solo comando, quindi aprire [http://localhost:3000](http://localhost:3000) e accedere come `admin` / `changeme`.

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

Per la produzione, consultare [Installazione](/admin-guide/installation) per Docker Compose, pacchetti, Kubernetes e installazione da binario. Seguire poi [Primi passi](/getting-started) per eseguire il primo task.

:::

<div className="row home-cards">
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Installazione e configurazione</h3></div>
      <div className="card__body">
        <p>Mettere in funzione un server e collegarlo al database, all'identity provider e alla rete.</p>
        <ul>
          <li><Link to="/admin-guide/installation">Installazione</Link></li>
          <li><Link to="/admin-guide/configuration">Configurazione</Link></li>
          <li><Link to="/admin-guide/reverse-proxy">Reverse proxy e TLS</Link></li>
          <li><Link to="/admin-guide/ldap">LDAP</Link> e <Link to="/admin-guide/openid">OpenID Connect</Link></li>
          <li><Link to="/admin-guide/security">Hardening della sicurezza</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Eseguire automazioni</h3></div>
      <div className="card__body">
        <p>Organizzare il lavoro in progetti, collegare repository e credenziali ed eseguire task su richiesta o in base a una pianificazione.</p>
        <ul>
          <li><Link to="/getting-started">Primi passi: il primo task in sei passaggi</Link></li>
          <li><Link to="/user-guide/projects">Progetti</Link> e <Link to="/user-guide/team">Team</Link></li>
          <li><Link to="/user-guide/task-templates">Template di task</Link> e <Link to="/user-guide/tasks">Task</Link></li>
          <li><Link to="/user-guide/key-store">Key Store</Link>, <Link to="/user-guide/inventory">Inventory</Link>, <Link to="/user-guide/environment">Gruppi di variabili</Link></li>
          <li><Link to="/user-guide/schedules">Pianificazioni</Link> e <Link to="/user-guide/workflows">Workflow</Link> (Pro)</li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Operare su larga scala</h3></div>
      <div className="card__body">
        <p>Distribuire l'esecuzione, garantire la ridondanza e mantenere il servizio osservabile e aggiornato.</p>
        <ul>
          <li><Link to="/admin-guide/runners">Runner</Link></li>
          <li><Link to="/admin-guide/ha">Alta disponibilità</Link></li>
          <li><Link to="/admin-guide/upgrading">Aggiornamento</Link></li>
          <li><Link to="/admin-guide/logs">Log</Link> e <Link to="/admin-guide/metrics">Metriche</Link></li>
          <li><Link to="/admin-guide/notifications">Notifiche</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Riferimento</h3></div>
      <div className="card__body">
        <p>Opzioni ed endpoint esatti, per quando si sa già cosa si sta cercando.</p>
        <ul>
          <li><Link to="/admin-guide/configuration/config-file">File di configurazione</Link> e <Link to="/admin-guide/configuration/env-vars">Variabili d'ambiente</Link></li>
          <li><Link to="/reference/api">API REST</Link></li>
          <li><Link to="/reference/cli">CLI</Link></li>
          <li><Link to="/admin-guide/cicd">Integrazione CI/CD</Link></li>
          <li><Link to="/faq/troubleshooting">FAQ sulla risoluzione dei problemi</Link></li>
        </ul>
      </div>
    </div>
  </div>
</div>

## Guide per strumento {#guides-by-tool}

<div className="home-tools margin-bottom--lg">
  <Link className="button button--outline button--primary" to="/user-guide/apps/ansible">Ansible</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/terraform">Terraform / OpenTofu</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/bash">Shell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/powershell">PowerShell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/python">Python</Link>
</div>

## Aiuto e community {#help-and-community}

- **Domande:** chiedere su [Discord](https://discord.gg/5R6k7hNGcH).
- **Bug e richieste di funzionalità:** aprire una issue su [GitHub](https://github.com/semaphoreui/semaphore/issues).
- **Codice sorgente:** [github.com/semaphoreui/semaphore](https://github.com/semaphoreui/semaphore).
- **Pro ed Enterprise:** [Attivazione della licenza](/admin-guide/license).
