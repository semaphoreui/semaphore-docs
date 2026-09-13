---
title: "Runners del proyecto"
sidebar_custom_props:
  edition: pro
---

# Runners del proyecto <Pro />

Los runners ejecutan tareas en máquinas distintas del servidor de Semaphore: más cerca de la infraestructura de destino, en otra zona de red o con un conjunto de herramientas diferente. Los **runners globales** los registra un administrador y dan servicio a todos los proyectos. Los **runners del proyecto** pertenecen a un único proyecto y los gestiona su equipo en la sección **Runners**.

![Runners del proyecto](/assets/project-runners-list.webp)

| Columna | Contenido |
|---|---|
| Interruptor | Habilita o deshabilita el runner. Un runner deshabilitado no recibe tareas. Solo los runners del proyecto tienen interruptor; los runners globales los gestiona el administrador. |
| **Nombre** | Nombre del runner. El distintivo **Global** marca los runners compartidos por todos los proyectos. |
| **Etiqueta** | Etiquetas del runner. Las plantillas con una **Etiqueta de runner** solo se ejecutan en los runners que tienen esa etiqueta. |
| **Estado** | **Online** cuando el runner ha consultado al servidor recientemente; **Offline** en caso contrario. |

## Añadir un runner {#adding-a-runner}

Necesita el rol **Manager** o superior. Haga clic en **Nuevo runner** y rellene el formulario.

<div style={{maxWidth: 420}}>

![Cuadro de diálogo Nuevo runner](/assets/project-runner-new.webp)

</div>

| Campo | Descripción |
|---|---|
| **Nombre** | Nombre del runner que se muestra en la lista y en los detalles de las tareas. |
| **Etiquetas** | Opcional. Una o varias etiquetas. Una plantilla con una **Etiqueta de runner** solo la ejecutan los runners que llevan esa etiqueta. |
| **Es predeterminado** | Los runners con esta marca también toman tareas de plantillas sin etiqueta de runner. Un runner sin esta marca y sin etiquetas nunca recibe tareas. |
| **Registrar** | Marcado: el runner se crea ya registrado y el cuadro de diálogo muestra el token del runner que debe incluir en su configuración. Sin marcar: el runner se crea sin registrar y obtiene un **token de registro** de un solo uso; el runner se registra por sí mismo con `semaphore runner register` o `semaphore runner start --auto-register`. |
| **Webhook** | URL opcional a la que Semaphore llama cuando se asigna una tarea al runner. Úsela para arrancar runners a demanda (de un solo uso), por ejemplo con una función en la nube. |
| **Número máximo de tareas paralelas** | Opcional. Cuántas tareas puede ejecutar el runner a la vez. |
| **Habilitado** | Si el runner recibe tareas. |

Tras crearlo, haga clic en el runner para volver a ver su token o su token de registro y para copiar los fragmentos de configuración.

## Instalar el runner {#installing-the-runner}

El runner es el mismo binario `semaphore` o la imagen de Docker `semaphoreui/runner` iniciada en modo runner. La instalación, el archivo de configuración, los comandos de registro, los ejecutores (local, Docker, Kubernetes) y la seguridad se describen en la guía del administrador: [Runners](/admin-guide/runners) y [CLI: Runners](/reference/cli/runners).

## Dirigir tareas a los runners {#routing-tasks-to-runners}

1. Asigne al runner una o varias **Etiquetas**, por ejemplo `windows-qa-server`.
2. En el formulario de la plantilla, establezca **Etiqueta de runner** con el mismo valor.
3. Las tareas de la plantilla esperan en estado `waiting` hasta que un runner con esa etiqueta esté en línea.

Las plantillas sin etiqueta de runner van a los runners marcados como **Es predeterminado**, incluidos los runners globales predeterminados. El runner que ejecutó una tarea se muestra en la pestaña **Detalles** de la [ventana de la tarea](../tasks#task-window).

## Seguridad {#security}

- Los runners se conectan al servidor, nunca al contrario, por lo que un runner puede estar detrás de un NAT o en una red privada.
- Cada petición de un runner se autentica con su token. Revoque un runner eliminándolo o deshabilitándolo.
- Use HTTPS entre los runners y el servidor; consulte [Seguridad de la red](/admin-guide/security/network).
