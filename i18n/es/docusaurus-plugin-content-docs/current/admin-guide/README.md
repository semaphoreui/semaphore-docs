# Guía de administración

Bienvenido a la Guía de administración de Semaphore UI. Esta guía proporciona información completa para instalar, configurar y mantener su instancia de Semaphore.

## ¿Qué es Semaphore UI? {#what-is-semaphore-ui}

Semaphore UI es una interfaz web moderna y de código abierto para ejecutar tareas de automatización. Está diseñada como una alternativa ligera, rápida y fácil de usar frente a plataformas de automatización más complejas.

Permite gestionar y ejecutar de forma segura tareas para:
*   Playbooks de **Ansible**
*   Infraestructura como código con **Terraform/OpenTofu**
*   Scripts de **PowerShell** y **Shell**
*   Scripts de **Python**

## Características principales y filosofía {#core-features--philosophy}

Comprender los principios de diseño de Semaphore le ayudará a sacarle el máximo partido:

*   **Ligero y eficiente**: Semaphore está escrito en **Go** y se distribuye como un **único archivo binario**. Tiene requisitos de recursos mínimos (CPU/RAM) y no necesita dependencias externas como Kubernetes, Docker o una JVM. Esto lo hace rápido, eficiente y fácil de desplegar.
*   **Fácil de instalar y mantener**: Puede tener Semaphore funcionando en minutos. La instalación puede ser tan sencilla como descargar el binario y ejecutarlo. Su arquitectura simple hace que las actualizaciones y el mantenimiento sean directos.
*   **Despliegue flexible**: Ejecútelo como binario, como servicio de systemd o en un contenedor de Docker. Es adecuado para todo, desde un homelab personal hasta entornos empresariales.
*   **Autoalojado y seguro**: Semaphore es una solución autoalojada. Todos sus datos, credenciales y registros permanecen en su propia infraestructura, lo que le da control total. Las credenciales siempre se almacenan cifradas en la base de datos.
*   **Integraciones potentes**: Aunque es simple, Semaphore admite funcionalidades avanzadas como autenticación LDAP/OpenID, control de acceso basado en roles (RBAC) detallado por proyecto, runners remotos para escalar la ejecución de tareas y una API REST completa para el acceso programático.

Esta guía le acompañará en la configuración y gestión de estas funcionalidades según sus necesidades específicas.

<!-- ## Start here

- Installation options: package manager, Docker/Compose, binary, Kubernetes (Helm), Snap (deprecated)
- Post-install configuration: config file, environment variables, interactive CLI setup
- Security essentials: reverse proxy, TLS, database and network hardening
- Authentication: LDAP and OpenID Connect providers
- Operations: CLI, runners, logs, notifications
- Maintenance: upgrading and troubleshooting -->

## Enlaces rápidos {#quick-links}

- Instalación: [Descripción general](/admin-guide/installation)
  - [Gestor de paquetes](/admin-guide/installation/package-manager)
  - [Docker](/admin-guide/installation/docker)
  - [Archivo binario](/admin-guide/installation/binary-file)
  - [Kubernetes (chart de Helm)](/admin-guide/installation/k8s)
  - [Nube](/admin-guide/installation/cloud)
  - [Instalación manual](/admin-guide/installation_manually)
- Configuración: [Descripción general](/admin-guide/configuration)
  - [Archivo de configuración](/admin-guide/configuration/config-file)
  - [Variables de entorno](/admin-guide/configuration/env-vars)
  - [Configuración interactiva](/admin-guide/configuration/cli)
- Seguridad: [Descripción general](/admin-guide/security)
  - [Seguridad de la base de datos](/admin-guide/security/database)
  - [Seguridad de la red](/admin-guide/security/network)
  - [Configuración de NGINX](/admin-guide/reverse-proxy/nginx)
  - [Configuración de Apache](/admin-guide/reverse-proxy/apache)
  - [Kerberos](/admin-guide/security/kerberos)
- Autenticación:
  - [LDAP](/admin-guide/ldap)
  - [OpenID](/admin-guide/openid)
    - [GitHub](/admin-guide/openid/github)
    - [Google](/admin-guide/openid/google)
    - [GitLab](/admin-guide/openid/gitlab)
    - [Gitea](/admin-guide/openid/gitea)
    - [Authelia](/admin-guide/openid/authelia)
    - [Authentik](/admin-guide/openid/authentik)
    - [Keycloak](/admin-guide/openid/keycloak)
    - [Okta](/admin-guide/openid/okta)
    - [PingFederate](/admin-guide/openid/pingfederate)
    - [Azure](/admin-guide/openid/azure)
    - [Zitadel](/admin-guide/openid/zitadel)
- Operaciones:
  - [CLI](/admin-guide/cli)
  - [Runners](/admin-guide/runners)
  - [Registros](/admin-guide/logs)
  - [Notificaciones](/admin-guide/notifications)
    - [Correo electrónico](/admin-guide/notifications/email)
    - [Telegram](/admin-guide/notifications/telegram)
    - [Slack](/admin-guide/notifications/slack)
    - [Teams](/admin-guide/notifications/teams)
    - [Rocket.Chat](/admin-guide/notifications/rocket)
    - [DingTalk](/admin-guide/notifications/ding)
    - [Gotify](/admin-guide/notifications/gotify)
- Mantenimiento:
  - [Actualización](/admin-guide/upgrading)
  - [Activación de licencia](/admin-guide/license)
  - [Resolución de problemas](/faq/troubleshooting)
