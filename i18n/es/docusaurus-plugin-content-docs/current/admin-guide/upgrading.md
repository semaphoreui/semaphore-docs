# Actualización

### Gestor de paquetes {#package-manager}

Descargue un archivo de paquete desde la [página de versiones](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` para Debian y Ubuntu, `*.rpm` para CentOS y RedHat.&#x20;

Instálelo con el gestor de paquetes.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs>
  <TabItem value="debian-x64" label="Debian / Ubuntu (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.deb

      sudo dpkg -i semaphore_2.17.15_linux_amd64.deb
      ```
  </TabItem>
  <TabItem value="debian-arm64" label="Debian / Ubuntu (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.deb

      sudo dpkg -i semaphore_2.17.15_linux_arm64.deb
      ```
  </TabItem>
  <TabItem value="centos-x64" label="CentOS (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.rpm

      sudo yum install semaphore_2.17.15_linux_amd64.rpm
      ```
  </TabItem>
  <TabItem value="centos-arm64" label="CentOS (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.rpm

      sudo yum install semaphore_2.17.15_linux_arm64.rpm
      ```
  </TabItem>
</Tabs>


### Binario {#binary}

<Tabs>
  <TabItem value="linux-x64" label="Linux (x64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_amd64.tar.gz

      tar xf semaphore_2.17.15_linux_amd64.tar.gz
      ```
  </TabItem>
  <TabItem value="linux-arm64" label="Linux (ARM64)">
      ```bash
      wget https://github.com/semaphoreui/semaphore/releases/\
      download/v2.17.15/semaphore_2.17.15_linux_arm64.tar.gz

      tar xf semaphore_2.17.15_linux_arm64.tar.gz
      ```
  </TabItem>
  <TabItem value="windows-x64" label="Windows (x64)">
      ```powershell
      Invoke-WebRequest `
      -Uri ("https://github.com/semaphoreui/semaphore/releases/" +
            "download/v2.17.15/semaphore_2.17.15_windows_amd64.zip") `
      -OutFile semaphore.zip

      Expand-Archive -Path semaphore.zip  -DestinationPath ./
      ```
  </TabItem>
</Tabs>

## Cambios de comportamiento destacados {#behavior-changes}

Estos cambios se aplican al actualizar a versiones recientes **2.20.x**. No requieren una migración de la base de datos, pero los playbooks o clientes de la API que dependían del comportamiento anterior pueden necesitar cambios.

### Las variables extra de Ansible son literales {#ansible-extra-vars-literal}

Semaphore ya no pasa las variables extra de Ansible en la línea de comandos. Los grupos de variables, las respuestas de encuesta, las entradas de workflow y el objeto integrado `semaphore_vars` se escriben en archivos YAML temporales y se pasan como `--extra-vars @file`. Cada valor de tipo cadena se marca con `!unsafe`, por lo que Ansible lo trata como datos y no evalúa Jinja2 dentro del valor.

Si guardó Jinja2 en un campo de encuesta, un grupo de variables o una plantilla `--extra-vars` esperando que Semaphore o Ansible lo expandiera antes de ejecutar el playbook, esa expansión ya no ocurre. Mueva la lógica al playbook (por ejemplo, use `{{ my_var }}` donde `my_var` es un valor simple de Semaphore) o calcule el valor fuera de Semaphore.

Los secretos de encuesta y de los grupos de variables se cifran en un archivo de Ansible Vault aparte. Semaphore genera un ID de vault y una contraseña únicos por tarea y responde a la solicitud de vault de Ansible por stdin. Esto es independiente de las contraseñas de vault que asocie a la plantilla.

Consulte [Variables de encuesta](/user-guide/task-templates/survey-vars), [Grupos de variables](/user-guide/environment) y [Seguridad — variables de tareas de Ansible](/admin-guide/security#ansible-task-variables).

### Salidas de workflow y campos de la API de tareas {#workflow-outputs-and-task-api}

Las [salidas de workflow](/user-guide/workflows#producing-outputs) las escribe la ejecución de la tarea y no se pueden establecer al iniciar una tarea mediante la API. `POST /api/project/{project_id}/tasks` ignora `workflow_run_id`, `workflow_node_id`, `workflow_template_id`, `artifacts` y `runner_id` si están presentes en el cuerpo.
