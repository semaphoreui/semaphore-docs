---
title: Agentes de IA
description: Cómo crear una plantilla de agente Claude Code o Codex, su prompt y las expresiones del prompt, la clave de API, los servidores MCP, los argumentos de la CLI y el registro de la tarea.
---

# Agentes de IA

Con Semaphore UI puede ejecutar agentes de programación de IA: [Claude Code](https://docs.claude.com/en/docs/claude-code/overview) y [Codex](https://developers.openai.com/codex/cli). Una plantilla de agente inicia la herramienta de línea de comandos del agente en un directorio de un repositorio y le entrega un prompt. El agente trabaja por su cuenta, sin nadie que responda a sus preguntas, e informa de lo que hace en el registro de la tarea.

Use una plantilla de agente para el trabajo que, de otro modo, describiría a un compañero: revisar el último commit, encontrar y corregir una prueba que falla, actualizar una dependencia y abrir un pull request. Como cualquier otra plantilla, puede iniciarse a mano, mediante una [programación](/user-guide/schedules), una [integración](/user-guide/integrations) o un [flujo de trabajo](/user-guide/workflows).

## Antes de empezar {#before-you-begin}

- **La herramienta de línea de comandos del agente está instalada** en la máquina que ejecuta las tareas: el servidor de Semaphore o el [runner](/admin-guide/runners).

  | Aplicación | ID | Comando | Instalación |
  |---|---|---|---|
  | Claude Code Agent | `claude` | `claude` | `npm install -g @anthropic-ai/claude-code` |
  | Codex Agent | `codex` | `codex` | `npm install -g @openai/codex` |

  Semaphore habilita una aplicación cuando encuentra su comando en el `PATH` al arrancar. Un administrador también puede habilitarla y establecer la ruta al ejecutable en la página [Aplicaciones](/user-guide/apps#managing-applications).
- **Una clave de API** del proveedor del modelo, consulte [Clave de API](#api-key).
- **Un repositorio** en el que trabaja el agente, añadido a [Repositorios](/user-guide/repositories).

## Crear una plantilla {#create-a-template}

1. Vaya a la sección **Plantillas de tareas**, haga clic en **Nueva plantilla** y luego en **Claude Code Agent** o **Codex Agent**.

![El menú Nueva plantilla con los elementos Claude Code Agent y Codex Agent](/assets/agent-template-new.webp)

2. Configure la plantilla.

![El editor de una plantilla Claude Code Agent](/assets/agent-template-editor.webp)

La plantilla le permite especificar los siguientes parámetros:

| Campo | Descripción |
|---|---|
| **Repositorio** | El repositorio en el que trabaja el agente. Semaphore lo clona o lo actualiza antes de la tarea, como con cualquier otra plantilla. |
| **Subdirectory path** | Opcional. El directorio del repositorio en el que se inicia el agente. Si se omite, el agente se inicia en la raíz del repositorio. |
| **Servidores MCP** | Opcional. Un inventario MCP con los servidores cuyas herramientas puede invocar el agente, consulte [Servidores MCP](#mcp-servers). |
| **Grupos de variables** | Variables y secretos para el agente: la clave de API, los valores para las [expresiones del prompt](#prompt-expressions) y las variables de entorno del proceso del agente. |
| **Prompt** | La instrucción con la que se ejecuta el agente, consulte [Prompt](#prompt). |
| **CLI args** | Argumentos adicionales para el comando del agente, consulte [Argumentos de la CLI](#cli-arguments). |
| **Variables de encuesta** | Preguntas que se formulan al iniciar la tarea. Las respuestas pueden insertarse en el prompt. |
| Casilla **Prompt** | Bajo **Claude Code prompts** o **Codex prompts**. Permite que quien inicia una tarea sustituya el prompt, consulte [Prompt de una tarea](#prompt-of-a-task). |

3. Haga clic en **Guardar** y, a continuación, ejecute la plantilla con el botón **Ejecutar**.

## Clave de API {#api-key}

El agente toma su clave de API de una variable de entorno. Añada la clave a un [grupo de variables](/user-guide/environment) de la plantilla como **variable de entorno secreta**:

| Aplicación | Variable | También se acepta |
|---|---|---|
| Claude Code Agent | `ANTHROPIC_API_KEY` | `CLAUDE_CODE_OAUTH_TOKEN` |
| Codex Agent | `OPENAI_API_KEY` | `CODEX_API_KEY` |

No se usa el inicio de sesión del usuario que ejecuta Semaphore: cada tarea recibe su propio directorio de configuración del agente, vacío, de modo que una clave de un grupo de variables es la única forma de autenticarse.

Si no está definida ninguna de las variables, el registro de la tarea indica cuál hay que añadir, y a continuación el propio agente falla con su propio error:

```
No API key for claude: add ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN as a secret of the template's Variable Group
```

## Prompt {#prompt}

El prompt es lo que usted escribiría al agente: texto sin formato, tan largo como haga falta. Se pasa al agente por su entrada estándar, por lo que no aparece en la lista de procesos.

El prompt es obligatorio, salvo que la casilla **Prompt** permita que una tarea aporte el suyo.

### Expresiones del prompt {#prompt-expressions}

El prompt de una plantilla puede tomar valores de los grupos de variables de la plantilla. Escriba una expresión entre llaves dobles, como en GitHub Actions, y Semaphore la sustituye cuando se inicia la tarea:

| Expresión | Valor |
|---|---|
| `${{ vars.extra.NAME }}` | Una variable extra de un grupo de variables. |
| `${{ vars.env.NAME }}` | Una variable de entorno de un grupo de variables. |
| `${{ secrets.extra.NAME }}` | Una variable extra secreta de un grupo de variables. |
| `${{ secrets.env.NAME }}` | Una variable de entorno secreta de un grupo de variables. |

```text
Find the flaky tests in services/api and fix them.
Open a pull request against ${{ vars.extra.base_branch }} and post its link
to ${{ vars.env.TRACKER_URL }} with the token ${{ secrets.env.TRACKER_TOKEN }}.
```

Las reglas:

- **Las variables de encuesta** son variables extra: la respuesta a la variable de encuesta `version` es `${{ vars.extra.version }}`, y una secreta es `${{ secrets.extra.NAME }}`. Una variable de encuesta que se entrega como variable de entorno está, en cambio, bajo `env`. Una variable de encuesta sin responder da una cadena vacía.
- **Una variable que no existe hace fallar la tarea** antes de que el agente se inicie, con un mensaje que nombra la expresión. Semaphore no ejecuta un agente con un hueco en su prompt.
- **Una expresión mal escrita se rechaza al guardar la plantilla**: `${{ secrets.TOKEN }}` no tiene `extra` ni `env`.
- **Las demás expresiones se dejan tal cual.** Solo `vars.…` y `secrets.…` pertenecen a Semaphore, de modo que un prompt puede pedir al agente que escriba un flujo de trabajo que contenga `${{ github.sha }}`. Para conservar una expresión `vars` o `secrets` como texto, anteponga un signo de dólar más: `$${{ secrets.env.NAME }}`.
- **Un valor se inserta tal cual.** Una cadena se usa como está escrita; una lista o un objeto, como JSON. En un valor no se vuelven a buscar expresiones.
- **Un secreto insertado en el prompt se enmascara** en el registro de la tarea, allí donde el agente lo repita.

:::warning

Un secreto en el prompt se envía al proveedor del modelo junto con el resto del prompt, y el agente puede usarlo de cualquier forma que el prompt permita. Es preferible dar el secreto a las herramientas del agente: como variable de entorno secreta de un grupo de variables o como token de un [servidor MCP](#mcp-servers).

:::

### Prompt de una tarea {#prompt-of-a-task}

Con la casilla **Prompt** activada, el formulario de la tarea muestra el prompt de la plantilla y le permite cambiarlo para una ejecución. Una programación, una integración o un paso de un flujo de trabajo pueden tener un prompt propio de la misma manera. A través de la API, envíelo en los parámetros de la tarea:

```json
{
  "template_id": 12,
  "params": {
    "prompt": "Review the changes of the last release and list the risky ones."
  }
}
```

Un prompt proporcionado por una tarea se usa exactamente como está escrito: **las expresiones del prompt solo se sustituyen en el prompt almacenado en la plantilla**. Así, las variables y los secretos del proyecto quedan fuera del alcance de quien solo puede ejecutar tareas. Si la plantilla no lo permite, se rechaza la tarea que aporta un prompt.

## Servidores MCP {#mcp-servers}

Un agente puede invocar las herramientas de servidores [MCP](https://modelcontextprotocol.io) remotos: un gestor de incidencias, un buscador de documentación, su propio servicio. Los servidores se guardan en un inventario de tipo **MCP Inventory**, y un mismo inventario sirve tanto para plantillas de Claude Code como de Codex.

1. Vaya a la sección **Inventario**, haga clic en **Nuevo inventario** y luego en **MCP Inventory**.
2. Añada los servidores y haga clic en **Guardar**.
3. Seleccione el inventario en el campo **Servidores MCP** de la plantilla.

![El formulario de un inventario MCP con tres servidores](/assets/agent-mcp-inventory.webp)

| Campo | Descripción |
|---|---|
| Interruptor | Un servidor desactivado permanece en la lista y no se entrega al agente. |
| **Nombre** | El nombre con el que el agente conoce el servidor: hasta 64 letras, dígitos, `-` y `_`. Se muestra en el registro de la tarea antes del nombre de una herramienta. |
| **URL** | Una dirección `http` o `https` de un servidor que habla MCP por HTTP o SSE. No se acepta un nombre de usuario ni una contraseña en la URL. |
| **Token** | Opcional. El agente lo envía en el encabezado `Authorization` como token bearer. |

Un token guardado se almacena cifrado y no vuelve a mostrarse: escriba uno nuevo para reemplazarlo o elimínelo con el aspa. El token llega al agente como variable de entorno de su proceso; no se escribe en el archivo de configuración del agente, ni en la línea de comandos, ni en el registro de la tarea.

Las herramientas de los servidores seleccionados se aprueban de antemano, ya que no hay nadie para confirmar una llamada. El agente recibe exactamente estos servidores: no se usan los servidores MCP configurados para el usuario que ejecuta Semaphore.

## Argumentos de la CLI {#cli-arguments}

Los **CLI args** se añaden al comando del agente después de los argumentos que establece el propio Semaphore. Introduzca cada token como un argumento independiente:

```json
["--model", "claude-sonnet-5-5"]
```

Úselos para lo que ofrece la propia línea de comandos del agente: el modelo, los límites, los permisos. El agente se ejecuta de forma desatendida, por lo que una herramienta que pediría una confirmación se rechaza; qué herramientas puede usar un agente sin preguntar se define con sus argumentos. Consulte la [referencia de la CLI de Claude Code](https://docs.claude.com/en/docs/claude-code/cli-reference) y la [referencia de la CLI de Codex](https://developers.openai.com/codex/cli/reference) para conocer las opciones de su versión.

Con **CLI args** activado bajo **Prompts**, una tarea puede añadir sus propios argumentos.

Las variables y los secretos de los grupos de variables no se añaden a la línea de comandos de un agente, donde la lista de procesos los mostraría. Las variables de entorno y las variables de entorno secretas se pasan al proceso del agente.

## Cómo se ejecuta el agente {#how-the-agent-runs}

Semaphore inicia el agente en el directorio del repositorio, o en su **Subdirectory path**, con el prompt en la entrada estándar:

| Aplicación | Comando |
|---|---|
| Claude Code Agent | `claude -p --output-format=stream-json --verbose --include-partial-messages --mcp-config=<file> --strict-mcp-config --no-session-persistence [--allowedTools=mcp__<server>__*,…] <CLI args>` |
| Codex Agent | `codex exec --json --skip-git-repo-check <CLI args> -` |

- **Cada tarea tiene su propio directorio de configuración** del agente (`CLAUDE_CONFIG_DIR`, `CODEX_HOME`), creado para la tarea y eliminado al terminar. Los ajustes, los inicios de sesión y los servidores MCP del usuario que ejecuta Semaphore no llegan al agente, y una variable de un grupo de variables no puede redirigir el directorio.
- **No se conserva nada entre tareas**: cada ejecución es una sesión nueva del agente. Lo que deba sobrevivir a una ejecución va en el repositorio: un commit, un pull request, un archivo.
- **El agente lee los archivos de instrucciones del repositorio** que su herramienta de línea de comandos lee por sí misma en el directorio de trabajo, como `CLAUDE.md` o `AGENTS.md`.
- **En los runners de Docker y Kubernetes** el agente se ejecuta en un contenedor, por lo que la [imagen del ejecutor](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners) debe contener el comando `claude` o `codex`.

## Registro de la tarea {#task-log}

El registro de la tarea muestra el trabajo del agente a medida que ocurre:

![El registro de una tarea de Claude Code: el modelo, las llamadas a herramientas, un subagente, el resumen](/assets/agent-task-log.webp)

- **Texto** del agente, línea a línea. Codex imprime un mensaje cuando está completo.
- **Llamadas a herramientas**, cada una en una fila: el estado, el servidor MCP y la herramienta, los argumentos. Haga clic en una fila para ver los argumentos y el resultado. Una llamada fallida aparece desplegada desde el principio.
- **Subagentes**: las filas de un subagente están marcadas con su nombre.
- **La primera fila** de una ejecución de Claude Code indica el modelo y los servidores MCP, con los que no se conectaron en rojo.
- **El resumen** al final: el número de turnos, la duración, los tokens y el coste, en la medida en que el agente los comunique.

**Raw log** muestra el mismo registro como texto sin formato.

## Seguridad {#security}

- **Un agente ejecuta comandos.** Dentro de los permisos que le da su herramienta de línea de comandos, el agente puede leer y modificar el directorio del repositorio, ejecutar programas como el usuario que ejecuta las tareas e invocar las herramientas de sus servidores MCP. Dé a una plantilla de agente el acceso que daría a un script escrito por otra persona: un repositorio y tokens con los permisos más restringidos que basten para el trabajo, y un [runner](/admin-guide/runners) aparte para el trabajo que quiera mantener separado del servidor.
- **El prompt y lo que el agente lee van al proveedor del modelo**: los archivos del repositorio, la salida de los comandos, los resultados de las herramientas.
- **Un repositorio puede dar instrucciones al agente.** El texto de los archivos que el agente lee, de una incidencia o del resultado de una herramienta puede cambiar lo que hace el agente. No dirija un agente con tokens potentes hacia contenido que usted no controla.
- **Los tokens y los secretos se enmascaran en el registro de la tarea**: los tokens de los servidores MCP y los secretos insertados en el prompt se sustituyen por `********`.
- **Solo el prompt almacenado en la plantilla puede usar variables y secretos**, consulte [Prompt de una tarea](#prompt-of-a-task).
