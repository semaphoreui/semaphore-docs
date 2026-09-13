---
title: Semaphore UI Dokumentation
sidebar_label: Startseite
hide_table_of_contents: true
---

import Link from '@docusaurus/Link';

# Semaphore UI Dokumentation

Semaphore UI ist eine selbst gehostete Weboberfläche und API zum Ausführen von **Ansible**-, **Terraform/OpenTofu**-, **Shell**-, **PowerShell**- und **Python**-Automatisierung. Es bietet Ihrem Team einen zentralen Ort, um Playbooks und Skripte auszuführen, Zugangsdaten verschlüsselt zu speichern, Jobs zu planen und nachzuvollziehen, wer wann was ausgeführt hat.

Es wird als einzelne Go-Binärdatei oder als Docker-Image ausgeliefert, läuft unter Linux, macOS und Windows und speichert Daten in SQLite, MySQL oder PostgreSQL.

Neu bei Semaphore? Die [Einführung](/introduction) erklärt, was Semaphore leistet, wie eine Installation aufgebaut ist und was Sie vor der Installation vorbereiten sollten.

:::tip[Schnellstart]

Starten Sie Semaphore mit SQLite mit einem einzigen Befehl, öffnen Sie dann [http://localhost:3000](http://localhost:3000) und melden Sie sich als `admin` / `changeme` an.

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

Für den Produktionsbetrieb finden Sie unter [Installation](/admin-guide/installation) Anleitungen für Docker Compose, Pakete, Kubernetes und Binärdateien. Folgen Sie anschließend [Erste Schritte](/getting-started), um Ihre erste Aufgabe auszuführen.

:::

<div className="row home-cards">
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Installieren und konfigurieren</h3></div>
      <div className="card__body">
        <p>Bringen Sie einen Server zum Laufen und verbinden Sie ihn mit Ihrer Datenbank, Ihrem Identity Provider und Ihrem Netzwerk.</p>
        <ul>
          <li><Link to="/admin-guide/installation">Installation</Link></li>
          <li><Link to="/admin-guide/configuration">Konfiguration</Link></li>
          <li><Link to="/admin-guide/reverse-proxy">Reverse-Proxy und TLS</Link></li>
          <li><Link to="/admin-guide/ldap">LDAP</Link> und <Link to="/admin-guide/openid">OpenID Connect</Link></li>
          <li><Link to="/admin-guide/security">Sicherheitshärtung</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Automatisierung ausführen</h3></div>
      <div className="card__body">
        <p>Organisieren Sie die Arbeit in Projekten, verbinden Sie Repositories und Zugangsdaten und führen Sie Aufgaben bei Bedarf oder nach Zeitplan aus.</p>
        <ul>
          <li><Link to="/getting-started">Erste Schritte: erste Aufgabe in sechs Schritten</Link></li>
          <li><Link to="/user-guide/projects">Projekte</Link> und <Link to="/user-guide/team">Teams</Link></li>
          <li><Link to="/user-guide/task-templates">Aufgabenvorlagen</Link> und <Link to="/user-guide/tasks">Aufgaben</Link></li>
          <li><Link to="/user-guide/key-store">Schlüsselspeicher</Link>, <Link to="/user-guide/inventory">Inventory</Link>, <Link to="/user-guide/environment">Variablengruppen</Link></li>
          <li><Link to="/user-guide/schedules">Zeitpläne</Link> und <Link to="/user-guide/workflows">Workflows</Link> (Pro)</li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Skalierter Betrieb</h3></div>
      <div className="card__body">
        <p>Verteilen Sie die Ausführung, betreiben Sie den Dienst redundant und halten Sie ihn beobachtbar und aktuell.</p>
        <ul>
          <li><Link to="/admin-guide/runners">Runner</Link></li>
          <li><Link to="/admin-guide/ha">Hochverfügbarkeit</Link></li>
          <li><Link to="/admin-guide/upgrading">Aktualisierung</Link></li>
          <li><Link to="/admin-guide/logs">Logs</Link> und <Link to="/admin-guide/metrics">Metriken</Link></li>
          <li><Link to="/admin-guide/notifications">Benachrichtigungen</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Referenz</h3></div>
      <div className="card__body">
        <p>Genaue Optionen und Endpunkte, wenn Sie bereits wissen, wonach Sie suchen.</p>
        <ul>
          <li><Link to="/admin-guide/configuration/config-file">Konfigurationsdatei</Link> und <Link to="/admin-guide/configuration/env-vars">Umgebungsvariablen</Link></li>
          <li><Link to="/reference/api">REST-API</Link></li>
          <li><Link to="/reference/cli">CLI</Link></li>
          <li><Link to="/admin-guide/cicd">CI/CD-Integration</Link></li>
          <li><Link to="/faq/troubleshooting">FAQ zur Fehlerbehebung</Link></li>
        </ul>
      </div>
    </div>
  </div>
</div>

## Anleitungen nach Werkzeug {#guides-by-tool}

<div className="home-tools margin-bottom--lg">
  <Link className="button button--outline button--primary" to="/user-guide/apps/ansible">Ansible</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/terraform">Terraform / OpenTofu</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/bash">Shell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/powershell">PowerShell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/python">Python</Link>
</div>

## Hilfe und Community {#help-and-community}

- **Fragen:** stellen Sie auf [Discord](https://discord.gg/5R6k7hNGcH).
- **Fehler und Funktionswünsche:** erstellen Sie ein Issue auf [GitHub](https://github.com/semaphoreui/semaphore/issues).
- **Quellcode:** [github.com/semaphoreui/semaphore](https://github.com/semaphoreui/semaphore).
- **Pro und Enterprise:** [Lizenzaktivierung](/admin-guide/license).
