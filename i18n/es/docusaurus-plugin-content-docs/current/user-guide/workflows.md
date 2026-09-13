# Flujos de trabajo (Pro)

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
3. En el editor gráfico:
   - Arrastre nodos desde la paleta al lienzo.
   - Conecte nodos arrastrando desde el conector de salida de un nodo hasta otro.
   - Haga clic en un nodo o arista para editar sus propiedades en el panel lateral.
4. Defina un **nombre** (y opcionalmente una **versión inicial** para el versionado de ejecuciones).
5. Corrija los problemas listados en el panel **Problemas** y luego haga clic en **Guardar**.

![Editor de flujos de trabajo](/assets/workflow-editor.webp)

El editor valida el grafo antes de guardar. Un flujo de trabajo válido debe tener al menos
un nodo, exactamente un nodo inicial (sin aristas entrantes), ningún ciclo y una
configuración completa en cada nodo ejecutable.

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

Cuando la ejecución llega a un nodo de aprobación, el estado cambia a **approval** hasta que
alguien la aprueba o la rechaza. Los controles Aprobar/Rechazar aparecen en la vista de la ejecución.
Las aprobaciones rechazadas hacen fallar la ejecución según las condiciones de las aristas conectadas.

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
- **Vista de la ejecución**: grafo a pantalla completa con el estado en directo de cada nodo (running, success,
  failed, approval, cuenta atrás del retardo).
- **Detener**: mientras una ejecución está en `running` o `approval`, los usuarios con
  `run_project_tasks` pueden detenerla. Se detienen todas las tareas activas, las aprobaciones
  pendientes se rechazan y la ejecución se marca como **stopped**.

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
