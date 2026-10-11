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

## Salidas y entradas {#outputs-and-inputs}

Un nodo de tarea puede entregar datos estructurados a los nodos que le siguen. La tarea
**produce salidas**: un objeto JSON de valores con nombre, que se almacena con la tarea cuando
termina correctamente. Una conexión hacia el siguiente nodo de tarea **entrega entradas**: rellena
las variables de encuesta de la plantilla de ese nodo a partir de las salidas del nodo anterior.
No se pasan archivos, solo valores.

### Producir salidas {#producing-outputs}

Cada tarea iniciada por una ejecución de flujo de trabajo recibe la variable de entorno
`SEMAPHORE_OUTPUTS_FILE`: la ruta de un archivo vacío creado solo para esa tarea. Lo que la tarea
escriba allí como objeto JSON se convierte en sus salidas.

| Aplicación | Cómo se producen las salidas |
|-----|--------------------------|
| **Ansible** | `ansible.builtin.set_stats` con `per_host: false` (el valor predeterminado). El plugin de callback incluido `semaphore_outputs` escribe en el archivo las estadísticas agregadas de la ejecución; las estadísticas por host no son salidas. |
| **Terraform, OpenTofu, Terragrunt** | Se capturan automáticamente de `output -json` tras una ejecución correcta. Un valor que la propia tarea escribió en el archivo prevalece sobre una salida capturada con el mismo nombre. |
| **Bash, Python, PowerShell, Pulumi** | El script escribe el archivo. |

```bash
# Bash: escribir el archivo de salidas
cat > "$SEMAPHORE_OUTPUTS_FILE" <<EOF
{"image_tag": "1.4.2", "replicas": 3, "subnet_ids": ["subnet-1", "subnet-2"]}
EOF
```

```yaml
# Ansible: set_stats se convierte en salidas
- name: Publish the image tag for the next nodes
  ansible.builtin.set_stats:
    data:
      image_tag: "{{ built_tag }}"
```

Reglas:

- Las salidas solo se leen cuando la tarea **termina correctamente**. Una tarea fallida o detenida
  no tiene ninguna, por lo que una rama **On failure** no recibe nada del nodo que falló.
- Los nombres de las salidas deben coincidir con `^[A-Za-z_][A-Za-z0-9_-]*$`. Un valor puede ser
  cualquier valor JSON: cadena, número, booleano, lista u objeto.
- Límites: el archivo ocupa como máximo 256 KB, con un máximo de 100 salidas de 32 KB como máximo
  cada una.
- Un archivo ausente o vacío significa "sin salidas". Un archivo que no es un objeto JSON, usa un
  nombre no válido o supera un límite **hace fallar la tarea**, con el motivo en su registro.
- Las salidas de Terraform que no se pueden almacenar (marcadas como `sensitive`, demasiado
  grandes, con un nombre no válido o por encima de los límites) se omiten y se listan en el
  registro de la tarea y en el panel **Salidas** (Outputs) de la tarea como **No capturadas** (Not captured). Nunca hacen
  fallar la tarea.

### Entregar entradas {#delivering-inputs}

Haga clic en una conexión que termine en un nodo de tarea: su panel lateral tiene una sección
**Entradas** (Inputs).

- **Por nombre** (predeterminado). Cada salida del nodo de origen cuyo nombre coincide con una
  variable de encuesta de la plantilla de destino rellena esa variable. Las salidas sin variable
  coincidente se ignoran; una salida de Terraform con guiones nunca es un nombre de variable
  válido, por lo que no se entrega.
- **Asignar entradas explícitamente** (Map inputs explicitly)**.** Marque la casilla para entregar solo los pares que indique:
  una variable de encuesta de la plantilla de destino y la clave de salida que la alimenta. Una
  lista vacía no entrega nada. Cuando el flujo de trabajo tiene una ejecución finalizada, el panel
  sugiere las claves que produjo esa ejecución y señala las claves que no se capturaron.

Una variable que ninguna conexión rellena toma el valor definido en el nodo y, si no lo hay, el
valor predeterminado de la variable. Una variable **obligatoria** que queda sin valor hace fallar
la tarea del nodo antes de que se inicie, con una línea de registro que nombra la variable, de
modo que la ejecución sigue sus aristas **On failure**.

Los valores se convierten al tipo de la variable: una variable `int` acepta un número o una cadena
de dígitos, una variable `enum` o `select` solo acepta sus propias opciones y una variable `string`
o `text` acepta cualquier cosa (un objeto o una lista llega como JSON compacto). Un valor que no
encaja se ignora, con el motivo en el registro de la tarea, y se aplica el valor de reserva.

**Los nodos de aprobación y de retardo** dejan pasar las salidas: `task → approval → task` sigue
entregando datos, y se aplica el modo de la última conexión.

**Varias conexiones hacia un mismo nodo.** Contribuye cada conexión cuyo origen terminó
correctamente. Cuando dos de ellas rellenan la misma variable, una asignación explícita prevalece
sobre una entrega por nombre; entre dos del mismo tipo gana la conexión creada primero, de modo
que una ejecución da siempre el mismo resultado. El registro de la tarea indica cuál ganó.

![The connection panel in by-name mode: matched survey variables are ticked](/assets/workflow-inputs-by-name.webp)

![The connection panel with explicit mapping: one output key per survey variable](/assets/workflow-inputs-explicit.webp)

### Dónde verlas {#where-to-see-outputs}

- La **vista de la ejecución** muestra una insignia *N salidas* (N outputs) en cada nodo que produjo alguna.
- El **diálogo de la tarea** tiene una tabla **Salidas** con los valores y la lista *No capturadas*.
- El registro de una tarea alimentada por una conexión empieza con una línea por variable, como
  `Input "image_tag" <- output "image_tag" of node 3 (task #41)`, de modo que el origen de cada
  valor aparece una línea por encima del propio valor.

![Run view: nodes that produced outputs carry a badge](/assets/workflow-run-outputs.webp)

<div class="DialogScreenshot" style={{maxWidth: 1000}}>
![Task dialog, Details tab: the Outputs table](/assets/task-outputs.webp)
</div>

### Limitaciones {#outputs-limitations}

- Las salidas se almacenan y se muestran en texto plano a cualquiera que pueda ver la tarea.
  **No pase secretos a través de las salidas.** Una variable de encuesta de tipo `secret` no puede
  rellenarse mediante una conexión.
- Las salidas son valores, nunca código: Ansible las recibe como cadenas literales y una expresión
  Jinja2 dentro de un valor no se evalúa.
- Las tareas en runners remotos producen y reciben salidas igual que las tareas en el servidor.
  Las tareas ejecutadas por el executor **Docker** o **Kubernetes** de un runner todavía no
  producen salidas; su registro lo indica.

## Variables de entorno {#environment-variables}

Una tarea iniciada por un flujo de trabajo recibe, además de las
[variables que recibe cada tarea](./tasks#environment-variables):

| Variable | Valor |
| --- | --- |
| `SEMAPHORE_WORKFLOW_ID` | ID del flujo de trabajo |
| `SEMAPHORE_WORKFLOW_RUN_ID` | ID de la ejecución actual |
| `SEMAPHORE_WORKFLOW_URL` | Enlace a la página de la ejecución, por ejemplo `https://semaphore.example.com/project/1/workflows/7/runs/42` (requiere `web_host` en la configuración del servidor) |
| `SEMAPHORE_OUTPUTS_FILE` | Ruta del archivo en el que la tarea escribe sus [salidas](#producing-outputs) |

Estas variables se establecen para todas las aplicaciones, incluidas Ansible y Terraform, y llegan a las tareas que se ejecutan en runners remotos.

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
los campos del nodo `delay` (`delay_seconds`), `input_mode` e `input_mappings` en las aristas,
el documento `artifacts` de cada tarea en los detalles de la ejecución (`GET …/runs/{run_id}`) y el
endpoint de detención (`POST …/runs/{run_id}/stop`).
