# Integraciones

Una integración inicia una plantilla de tarea cuando un servicio externo llama a una URL de Semaphore. Quien llama puede ser GitHub, GitLab, Bitbucket, un sistema de monitorización o cualquier programa capaz de enviar una petición HTTP. La petición no solo dispara la ejecución: partes de ella —un nombre de rama, un commit, una etiqueta de versión— pueden llevarse a la tarea como variables.

![Lista de integraciones](/assets/integrations-list.webp)

Cada integración tiene cuatro piezas:

| Pieza | Responde a la pregunta |
|---|---|
| **Alias** | ¿A qué URL llama el remitente? |
| **Método de autenticación** | ¿Tiene esta petición permiso para iniciar algo? |
| **Matchers** | ¿Es *esta* la petición que la integración espera? |
| **Extractores de valores** | ¿Qué campos de la petición llegan a la tarea, y como qué? |

Para crear una, abra **Integrations** en el menú del proyecto y pulse **New Integration**: póngale un nombre, elija la plantilla de tarea que ejecuta y el método de autenticación. Después pulse la integración en la lista para configurar su alias, sus matchers y sus extractores de valores.

![Detalles de una integración](/assets/integration-detail.webp)

## Cómo se procesa una llamada {#how-a-call-is-handled}

1. El remitente llama a `/api/integrations/<alias>` con `GET` o `POST`.
2. Semaphore resuelve el alias a las integraciones que puede iniciar. El endpoint es público: solo el alias y el método de autenticación lo protegen.
3. Cada una de esas integraciones comprueba la petición con su propio **método de autenticación**. Una petición que no pasa la comprobación no inicia nada.
4. Si la llamada llegó por un **alias de proyecto**, se evalúan los **matchers** de la integración. Todos deben coincidir; si no, la integración se omite.
5. Se ejecutan los **extractores de valores**, que convierten partes de la petición en variables y parámetros de la tarea.
6. La tarea se crea y se pone en cola, exactamente igual que si alguien hubiera iniciado la plantilla a mano.

Una llamada procesada recibe `204 No Content` con el cuerpo vacío, se haya iniciado algo o no. Lo que se ha iniciado se indica en las cabeceras de respuesta:

| Cabecera de respuesta | Valor |
|---|---|
| `X-Semaphore-Task-ID` | La tarea creada |
| `X-Semaphore-Template-ID` | La plantilla que ejecuta |
| `X-Semaphore-Project-ID` | El proyecto al que pertenece la tarea |
| `X-Semaphore-Integration-ID` | La integración que la inició |
| `X-Semaphore-Inventory-ID` | El inventario de la tarea, cuando tiene uno |

Toda llamada a un alias conocido se escribe además en el [historial de llamadas](#call-history), que es donde hay que mirar cuando un webhook no hace lo que se espera.

## Alias {#aliases}

Un alias es la parte aleatoria e inadivinable de la URL del webhook: `/api/integrations/<random_string>`. Acepta `GET` y `POST`. Hay dos clases, y una integración usa solo una a la vez.

Un **alias de proyecto** se crea con **Add Alias** sobre la lista de integraciones y lo comparten todas las integraciones del proyecto que tienen activado el interruptor **Use project alias**. Una petición entrante se ofrece a todas, y cada una decide por sus matchers si se ejecuta. Es el alias que se entrega una vez a GitHub o GitLab para después repartir los eventos con matchers.

Un **alias de integración** se crea con **Add Alias** en la página de la propia integración y le pertenece solo a ella. Una llamada la inicia de inmediato: **los matchers no se evalúan en absoluto**. Úselo cuando el remitente esté dedicado a una sola tarea, o cuando el cuerpo venga en un formato que los matchers no pueden inspeccionar.

:::warning
El interruptor **Use project alias** de la página de la integración decide qué clase de alias funciona. Mientras está activado, la integración responde al alias de proyecto y sus propios alias se ignoran; mientras está desactivado, el alias de proyecto nunca llega a la integración y sus matchers nunca se usan.
:::

Un proyecto puede tener varios alias de ambas clases. Borrar uno con el icono de papelera que tiene al lado lo detiene al instante, mientras que las llamadas ya recibidas siguen en el historial.

## Autenticación {#authentication}

El endpoint del webhook no está detrás de un inicio de sesión, así que el método de autenticación es lo que impide que desconocidos lancen sus tareas. Elíjalo en el formulario de la integración; **Auth secret** es una clave del [almacén de claves](/user-guide/key-store).

| Método de autenticación | Qué comprueba Semaphore | Auth secret |
|---|---|---|
| **None** | Nada: cualquiera que conozca la URL puede iniciar la plantilla | — |
| **GitHub Webhooks** | `X-Hub-Signature-256` es igual a `sha256=` más el HMAC-SHA256 del cuerpo | Cadena, o la contraseña de una clave de usuario/contraseña |
| **Bitbucket Webhooks** | `X-Hub-Signature` del mismo modo | Cadena, o la contraseña de una clave de usuario/contraseña |
| **Token** | La cabecera indicada en **Auth header** es igual al secreto | Cadena, o la contraseña de una clave de usuario/contraseña |
| **HMAC** | La cabecera indicada en **Auth header** contiene el HMAC-SHA256 del cuerpo | Cadena, o la contraseña de una clave de usuario/contraseña |
| **HMAC (SHA-512)** | Lo mismo con HMAC-SHA512 | Cadena, o la contraseña de una clave de usuario/contraseña |
| **BasicAuth** | La cabecera `Authorization` lleva el usuario *y* la contraseña | Solo una clave de usuario/contraseña |

Una clave de tipo **Cadena** usa su valor como secreto compartido; una clave de usuario/contraseña usa su contraseña, y solo BasicAuth compara además el usuario. Una clave de un tipo que el método no puede usar hace que la petición se rechace, en lugar de pasar por alto la discrepancia.

### Autenticación HMAC {#hmac-authentication}

Los métodos de autenticación HMAC (`hmac` / SHA-256 y `hmac-sha512` / SHA-512) verifican que el cuerpo del webhook se firmó con un secreto compartido.

Configure:

1. **Auth header**: la cabecera de la petición que lleva la firma (por ejemplo `X-Signature` o `X-Hub-Signature-256`).
2. **Auth secret**: una clave de tipo **Cadena** del almacén de claves (su valor es el secreto) o unas credenciales de usuario/contraseña (su **contraseña** es el secreto).

El remitente debe poner en esa cabecera un resumen HMAC del cuerpo sin procesar en **hexadecimal puro** (sin el prefijo `sha256=` / `sha512=`; los métodos de GitHub y Bitbucket, en cambio, esperan ese prefijo, y los métodos HMAC no). Semaphore lo compara con el `HMAC-SHA256` o el `HMAC-SHA512` del cuerpo calculado con el secreto configurado.

Ejemplo (SHA-512) con OpenSSL:

```bash
SECRET='your-webhook-secret'
BODY='{"event":"deploy"}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "$SECRET" | awk '{print $2}')"

curl -X POST "https://semaphore.example.com/api/integrations/<alias>" \
  -H "Content-Type: application/json" \
  -H "X-Signature: ${SIG}" \
  --data "$BODY"
```

## Matchers {#matchers}

Un matcher es una condición sobre la petición entrante: *esta cabecera es igual a aquello*, *este campo JSON contiene aquello*. Los matchers son lo que permite que un único alias de proyecto sirva a muchas integraciones: GitHub envía todos sus eventos a la misma URL y los matchers deciden qué integración reacciona a cada evento.

Un matcher solo decide si la integración se ejecuta. Nunca modifica la tarea; de eso se encargan los extractores.

Los matchers se evalúan **solo para las llamadas que llegan por un alias de proyecto** (interruptor **Use project alias** activado). Una llamada al alias propio de una integración la inicia sin mirarlos.

### Campos de un matcher {#matcher-fields}

| Campo | Significado |
|---|---|
| **Name** | Una etiqueta para la lista. Texto libre, no participa en la comparación |
| **Match on** | **Body** o **Header**: de dónde sale el valor |
| **Body Data Format** | **JSON** o **String**, se muestra solo con **Body** |
| **Key** | El nombre de la cabecera, o la ruta a un campo del cuerpo JSON |
| **Comparison Method** | `==`, `!=` o **Contains** |
| **Value** | El texto con el que se compara el valor de la petición |

**Match on: Header**: **Key** es un nombre de cabecera y no distingue mayúsculas de minúsculas, así que `X-GitHub-Event` y `x-github-event` son la misma cabecera. Una cabecera que la petición no trae se comporta como un valor ausente (véase más abajo). Cuando una cabecera aparece varias veces, solo se compara el primer valor.

**Match on: Body, JSON**: **Key** es una ruta dentro del cuerpo analizado, descrita en la sección siguiente. Un cuerpo que no es JSON válido da un valor ausente para cualquier clave.

**Match on: Body, String**: el valor es todo el cuerpo sin procesar y **Key** se ignora. El formulario pide una clave de todos modos porque el campo es obligatorio; escriba un guion. Es la única manera de comparar un cuerpo que no es JSON; combínela con **Contains**.

**Key** y **Value** son obligatorios, de modo que un matcher no puede comprobar un valor vacío. Para reaccionar a la ausencia de un campo, compárelo con `!=` contra un valor que nunca tenga.

### Claves JSON {#json-keys}

Una clave es una ruta por el documento JSON. Los niveles se separan con puntos y un elemento de un array se indica con su índice entre corchetes, empezando en cero. Los nombres distinguen mayúsculas de minúsculas.

```json
{
  "ref": "refs/heads/main",
  "repository": { "name": "semaphore", "private": false },
  "commits": [
    { "id": "9fceb02", "message": "Fix the deploy" },
    { "id": "1c4a7b8", "message": "Bump the version" }
  ]
}
```

| Clave | A qué apunta |
|---|---|
| `ref` | `refs/heads/main` |
| `repository.name` | `semaphore` |
| `repository.private` | `false` |
| `commits.[0].id` | `9fceb02` |
| `commits.[1].message` | `Bump the version` |
| `commits` | Todo el array |
| `repository.url` | A nada: el campo no existe |

El campo **Key** de un extractor de valores usa la misma sintaxis.

### Cómo compara valores un matcher {#how-a-matcher-compares-values}

El valor de la petición se convierte en texto y se compara con **Value** como texto, así que el campo **Value** nunca necesita comillas, corchetes ni escapes.

- **Las cadenas** se comparan literalmente, distinguiendo mayúsculas de minúsculas: `Push` no coincide con `push`.
- **Los números** se comparan sin parte decimal cuando no la tienen: `42` en el cuerpo coincide con el valor `42`, no con `42.0`. Un número fraccionario se compara tal como está escrito, así que `1.5` coincide con `1.5`.
- **Los booleanos** coinciden con `true` y `false`.
- **Un valor ausente** —una cabecera que falta, una ruta JSON que no existe, un `null` o un cuerpo que no es JSON válido— se compara como el texto literal `<nil>`. De ahí una consecuencia que conviene recordar: `==` nunca puede coincidir con un campo ausente, y `!=` coincide siempre con él.
- **Los objetos y los arrays** no tienen una forma de texto legible; no los compare. Apunte la clave a un campo escalar de su interior.
- **Contains** es una simple comprobación de subcadena que distingue mayúsculas de minúsculas, sin comodines ni expresiones regulares.

### Varios matchers {#several-matchers}

Una integración puede tener cuantos matchers haga falta y se combinan con **Y**: la integración solo se ejecuta cuando coinciden todos. No hay forma de expresar un *o* dentro de una integración; cree una segunda integración sobre la misma plantilla para la condición alternativa.

:::warning
Una integración que usa el alias de proyecto y **no tiene matchers** nunca se inicia, porque no hay nada que pueda coincidir. Dele al menos un matcher, o desactive **Use project alias** y llame al alias propio de la integración.
:::

### Ejemplos de matchers {#matcher-examples}

| Objetivo | Match on | Formato | Key | Método | Value |
|---|---|---|---|---|---|
| Solo los push de GitHub | Header | — | `X-GitHub-Event` | `==` | `push` |
| Solo los push a `main` | Body | JSON | `ref` | `==` | `refs/heads/main` |
| Cualquier rama excepto `main` | Body | JSON | `ref` | `!=` | `refs/heads/main` |
| Solo etiquetas | Body | JSON | `ref` | Contains | `refs/tags/` |
| Solo merge requests de GitLab fusionadas | Body | JSON | `object_attributes.state` | `==` | `merged` |
| Ignorar los commits de un bot | Body | JSON | `pusher.name` | `!=` | `dependabot` |
| Solo releases publicadas de GitHub | Body | JSON | `action` | `==` | `published` |
| Una alerta de texto que menciona un disco | Body | String | `-` | Contains | `disk` |

Las dos primeras filas juntas son la configuración habitual de una integración de despliegue: el tipo de evento desde la cabecera y la rama desde el cuerpo, y ambas deben coincidir.

## Extractores de valores {#value-extractors}

Un extractor de valores copia una parte de la petición entrante en la tarea que está a punto de iniciarse. Así un webhook pasa una rama, un hash de commit, un autor o una versión de release a la automatización que dispara.

Los extractores se ejecutan siempre, por cualquier clase de alias que haya llegado la llamada, y lo hacen después de superar la autenticación y los matchers.

### Campos de un extractor {#extractor-fields}

| Campo | Significado |
|---|---|
| **Name** | Una etiqueta para la lista. Texto libre |
| **Source of the Value** | **Body** o **Header** |
| **Data Type of Body** | **JSON** o **String**, se muestra solo con **Body** |
| **Key** | El nombre de la cabecera, o una [clave JSON](#json-keys): la misma sintaxis que usan los matchers |
| **Variable Usage** | **Variables** o **Task Params**: a dónde se entrega el valor |
| **Variable** | El nombre que el valor recibe en la tarea |

Con **Body** y **String**, todo el cuerpo sin procesar se convierte en el valor y **Key** se ignora, igual que en un matcher.

### Qué recibe la variable {#what-the-variable-receives}

A diferencia de un matcher, un extractor no convierte nada en texto: un valor JSON conserva su tipo, así que un número sigue siendo un número y un objeto sigue siendo un objeto.

| Qué contiene la petición | Qué recibe la variable |
|---|---|
| Una cabecera | Su texto; una cadena vacía cuando la cabecera falta |
| Una cadena, un número o un booleano JSON | El mismo valor, con su tipo |
| Un objeto o un array JSON | El objeto o el array completo, conservando su estructura |
| Un `null` de JSON, una ruta que no existe o un cuerpo que no es JSON válido | Nada: la variable **no se define en absoluto** y lo que define la plantilla se mantiene |
| El cuerpo como **String** | Todo el cuerpo sin procesar, como texto |

La diferencia entre «vacío» y «no definido» importa: una cabecera ausente da a la tarea una cadena vacía, mientras que un campo JSON ausente deja intacto el valor propio de la plantilla.

### Variable Usage: Variables {#variable-usage-variables}

El valor se une a las variables de la tarea, el mismo conjunto que rellena el campo **Variables** del diálogo de nueva tarea. Semaphore las pasa a la herramienta como variables adicionales (`--extra-vars` en Ansible, `-var` en Terraform) y sobrescriben una clave del mismo nombre del [grupo de variables](/user-guide/environment) de la plantilla.

Dele a la variable exactamente el nombre de una [variable de encuesta](/user-guide/task-templates/survey-vars) de la plantilla y el webhook rellenará esa variable en lugar de una persona.

### Variable Usage: Task Params {#variable-usage-task-params}

Los parámetros de tarea son los [prompts](/user-guide/task-templates/prompts) integrados de la plantilla, no variables para el playbook. El valor extraído se pasa sin cambios, así que su tipo JSON debe ser el esperado: `true`, no `"true"`.

| Variable | Se aplica a | Espera |
|---|---|---|
| `git_branch` | Cualquier aplicación | La rama que se va a usar. Se quita el `refs/heads/` inicial, así que el `ref` de GitHub puede usarse tal cual |
| `limit`, `tags`, `skip_tags` | Ansible | Una lista de cadenas |
| `debug`, `dry_run`, `diff` | Ansible | `true` o `false` |
| `plan`, `destroy`, `auto_approve`, `upgrade`, `reconfigure` | Terraform, OpenTofu, Terragrunt | `true` o `false` |

La plantilla tiene que permitir la sustitución para que el valor surta efecto: **Allow override branch in task** para `git_branch` y el prompt correspondiente para `limit`, `tags` y `skip_tags`. Sin ese permiso el valor se descarta y la tarea se ejecuta con el ajuste de la plantilla.

### Ejemplo de extractores: push de GitHub {#extractor-example-github-push}

Un webhook de push de GitHub envía un cuerpo que empieza así:

```json
{
  "ref": "refs/heads/main",
  "after": "9fceb02d0ae598e95dc970b74767f19372d61af8",
  "repository": { "name": "semaphore", "default_branch": "main" },
  "pusher": { "name": "octocat", "email": "octocat@example.com" }
}
```

Cuatro extractores lo convierten en una tarea completamente descrita:

| Name | Source | Formato | Key | Usage | Variable |
|---|---|---|---|---|---|
| Branch | Body | JSON | `ref` | Task Params | `git_branch` |
| Commit | Body | JSON | `after` | Variables | `COMMIT` |
| Author | Body | JSON | `pusher.name` | Variables | `AUTHOR` |
| Event | Header | — | `X-GitHub-Event` | Variables | `EVENT` |

La tarea usa entonces `main` (el prefijo `refs/heads/` se elimina por usted) y se ejecuta con las variables `COMMIT`, `AUTHOR` y `EVENT` a disposición del playbook. Para ver qué entregó realmente una llamada, ábrala en la pestaña History y compare su cuerpo con sus claves.

## Parámetros de tarea predefinidos {#task-parameters}

En cuanto se elige una plantilla en el formulario de la integración aparecen sus propias opciones de ejecución: un mensaje, sus variables de encuesta, el inventario, la rama de Git cuando la plantilla permite sustituirla y los prompts de la aplicación. Lo que configure ahí será el valor por omisión de cada tarea que inicie esta integración, de modo que los valores que nunca cambian —un inventario, un mensaje fijo— van aquí y no en un extractor.

Los extractores se aplican por encima de esos valores: una variable o un parámetro de tarea producido por un extractor sustituye al valor predefinido del mismo nombre, y el valor predefinido se mantiene cuando el extractor no encuentra nada.

## Integraciones de workflow <FeatureState feature="workflows" /> {#workflow-integrations}

Una integración puede iniciar un [workflow](/user-guide/workflows) en lugar de una sola plantilla. Cambie **Runs** a **Workflow** en el formulario de la integración y elija el workflow.

Los extractores funcionan igual, con una diferencia: **Variable Usage** se ignora y cada valor extraído se entrega como respuesta a la encuesta del workflow con el nombre de **Variable**. El workflow valida después esas respuestas y las pasa a sus nodos mediante sus vinculaciones, de forma que un valor al que no está vinculado ningún nodo nunca llega a una tarea. Una llamada correcta informa de `X-Semaphore-Workflow-ID` y `X-Semaphore-Workflow-Run-ID` además de las cabeceras de la tarea.

## Historial de llamadas {#call-history}

La pestaña **History** de la página de integraciones lista todas las llamadas que el proyecto ha recibido por cualquiera de sus alias, de la más reciente a la más antigua. Sobrevive al alias, a la integración y a la tarea que inició, porque se guarda por proyecto y no por integración.

| Columna | Muestra |
|---|---|
| **Time** | Cuándo llegó la llamada |
| **Integration** | La integración que la atendió, con el alias debajo; pulse el alias para filtrar la lista |
| **Source IP** | La dirección desde la que llegó la llamada |
| **Method** | `GET` o `POST` |
| **Status** | Qué hizo la integración con la llamada, y por qué |
| **Task** | La tarea o la ejecución de workflow que se inició |
| **Duration** | Cuánto tardó la integración en atender la llamada |

Hay cuatro estados posibles:

| Estado | Significado |
|---|---|
| `ok` | Se inició una tarea o una ejecución de workflow |
| `unauthorized` | La petición no pasó el método de autenticación de la integración |
| `skipped` | Los matchers no coincidieron, o el alias no inició ninguna integración |
| `error` | Se intentó iniciar y falló: la plantilla ya no existía, la encuesta rechazó los valores |

Al pulsar una fila se abre la llamada, incluido el cuerpo de la petición tal como se recibió (sus primeros 64 KiB; si era más largo se muestran el tamaño almacenado y el original). Las **cabeceras de la petición nunca se guardan**: llevan la firma o el token con el que se autenticó el remitente. El cuerpo de una llamada que no superó la autenticación tampoco se conserva, ya que cualquiera que conozca la URL puede enviar una.

Filtre la lista por integración y por alias con los controles sobre la tabla y recórrala con las flechas de debajo. El historial no caduca: crece hasta que se borra el proyecto.

## Resolución de problemas {#troubleshooting}

| Síntoma | Qué comprobar |
|---|---|
| No aparece ninguna fila en History | El alias de la URL es incorrecto o se ha borrado. Una llamada al alias propio de una integración con **Use project alias** activado tampoco se registra en ningún sitio |
| `unauthorized` | El nombre de la cabecera de autenticación, la clave del almacén de claves y si el remitente envía la firma con el prefijo `sha256=` que el método espera. GitHub y Bitbucket usan sus propias cabeceras al margen de **Auth header** |
| `skipped`, motivo *No integration matched the alias* | El alias existe, pero ninguna integración del proyecto tiene **Use project alias** activado |
| `skipped`, motivo *No matcher matched the request* | Abra la llamada y compare su cuerpo con sus matchers. Recuerde que un campo ausente nunca coincide con `==`, que las claves distinguen mayúsculas de minúsculas y que **Contains** no admite comodines. Una integración sin ningún matcher se omite por el mismo motivo |
| La tarea se ejecuta pero una variable está vacía o falta | La clave JSON no corresponde al contenido (abra la llamada para ver el cuerpo), el valor era `null`, o el nombre de **Variable** no coincide con la variable de encuesta que debería rellenar |
| La rama no se sustituye | La plantilla necesita **Allow override branch in task** y el extractor debe escribir en el parámetro de tarea `git_branch` |
| Una llamada inicia varias tareas | Varias integraciones usan el alias de proyecto y todos sus matchers coinciden. Haga los matchers más estrictos o dé a las integraciones sus propios alias |
