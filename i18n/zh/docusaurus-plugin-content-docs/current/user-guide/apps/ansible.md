
# Ansible

使用 Semaphore UI 可以运行 Ansible playbook。为此，您需要创建一个 **Ansible Playbook** 模板。

1. 进入**任务模板**（Task Templates）部分，点击**新建模板**（New Template），然后选择 **Ansible Playbook**。

![](/assets/ansible_1.png)

2. 设置模板。

模板允许您指定以下参数：

* 仓库（Repository）
* playbook 文件路径
* 工作目录（可选）
* 清单（Inventory）
* 变量组（Variable Groups）
* Vault
* 额外的 CLI 参数（tags、skip-tags、limit、verbosity）
* 环境变量

![](/assets/ansible_2.png)

## 工作目录 {#working-directory}

使用**工作目录**（Working directory）可从模板仓库的子目录运行 Ansible 命令。请输入相对于仓库根目录的路径。例如，如果 `ansible.cfg` 存放在 `<repository>/automation` 中，则输入 `automation`。绝对路径和仓库之外的路径会被拒绝。若省略，Semaphore 使用仓库根目录。

工作目录会影响依赖于进程当前目录的 Ansible 行为。Ansible 的[配置文件搜索顺序][ansible-config-search]包括当前目录中的 `ansible.cfg`。工作目录还会影响额外 CLI 参数中相对路径的解析，例如 [`--extra-vars @vars.yml`][ansible-extra-vars-file] 和 [`--private-key key.pem`][ansible-private-key]。playbook 和文件清单的路径仍然相对于各自的仓库根目录。

更改工作目录本身不会将该目录下的 `roles/` 或 `collections/` 子目录加入 Ansible 的搜索路径。[相对于 playbook 的角色发现][ansible-role-search]和[与 playbook 相邻的集合][ansible-playbook-collections]仍以 playbook 的位置为准。当所选的 `ansible.cfg` 配置了 `roles_path` 或 `collections_path` 时，工作目录仍可能间接影响它们的发现。

[ansible-config-search]: https://docs.ansible.com/ansible/latest/reference_appendices/config.html#the-configuration-file
[ansible-extra-vars-file]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#vars-from-a-json-or-yaml-file
[ansible-private-key]: https://docs.ansible.com/ansible/latest/cli/ansible-playbook.html#cmdoption-ansible-playbook-private-key
[ansible-role-search]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html#storing-and-finding-roles
[ansible-playbook-collections]: https://docs.ansible.com/ansible/latest/collections_guide/collections_installing.html#installing-collections-adjacent-to-playbooks

## 模板类型 {#template-types}

ansible-playbook 模板可以是以下类型之一：

* [任务](#task)
* [构建](#build)
* [部署](#deploy)

### 任务 {#task}

仅使用指定参数运行指定的 playbook。

如果您打算通过 API 调用并使用 *limit* 功能启动模板，请确保启用 *Ansible 提示：Limit*（Ansible prompts: Limit）选项。否则 API 调用中设置的 limit 将被忽略。对于由 API 触发的任务，这不会产生任何交互式提示，任务会无人值守地运行。

### 构建 {#build}

此类模板应用于创建[制品](https://en.wikipedia.org/wiki/Artifact\_\(software\_development\))。制品的起始版本可在模板参数中指定。每次运行都会递增制品版本。

![](/assets/template_new_build_ipad1.png)

Semaphore 不原生支持制品，它只提供任务版本管理。您需要自行实现制品的创建。请阅读 [CI/CD](../../admin-guide/cicd) 一文了解如何实现。

### 部署 {#deploy}

此类模板应用于将制品部署到目标服务器。每个 `deploy` 模板都与一个 `build` 模板关联。


这样您就可以将制品的特定版本部署到服务器。

## 模板选项 {#template-options}

### 计划任务 {#schedule}

您可以在模板设置中指定 cron 计划来设置任务调度。cron 表达式格式请参阅[文档](https://pkg.go.dev/github.com/robfig/cron/v3#hdr-CRON\_Expression\_Format)。


#### 仓库有新提交时运行任务 {#run-a-task-when-a-new-commit-is-added-to-the-repository}

您可以使用 cron 定期检查仓库中的新提交，并在有新提交时触发任务。

例如，您的应用源代码位于 git 仓库中。您可以将其添加到**仓库**（Repositories）中，并为新提交触发构建任务。


### tags、skip-tags 和 limit {#tags-skip-tags-and-limit}

模板支持以下 Ansible CLI 选项：

- `--tags`
- `--skip-tags`
- `--limit`

这些选项可在模板中设置，并在创建任务时覆盖。如果计划通过 API 传递这些值，请确保启用相应的提示。

### Galaxy 依赖 {#galaxy-requirements}

在运行 playbook 之前，Semaphore 会使用 `ansible-galaxy install --force` 安装在 playbook 目录、仓库根目录及其 `roles/` 和 `collections/` 子目录中找到的 `requirements.yml` 文件所声明的角色和集合。

为避免每次运行都重新安装，Semaphore 会保存每个依赖文件的校验和，仅在文件变更时才重新执行安装。位于 **Ansible 提示**（Ansible prompts）之下的可折叠 **Galaxy 安装选项**（Galaxy install options）部分中的两个模板选项控制此行为：

- **跳过 Galaxy 安装**（Skip Galaxy install）——完全不运行 `ansible-galaxy`。当依赖已预装在运行器镜像中时使用。
- **强制 Galaxy 安装**（Force Galaxy install）——始终运行 `ansible-galaxy install --force`，忽略已保存的校验和。当依赖文件指向一个不断变化的目标（例如分支而非标签）且您希望每次运行都获取最新版本时使用。

通过启用该部分底部**提示**（Prompts）下的同名复选框，可以将**跳过 Galaxy 安装**显示在任务运行表单中。启用提示后，运行时选择的值会覆盖模板默认值。

#### 额外的 Galaxy 参数 {#galaxy-extra-args}

**角色安装参数**（Role install args）和**集合安装参数**（Collection install args）（位于 **Ansible 提示**下方可折叠的 **Galaxy 安装选项**部分；默认折叠；旁边的计数器显示已自定义的 Galaxy 设置数量）分别为 `ansible-galaxy role install` 和 `ansible-galaxy collection install` 追加参数。它们之所以分开配置，是因为这两个子命令接受的参数不同：例如 `--pre` 仅对集合有效。

每个条目是一个 argv 标记；值可以内联给出（`--timeout=60`），也可以作为下一个条目给出（`--timeout`、`60`）。仅接受以下参数：

| 范围 | 参数 |
|-------|-------|
| 两者 | `-c`/`--ignore-certs`、`-f`/`--force`、`--force-with-deps`、`-i`/`--ignore-errors`、`-n`/`--no-deps`、`-s`/`--server <url>`、`--timeout <seconds>`、`-v`…`-vvvv`/`--verbose` |
| 仅角色 | `-g`/`--keep-scm-meta` |
| 仅集合 | `--pre`、`-U`/`--upgrade`、`--offline`、`--no-cache`、`--clear-response-cache`、`--disable-gpg-verify`、`--keyring <path>`、`--signature <url>`、`--required-valid-signature-count <n>`、`--ignore-signature-status-code(s) <code>` |

其他任何参数都会在保存模板时被拒绝。特别是不允许使用 `--token`/`--api-key`，因为命令行参数在进程列表中可见——请改为在变量组中通过环境变量（例如 `ANSIBLE_GALAXY_SERVER_<NAME>_TOKEN`）配置 Galaxy 凭据。依赖文件（`-r`）由 Semaphore 设置，安装路径（`-p`、`--roles-path`、`--collections-path`）被刻意排除，以防模板写入仓库之外——请改为在 `ansible.cfg` 中或通过 `ANSIBLE_ROLES_PATH`/`ANSIBLE_COLLECTIONS_PATH` 设置 `roles_path`/`collections_path`。

### 并行度（`--forks` / `-f`） {#parallelism---forks---f}

通过在模板的**额外 CLI 参数**（Extra CLI arguments）中传入 `--forks` 或
`-f`，可以控制 Ansible 并行连接的主机数量。参数必须是有效的 JSON——
请使用由独立标记组成的数组：

```json
["--forks", "10"]
```

也支持短格式：

```json
["-f", "10"]
```

在模板上启用**允许在任务中覆盖参数**（Allow override arguments in task）后，任务可以
在运行时提供自己的 forks 值。Ansible 会同时收到模板和任务的参数；命令行中最后一个 `--forks` / `-f` 生效。

如果参数不是有效的 JSON，任务会在开始执行前失败，并给出描述性的验证错误。

### 身份验证 {#authentication}

playbook 中主机的身份验证通过清单上引用的密钥库（Key Store）用户完成。SSH 使用的用户由密钥库条目上可选的用户字段决定。

### 多个 Vault 密码 {#multiple-vault-passwords}

您可以将密钥库中的多个 Vault 密码附加到一个模板。执行期间，Ansible 会尝试使用提供的密码进行解密。

### 详细程度 {#verbosity-level}

您可以在模板/任务表单中调整任务的 Ansible 详细程度（例如 `-v`、`-vvv`），以便排查问题。
