# Variables de encuesta

Las variables de encuesta son campos de entrada personalizados que puede agregar a las plantillas de tareas para recopilar datos del usuario al ejecutar tareas. En lugar de codificar valores fijos en sus playbooks o scripts, puede definir variables personalizadas que soliciten valores a los usuarios en tiempo de ejecución.

Esta característica resulta útil para:
- Ejecutar la misma plantilla con distintos parámetros (por ejemplo, valores de configuración)
- Aceptar entradas dinámicas mediante llamadas a la API
- Pasar parámetros personalizados en tareas programadas
- Desencadenar tareas desde integraciones con datos extraídos de webhooks

![](https://www.semaphoreui.com/uploads/v2.14/survey.webp)

## Variables de encuesta frente a prompts {#survey-variables-vs-prompts}

Es importante entender la diferencia entre las variables de encuesta y los prompts:

| Característica | Variables de encuesta | Prompts |
|---------|-----------------|---------|
| **Definición** | Campos personalizados que usted crea | Opciones predefinidas específicas de la plantilla |
| **Ejemplos** | Nombre del entorno, número de versión, endpoint de la API | Ansible: `--limit`, `--tags`<br/>Terraform: workspaces |
| **Configuración** | Se agregan en la configuración de la plantilla con nombre y tipo | Se habilitan mediante casillas de verificación en la plantilla |
| **Se pasan como** | Ansible: `--extra-vars`<br/>Terraform: `-var` | Indicadores integrados de la CLI |

Las **variables de encuesta** son campos personalizados flexibles que usted mismo define, mientras que los **prompts** son opciones integradas específicas de cada tipo de plantilla (como los indicadores `--limit` o `--tags` de Ansible).

## Agregar variables de encuesta a una plantilla {#adding-survey-variables-to-a-template}

Las variables de encuesta se configuran en la configuración de la plantilla:

1. Vaya a **Plantillas de tareas** y seleccione su plantilla
2. Vaya a la sección **Variables de encuesta** en la configuración de la plantilla
3. Haga clic en **Agregar variable de encuesta**
4. Configure la variable:
   - **Nombre**: Nombre de la variable (se usa en su código)
   - **Título**: Etiqueta que se muestra en el formulario
   - **Tipo**: Elija el tipo de campo
   - **Pasar variable como**: Variable extra (predeterminado) o variable de entorno
   - **Valor predeterminado**: Valor opcional precargado que se muestra al abrir el formulario de la tarea
   - **Obligatorio**: Si el campo debe rellenarse obligatoriamente
5. Guarde la plantilla

Cuando los usuarios ejecuten una tarea desde esta plantilla, verán un formulario con sus variables de encuesta personalizadas.

## Tipos de variables {#variable-types}

Las variables de encuesta admiten seis tipos:

### String {#string}

Campo de texto para valores de cadena.

**Casos de uso**: Nombres de entornos, nombres de ramas, nombres de host, rutas de archivos

**Ejemplo**: Una variable llamada `environment` solicita a los usuarios que introduzcan "production", "staging" o "development"

### Integer {#integer}

Campo numérico para valores enteros.

**Casos de uso**: Números de puerto, número de reintentos, tiempos de espera, límites de recursos

**Ejemplo**: Una variable llamada `timeout_seconds` solicita a los usuarios que introduzcan "300" o "600"

### Text {#text}

Área de texto multilínea para valores de cadena más largos.

**Casos de uso**: Mensajes de commit, fragmentos JSON, notas de formato libre, configuración multilínea

**Ejemplo**: Una variable llamada `changelog` en la que los usuarios pegan las notas de la versión antes del despliegue

### Enum (selección única) {#enum-single-select}

Menú desplegable en el que el usuario elige exactamente una opción de una lista predefinida.

**Casos de uso**: Tipo de entorno, estrategia de despliegue, opciones de tipo booleano

**Ejemplo**: Una variable llamada `deployment_type` con las opciones: "rolling", "blue-green", "canary"

Al crear una variable enum, agregue cada opción con una etiqueta y un valor en el editor de variables.

### Select (selección múltiple) {#select-multi-select}

Menú desplegable en el que el usuario puede elegir una o más opciones de una lista predefinida. Los valores seleccionados se pasan como un arreglo JSON (por ejemplo, `["staging","production"]`), no como una única cadena.

**Casos de uso**: Regiones de destino, feature flags, varios grupos de hosts, listas de etiquetas

**Ejemplo**: Una variable llamada `target_regions` con las opciones `us-east-1`, `eu-west-1`, `ap-southeast-1`

**Restricciones**:
- Los valores predeterminados deben elegirse de la lista de opciones y pueden incluir varias selecciones
- En las plantillas de Bash, PowerShell y Python, analice el arreglo JSON a partir del argumento o del valor de entorno (vea los ejemplos más abajo)

### Secret {#secret}

Campo de contraseña en el que el valor permanece oculto.

**Casos de uso**: Claves de API, contraseñas, tokens, configuración sensible

**Ejemplo**: Una variable llamada `api_token` en la que el valor introducido se muestra como puntos por seguridad

## Valores predeterminados {#default-values}

Puede establecer un valor predeterminado opcional para la mayoría de los tipos de variables. Cuando un usuario abre el diálogo de ejecución de la tarea, los campos aparecen precargados con estos valores predeterminados.

- **String, integer, text, secret**: un único valor predeterminado
- **Enum**: una opción de la lista
- **Select**: una o más opciones de la lista

Los valores predeterminados son útiles para programaciones e integraciones en las que la misma plantilla se ejecuta repetidamente con parámetros predecibles. Los usuarios pueden seguir cambiando los valores antes de iniciar una tarea.

## Pasar variable como (destino) {#pass-variable-as-target}

Cada variable de encuesta puede entregarse de una de estas dos formas:

| Ajuste | Comportamiento |
|---------|----------|
| **Variable extra** (predeterminado) | Se pasa de la forma específica de cada aplicación: `--extra-vars` de Ansible, `-var` de Terraform o argumentos de la CLI `name=value` para las aplicaciones de shell |
| **Variable de entorno** | Se define como variable de entorno del proceso, con un nombre que coincide con el nombre de la variable de encuesta |

Utilice **Variable de entorno** cuando su script o herramienta lea del entorno en lugar de los indicadores de la CLI. Para las variables de Terraform que deben seguir la convención `TF_VAR_`, nombre la variable de encuesta `TF_VAR_instance_type` y establezca el destino como variable de entorno.

Las variables con destino de entorno **no** se duplican en extra-vars, `-var` ni en los argumentos de la CLI. Cada valor se entrega exactamente una vez.

## Cómo se pasan las variables de encuesta a las tareas {#how-survey-variables-are-passed-to-tasks}

Las variables de encuesta se pasan de forma distinta según el tipo de plantilla y el ajuste **Pasar variable como**.

Los **valores de selección múltiple (tipo `select`)** son arreglos codificados en JSON en todas las vías de entrega (JSON de extra-vars, `-var`, argumentos de la CLI y variables de entorno). Una selección de las opciones `1` y `2` se convierte en `["1","2"]`, no en una cadena separada por espacios.

### Plantillas de Ansible {#ansible-templates}

Las variables de encuesta se pasan como variables extra de Ansible mediante el indicador `--extra-vars`.

**Ejemplo**: Si define una variable de encuesta llamada `app_version`:

```yaml
---
- hosts: webservers
  tasks:
    - name: Deploy application
      command: deploy.sh {{ app_version }}
```

Al ejecutar la tarea, el usuario introduce "2.5.0" en el formulario de encuesta y Ansible lo recibe como:

```bash
ansible-playbook playbook.yml --extra-vars "app_version=2.5.0"
```

### Plantillas de Terraform/OpenTofu {#terraformopentofu-templates}

Las variables de encuesta se pasan como variables de Terraform mediante el indicador `-var`.

**Ejemplo**: Si define una variable de encuesta llamada `instance_count`:

```hcl
variable "instance_count" {
  type        = number
  description = "Number of instances to create"
}

resource "aws_instance" "web" {
  count         = var.instance_count
  instance_type = "t2.micro"
  # ... other configuration
}
```

Al ejecutar la tarea, el usuario introduce "3" en el formulario de encuesta y Terraform lo recibe como:

```bash
terraform apply -var="instance_count=3"
```

### Plantillas de Shell/Bash {#shellbash-templates}

Las variables de encuesta se pasan al script de Bash como argumentos de línea de comandos:

```bash
/bin/bash your_script.sh var1=val1 var2=val2 ... varN=valN
```

Puede usar el siguiente código dentro del script para analizar los argumentos y convertirlos en un arreglo:

```bash
declare -A args
for arg in "$@"; do
  KEY="${arg%%=*}"
  VALUE="${arg#*=}"
  args["$KEY"]="$VALUE"
done
 
echo "ARG1: ${args[ARG1]}"
echo "ARG2: ${args[ARG2]}"
```

Para las variables de **selección múltiple**, el valor es una cadena con un arreglo JSON. Analícelo con `jq` (asegúrese de que `jq` esté disponible en su imagen del ejecutor):

```bash
regions_json='["us-east-1","eu-west-1"]'
regions=$(echo "$regions_json" | jq -r '.[]')
for region in $regions; do
  echo "Deploying to $region"
done
```

### Plantillas de PowerShell {#powershell-templates}

Las variables de encuesta se pasan al script de PowerShell en ejecución como argumentos de línea de comandos:

```bash
pwsh your_script.sh var1=val1 var2=val2 ... varN=valN
```


Para analizar los argumentos, utilice el siguiente código en el script en ejecución:

```powershell
$parsed = @{}

foreach ($a in $args) {
    if ($a -match "^([^=]+)=(.*)$") {
        $key = $matches[1]
        $val = $matches[2]
        $parsed[$key] = $val
    }
}


Write-Host "Parsed arguments:"

write-host $parsed['env1']
write-host $parsed.env1
```

Para las variables de **selección múltiple**, analice el arreglo JSON a partir del valor del argumento:

```powershell
$regions = $parsed['target_regions'] | ConvertFrom-Json
foreach ($region in $regions) {
    Write-Host "Deploying to $region"
}
```

### Plantillas de Python {#python-templates}

Las variables de encuesta se pasan al script de Python en ejecución como argumentos de línea de comandos:

```bash
python3 your_script.sh var1=val1 var2=val2 ... varN=valN
```

Para analizar los argumentos, utilice el siguiente código en el script en ejecución:

```python
import sys

parsed = {}

for arg in sys.argv[1:]:
    if "=" in arg:
        key, val = arg.split("=", 1)
        parsed[key] = val

print("Parsed arguments:")
print(parsed.get("env1"))
print(parsed["env1"] if "env1" in parsed else None)
```

Para las variables de **selección múltiple**, analice el arreglo JSON:

```python
import json

regions = json.loads(parsed["target_regions"])
for region in regions:
    print(f"Deploying to {region}")
```

## Uso de las variables de encuesta {#using-survey-variables}

### Ejecución manual de tareas {#manual-task-execution}

Al ejecutar una tarea desde una plantilla con variables de encuesta:

1. Haga clic en **Ejecutar** en la plantilla
2. Aparece un formulario con todas las variables de encuesta definidas
3. Rellene los valores de cada campo
4. Haga clic en **Ejecutar tarea**

La tarea se ejecuta con los valores proporcionados, que se pasan al playbook o script.
<!-- 
### API calls {#api-calls}

To pass survey variable values via API:

**Example API request:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "environment": {
      "app_version": "2.5.0",
      "environment": "production"
    }
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

Survey variable values are passed in the `environment` object of the request payload.

**Important**: The task runs unattended when triggered via API—no interactive prompt appears. -->

### Tareas programadas {#scheduled-tasks}

Las programaciones pueden incluir valores de variables de encuesta para ejecutar la misma plantilla con distintos parámetros en distintas programaciones.

**Configuración:**

1. Agregue variables de encuesta a su plantilla
2. Cree una programación para esa plantilla
3. En la configuración de la programación, defina los valores de sus variables de encuesta
4. Cada ejecución programada utiliza esos valores predefinidos

**Ejemplo de caso de uso**: Ejecutar un playbook de copia de seguridad con distintas políticas de retención:
- Programación diaria con `retention_days=7`
- Programación semanal con `retention_days=30`
- Programación mensual con `retention_days=365`

Consulte la documentación de [Programaciones](../schedules) para más detalles.

### Integraciones y webhooks {#integrations-and-webhooks}

Las integraciones pueden extraer valores de los webhooks entrantes y asignarlos a variables de encuesta.

**Configuración:**

1. Agregue variables de encuesta a su plantilla
2. Cree una integración que desencadene esta plantilla
3. Configure extractores de valores para obtener datos del cuerpo del webhook
4. Asigne los valores extraídos a sus variables de encuesta

**Ejemplo**: Desencadenar un despliegue cuando se crea una release en GitHub:
- Extraer la etiqueta de la release del cuerpo del webhook
- Asignarla a una variable de encuesta llamada `release_version`
- El playbook de despliegue recibe el número de versión

Consulte la documentación de [Integraciones](../integrations) para más detalles.

## Buenas prácticas {#best-practices}

### Utilice nombres descriptivos {#use-descriptive-names}

Elija nombres claros y descriptivos para sus variables de encuesta que indiquen su propósito:
- ✅ Bien: `target_environment`, `app_version`, `backup_retention_days`
- ❌ Mal: `env`, `ver`, `days`

### Proporcione títulos útiles {#provide-helpful-titles}

El título aparece en el formulario, así que hágalo fácil de entender:
- Nombre de la variable: `db_host`
- Título: "Nombre de host o dirección IP de la base de datos"

### Utilice enum o select para opciones conocidas {#use-enum-or-select-for-known-options}

Cuando los usuarios deban elegir entre un conjunto limitado de opciones, utilice enum o select en lugar de string:
- ✅ **Enum** para exactamente una opción: production, staging o development
- ✅ **Select** cuando varias opciones son válidas: varias regiones o feature flags
- ❌ Campo string con una nota "introduzca production o staging"

### Utilice el destino de variable de entorno de forma deliberada {#use-environment-variable-target-deliberately}

Prefiera la entrega predeterminada como variable extra, a menos que su playbook, script o herramienta lea explícitamente del entorno del proceso. Nombre las variables con destino de entorno exactamente como espera la herramienta de destino (por ejemplo, `TF_VAR_region`).

### Marque los campos obligatorios de forma adecuada {#mark-required-fields-appropriately}

Marque los campos como obligatorios solo si son realmente necesarios. Considere proporcionar valores predeterminados razonables en sus playbooks para los campos opcionales.

### Valide en su código {#validate-in-your-code}

No dé por sentado que los valores de las variables de encuesta siempre son válidos. Agregue lógica de validación en sus playbooks o scripts:

```yaml
- name: Validate environment variable
  assert:
    that:
      - environment in ['production', 'staging', 'development']
    fail_msg: "Invalid environment: {{ environment }}"
```

### Utilice secretos para datos sensibles {#use-secrets-for-sensitive-data}

Utilice siempre el tipo secret para valores sensibles como claves de API, contraseñas o tokens. Esto garantiza que los valores permanezcan ocultos en la interfaz y en los registros.

### Combínelas con grupos de variables {#combine-with-variable-groups}

Las variables de encuesta funcionan bien junto con los [grupos de variables](../environment):
- Utilice los **grupos de variables** para la configuración estática compartida entre tareas
- Utilice las **variables de encuesta** para los valores que cambian en cada ejecución de tarea

**Ejemplo**:
- Grupo de variables: Detalles de conexión a la base de datos, endpoints de la API
- Variables de encuesta: Entorno de despliegue, número de versión, feature flags

## Casos de uso comunes {#common-use-cases}

### Despliegues específicos por entorno {#environment-specific-deployments}

Cree variables de encuesta para:
- `environment`: enum con las opciones "production, staging, development"
- `app_version`: string para la versión que se va a desplegar
- `enable_debug`: enum con las opciones "true, false"

### Operaciones de base de datos {#database-operations}

Cree variables de encuesta para:
- `db_name`: string para el nombre de la base de datos
- `backup_retention_days`: integer para la política de retención
- `maintenance_window`: string para la ventana de tiempo

### Aprovisionamiento de infraestructura {#infrastructure-provisioning}

Cree variables de encuesta para:
- `instance_count`: integer para el número de instancias
- `instance_type`: enum con las opciones "t2.micro, t2.small, t2.medium"
- `region`: enum con las regiones de AWS

### Pipelines de CI/CD {#cicd-pipelines}

Cree variables de encuesta para:
- `git_branch`: string para la rama que se va a compilar
- `build_type`: enum con las opciones "debug, release"
- `run_tests`: enum con las opciones "true, false"

## Diferencias con los grupos de variables {#differences-from-variable-groups}

| Característica | Variables de encuesta | Grupos de variables |
|---------|-----------------|-----------------|
| **Propósito** | Entrada en tiempo de ejecución por tarea | Configuración estática reutilizable |
| **Cuándo se definen** | En el momento de ejecutar la tarea | Preconfigurados en el proyecto |
| **Caso de uso** | Valores que cambian en cada ejecución | Ajustes compartidos entre tareas |
| **Formato** | Campos individuales con tipo | Formato JSON con objetos anidados |
| **Alcance** | Una única ejecución de tarea | Varias plantillas/inventories |
| **Seguridad** | El tipo secret oculta los valores sensibles | Pestaña de secretos para datos sensibles |

Utilice variables de encuesta cuando necesite flexibilidad en tiempo de ejecución, y grupos de variables cuando desee una configuración coherente en varias ejecuciones de tareas.
