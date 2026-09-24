---
title: Host config
description: "将 Git 主机或仓库 URL 映射到密钥库中的凭据，使托管在别处的子模块、Galaxy 角色、Terraform 模块和清单仓库能够用各自的密钥访问。"
---

# Host config

任务使用在[仓库](/user-guide/repositories)中选择的密钥向其仓库进行认证。任务从 Git 获取的其他所有内容都没有自己的凭据：另一台服务器上的子模块、`requirements.yml` 中的角色、Terraform 模块、保存在第二个仓库中的清单。**Host config**（主机配置）填补了这一空缺。一条映射将 Git 主机或仓库 URL 绑定到[密钥库](/user-guide/key-store)中的一个凭据，项目的每一次 Git 操作在访问该主机或 URL 时都会使用它。

该页面位于项目菜单中的 **Repositories** 下方。添加、编辑和删除映射需要管理项目资源的权限，与密钥库所需的权限相同。

![带有三条映射的项目 Host config 页面](/assets/host-config-page.webp)

## 映射类型 {#mapping-types}

点击 **Add mapping**（添加映射），选择映射匹配的对象。

### Host {#host}

**Host** 映射匹配一个 SSH 主机名，例如 `github.com` 或 `gitlab.example.com`，并且需要一个 **SSH** 密钥。任务每次打开到该主机的 SSH 连接时，都会使用映射的密钥进行认证：通过 SSH 克隆的仓库或子模块、`requirements.yml` 中的 `git@host:group/repo.git` URL，以及 Ansible 清单中使用该名称的主机。如果密钥带有登录名，它会被用作该主机的 SSH 用户。

<div style={{maxWidth: 720}}>

![选择了 Host 类型的添加映射对话框](/assets/host-config-form-host.webp)

</div>

### URL {#url}

**URL** 映射匹配一个 `https://` 或 `http://` 仓库 URL。它可以指定单个仓库，如 `https://gitlab.example.com/infra/network.git`，也可以以 `/` 结尾来覆盖某个组下的所有仓库，如 `https://gitlab.example.com/ansible/`。当多条映射同时匹配时，最具体的 URL 胜出，因此单个仓库的映射会覆盖包含它的组的映射。

凭据决定了访问 URL 的方式：

| 凭据 | 行为 |
|---|---|
| **SSH** 密钥 | URL 被改写为 SSH 形式，连接使用该密钥认证。密钥的登录名作为 SSH 用户，没有登录名时使用 `git`。 |
| **密码登录** | 登录名和密码被加入 URL 并通过 HTTPS 发送。留空登录名即可使用个人访问令牌。只有 `https://` URL 接受此凭据，因此机密永远不会以明文传输。 |

URL 本身不得包含凭据、空格、引号或 `=` 字符。

<div style={{maxWidth: 720}}>

![使用密码登录的 URL 映射的编辑对话框](/assets/host-config-form-url.webp)

</div>

## 映射的生效范围 {#where-mappings-apply}

项目的映射在任务的第一条 Git 命令之前安装，并持续生效直到任务结束。它们覆盖：

- 克隆和更新模板的仓库，包括其子模块；
- 从 `requirements.yml` 安装的角色和集合，参见 [Galaxy 依赖](/user-guide/apps/ansible#galaxy-requirements)；
- `terraform init` 或 `tofu init` 获取的模块；
- 由 playbook 或脚本自身启动的 Git 命令，例如 Ansible 的 `git` 模块；
- 保存在 Git 中的清单的仓库；
- 清单中的主机，当 **Host** 映射与其名称匹配时；
- 在模板表单中浏览仓库的分支和 playbook，以及在新提交时启动的计划任务的轮询。

发送到[远程运行器](/admin-guide/runners)的任务会随任务一起收到映射，因此在那里的行为完全相同。

映射会覆盖服务器全局 SSH 配置（[配置](/reference/configuration)中的 `ssh.config_path`）里同一主机的条目；该文件的其他条目继续生效。映射需要命令行 Git 客户端，即默认的 `git_client: cmd_git`；使用内置的 `go_git` 客户端时，带有映射的项目的任务会以一条说明性错误失败，而不是使用错误的凭据。

## 凭据 {#credentials}

私钥从不落盘：每条 SSH 映射将其密钥保存在一个与任务同生命周期的 SSH 代理中，生成的 SSH 配置只引用该代理。密码登录通过 Git 的配置环境传递，而不是通过命令行，并且 Git 在任务日志中报告的是原始 URL，因此机密在两处都不会出现。

被映射引用的密钥无法删除；确认对话框会列出使用它的映射。将此类密钥的类型改为映射无法使用的类型，例如把 Host 映射的 SSH 密钥改成密码登录，同样会被拒绝。

## 示例 {#example}

一个 playbook 位于 GitHub，使用自托管 GitLab 上的一个子模块，并通过 `requirements.yml` 从第二个 GitLab 组安装一个角色：

```yaml
# requirements.yml
- src: https://gitlab.example.com/ansible/role-nginx.git
  version: v2.1.0
```

三条映射即可让任务运行，而无需对仓库做任何修改：

| 类型 | 主机或 URL | 凭据 |
|---|---|---|
| Host | `github.com` | GitHub 仓库的部署密钥 |
| URL | `https://gitlab.example.com/ansible/` | 以密码登录形式保存的 GitLab 访问令牌 |
| URL | `https://gitlab.example.com/infra/network.git` | 仅在该仓库上被允许的 SSH 密钥 |

## 备份 {#backups}

映射是[项目备份](./projects/settings#danger-zone)的一部分。它们按名称引用凭据，因此恢复后的项目仍将映射绑定到恢复的密钥上。与所有密钥一样，机密值本身不会被导出。
