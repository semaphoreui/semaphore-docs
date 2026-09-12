# Prompts

Los prompts son indicadores y opciones predefinidos, específicos de cada tipo de plantilla, que puede habilitar para permitir la personalización en tiempo de ejecución. A diferencia de las [variables de encuesta](/user-guide/task-templates/survey-vars), que son campos personalizados que usted crea, los prompts son opciones integradas que corresponden a indicadores concretos de la CLI de Ansible, Terraform y otras herramientas.

Esta característica le permite:
- Sobrescribir los valores predeterminados de la plantilla en tiempo de ejecución
- Apuntar a hosts o recursos específicos
- Controlar el comportamiento de la ejecución con indicadores de la CLI
- Pasar opciones de ejecución mediante llamadas a la API o programaciones

## Prompts frente a variables de encuesta {#prompts-vs-survey-variables}

| Característica | Prompts | Variables de encuesta |
|---------|---------|-----------------|
| **Definición** | Opciones predefinidas específicas de la plantilla | Campos personalizados que usted crea |
| **Ejemplos** | Ansible: `--limit`, `--tags`<br/>Terraform: workspaces, `-destroy` | Nombre del entorno, número de versión, parámetros personalizados |
| **Configuración** | Se habilitan mediante casillas de verificación en la plantilla | Se agregan en la configuración de la plantilla con nombre y tipo |
| **Se pasan como** | Indicadores integrados de la CLI | Ansible: `--extra-vars`<br/>Terraform: `-var` |

Los **prompts** son opciones estandarizadas integradas en Semaphore para herramientas específicas, mientras que las **variables de encuesta** son campos personalizados flexibles que usted mismo define.

## Prompts de Ansible {#ansible-prompts}

Para las plantillas de playbooks de Ansible, puede habilitar prompts para las siguientes opciones de la CLI:

### Limit {#limit}

Habilite el prompt `--limit` para especificar a qué hosts apuntar al ejecutar el playbook.

**Equivalente en la CLI**: `ansible-playbook playbook.yml --limit webservers`

**Casos de uso**:
- Ejecutar el playbook en un subconjunto de hosts del inventory
- Apuntar a servidores específicos para el despliegue
- Probar cambios en un solo host antes de desplegarlos

**Ejemplo**:
- Su inventory contiene 50 servidores web
- Habilite el prompt Limit
- Al ejecutar la tarea, especifique `web-01.example.com` para apuntar solo a ese servidor
- O especifique `webservers:&production` para apuntar a los servidores web de producción

### Tags {#tags}

Habilite el prompt `--tags` para ejecutar solo las tareas con etiquetas específicas.

**Equivalente en la CLI**: `ansible-playbook playbook.yml --tags deploy,restart`

**Casos de uso**:
- Ejecutar solo partes concretas de un playbook
- Ejecutar los pasos de despliegue sin las tareas de configuración
- Reiniciar servicios rápidamente sin ejecutar el playbook completo

**Ejemplo**:
```yaml
---
- hosts: all
  tasks:
    - name: Install packages
      apt:
        name: nginx
      tags: install

    - name: Deploy application
      copy:
        src: app.tar.gz
        dest: /opt/app/
      tags: deploy

    - name: Restart service
      service:
        name: nginx
        state: restarted
      tags: restart
```

Habilite el prompt Tags e introduzca `deploy,restart` para omitir el paso de instalación.

### Skip Tags {#skip-tags}

Habilite el prompt `--skip-tags` para omitir las tareas con etiquetas específicas.

**Equivalente en la CLI**: `ansible-playbook playbook.yml --skip-tags testing,debug`

**Casos de uso**:
- Omitir tareas opcionales en producción
- Excluir tareas de depuración o de pruebas
- Evitar tareas que consumen mucho tiempo cuando no son necesarias

**Ejemplo**: Con el playbook anterior, habilite Skip Tags e introduzca `install` para omitir la instalación de paquetes y ejecutar solo las tareas de despliegue y reinicio.

### Habilitar los prompts de Ansible {#enabling-ansible-prompts}

Para habilitar los prompts de Ansible:

1. Vaya a **Plantillas de tareas** y seleccione su plantilla de Ansible
2. Busque la sección **Prompts de Ansible** en la configuración de la plantilla
3. Marque las casillas de los prompts que desee:
   - ☐ **Limit** - Habilita el indicador `--limit`
   - ☐ **Tags** - Habilita el indicador `--tags`
   - ☐ **Skip Tags** - Habilita el indicador `--skip-tags`
4. Guarde la plantilla

![](/assets/ansible_2.png)

Una vez habilitados, estos campos aparecen en el formulario de ejecución de tareas, en las solicitudes a la API y en las configuraciones de programaciones.

## Prompts de Terraform/OpenTofu {#terraformopentofu-prompts}

Para las plantillas de Terraform y OpenTofu, Semaphore proporciona varios prompts integrados:

### Selección de workspace {#workspace-selection}

Seleccione qué workspace de Terraform se utilizará para la ejecución de la tarea.

**Equivalente en la CLI**: `terraform workspace select staging`

**Casos de uso**:
- Gestionar varios entornos (dev, staging, producción)
- Separar los archivos de estado para distintas configuraciones
- Probar cambios de infraestructura de forma aislada

**Configuración**:
1. Cree los workspaces en la pestaña **Workspaces** de la plantilla
2. El selector de workspace aparece automáticamente en el formulario de la tarea
3. Los usuarios eligen el workspace de destino al ejecutar las tareas

Consulte [Workspaces de Terraform](/user-guide/apps/terraform/workspaces) para una configuración detallada.

### Indicador Destroy {#destroy-flag}

Habilite el indicador `-destroy` para desmantelar la infraestructura.

**Equivalente en la CLI**: `terraform apply -destroy`

**Casos de uso**:
- Limpiar entornos de prueba temporales
- Retirar infraestructura
- Eliminar recursos específicos

**Importante**: Se trata de una operación destructiva. Úsela con precaución y considere exigir una confirmación en sus flujos de trabajo.

### Indicador Migrate State {#migrate-state-flag}

Habilite el indicador `-migrate-state` al cambiar la configuración del backend.

**Equivalente en la CLI**: `terraform init -migrate-state`

**Casos de uso**:
- Mover el estado a un backend distinto
- Migrar entre ubicaciones de almacenamiento
- Actualizar la configuración del backend

### Habilitar los prompts de Terraform {#enabling-terraform-prompts}

Los prompts de Terraform están disponibles en la configuración de la plantilla:

1. Vaya a **Plantillas de tareas** y seleccione su plantilla de Terraform
2. Configure los prompts disponibles en la configuración de la plantilla:
   - Selección de workspace (se habilita automáticamente si hay workspaces configurados)
   - Opción del indicador destroy
   - Opción de migrate state
3. Guarde la plantilla

El formulario de la tarea muestra estas opciones al ejecutar tareas de Terraform.

## Prompts de Bash, PowerShell y Python {#bash-powershell-and-python-prompts}

Para las plantillas de Bash, PowerShell y Python, los prompts son mínimos, ya que la mayor parte de la personalización se gestiona mediante [variables de encuesta](/user-guide/task-templates/survey-vars).

Los prompts disponibles son:

- Argumentos de la CLI
- Rama

Estos tipos de plantilla se benefician más de las variables de encuesta personalizadas para pasar parámetros a los scripts.

## Uso de los prompts {#using-prompts}

### Ejecución manual de tareas {#manual-task-execution}

Al ejecutar una tarea desde una plantilla con prompts habilitados:

1. Haga clic en **Ejecutar** en la plantilla
2. Aparece un formulario con los campos de los prompts habilitados
3. Rellene los valores de los prompts que desee utilizar (los campos opcionales pueden dejarse vacíos)
4. Haga clic en **Ejecutar tarea**

La tarea se ejecuta con los valores de prompt especificados, que se pasan como indicadores de la CLI.

### Llamadas a la API {#api-calls}

Para pasar valores de prompt mediante la API, inclúyalos en el cuerpo de la solicitud:

**Ejemplo con Ansible:**

```bash
curl -XPOST \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -d '{
    "template_id": 123,
    "limit": "webservers",
    "tags": "deploy,restart",
    "skip_tags": "testing"
  }' \
  https://your-semaphore.com/api/project/1/tasks
```

**Importante**: Los prompts deben estar habilitados en la plantilla para que los valores se acepten. Si pasa valores de prompt mediante la API sin haberlos habilitado, esos valores se ignorarán.

### Tareas programadas {#scheduled-tasks}

Las programaciones pueden incluir valores de prompt para personalizar la ejecución automatizada de tareas:

**Ejemplo**: Programación con prompts de Ansible
- Programación de despliegue diario con `limit: "production"` y `tags: "deploy"`
- Programación de mantenimiento semanal con `tags: "updates,cleanup"`

Configure los valores de los prompts en la configuración de la programación para que cada ejecución programada utilice las opciones especificadas.

### Integraciones y webhooks {#integrations-and-webhooks}

Las integraciones pueden extraer valores de los webhooks y asignarlos a los prompts:

**Ejemplo**: Un webhook de GitHub desencadena un despliegue
- Extraer el nombre de la rama del webhook
- Asignarlo al prompt Limit para apuntar a un entorno específico
- Desplegar solo en los servidores que coincidan con el entorno de la rama

Consulte [Integraciones](../integrations) para la configuración de webhooks.

## Buenas prácticas {#best-practices}

### Habilite solo los prompts necesarios {#enable-only-necessary-prompts}

Cada prompt habilitado agrega un campo al formulario de la tarea. Habilite solo los prompts que los usuarios realmente necesiten personalizar.

✅ **Bien**: Habilitar Limit para los equipos de operaciones que necesitan apuntar a hosts específicos
❌ **Mal**: Habilitar todos los prompts "por si acaso"

### Combínelos con variables de encuesta {#combine-with-survey-variables}

Utilice los prompts para las opciones de la CLI específicas de cada herramienta y las variables de encuesta para los parámetros personalizados:

**Ejemplo de plantilla de Ansible:**
- **Prompts**: Limit (qué hosts), Tags (qué tareas)
- **Variables de encuesta**: `app_version` (qué versión), `enable_rollback` (lógica personalizada)

### Documente el uso de la API {#document-api-usage}

Si las plantillas se desencadenan mediante la API, documente qué prompts están disponibles y su formato esperado:

```markdown
## API Usage

Enabled prompts:
- `limit`: Host pattern (optional)
- `tags`: Comma-separated tag list (optional)

Example:
POST /api/project/1/tasks
{
  "template_id": 123,
  "limit": "webservers:&production",
  "tags": "deploy"
}
```

### Utilice Limit para pruebas seguras {#use-limit-for-safe-testing}

Pruebe siempre primero los playbooks potencialmente destructivos con el prompt Limit:

1. Habilite el prompt Limit en la plantilla
2. Primera ejecución: especifique `limit: "test-server-01"` para probar en un solo host
3. Verifique que se haya completado correctamente
4. Segunda ejecución: especifique `limit: "production"` para desplegar en todos los hosts

### Valide las combinaciones de prompts {#validate-prompt-combinations}

Algunas combinaciones de prompts pueden no tener sentido. Agregue documentación o validación:

- Usar `--tags deploy` junto con `--skip-tags deploy` genera un conflicto
- Especificar a la vez un workspace y el indicador destroy requiere especial precaución

## Casos de uso comunes {#common-use-cases}

### Despliegue gradual con Limit {#gradual-rollout-with-limit}

Despliegue en producción de forma gradual usando Limit de Ansible:

1. Ejecución 1: `limit: "web-01.example.com"` - Desplegar en un solo servidor
2. Supervisar en busca de problemas
3. Ejecución 2: `limit: "webservers:&canary"` - Desplegar en los servidores canary
4. Validar las métricas
5. Ejecución 3: `limit: "webservers:&production"` - Despliegue completo

### Ejecución selectiva con Tags {#selective-execution-with-tags}

Utilice Tags para ejecutar solo partes específicas de un playbook:

**Mañana**: `tags: "deploy"` - Desplegar la nueva versión
**Tarde**: `tags: "config"` - Actualizar la configuración
**Noche**: `tags: "restart"` - Reiniciar los servicios con la nueva configuración

### Gestión de entornos con workspaces {#environment-management-with-workspaces}

Utilice la selección de workspace de Terraform para la gestión de entornos:

- **Desarrollo**: Seleccione el workspace `dev` - recursos más económicos, iteración más rápida
- **Staging**: Seleccione el workspace `staging` - similar a producción, para pruebas
- **Producción**: Seleccione el workspace `prod` - infraestructura de producción completa

### Limpieza con Destroy {#cleanup-with-destroy}

Utilice destroy de Terraform para infraestructura temporal:

1. Crear el entorno de prueba: ejecute con el workspace `test-branch-123`
2. Ejecutar las pruebas de integración
3. Limpiar: ejecute con el indicador destroy habilitado y el workspace `test-branch-123`

## Solución de problemas {#troubleshooting}

### Los valores de prompt se ignoran {#prompt-values-ignored}

**Problema**: Se pasan valores de prompt pero no surten efecto

**Solución**: Verifique que el prompt correspondiente esté habilitado en la configuración de la plantilla. Los prompts deben habilitarse de forma explícita.

### No se puede especificar limit {#cannot-specify-limit}

**Problema**: El campo Limit no aparece en el formulario de la tarea

**Solución**: 
1. Edite la plantilla
2. Busque la sección "Ansible Prompts"
3. Marque la casilla "Limit"
4. Guarde la plantilla

### Las llamadas a la API fallan con valores de prompt {#api-calls-fail-with-prompt-values}

**Problema**: Las solicitudes a la API con valores de prompt devuelven errores

**Solución**: 
1. Asegúrese de que los prompts estén habilitados en la plantilla
2. Compruebe el formato JSON del cuerpo de la solicitud
3. Verifique que los nombres de los campos coincidan exactamente (`limit`, no `host_limit`)

### Las etiquetas no filtran las tareas {#tags-not-filtering-tasks}

**Problema**: Se especifican etiquetas pero todas las tareas siguen ejecutándose

**Solución**: 
1. Verifique que las tareas del playbook tengan las etiquetas correctamente definidas
2. Compruebe si hay errores tipográficos en los nombres de las etiquetas
3. Asegúrese de que las etiquetas estén separadas por comas sin espacios: `deploy,restart`, no `deploy, restart`

## Documentación relacionada {#related-documentation}

- [Variables de encuesta](/user-guide/task-templates/survey-vars) - Campos personalizados para plantillas
- [Plantillas de Ansible](/user-guide/apps/ansible) - Configuración específica de Ansible
- [Plantillas de Terraform](/user-guide/apps/terraform) - Configuración específica de Terraform
- [Programaciones](../schedules) - Ejecución automatizada de tareas
- [Integraciones](../integrations) - Tareas desencadenadas por webhooks
- [Documentación de la API](../../admin-guide/api) - Referencia de la API
