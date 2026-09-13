---
title: Guía de administración
description: Para administradores que instalan, configuran, protegen y operan un servidor de Semaphore para sus equipos.
---

# Guía de administración

Esta sección está dirigida a los administradores que instalan y operan Semaphore
para otras personas. Todo lo que aquí se describe exige acceso al propio servidor:
al archivo de configuración, a las variables de entorno, a la línea de comandos o a
la máquina en la que se ejecuta Semaphore. El trabajo que se realiza dentro de un
proyecto a través de la interfaz web se explica en la
[Guía del usuario](/user-guide).

Semaphore es un único binario de Go con una interfaz web y una API REST. Almacena
sus datos en SQLite, MySQL o PostgreSQL, mantiene las credenciales cifradas y
ejecuta las tareas en el propio servidor o en runners independientes. Por tanto, una
instalación en funcionamiento se reduce a cuatro decisiones: cómo instalarlo, dónde
reside la base de datos, cómo inician sesión los usuarios y dónde se ejecutan las
tareas.

## Preparar la instalación {#set-up}

Todo lo que se configura antes de arrancar el servidor o en torno a ese momento.

| Página | Qué cubre |
|---|---|
| [Instalación](/admin-guide/installation) | Gestor de paquetes, Docker, binario, Kubernetes y una instalación manual. |
| [Configuración](/admin-guide/configuration) | El archivo `config.json`, las variables de entorno y todas las opciones admitidas. |
| [Actualización](/admin-guide/upgrading) | Pasar a una versión más reciente y qué comprobar antes. |
| [Proxy inverso](/admin-guide/reverse-proxy) | Servir Semaphore detrás de nginx, Apache o Caddy, con TLS. |
| [Seguridad](/admin-guide/security) | Hash de contraseñas, cifrado de secretos, refuerzo de la red y JWT de tareas. |
| [LDAP y AD](/admin-guide/ldap) | Iniciar sesión contra un servicio de directorio. |
| [OpenID Connect](/admin-guide/openid) | Inicio de sesión único con GitHub, Google, Keycloak, Okta y nueve proveedores más. |
| [Runners](/admin-guide/runners) | Ejecutar tareas en máquinas distintas del servidor. |
| [Alta disponibilidad](/admin-guide/ha) | Ejecutar varios nodos de Semaphore contra una misma base de datos. |

## Operar {#operate}

Todo lo que se hace en un servidor que ya está en marcha.

| Página | Qué cubre |
|---|---|
| [CLI](/admin-guide/cli) | Gestionar usuarios, proyectos, vaults, runners y migraciones de la base de datos desde el shell. |
| [API](/admin-guide/api) | Autenticarse con un token y controlar Semaphore mediante programación. |
| [Integración CI/CD](/admin-guide/cicd) | Iniciar tareas de Semaphore desde una canalización externa. |
| [Registros](/admin-guide/logs) | Registros del servidor, registros de tareas y su reenvío a otros sistemas. |
| [Métricas](/admin-guide/metrics) | El endpoint de Prometheus y las métricas que expone. |
| [Notificaciones](/admin-guide/notifications) | Canales de entrega de las alertas: correo electrónico, Telegram, Slack y otros. |
| [Licencia](/admin-guide/license) | Activar una suscripción Pro o Enterprise. |

## Por dónde empezar {#where-to-start}

Si instala Semaphore por primera vez, lea
[Instalación](/admin-guide/installation) y elija un método; después,
[Configuración](/admin-guide/configuration) para saber cómo se proporcionan las
opciones. Ponga el servidor detrás de un [proxy inverso](/admin-guide/reverse-proxy)
con TLS antes de que lo use nadie más.

Para ver qué añade una suscripción de pago, consulte [Ediciones](/editions).
