---
title: Upgrading
description: Commands to upgrade Semaphore from the deb and rpm packages or from the binary archives on Linux and Windows.
---

# Upgrading

### Package manager {#package-manager}

Download a package file from [Releases page](https://github.com/semaphoreui/semaphore/releases).

&#x20;`*.deb` for Debian and Ubuntu, `*.rpm` for CentOS and RedHat.&#x20;

Install it using the package manager.

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


### Binary {#binary}

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

## Notable behavior changes {#behavior-changes}

These changes apply when you upgrade to recent **2.20.x** releases. They do not require a database migration, but playbooks or API clients that relied on the old behavior may need updates.

### Ansible extra variables are literals {#ansible-extra-vars-literal}

Semaphore no longer passes Ansible extra variables on the command line. Variable groups, survey answers, workflow inputs and the built-in `semaphore_vars` object are written to temporary YAML files and passed as `--extra-vars @file`. Every string value is tagged `!unsafe`, so Ansible treats it as data and does not evaluate Jinja2 inside the value.

If you stored Jinja2 in a survey field, variable group or `--extra-vars` template expecting Semaphore or Ansible to expand it before the playbook runs, that expansion no longer happens. Move the logic into the playbook (for example use `{{ my_var }}` where `my_var` is a plain value from Semaphore) or compute the value outside Semaphore.

Survey secrets and variable-group secrets are encrypted in a separate Ansible Vault file. Semaphore generates a one-off vault ID and password per task and answers Ansible's vault prompt on stdin. This is separate from vault passwords you attach to the template.

See [Survey variables](/user-guide/task-templates/survey-vars), [Variable groups](/user-guide/environment) and [Security — Ansible task variables](/admin-guide/security#ansible-task-variables).

### Workflow outputs and task API fields {#workflow-outputs-and-task-api}

[Workflow outputs](/user-guide/workflows#producing-outputs) are written by the task run and cannot be set when you start a task through the API. `POST /api/project/{project_id}/tasks` ignores `workflow_run_id`, `workflow_node_id`, `workflow_template_id`, `artifacts` and `runner_id` if they are present in the body.
