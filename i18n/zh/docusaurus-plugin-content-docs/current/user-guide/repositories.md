# 仓库

仓库（Repository）是存放和管理 Ansible 内容（如 playbook 和 role）的地方。

![仓库列表](/assets/repositories-list.webp)

列表显示名称、带分支的 Git URL，以及用于认证的密钥。

Semaphore 支持以下类型的仓库：
  * 本地文件系统（`/path/to/the/repo`）
  * 本地 Git 仓库（`file://`）
  * 通过 HTTPS（`https://`）、SSH（`ssh://` 或简写形式 `git@host:org/repo.git`）访问的远程 Git 仓库
  * 支持 `git://` 协议，但出于安全原因不推荐使用。

所有任务模板（Task Templates）都需要一个仓库才能运行。

## 认证 {#authentication}
如果你使用的远程仓库需要认证，需要在 Semaphore 的**密钥库（Key Store）**分区中配置密钥。

对于使用 SSH 的远程仓库，你需要在**密钥库**中使用你的 SSH 密钥。

对于不需要认证的远程仓库，可以创建类型为 `None` 的密钥。

## 创建新仓库 {#creating-a-new-repository}
1. 确保你已经在密钥库分区中为即将添加的仓库配置好了密钥。

2. 进入 Semaphore 的 Repositories 分区，点击右上角的 **New Repository** 按钮。

3. 配置仓库：
    * 为仓库命名
    * 添加 URL。URL 必须以下列形式之一开头：
        * `/path/to/the/repo`：文件系统上的本地文件夹
        * `https://`：通过 HTTPS 访问的远程 Git 仓库
        * `ssh://`：通过 SSH 访问的远程 Git 仓库
        * `file://`：本地 Git 仓库
        * `git://`：通过 Git 协议访问的远程 Git 仓库
    * 设置仓库的分支，如果不确定应该填什么，通常是 master 或 main
    * 选择你在设置此仓库之前配置好的 **Access Key**。

4. 全部配置完成后点击 Save。

## 编辑现有仓库 {#editing-an-existing-repository}
1. 进入 Semaphore 的 Repositories 分区。

2. 点击要修改的仓库旁边的铅笔图标，随后会显示该仓库的配置。

## 删除仓库 {#deleting-a-repository}
请确保要删除的仓库没有被任何任务模板使用。
被任务模板使用的仓库无法删除：
1. 进入 Semaphore 的 Repositories 分区。

2. 点击要删除的仓库上的垃圾桶图标。

3. 如果确定要删除该仓库，请在确认弹窗中点击 Yes。

## 依赖要求 {#requirements}
在项目初始化时，Semaphore 会按以下位置和顺序查找并安装 requirements.yml 中的 Ansible role 和 collection。

### Role {#roles}

* `playbook_dir`/roles/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/roles/requirements.yml
* `repo_path`/requirements.yml

### Collection {#collection}

* `playbook_dir`/collections/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/collections/requirements.yml
* `repo_path`/requirements.yml

### 处理逻辑 {#processing-logic}

* 每个文件独立处理
* 如果文件存在，则按其类型（role 或 collection）进行处理
* 如果任何文件的处理出错，安装过程会停止并返回该错误
* 根目录中的同一个 requirements.yml 文件（**`playbook_dir`/requirements.yml** 和 **`repo_path`/requirements.yml**）会被处理两次——一次用于 role，一次用于 collection

无论之前的位置是否存在或是否处理成功，Semaphore 都会尝试处理所有这些位置，除非出现错误。
