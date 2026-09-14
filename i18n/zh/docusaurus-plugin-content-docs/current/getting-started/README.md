---
title: 快速入门
description: 安装 Semaphore UI，运行并检查第一个 Ansible 任务，然后配置定时运行。
sidebar_label: 快速入门
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 快速入门

Semaphore UI 提供 Web 界面和 API，用于通过 Ansible、Terraform/OpenTofu、Bash、PowerShell 和 Python 执行可重复的自动化。它将 Git 中的自动化代码、凭据、变量、计划、工作流和执行环境整合在一起，并保存每次运行的状态和日志。

本指南使用 Ansible 作为第一个可运行示例。您可以使用自己仓库中的 playbook，也可以使用公共仓库 [`semaphoreui/semaphore-demo`](https://github.com/semaphoreui/semaphore-demo) 重现截图中的示例。

## 1. 安装 Semaphore

根据 Semaphore 的运行环境选择安装方式。默认选中原生软件包。

<Tabs groupId="installation-method">
  <TabItem value="package" label="原生软件包" default className="InstallationMethod">

对于 `amd64` 上的 Debian 或 Ubuntu：

```bash
wget https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.deb
sudo apt install ./semaphore_2.19.12_linux_amd64.deb
```

对于 `amd64` 上的 RHEL、Fedora、Rocky Linux、AlmaLinux 或 CentOS Stream：

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.rpm
sudo dnf install ./semaphore_2.19.12_linux_amd64.rpm
```

配置数据库和首个管理员，然后使用生成的配置启动 Semaphore：

```bash
semaphore setup --config ./config.json
semaphore server --config ./config.json
```

本地试用时，选择 SQLite，接受或设置数据库和 playbook 路径，输入公共 URL，并按提示创建首个管理员。

  </TabItem>
  <TabItem value="docker" label="Docker Compose" className="InstallationMethod">

创建 `compose.yaml`：

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:v2.19.12
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - semaphore-data:/var/lib/semaphore
    environment:
      SEMAPHORE_DB_DIALECT: sqlite
      SEMAPHORE_DB_PATH: /var/lib/semaphore
      SEMAPHORE_ADMIN: admin
      SEMAPHORE_ADMIN_NAME: Admin
      SEMAPHORE_ADMIN_EMAIL: admin@localhost
      SEMAPHORE_ADMIN_PASSWORD: ${SEMAPHORE_ADMIN_PASSWORD}
      SEMAPHORE_ACCESS_KEY_ENCRYPTION: ${SEMAPHORE_ACCESS_KEY_ENCRYPTION}

volumes:
  semaphore-data:
```

生成加密密钥，将其与强管理员密码一起放入 `compose.yaml` 旁的 `.env` 文件中：

```bash
head -c32 /dev/urandom | base64
```

```dotenv
SEMAPHORE_ADMIN_PASSWORD=replace-with-a-long-password
SEMAPHORE_ACCESS_KEY_ENCRYPTION=paste-the-generated-key-here
```

不要将 `.env` 纳入版本控制，然后启动容器：

```bash
docker compose up -d
docker compose logs -f semaphore
```

  </TabItem>
  <TabItem value="binary" label="二进制压缩包" className="InstallationMethod">

从 [GitHub Releases](https://github.com/semaphoreui/semaphore/releases) 下载适合您的操作系统和 CPU 架构的压缩包。Linux `amd64` 示例：

```bash
curl -LO https://github.com/semaphoreui/semaphore/releases/download/v2.19.12/semaphore_2.19.12_linux_amd64.tar.gz
tar -xzf semaphore_2.19.12_linux_amd64.tar.gz
./semaphore setup --config ./config.json
./semaphore server --config ./config.json
```

本地试用时，选择 SQLite，接受或设置数据库和 playbook 路径，输入公共 URL，并按提示创建首个管理员。

macOS 请选择 `darwin` 压缩包，Windows 请选择 `.zip`。本指南后续的 Ansible 操作仍需要安装了 Ansible 的 Linux、macOS、WSL、容器或 Linux runner 执行环境。

  </TabItem>
  <TabItem value="helm" label="通过 Helm 安装到 Kubernetes" className="InstallationMethod">

添加官方 chart，并在安装前查看其默认配置：

```bash
helm repo add semaphoreui https://semaphoreui.github.io/charts
helm repo update
helm show chart semaphoreui/semaphore
helm show values semaphoreui/semaphore > values.yaml

helm upgrade --install semaphore semaphoreui/semaphore \
  --namespace semaphore \
  --create-namespace \
  --values values.yaml
```

chart 的 `appVersion` 标识 Semaphore 版本。生产使用前，请在 `values.yaml` 中配置持久存储、数据库、管理员凭据、访问密钥的加密密钥以及 ingress/TLS。

  </TabItem>
</Tabs>

如需引导式配置，请使用官方 [Semaphore 安装页面](https://semaphoreui.com/install) 选择版本、生成配置并获取相应的下载或运行命令。

<details>
<summary>不确定该选择哪种安装方式？</summary>

| 安装方式 | 适用场景 | 详细指南 |
| --- | --- | --- |
| **原生软件包** | 支持的 Linux 服务器 | [通过包管理器安装](/admin-guide/installation/package-manager) |
| **Docker Compose** | 快速搭建隔离环境或在容器主机上运行 | [Docker 安装](/admin-guide/installation/docker) |
| **二进制压缩包** | macOS、Windows、FreeBSD，或没有合适软件包的 Linux | [二进制安装](/admin-guide/installation/binary-file) |
| **通过 Helm 安装到 Kubernetes** | 已有 Kubernetes 集群 | [Kubernetes 安装](/admin-guide/installation/k8s) |

详细指南涵盖生产数据库、服务、机密、存储、ingress 和升级。

</details>

本 Ansible 教程要求 `git --version` 和 `ansible-playbook --version` 能在 Semaphore 服务器或 runner 上运行。如果任一命令不可用，请先安装 [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) 和 [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) 再继续。

:::tip 生产环境安装
在生产环境使用 Semaphore 前，请阅读[配置](/admin-guide/configuration)、[安全](/admin-guide/security)、[Runners](/admin-guide/runners)、[高可用性](/admin-guide/ha)和[升级](/admin-guide/upgrading)。
:::

## 2. 登录

1. 在浏览器中打开 Semaphore。本地安装通常使用 [http://localhost:3000](http://localhost:3000)。
2. 输入通过 `semaphore setup` 或 Docker 管理员变量创建的管理员登录名和密码。
3. 选择 **Sign In**。

![Semaphore 登录界面](/assets/getting-started/sign-in.jpg)

首次配置请使用管理员账户，因为它可以创建项目和用户。管理员创建普通用户账户并授予项目访问权限后，普通用户也从同一页面登录。请参阅[用户管理](/user-guide/admin/users)。

## 3. 创建项目

登录空的 Semaphore 实例后，**New Project** 页面会自动打开。如果已有项目，请打开项目选择器并选择 **New Project...**。填写表单：

| 字段 | 填写内容 |
| --- | --- |
| **Project Name** | 易于识别的工作空间名称，例如 `Production infrastructure` 或您的应用名称。 |
| **Max number of parallel tasks** | 可选。限制此项目中的并发任务数；留空则使用服务器限制。 |
| **Telegram Chat ID** | 可选。为项目配置 Telegram 通知时使用。 |
| **Allow alerts for this project** | 可选。启用已配置的项目通知。 |
选择 **Create**。

不要选择 **Create Demo Project**：它会添加示例资源，而本指南从空项目开始。以后创建其他项目时，同一选项会作为 **Demo** 开关显示在 New Project 对话框中。

![包含所有可用字段的空白 New Project 表单](/assets/getting-started/new-project-empty.jpg)

新项目包含 **Task Templates**、**Workflows**、**Schedule**、**Inventory**、**Variable Groups**、**Key Store** 和 **Repositories** 等部分。有关项目设置、团队访问、活动和历史，请参阅[项目](/user-guide/projects)。

<details>
<summary>观看此步骤</summary>

![在空的 Semaphore 实例中创建第一个项目](/assets/getting-started/create-first-project.gif)

</details>

## 4. 理解核心概念

新项目打开时显示空的 Dashboard。侧边栏是此项目的主要导航入口：

![添加资源和任务之前的空白 Semaphore 项目界面](/assets/getting-started/after-sign-in.jpg)

- **Dashboard** 显示运行历史、统计信息、活动和项目设置。
- **Task Templates**、**Workflows** 和 **Schedule** 定义运行内容和运行时间。
- **Repositories**、**Inventory**、**Variable Groups** 和 **Key Store** 提供代码、目标、变量和凭据。
- **Integrations**、**Team** 和 **Runners** 连接外部系统、用户和执行主机。

下图展示这些资源如何产生一次运行：

<div class="BlockSchema">
  ![Semaphore 资源和触发器如何产生任务运行](/assets/getting-started/core-concepts.svg)
</div>

界面操作、API 请求或计划可以直接启动 **Task Template**，也可以启动使用任务模板的 **Workflow**。Semaphore 创建一次任务运行，在界面中显示为 **Task**，并将其发送到 Semaphore 服务器或符合条件的远程 runner。对于 Ansible，该执行主机运行 `ansible-playbook`；Inventory 列出由 Ansible 管理的系统。

| 概念 | 作用 |
| --- | --- |
| [**Project**](/user-guide/projects) | 包含自动化资源、权限和运行历史的隔离工作空间。 |
| [**Repository**](/user-guide/repositories) | 指向包含任务所用自动化文件的 Git 分支或标签。 |
| [**Key Store**](/user-guide/key-store) | 在 Git 和任务输入之外保存可复用的 SSH 密钥、登录凭据、令牌和 Ansible Vault 密码。 |
| [**Inventory**](/user-guide/inventory) | 告诉 Ansible 要管理哪些主机和组，以及使用哪些凭据。 |
| [**Variable Group**](/user-guide/environment) | 保存可供一个或多个模板复用的 Ansible 变量、环境变量和机密。 |
| [**Task Template**](/user-guide/task-templates/) | 保存运行定义：自动化类型、文件、仓库、inventory、变量、提示参数和执行选项。 |
| [**Task (task run)**](/user-guide/tasks) | 一次执行，具有独立的输入、状态、时间戳、日志、详情和结果。 |
| **Workflow** | 将任务模板连接成多步骤流程，包含成功、失败、审批和备注分支。 |
| [**Schedule**](/user-guide/schedules) | 根据 cron 表达式单次或重复启动任务模板或工作流。 |
| [**Runner**](/admin-guide/runners) | 在 Semaphore 主服务器之外执行排队任务，例如在其他网络或安全区域中。 |

## 5. 连接仓库

Repository 将 Semaphore 连接到 Git 中的自动化代码；Semaphore 本身不存储 playbook。连接您的仓库，或使用以下公共演示配置完整重现示例。[集成](/user-guide/integrations)是独立功能，用于从 GitHub、GitLab 或其他 webhook 来源启动自动化。

1. 打开 **Repositories**，选择 **New Repository**。
2. 输入仓库名称、URL、分支和凭据。如果使用公共演示，请填写：

   | 字段 | 值 |
   | --- | --- |
   | **Name** | `Demo` |
   | **URL or path** | `https://github.com/semaphoreui/semaphore-demo.git` |
   | **Branch / Tag** | `main` |
   | **Access Key** | `None`，因为该仓库是公共仓库 |

3. 选择 **Create**。

![填写了 Semaphore 公共演示仓库信息的仓库表单](/assets/getting-started/repository-settings.jpg)

现在仓库应出现在列表中。Semaphore 会在任务启动时在执行主机上克隆或更新仓库，而不是在创建 Repository 记录时执行。截图展示了本指南使用的演示配置。

![项目仓库列表中已连接的 Demo 仓库](/assets/getting-started/connected-repository.jpg)

对于私有仓库，请选择合适的 Key Store 凭据以替代 `None`。有关本地路径、HTTPS、SSH、分支、凭据和依赖文件，请参阅[仓库](/user-guide/repositories)。

## 6. 为远程受管主机添加 SSH 密钥

此 SSH 凭据使 Ansible 能从 Semaphore 服务器或 runner 连接到 Inventory 中的远程主机。如果使用 `localhost` 演示，则不需要 SSH 密钥；请继续第 7 步。

演示使用 `localhost` 和 `ansible_connection=local`，因此不会建立 SSH 连接。如果您自己的 playbook 管理远程主机，请添加其密钥：

1. 将密钥的公钥部分添加到受管主机上的 `~/.ssh/authorized_keys`。
2. 打开 **Key Store**，选择 **New Key**。
3. 输入易于识别的名称，例如 `Production hosts`，保持选中 **Local**，然后选择 **SSH Key**。
4. 输入 Ansible 应在主机上使用的账户，例如 `ubuntu` 或 `ec2-user`。
5. 粘贴完整私钥，包括 `BEGIN` 和 `END` 行，并根据需要添加口令。
6. 选择 **Create**。下一步在 **Inventory → User Credentials** 下选择此密钥。

![为受管主机所用账户创建密钥的 New SSH Key 表单](/assets/getting-started/add-managed-host-ssh-key.jpg)

截图中是占位内容，不是可用的机密。切勿在文档、截图、任务参数或版本控制中公开私钥。

Semaphore 可以在本地存储机密，也可以集成 [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) 和 [Devolutions Server](/user-guide/key-store/devolutions-server) 等外部机密存储。有关支持的全部凭据类型和存储选项，请参阅[密钥存储](/user-guide/key-store)。

## 7. 创建 Ansible inventory

每个 Ansible 任务都需要 inventory。首次本地运行时，请向仓库添加 `inventory.ini` 等文件：

```ini
[local]
localhost ansible_connection=local
```

这里的 `localhost` 指执行主机，即 Semaphore 服务器、容器或 runner，不一定是打开浏览器的计算机。`ansible_connection=local` 告诉 Ansible 不使用 SSH。演示仓库使用等效文件 `invs/prod/hosts`，其中的组名为 `site`。

如果在自己的仓库中创建了 `inventory.ini`，请先提交并推送到连接 Semaphore 的分支，再继续。

1. 打开 **Inventory**，选择 **New Inventory → Ansible Inventory**。
2. 输入与您的 inventory 对应的值。例如：

   | 字段 | 值 |
   | --- | --- |
   | **Name** | `Local`（演示中为 `Prod`） |
   | **User Credentials** | 对于 `localhost` 使用 `None`；远程 inventory 使用主机的 SSH 凭据 |
   | **Type** | `File` |
   | **Path to Inventory file** | `inventory.ini`（演示中为 `invs/prod/hosts`） |

3. 将 **Runner tag**、**Sudo Credentials** 和 **Repository** 留空，然后选择 **Create**。

![使用演示仓库配置的 Ansible 文件型 inventory](/assets/getting-started/ansible-inventory-settings.jpg)

将 **Repository** 留空表示 Semaphore 从任务模板所选仓库解析此相对 inventory 路径。仅当 inventory 位于其他仓库时才在此选择仓库。对于远程主机，请将第 6 步中的 SSH 密钥用作 **User Credentials**。

有关静态、文件型和动态 inventory，请参阅 [Inventory](/user-guide/inventory)。

## 8. 添加变量组（可选）

**Variable Group** 是一组可复用的值，可以关联到一个或多个任务模板。**Extra variables** 用于 Ansible 变量，**Environment variables** 用于导出到进程的值，**Secrets** 用于需要加密和遮蔽的敏感值。这样可以将特定环境的配置保留在 playbook 之外，避免在每个模板中重复输入相同值。

第一个任务无需变量组也能运行。作为示例，可以创建一个设置 `ansible_python_interpreter=auto_silent` 的变量组；Ansible 仍会自动发现 Python，但不会输出关于发现过程的提示性警告。

1. 打开 **Variable Groups**，选择 **New Group**。
2. 为 **Group Name** 设置一个描述性名称，例如 `Ansible defaults`。
3. 在 **Variables → Extra variables** 下，保持选中 **Table**，然后选择 **+**。
4. 输入：

   | 名称 | 类型 | 值 |
   | --- | --- | --- |
   | `ansible_python_interpreter` | `String` | `auto_silent` |

5. 选择 **Save**。

![在表格编辑器中配置的变量组](/assets/getting-started/variable-group-table.jpg)

有关优先级规则和机密存储选项，请参阅[变量组](/user-guide/environment)。

## 9. 创建 Ansible 任务模板

### 检查 Git 中的 playbook

如果已连接的仓库包含 Ansible playbook，请使用它。否则，添加 `get-started.yml` 等简单示例：

```yaml
- name: Verify Semaphore setup
  hosts: all
  gather_facts: false
  tasks:
    - name: Check the Ansible connection
      ansible.builtin.ping:
```

如果使用演示，请改用其 [`ping.yml`](https://github.com/semaphoreui/semaphore-demo/blob/main/ping.yml)。它以演示 inventory 中的 `site` 组为目标，并运行包含的 `ping` 角色。

演示从 Git 子模块下载该角色，并向 `semaphoreui.com` 发送一次 ICMP 请求，因此执行主机需要能访问 GitHub 并允许出站 ICMP。如果 ICMP 被阻止，请改用本地 `get-started.yml` 示例。

![已连接 GitHub 仓库中的 ping.yml](/assets/getting-started/demo-playbook-github.jpg)

截图展示公共演示仓库中的 playbook。将自动化代码保存在 Git 中便于审查更改，也使 Semaphore 能记录每次运行所用的确切提交。

如果在自己的仓库中创建了 `get-started.yml`，请先提交并推送到连接 Semaphore 的分支，再继续。

### 配置模板

1. 打开 **Task Templates**，选择 **New template → Applications**。
2. 启用 **Ansible Playbook**，然后返回 **Task Templates**。
3. 选择 **New template → Ansible Playbook**。
4. 保持选中 **Task** 选项卡。**Build** 和 **Deploy** 是带版本管理的 CI/CD 模板类型，此次独立运行不需要它们。
5. 根据您的文件配置模板。例如：

   | 字段 | 值 | 作用 |
   | --- | --- | --- |
   | **Name** | `Run first playbook` | 标识可复用模板及其任务历史。 |
   | **Repository** | 您的仓库（示例中为 `Demo`） | 提供 playbook 和相关文件。 |
   | **Path to playbook file** | `get-started.yml`（演示中为 `ping.yml`） | 从仓库根目录解析。 |
   | **Inventory** | `Local`（演示中为 `Prod`） | 提供首次运行的本地目标。 |
   | **Variable Groups** | `Ansible defaults`（如果已创建） | 添加可选的可复用 Ansible 设置。 |
   | **Runner tag** | 留空 | 根据服务器配置使用本地执行或默认 runner。 |

6. 对于上面的简单 playbook 或公共演示，在 **Ansible options** 下启用 **Skip Galaxy install**：此任务都不需要 Galaxy 依赖。如果您的仓库需要来自 `requirements.yml` 文件的角色或集合，请保持关闭。
7. 选择 **Create**。

![包含仓库、inventory 和变量组的 Ansible 任务模板](/assets/getting-started/ansible-task-template-settings.jpg)

<details>
<summary>观看此步骤</summary>

![启用 Ansible 并创建第一个 Ansible 任务模板](/assets/getting-started/create-ansible-template.gif)

</details>

其他有用字段包括：

- **Vaults** 为加密的 Ansible 内容选择 Key Store 密码。
- **Limit**、**Tags** 和 **Skip tags** 缩小 playbook 的执行范围。
- **Prompts** 允许界面用户、计划或 API 请求为特定运行覆盖已启用的值。
- **Runner tag** 控制任务在哪里执行；它不选择 Ansible 目标。

有关全部字段和执行选项，请参阅 [Ansible 模板](/user-guide/apps/ansible)和[任务模板](/user-guide/task-templates/)。

## 10. 运行模板并检查任务

1. 打开创建的任务模板，选择 **Run**。
2. 可选添加一条消息，例如 `First Semaphore run`。
3. 保持 **Dry Run** 和 **Diff** 关闭，然后选择 **Run**。

![未启用额外选项的 Ansible playbook New Task 对话框](/assets/getting-started/run-ansible-task-clean.jpg)

Semaphore 将任务加入队列，准备仓库，应用 inventory 和可选变量组，然后运行选定的 playbook。状态依次经过 **Waiting** 和 **Running**，最终变为 **Success** 或 **Failed**。

### 日志

**Log** 是命令输出的依据。请阅读最终的 `PLAY RECAP`，不要只看绿色状态标记。

![包含 ping 输出和 PLAY RECAP 的成功 Ansible 任务日志](/assets/getting-started/ansible-task-log-variable-group.jpg)

具体计数取决于您的 playbook。首次成功运行应以 `localhost` 的 `unreachable=0` 和 `failed=0` 结束。如果演示日志显示 `changed=1`，表示通过 shell 执行的 ping 步骤已运行并报告了更改；这不是错误。

### 详情和摘要

| 选项卡 | 检查内容 |
| --- | --- |
| **Log** | 实时执行阶段、模块输出、错误和最终 `PLAY RECAP`。 |
| **Details** | 模板类型、Git 提交、运行消息、发起人、时间戳和耗时。 |
| **Summary** | 任务摘要功能可用时，查看完成后各主机的 Ansible 结果和错误。 |

![包含模板、提交和时间信息的任务详情](/assets/getting-started/ansible-task-details.jpg)

![包含 OK 和 Not OK 主机数量的任务摘要](/assets/getting-started/ansible-task-summary.jpg)

如果 **Summary** 不可用，请在 **Log** 中验证运行；`PLAY RECAP` 仍是 Ansible 结果的权威依据。

<details>
<summary>观看运行过程和结果</summary>

![运行 Ansible 任务并检查日志和详情](/assets/getting-started/run-and-inspect-task.gif)

</details>

### 查找以前的运行

关闭任务窗口，返回模板的 **Tasks** 选项卡。每次运行都有独立的任务编号、状态、用户、开始时间、耗时和保存的日志。**Dashboard → History** 显示项目中所有模板的运行。更多信息请参阅[任务](/user-guide/tasks)和[项目历史](/user-guide/projects/history)。

![包含成功任务运行的 Ansible 模板历史](/assets/getting-started/ansible-template-history.jpg)

如果任务失败，请根据日志中最后一条有用信息决定下一步检查内容：

- 克隆错误通常指向仓库 URL、分支、Access Key 或执行主机的网络访问问题。
- `ansible-playbook: command not found` 表示 Semaphore 服务器或选定 runner 上缺少 Ansible。
- `UNREACHABLE` 通常指向 inventory 地址、主机凭据、SSH 可达性或主机密钥验证问题。
- 失败的 Ansible 步骤通常会在 `PLAY RECAP` 正上方列出任务名称、主机和模块错误。

## 11. 按计划运行任务

通过界面成功执行任务后，即可自动运行它。例如，cron 表达式 `0 3 * * *` 会在 Semaphore 显示的时区中每天 03:00 启动任务。

1. 打开 **Schedule**，选择 **New Schedule → Cron**。
2. 输入描述性名称，例如 `Nightly playbook`。
3. 选择要运行的任务模板。
4. 保持启用 **Show cron format**，输入 cron 表达式，例如 `0 3 * * *`。
5. 保持选中 **Enabled**，选择 **Save**。

![配置为每天 03:00 运行示例任务的 cron 计划](/assets/getting-started/create-cron-schedule.jpg)

Semaphore 会在保存前显示配置的时区并计算下次运行时间。计划运行使用与模板相同的仓库、inventory、变量组和执行设置。如果模板提供提示参数，计划可以为其提供值。有关 cron 语法、时区配置、单次运行和计划参数，请参阅[计划](/user-guide/schedules)。

保存后，确认计划处于 **Enabled** 状态，且 **Next run** 显示预期时间。计划任务会出现在模板的 **Tasks** 选项卡和 **Dashboard → History** 中。

## 接下来可以尝试什么

第一个 Ansible 任务成功后：

- 如果仓库要求身份验证，请在[密钥存储](/user-guide/key-store)中添加合适的私有凭据。
- 如果多个模板需要有序的成功、失败、审批或备注路径，请构建 **Workflow**。
- 使用[集成](/user-guide/integrations)接收来自 GitHub、GitLab 或其他系统的经过身份验证的 webhook 触发。
- 使用 [API](/reference/api) 以编程方式管理资源和启动模板。
- 如果需要在其他网络、操作系统或安全区域执行，请添加[远程 runner](/admin-guide/runners)。

生产使用时，通过 HTTPS 提供 Semaphore 服务，将数据库与访问密钥加密机密一同备份，配置集中身份验证，并阅读[安全](/admin-guide/security)、[日志](/admin-guide/logs)和[升级](/admin-guide/upgrading)。
