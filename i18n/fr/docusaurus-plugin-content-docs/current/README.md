---
title: Documentation Semaphore UI
sidebar_label: Accueil
hide_table_of_contents: true
---

import Link from '@docusaurus/Link';

# Documentation Semaphore UI

Semaphore UI est une interface web et une API auto-hébergées pour exécuter des automatisations **Ansible**, **Terraform/OpenTofu**, **Shell**, **PowerShell** et **Python**. Il offre à votre équipe un lieu unique pour exécuter des playbooks et des scripts, conserver les identifiants chiffrés, planifier des tâches et voir qui a exécuté quoi et quand.

Il est distribué sous forme d'un binaire Go unique ou d'une image Docker, fonctionne sous Linux, macOS et Windows, et stocke ses données dans SQLite, MySQL ou PostgreSQL.

Vous découvrez Semaphore ? L'[Introduction](/introduction) explique ce qu'il fait, comment un déploiement est composé et ce qu'il faut préparer avant l'installation.

:::tip[Démarrage rapide]

Lancez Semaphore avec SQLite en une seule commande, puis ouvrez [http://localhost:3000](http://localhost:3000) et connectez-vous avec `admin` / `changeme`.

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

Pour la production, consultez [Installation](/admin-guide/installation) pour les installations via Docker Compose, paquets, Kubernetes et binaire. Suivez ensuite [Premiers pas](/getting-started) pour exécuter votre première tâche.

:::

<div className="row home-cards">
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Installer et configurer</h3></div>
      <div className="card__body">
        <p>Mettez un serveur en service et connectez-le à votre base de données, votre fournisseur d'identité et votre réseau.</p>
        <ul>
          <li><Link to="/admin-guide/installation">Installation</Link></li>
          <li><Link to="/admin-guide/configuration">Configuration</Link></li>
          <li><Link to="/admin-guide/reverse-proxy">Proxy inverse et TLS</Link></li>
          <li><Link to="/admin-guide/ldap">LDAP</Link> et <Link to="/admin-guide/openid">OpenID Connect</Link></li>
          <li><Link to="/admin-guide/security">Renforcement de la sécurité</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Exécuter des automatisations</h3></div>
      <div className="card__body">
        <p>Organisez le travail en projets, connectez des dépôts et des identifiants, et exécutez des tâches à la demande ou selon une planification.</p>
        <ul>
          <li><Link to="/getting-started">Premiers pas : première tâche en six étapes</Link></li>
          <li><Link to="/user-guide/projects">Projets</Link> et <Link to="/user-guide/team">Équipes</Link></li>
          <li><Link to="/user-guide/task-templates">Modèles de tâches</Link> et <Link to="/user-guide/tasks">Tâches</Link></li>
          <li><Link to="/user-guide/key-store">Magasin de clés</Link>, <Link to="/user-guide/inventory">Inventaire</Link>, <Link to="/user-guide/environment">Groupes de variables</Link></li>
          <li><Link to="/user-guide/schedules">Planifications</Link> et <Link to="/user-guide/workflows">Workflows</Link> (Pro)</li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Exploiter à grande échelle</h3></div>
      <div className="card__body">
        <p>Distribuez l'exécution, fonctionnez en redondance et gardez le service observable et à jour.</p>
        <ul>
          <li><Link to="/admin-guide/runners">Runners</Link></li>
          <li><Link to="/admin-guide/ha">Haute disponibilité</Link></li>
          <li><Link to="/admin-guide/upgrading">Mise à niveau</Link></li>
          <li><Link to="/admin-guide/logs">Journaux</Link> et <Link to="/admin-guide/metrics">Métriques</Link></li>
          <li><Link to="/admin-guide/notifications">Notifications</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Référence</h3></div>
      <div className="card__body">
        <p>Les options et points de terminaison exacts lorsque vous savez déjà ce que vous cherchez.</p>
        <ul>
          <li><Link to="/admin-guide/configuration/config-file">Fichier de configuration</Link> et <Link to="/admin-guide/configuration/env-vars">Variables d'environnement</Link></li>
          <li><Link to="/admin-guide/api">API REST</Link></li>
          <li><Link to="/admin-guide/cli">CLI</Link></li>
          <li><Link to="/admin-guide/cicd">Intégration CI/CD</Link></li>
          <li><Link to="/faq/troubleshooting">FAQ de dépannage</Link></li>
        </ul>
      </div>
    </div>
  </div>
</div>

## Guides par outil {#guides-by-tool}

<div className="home-tools margin-bottom--lg">
  <Link className="button button--outline button--primary" to="/user-guide/apps/ansible">Ansible</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/terraform">Terraform / OpenTofu</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/bash">Shell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/powershell">PowerShell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/python">Python</Link>
</div>

## Aide et communauté {#help-and-community}

- **Questions :** posez-les sur [Discord](https://discord.gg/5R6k7hNGcH).
- **Bugs et demandes de fonctionnalités :** ouvrez un ticket sur [GitHub](https://github.com/semaphoreui/semaphore/issues).
- **Code source :** [github.com/semaphoreui/semaphore](https://github.com/semaphoreui/semaphore).
- **Pro et Enterprise :** [Activation de la licence](/admin-guide/license).
