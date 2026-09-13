---
title: Documentación de Semaphore UI
sidebar_label: Inicio
hide_table_of_contents: true
---

import Link from '@docusaurus/Link';

# Documentación de Semaphore UI

Semaphore UI es una interfaz web y una API autoalojadas para ejecutar automatizaciones con **Ansible**, **Terraform/OpenTofu**, **Shell**, **PowerShell** y **Python**. Ofrece a su equipo un único lugar para ejecutar playbooks y scripts, mantener las credenciales cifradas, programar trabajos y ver quién ejecutó qué y cuándo.

Se distribuye como un único binario de Go o como imagen de Docker, se ejecuta en Linux, macOS y Windows, y almacena los datos en SQLite, MySQL o PostgreSQL.

¿Es la primera vez que usa Semaphore? La [Introducción](/introduction) explica qué hace, cómo se compone una instalación y qué debe preparar antes de instalarlo.

:::tip[Inicio rápido]

Ejecute Semaphore con SQLite con un solo comando, luego abra [http://localhost:3000](http://localhost:3000) e inicie sesión como `admin` / `changeme`.

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

Para producción, consulte [Instalación](/admin-guide/installation) para las instalaciones con Docker Compose, paquetes, Kubernetes y binario. Después, siga [Primeros pasos](/getting-started) para ejecutar su primera tarea.

:::

<div className="row home-cards">
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Instalar y configurar</h3></div>
      <div className="card__body">
        <p>Ponga en marcha un servidor y conéctelo a su base de datos, proveedor de identidad y red.</p>
        <ul>
          <li><Link to="/admin-guide/installation">Instalación</Link></li>
          <li><Link to="/admin-guide/configuration">Configuración</Link></li>
          <li><Link to="/admin-guide/reverse-proxy">Proxy inverso y TLS</Link></li>
          <li><Link to="/admin-guide/authentication/ldap">LDAP</Link> y <Link to="/admin-guide/authentication/openid">OpenID Connect</Link></li>
          <li><Link to="/admin-guide/security">Refuerzo de la seguridad</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Ejecutar automatizaciones</h3></div>
      <div className="card__body">
        <p>Organice el trabajo en proyectos, conecte repositorios y credenciales, y ejecute tareas bajo demanda o de forma programada.</p>
        <ul>
          <li><Link to="/getting-started">Primeros pasos: la primera tarea en seis pasos</Link></li>
          <li><Link to="/user-guide/projects">Proyectos</Link> y <Link to="/user-guide/team">Equipos</Link></li>
          <li><Link to="/user-guide/task-templates">Plantillas de tareas</Link> y <Link to="/user-guide/tasks">Tareas</Link></li>
          <li><Link to="/user-guide/key-store">Almacén de claves</Link>, <Link to="/user-guide/inventory">Inventario</Link>, <Link to="/user-guide/environment">Grupos de variables</Link></li>
          <li><Link to="/user-guide/schedules">Programaciones</Link> y <Link to="/user-guide/workflows">Flujos de trabajo</Link> (Pro)</li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Operar a escala</h3></div>
      <div className="card__body">
        <p>Distribuya la ejecución, funcione con redundancia y mantenga el servicio observable y actualizado.</p>
        <ul>
          <li><Link to="/admin-guide/runners">Runners</Link></li>
          <li><Link to="/admin-guide/ha">Alta disponibilidad</Link></li>
          <li><Link to="/admin-guide/upgrading">Actualización</Link></li>
          <li><Link to="/admin-guide/logs">Registros</Link> y <Link to="/admin-guide/metrics">Métricas</Link></li>
          <li><Link to="/admin-guide/notifications">Notificaciones</Link></li>
        </ul>
      </div>
    </div>
  </div>
  <div className="col col--6 margin-bottom--lg">
    <div className="card">
      <div className="card__header"><h3>Referencia</h3></div>
      <div className="card__body">
        <p>Opciones y endpoints exactos para cuando ya sabe lo que busca.</p>
        <ul>
          <li><Link to="/admin-guide/configuration/config-file">Archivo de configuración</Link> y <Link to="/admin-guide/configuration/env-vars">Variables de entorno</Link></li>
          <li><Link to="/reference/api">API REST</Link></li>
          <li><Link to="/reference/cli">CLI</Link></li>
          <li><Link to="/admin-guide/cicd">Integración CI/CD</Link></li>
          <li><Link to="/faq/troubleshooting">Preguntas frecuentes sobre resolución de problemas</Link></li>
        </ul>
      </div>
    </div>
  </div>
</div>

## Guías por herramienta {#guides-by-tool}

<div className="home-tools margin-bottom--lg">
  <Link className="button button--outline button--primary" to="/user-guide/apps/ansible">Ansible</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/terraform">Terraform / OpenTofu</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/bash">Shell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/powershell">PowerShell</Link>
  <Link className="button button--outline button--primary" to="/user-guide/apps/python">Python</Link>
</div>

## Ayuda y comunidad {#help-and-community}

- **Preguntas:** pregunte en [Discord](https://discord.gg/5R6k7hNGcH).
- **Errores y solicitudes de funcionalidades:** abra un issue en [GitHub](https://github.com/semaphoreui/semaphore/issues).
- **Código fuente:** [github.com/semaphoreui/semaphore](https://github.com/semaphoreui/semaphore).
- **Pro y Enterprise:** [Activación de licencia](/admin-guide/license).
