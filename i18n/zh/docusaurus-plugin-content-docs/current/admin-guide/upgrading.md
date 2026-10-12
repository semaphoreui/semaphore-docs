# 升级

### 包管理器 {#package-manager}

从[发布页面](https://github.com/semaphoreui/semaphore/releases)下载软件包文件。

&#x20;Debian 和 Ubuntu 使用 `*.deb`，CentOS 和 RedHat 使用 `*.rpm`。&#x20;

使用包管理器安装它。

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


### 二进制文件 {#binary}

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

## 重要的行为变更 {#behavior-changes}

升级到较新的 **2.20.x** 版本时，这些变更会生效。它们不需要数据库迁移，但依赖旧行为的 playbook 或 API 客户端可能需要更新。

### Ansible 额外变量按字面值处理 {#ansible-extra-vars-literal}

Semaphore 不再通过命令行传递 Ansible 额外变量。变量组、调查问卷答案、工作流输入和内置的 `semaphore_vars` 对象会被写入临时 YAML 文件，并以 `--extra-vars @file` 的形式传递。每个字符串值都带有 `!unsafe` 标记，因此 Ansible 将其视为数据，不会计算值中的 Jinja2。

如果您在调查问卷字段、变量组或 `--extra-vars` 模板中存放了 Jinja2，并期望 Semaphore 或 Ansible 在 playbook 运行前展开它，那么这种展开将不再发生。请把逻辑移到 playbook 中（例如，当 `my_var` 是来自 Semaphore 的普通值时使用 `{{ my_var }}`），或者在 Semaphore 之外计算该值。

调查问卷密钥和变量组密钥会加密保存在单独的 Ansible Vault 文件中。Semaphore 为每个任务生成一次性的 vault ID 和密码，并通过 stdin 响应 Ansible 的 vault 提示。这与您附加到模板的 vault 密码相互独立。

请参阅[调查问卷变量](/user-guide/task-templates/survey-vars)、[变量组](/user-guide/environment)以及[安全 — Ansible 任务变量](/admin-guide/security#ansible-task-variables)。

### 工作流输出与任务 API 字段 {#workflow-outputs-and-task-api}

[工作流输出](/user-guide/workflows#producing-outputs)由任务运行时写入，通过 API 启动任务时无法设置。如果请求体中包含 `workflow_run_id`、`workflow_node_id`、`workflow_template_id`、`artifacts` 和 `runner_id`，`POST /api/project/{project_id}/tasks` 会忽略它们。
