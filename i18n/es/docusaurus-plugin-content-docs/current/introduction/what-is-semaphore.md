---
title: Qué es Semaphore
description: Qué hace Semaphore UI, los problemas que resuelve, a quién va dirigido y los casos en los que otra herramienta es la mejor opción.
---

# Qué es Semaphore

Semaphore UI es una interfaz web autoalojada y una API REST para ejecutar la automatización
que ya tienes. La apuntas a un repositorio Git que contiene tus playbooks de Ansible,
configuraciones de Terraform o scripts de shell, le indicas qué credenciales y hosts debe
usar, y se convierte en el único lugar donde tu equipo ejecuta esa automatización, guarda
los secretos que necesita y mantiene un registro de cada ejecución.

Semaphore no sustituye a Ansible, Terraform ni a tus scripts. Los ejecuta, en un
servidor en lugar de en el portátil de alguien.

## El problema que resuelve {#the-problem-it-solves}

La automatización suele empezar en una estación de trabajo. Un ingeniero tiene el playbook,
el inventario, la clave SSH y la versión correcta de Ansible instalada. Eso funciona hasta
que una segunda persona necesita ejecutar lo mismo, o hasta que alguien pregunta qué cambió
en un host el martes pasado.

Semaphore traslada la ejecución a un servidor compartido y añade las piezas que faltaban:

| Pieza que falta | Qué aporta Semaphore |
|---|---|
| Todo el mundo necesita las herramientas instaladas | Las tiene un servidor (o un runner); los usuarios solo necesitan un navegador. |
| Las credenciales se copian entre portátiles | Un [almacén de claves](/user-guide/key-store) cifrado que entrega los secretos a la ejecución, nunca al usuario. |
| No hay registro de quién ejecutó qué | Cada [tarea](/user-guide/tasks) conserva su salida, su estado de salida, el usuario y la hora. |
| Nadie debería tener root para ejecutar un playbook | Los [roles](/user-guide/team) deciden quién puede ejecutar, editar o solo observar. |
| Las ejecuciones ocurren cuando alguien se acuerda | Los [horarios](/user-guide/schedules), los [webhooks](/user-guide/integrations) y las llamadas a la API las inician. |

## A quién va dirigido {#who-it-is-for}

- **Equipos de infraestructura y plataforma** que ya usan Ansible o Terraform y quieren
  que sus compañeros lo ejecuten sin repartir credenciales de producción.
- **Equipos pequeños sin plataforma de CI/CD**, que necesitan trabajos operativos
  programados y bajo demanda, pero no un pipeline de compilación.
- **Equipos con una plataforma de CI/CD** que quieren mantener las ejecuciones operativas
  — reinicios, despliegues, renovaciones de certificados — fuera del sistema de compilación
  y visibles para personas que no leen YAML de pipelines.

Semaphore es autoalojado. No hay versión SaaS: ejecutas el binario o el contenedor en tu
propia infraestructura, y tus secretos nunca salen de ella.

## Qué ejecuta {#what-it-runs}

Cada [plantilla de tarea](/user-guide/task-templates) elige una aplicación:

- [Ansible](/user-guide/apps/ansible) — playbooks con inventarios, contraseñas de vault y
  el conjunto completo de opciones de `ansible-playbook`.
- [Terraform, OpenTofu y Terragrunt](/user-guide/apps/terraform) — plan y apply con
  workspaces y el estado gestionado por tu backend.
- [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell) y
  [Python](/user-guide/apps/python) — todo lo que no cubren los anteriores.

Las tareas se ejecutan en el propio servidor o en [runners](/admin-guide/runners) situados
cerca de los sistemas que gestionan.

## Cuándo no usarlo {#when-not-to-use-it}

Conocer los límites ahorra tiempo después.

- **Compilar y probar código fuente.** Semaphore no tiene artefactos de compilación, ni
  compilaciones matriciales, ni comprobaciones de pull request, ni registro de contenedores.
  Usa GitHub Actions, GitLab CI o Jenkins para eso, e
  [inicia tareas de Semaphore desde ellos](/admin-guide/cicd) cuando un pipeline necesite
  tocar la infraestructura.
- **Sustituir a Ansible o Terraform.** Semaphore no tiene motor de ejecución propio. Si tu
  playbook no funciona desde una shell, no funcionará desde Semaphore.
- **Actuar como CMDB.** Los [inventarios](/user-guide/inventory) son los inventarios que
  necesitan tus ejecuciones, no una fuente de verdad sobre tu parque. Genéralos desde tu
  fuente real con un inventario dinámico.
- **Ser el gestor de secretos de tu organización.** Los secretos se cifran en reposo y están
  diseñados para que los usen las tareas, no para que las personas los lean. Si ya ejecutas
  HashiCorp Vault u otro almacén, [conéctalo](/user-guide/key-store) en lugar de copiar los secretos.
- **Ejecutar un servicio de un solo nodo donde cualquier caída sea inaceptable.** Varios nodos
  activos requieren [alta disponibilidad](/admin-guide/ha), que es una función Enterprise y
  necesita PostgreSQL o MySQL más Redis.

## Qué sigue {#whats-next}

- [Arquitectura](/introduction/architecture) — los procesos, la base de datos y dónde se ejecutan las tareas.
- [Conceptos básicos](/introduction/concepts) — las diez palabras que la interfaz espera que conozcas.
- [Primeros pasos](/getting-started) — instálalo y ejecuta algo.
