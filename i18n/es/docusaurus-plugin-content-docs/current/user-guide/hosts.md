---
title: Hosts
description: A qué hosts llegan sus tareas de Ansible, cómo terminó cada uno y dónde mirar cuando un host falla o nunca se alcanza.
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

La página **Hosts** de un proyecto lista cada host al que han llegado las tareas de Ansible del
proyecto, con el resultado de la última ejecución en él. Ábrala cuando quiera saber qué hosts fallan,
cuáles no se pueden alcanzar y a cuáles no ha llegado ninguna tarea desde hace tiempo, sin abrir los
registros de las tareas uno por uno.

## Cómo funciona {#how-it-works}

Usted no añade hosts a mano. Tras cada tarea de Ansible, Semaphore registra cada host del play con su
resultado en ese host: `ok`, `changed`, `failed` o `unreachable`. Cuentan las tareas en el servidor,
en los runners y en los ejecutores de Docker o Kubernetes. Las tareas de otras aplicaciones, como
Terraform o Bash, no añaden hosts.

Un host es su nombre en el inventario. `web-01` en dos inventarios es un solo host, y `Web-01` es el
mismo host que `web-01`. Un host al que llegan tareas de varios proyectos aparece en cada proyecto
con las cifras propias de ese proyecto. Un host permanece en la lista, junto con su historial,
después de salir de su inventario.

## Encontrar un host {#find-a-host}

- **Search** busca hosts por nombre.
- **Failing now** muestra los hosts cuya última ejecución falló. **Unreachable** muestra los hosts a
  los que Ansible no pudo conectarse. **Not seen 30 days** muestra los hosts a los que no ha llegado
  ninguna tarea en un mes.
- **Template** limita la lista a los hosts de una plantilla.

Haga clic en un host para abrir su ficha: cuándo se vio por primera vez, cuántas ejecuciones tuvo,
cuántas de las últimas 10 ejecuciones fallaron y las tareas que llegaron a él, con el resultado en
este host. Haga clic en una tarea para abrir su registro.

La pestaña **Summary** de una tarea muestra lo mismo para una ejecución: seleccione **All servers**
para ver todos los hosts de esa tarea con sus contadores.

## Qué sigue {#whats-next}

- [Hosts para administradores](/admin-guide/hosts) — todos los proyectos, el recuento de la licencia y la baja de hosts.
- [Inventario](/user-guide/inventory) — defina los hosts contra los que se ejecutan sus tareas.
