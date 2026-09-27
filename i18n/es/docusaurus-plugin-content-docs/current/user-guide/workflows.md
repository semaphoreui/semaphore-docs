---
title: "Flujos de trabajo"
sidebar_custom_props:
  edition: pro
---

# Flujos de trabajo <Pro />

Los flujos de trabajo permiten encadenar varias plantillas de tareas en un grafo dirigido (DAG) con
ramificaciones, aprobaciones y pausas temporizadas. Una ejecución de flujo de trabajo avanza automáticamente
a medida que termina cada paso: el grafo se diseña una sola vez en el editor visual y después
se lanzan ejecuciones desde la página Flujos de trabajo.

:::info
Los flujos de trabajo son una funcionalidad de **Semaphore Pro**. El elemento de menú Flujos de trabajo aparece solo
cuando su suscripción los incluye.
:::

## Descripción general {#overview}

Un flujo de trabajo consta de:

- **Nodos**: pasos del grafo (ejecutar una plantilla, esperar una aprobación, hacer una pausa de
  un retardo o anotar con una nota).
- **Aristas**: conexiones entre nodos, cada una etiquetada con una **condición** que
  controla cuándo se inicia el nodo descendente.

Al iniciar un flujo de trabajo, Semaphore crea una **ejecución de flujo de trabajo**. El servidor
dirige la progresión: a medida que las tareas terminan, las aprobaciones se resuelven o los retardos expiran,
los nodos descendentes se lanzan según las condiciones de las aristas.

## Crear un flujo de trabajo {#creating-a-workflow}

1. Abra su proyecto y vaya a **Flujos de trabajo**.
2. Haga clic en **Nuevo flujo de trabajo**.
3. Añada el primer nodo: haga clic en un tipo de la **Paleta**, arrástrelo al lienzo o
   use el botón **+** de la esquina superior derecha del lienzo.
4. Pase el cursor sobre un nodo y haga clic en el asa **+** de su puerto de salida para
   añadir el siguiente paso. El nuevo nodo se coloca a la derecha y se conecta con una
   arista **On success**. También puede conectar nodos arrastrando desde un puerto de
   salida hasta un puerto de entrada.
5. Haga clic en un nodo para editarlo en el **panel de propiedades** de la derecha: tipo de
   nodo, plantilla de tarea y parámetros de tarea, tiempo de espera y mensaje de aprobación,
   duración del retardo, convergencia.
6. Haga clic en la **píldora de condición** en el centro de una arista para cambiar su
   condición, o pase el cursor sobre ella y haga clic en **×** para eliminar la arista.
7. Defina un **nombre** (y opcionalmente una **versión inicial** para el versionado de
   ejecuciones).
8. Corrija los problemas listados en el chip **Problemas** de la barra de herramientas y
   luego haga clic en **Guardar**.

![Editor de flujos de trabajo](/assets/workflow-editor.webp)

El editor valida el grafo mientras trabaja. Los nodos con algún problema muestran una
insignia de advertencia, y el chip de la barra de herramientas enumera todos los problemas;
haga clic en uno para seleccionar el nodo. Un flujo de trabajo válido debe tener al menos
un nodo, exactamente un nodo inicial (sin aristas entrantes), ningún ciclo y una
configuración completa en cada nodo ejecutable. **Guardar** permanece deshabilitado hasta
que el grafo sea válido.

![Menú de adición rápida](/assets/workflow-editor-quick-add.webp)

### Controles del editor {#editor-controls}

El lienzo se puede desplazar y ampliar con el ratón, un trackpad, los botones de la
esquina inferior izquierda o el teclado. Los atajos de teclado funcionan mientras el
lienzo tiene el foco: haga clic primero en un espacio vacío del lienzo o pulse
<kbd>Tab</kbd> hasta que el lienzo quede enfocado. A continuación, <kbd>Tab</kbd> recorre
los nodos; <kbd>Enter</kbd> sobre un nodo lo selecciona y abre su panel de propiedades (en
la vista de la ejecución abre el registro de la tarea). La misma navegación funciona en la
vista de la ejecución.

| Acción | Ratón | Trackpad | Botones | Teclado |
|--------|-------|----------|---------|---------|
| Desplazar (mover el lienzo) | Arrastre un espacio vacío, o desplácese con la rueda (vertical) y <kbd>Shift</kbd>+rueda (horizontal) | Desplazamiento con dos dedos en cualquier dirección | — | <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd>; mantenga <kbd>Shift</kbd> para pasos más grandes |
| Acercar / alejar | <kbd>Ctrl</kbd>+rueda (<kbd>Cmd</kbd>+rueda en macOS); hace zoom hacia el puntero | Pinzar | **+** / **−** | <kbd>+</kbd> / <kbd>−</kbd> |
| Ajustar todo el grafo a la pantalla | — | — | **ajustar vista** | <kbd>0</kbd> |
| Restablecer el zoom al 100 % | — | — | — | <kbd>1</kbd> |
| Organizar los nodos automáticamente | — | — | **ordenar** | — |

El editor ajusta el grafo a la pantalla al abrirse. El nivel de zoom actual se muestra
debajo de los botones. Los nodos se alinean a una cuadrícula de 20 px al moverlos.

| Acción de edición | Cómo |
|-------------------|------|
| Añadir un nodo | Asa **+** de un nodo, clic o arrastre desde la paleta, el botón **+** de la esquina superior derecha o clic derecho en un espacio vacío del lienzo. |
| Conectar nodos | Arrastre desde el puerto de salida de un nodo (borde derecho) hasta el puerto de entrada de otro nodo (borde izquierdo). |
| Cambiar la condición de una arista | Haga clic en la píldora de condición de la arista y elija una condición. |
| Eliminar el nodo o la arista seleccionados | <kbd>Delete</kbd> (<kbd>Cmd</kbd>+<kbd>Backspace</kbd> en macOS), el botón de eliminar del panel de propiedades o **×** en la píldora de una arista al pasar el cursor sobre ella. |
| Deshacer / rehacer | <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> (<kbd>Cmd</kbd> en macOS) o las flechas de la barra de herramientas. Hasta 50 pasos. |
| Deseleccionar | <kbd>Esc</kbd> cierra el panel de propiedades y borra la selección. |

Al salir del editor con cambios sin guardar se pide confirmación. El punto en el botón
**Guardar** indica que el grafo difiere de la versión guardada.

## Tipos de nodos {#node-kinds}

| Tipo | Propósito |
|------|---------|
| **Tarea** | Ejecuta una plantilla de tarea. Puede sobrescribir los parámetros de la plantilla (inventory, entorno, limit de Ansible, argumentos CLI adicionales) por nodo mediante los **parámetros de tarea**. |
| **Aprobación** | Pausa la ejecución hasta que un usuario con permiso la aprueba o la rechaza. Opcionalmente, defina un tiempo de espera (segundos) y un mensaje de aprobación. |
| **Retardo** | Espera el número de segundos configurado antes de continuar con los nodos descendentes. Útil para periodos de enfriamiento, ventanas de mantenimiento o para espaciar pasos dependientes. |
| **Nota** | Anotación de formato libre en el lienzo. Los nodos de nota no se ejecutan ni se conectan mediante aristas: sirven únicamente como documentación. |

### Convergencia {#convergence}

Los nodos con varias aristas entrantes pueden requerir que terminen **todos** los nodos ascendentes
(predeterminado) o **cualquiera** de ellos. Defina **Convergencia** en el panel de propiedades del nodo.

### Nodos de retardo {#delay-nodes}

Un nodo de retardo pausa la ejecución del flujo de trabajo durante la duración configurada (mínimo 1
segundo). Mientras espera:

- La ejecución permanece en estado **running**.
- La vista de la ejecución muestra una cuenta atrás en directo en el nodo de retardo.
- Los nodos descendentes conectados mediante aristas no se inician hasta que el retardo termina.

Si la ejecución del flujo de trabajo se **detiene** mientras un retardo está activo, el retardo se
cancela y la ejecución finaliza en estado **stopped**.

### Nodos de aprobación {#approval-nodes}

Cuando la ejecución llega a un nodo de aprobación, el estado de la ejecución cambia a
**approval** hasta que alguien la aprueba o la rechaza. La tarjeta de aprobación de la vista
de la ejecución muestra el mensaje de aprobación con los botones **Aprobar** y **Rechazar**
para los usuarios que pueden ejecutar tareas en el proyecto. Una aprobación rechazada hace
fallar el nodo, y la ejecución continúa por las aristas **On failure** o **Always**.

## Condiciones de las aristas {#edge-conditions}

Cada arista tiene una condición que determina cuándo el nodo descendente pasa a estar listo:

| Condición | El nodo descendente se inicia cuando el nodo ascendente… |
|-----------|-------------------------------------------|
| **On success** | Termina correctamente (predeterminado). |
| **On failure** | Termina con un error. |
| **Always** | Termina en cualquier estado final (éxito o fallo). |

Use ramas **On failure** para acciones de compensación o notificaciones. Use
**Always** cuando el siguiente paso deba ejecutarse independientemente del resultado.

## Ejecución y supervisión {#running-and-monitoring}

- **Ejecutar flujo de trabajo**: inicia una nueva ejecución desde la lista de Flujos de trabajo.
- **Vista de la ejecución**: el mismo grafo que en el editor, en modo de solo lectura, con el
  estado en directo de cada nodo. Un icono de estado en la esquina de la tarjeta muestra
  éxito, fallo, en ejecución, en espera de aprobación o la cuenta atrás de un retardo; el
  subtítulo muestra la duración. Los nodos que aún no se han iniciado aparecen atenuados, y
  la arista que lleva a un nodo en ejecución está animada.
- **Registro de la tarea**: haga clic en un nodo de tarea que ya se haya iniciado para abrir
  su registro de tarea.
- **Detener**: mientras una ejecución está en `running` o `approval`, los usuarios con
  `run_project_tasks` pueden detenerla. Se detienen todas las tareas activas, las aprobaciones
  pendientes se rechazan y la ejecución se marca como **stopped**.

![Vista de la ejecución del flujo de trabajo](/assets/workflow-run.webp)

![Aprobación pendiente en la vista de la ejecución](/assets/workflow-run-approval.webp)

Estados de la ejecución: `running`, `approval`, `success`, `failed`, `stopped`.

## Versionado de ejecuciones {#run-versioning}

Defina la **Versión inicial** en el flujo de trabajo (por ejemplo `1.0.0`) para activar las etiquetas de
versión en cada ejecución. Semaphore incrementa la versión en las ejecuciones sucesivas, de forma similar
a las plantillas de compilación.

## Artefactos del flujo de trabajo (set_stats) {#workflow-artifacts-set_stats}

Cuando una tarea de Ansible en un flujo de trabajo usa `set_stats`, las variables se almacenan como
**artefactos del flujo de trabajo** para esa ejecución. Los nodos de tarea descendentes de la misma ejecución
los reciben automáticamente como variables adicionales.

:::warning
Si los pasos del flujo de trabajo se ejecutan en **runners remotos**, los artefactos del flujo de trabajo todavía no
fluyen entre pasos de runners remotos: solo se pasan entre tareas ejecutadas
localmente en el servidor Semaphore. Planifique el traspaso de artefactos en consecuencia o mantenga
los pasos que producen y consumen artefactos en la misma ruta de ejecución.
:::

## Permisos {#permissions}

- Gestionar flujos de trabajo (crear, editar, eliminar) requiere permisos de gestión de recursos
  del proyecto.
- Ejecutar flujos de trabajo requiere `run_project_tasks`.
- Resolver aprobaciones requiere el acceso adecuado al proyecto (los mismos usuarios que pueden ejecutar
  tareas en el proyecto).

## API {#api}

Las plantillas y ejecuciones de flujos de trabajo están disponibles en
`/api/project/{project_id}/workflows`. Consulte la
[documentación de la API](/reference/api) para ver los esquemas de petición y respuesta, incluidos
los campos del nodo `delay` (`delay_seconds`) y el endpoint de detención
(`POST …/runs/{run_id}/stop`).
