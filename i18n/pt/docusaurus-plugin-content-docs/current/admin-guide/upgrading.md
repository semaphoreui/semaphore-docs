# Atualização

### Gerenciador de pacotes {#package-manager}

Baixe um arquivo de pacote na [página de Releases](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` para Debian e Ubuntu, `*.rpm` para CentOS e RedHat.&#x20;

Instale-o usando o gerenciador de pacotes.

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


### Binário {#binary}

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

## Mudanças de comportamento relevantes {#behavior-changes}

Estas mudanças se aplicam ao atualizar para versões recentes **2.20.x**. Elas não exigem migração de banco de dados, mas playbooks ou clientes de API que dependiam do comportamento antigo podem precisar de ajustes.

### As variáveis extras do Ansible são literais {#ansible-extra-vars-literal}

O Semaphore não passa mais as variáveis extras do Ansible na linha de comando. Grupos de variáveis, respostas de pesquisa, entradas de workflow e o objeto integrado `semaphore_vars` são gravados em arquivos YAML temporários e passados como `--extra-vars @file`. Todo valor de texto recebe a marca `!unsafe`, de modo que o Ansible o trata como dado e não avalia Jinja2 dentro do valor.

Se você armazenou Jinja2 em um campo de pesquisa, em um grupo de variáveis ou em um modelo `--extra-vars` esperando que o Semaphore ou o Ansible o expandisse antes de o playbook ser executado, essa expansão não ocorre mais. Mova a lógica para o playbook (por exemplo, use `{{ my_var }}`, em que `my_var` é um valor simples vindo do Semaphore) ou calcule o valor fora do Semaphore.

Os segredos de pesquisa e de grupos de variáveis são criptografados em um arquivo separado do Ansible Vault. O Semaphore gera um ID de vault e uma senha únicos por tarefa e responde ao prompt de vault do Ansible via stdin. Isso é independente das senhas de vault que você anexa ao modelo.

Consulte [Variáveis de pesquisa](/user-guide/task-templates/survey-vars), [Grupos de variáveis](/user-guide/environment) e [Segurança — variáveis de tarefa do Ansible](/admin-guide/security#ansible-task-variables).

### Saídas de workflow e campos da API de tarefas {#workflow-outputs-and-task-api}

As [saídas de workflow](/user-guide/workflows#producing-outputs) são gravadas pela execução da tarefa e não podem ser definidas ao iniciar uma tarefa pela API. `POST /api/project/{project_id}/tasks` ignora `workflow_run_id`, `workflow_node_id`, `workflow_template_id`, `artifacts` e `runner_id` caso estejam presentes no corpo.
