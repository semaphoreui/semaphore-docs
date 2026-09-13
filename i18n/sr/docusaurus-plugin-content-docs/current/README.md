---
title: Dokumentacija Semaphore UI
sidebar_label: Početna
hide_table_of_contents: true
---

import Link from '@docusaurus/Link';

# Dokumentacija Semaphore UI

Semaphore UI je samostalno hostovani veb interfejs i API za pokretanje **Ansible**, **Terraform/OpenTofu**, **Shell**, **PowerShell** i **Python** automatizacije. Vašem timu daje jedno mesto za pokretanje playbook-ova i skripti, čuvanje kredencijala u šifrovanom obliku, zakazivanje poslova i uvid u to ko je šta i kada pokrenuo.

Isporučuje se kao jedan Go binarni fajl ili Docker imidž, radi na Linux-u, macOS-u i Windows-u, a podatke čuva u SQLite, MySQL ili PostgreSQL bazi.

:::tip[Brzi početak]

Pokrenite Semaphore sa SQLite bazom jednom komandom, zatim otvorite [http://localhost:3000](http://localhost:3000) i prijavite se kao `admin` / `changeme`.

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

Za produkciju pogledajte [Instalacija](/admin-guide/installation) za Docker Compose, pakete, Kubernetes i instalaciju binarnog fajla. Zatim pratite [Prvi koraci](/getting-started) da biste pokrenuli svoj prvi zadatak.

:::

<div className="row home-cards">
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Instalacija i konfiguracija</h3></div>
      <div className="card__body">
        <p>Pokrenite server i povežite ga sa bazom podataka, provajderom identiteta i mrežom.</p>
        <ul>
          <li><Link to="/admin-guide/installation">Instalacija</Link></li>
          <li><Link to="/admin-guide/configuration">Konfiguracija</Link></li>
          <li><Link to="/admin-guide/reverse-proxy">Reverzni proksi i TLS</Link></li>
          <li><Link to="/admin-guide/ldap">LDAP</Link> i <Link to="/admin-guide/openid">OpenID Connect</Link></li>
          <li><Link to="/admin-guide/security">Bezbednosno ojačavanje</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Pokretanje automatizacije</h3></div>
      <div className="card__body">
        <p>Organizujte rad u projekte, povežite repozitorijume i kredencijale i pokrećite zadatke na zahtev ili po rasporedu.</p>
        <ul>
          <li><Link to="/getting-started">Prvi koraci: prvi zadatak u šest koraka</Link></li>
          <li><Link to="/user-guide/projects">Projekti (Projects)</Link> i <Link to="/user-guide/team">Timovi (Teams)</Link></li>
          <li><Link to="/user-guide/task-templates">Šabloni zadataka (Task Templates)</Link> i <Link to="/user-guide/tasks">Zadaci (Tasks)</Link></li>
          <li><Link to="/user-guide/key-store">Skladište ključeva (Key Store)</Link>, <Link to="/user-guide/inventory">Inventar (Inventory)</Link>, <Link to="/user-guide/environment">Grupe promenljivih (Variable Groups)</Link></li>
          <li><Link to="/user-guide/schedules">Rasporedi (Schedules)</Link> i <Link to="/user-guide/workflows">Tokovi rada (Workflows)</Link> (Pro)</li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Rad u velikom obimu</h3></div>
      <div className="card__body">
        <p>Raspodelite izvršavanje, obezbedite redundantnost i održavajte servis nadgledanim i ažurnim.</p>
        <ul>
          <li><Link to="/admin-guide/runners">Runner-i (Runners)</Link></li>
          <li><Link to="/admin-guide/ha">Visoka dostupnost</Link></li>
          <li><Link to="/admin-guide/upgrading">Nadogradnja</Link></li>
          <li><Link to="/admin-guide/logs">Logovi</Link> i <Link to="/admin-guide/metrics">Metrike</Link></li>
          <li><Link to="/admin-guide/notifications">Obaveštenja</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Referenca</h3></div>
      <div className="card__body">
        <p>Tačne opcije i krajnje tačke kada već znate šta tražite.</p>
        <ul>
          <li><Link to="/admin-guide/configuration/config-file">Konfiguracioni fajl</Link> i <Link to="/admin-guide/configuration/env-vars">Promenljive okruženja</Link></li>
          <li><Link to="/admin-guide/api">REST API</Link></li>
          <li><Link to="/admin-guide/cli">CLI</Link></li>
          <li><Link to="/admin-guide/cicd">CI/CD integracija</Link></li>
          <li><Link to="/faq/troubleshooting">Česta pitanja o rešavanju problema</Link></li>
        </ul>
      </div>
    </div>
  </div>
</div>

## Vodiči po alatu {#guides-by-tool}

<div className="home-tools margin-bottom--lg">
  <Link className="button button--outline button--primary" to="/user-guide/apps/ansible">Ansible</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/terraform">Terraform / OpenTofu</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/bash">Shell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/powershell">PowerShell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/python">Python</Link>
</div>

## Pomoć i zajednica {#help-and-community}

- **Pitanja:** postavite ih na [Discord](https://discord.gg/5R6k7hNGcH) serveru.
- **Greške i zahtevi za nove funkcionalnosti:** otvorite prijavu na [GitHub](https://github.com/semaphoreui/semaphore/issues).
- **Izvorni kod:** [github.com/semaphoreui/semaphore](https://github.com/semaphoreui/semaphore).
- **Pro i Enterprise:** [Aktivacija licence](/admin-guide/license).
