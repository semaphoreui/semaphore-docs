# Обновление

### Менеджер пакетов {#package-manager}

Скачайте файл пакета со [страницы релизов](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` для Debian и Ubuntu, `*.rpm` для CentOS и RedHat.&#x20;

Установите его с помощью менеджера пакетов.

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


### Бинарный файл {#binary}

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

## Важные изменения поведения {#behavior-changes}

Эти изменения применяются при обновлении до последних версий **2.20.x**. Миграция базы данных не требуется, но playbook и API-клиенты, которые полагались на прежнее поведение, возможно, придётся обновить.

### Дополнительные переменные Ansible передаются как литералы {#ansible-extra-vars-literal}

Semaphore больше не передаёт дополнительные переменные Ansible в командной строке. Группы переменных, ответы на опросы, входные данные workflow и встроенный объект `semaphore_vars` записываются во временные YAML-файлы и передаются как `--extra-vars @file`. Каждое строковое значение помечается тегом `!unsafe`, поэтому Ansible воспринимает его как данные и не вычисляет Jinja2 внутри значения.

Если вы сохраняли Jinja2 в поле опроса, группе переменных или шаблоне `--extra-vars` в расчёте на то, что Semaphore или Ansible раскроет его до запуска playbook, такое раскрытие больше не выполняется. Перенесите логику в playbook (например, используйте `{{ my_var }}`, где `my_var` — простое значение из Semaphore) или вычисляйте значение вне Semaphore.

Секреты опросов и групп переменных шифруются в отдельном файле Ansible Vault. Semaphore генерирует одноразовый идентификатор vault и пароль для каждой задачи и отвечает на запрос vault от Ansible через stdin. Это не связано с паролями vault, которые вы привязываете к шаблону.

См. [Переменные опроса](/user-guide/task-templates/survey-vars), [Группы переменных](/user-guide/environment) и [Безопасность — переменные задач Ansible](/admin-guide/security#ansible-task-variables).

### Выходные данные workflow и поля API задач {#workflow-outputs-and-task-api}

[Выходные данные workflow](/user-guide/workflows#producing-outputs) записываются при выполнении задачи и не могут быть заданы при запуске задачи через API. `POST /api/project/{project_id}/tasks` игнорирует `workflow_run_id`, `workflow_node_id`, `workflow_template_id`, `artifacts` и `runner_id`, если они переданы в теле запроса.
