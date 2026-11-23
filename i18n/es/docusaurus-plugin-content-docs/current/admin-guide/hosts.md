---
title: Hosts
description: La vista de administrador de los hosts de todos los proyectos, el recuento de Nodes de la licencia y cómo dar de baja un host que ya no gestiona.
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

La página de administrador **Hosts** lista los hosts de todos los proyectos en un solo lugar y muestra
cuáles de ellos cuentan para los **Nodes** de su licencia. Abra el menú de administración en la
esquina inferior izquierda y seleccione **Hosts**.

La forma en que los hosts entran en la lista, los estados, la búsqueda y la ficha del host son los
mismos que en la página del proyecto. Para obtener más información, consulte
[Hosts](/user-guide/hosts). Aquí un host es una sola fila para todos los proyectos, y su ficha lista
los proyectos y las tareas que llegaron a él.

## Recuento de la licencia {#license-count}

Su licencia incluye un número de hosts. La fila **Nodes** de **Suscripción y facturación** muestra
cuántos están en uso, por ejemplo `42 / 50`. Un host está en uso cuando una tarea de Ansible llegó a
él en el último mes y nadie lo ha dado de baja. Un host que solo estuvo inalcanzable no está en uso.

Los hosts que no están en uso muestran **Not counted** en la lista. Vuelven a contar por sí solos la
próxima vez que una tarea llegue a ellos.

Cuando hay más hosts en uso de los que incluye la licencia, la fila **Nodes** se pone en rojo con
**(limit exceeded)** y esta página muestra una advertencia. Dé de baja los hosts que ya no gestiona o
amplíe su licencia. Para obtener más información, consulte [Activación de la licencia](/admin-guide/license).

## Dar de baja un host {#decommission}

Cuando haya eliminado un host de su infraestructura, haga clic en **Decommission** al final de su fila
y confirme. El host sale del recuento de inmediato, muestra **Decommissioned** y conserva su historial
en todos los proyectos. Si una tarea vuelve a llegar a él más adelante, Semaphore quita la marca y el
host vuelve a estar en uso.

## Qué sigue {#whats-next}

- [Hosts](/user-guide/hosts) — la página del proyecto, los estados y la ficha del host.
- [Activación de la licencia](/admin-guide/license) — active y sustituya la clave de licencia.
