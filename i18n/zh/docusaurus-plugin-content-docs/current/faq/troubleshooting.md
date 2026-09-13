---
title: 故障排除
description: "最常见故障的解决方法：运行器 404、Ansible Gathering Facts、Postgres SSL、git 克隆、脚本输出缺失以及 LDAP 错误。"
---

# 故障排除

## 运行器报错 404 {#runner-prints-error-404}

### 如何修复 {#how-to-fix}

[从运行器（Runner）收到 401 错误码](https://github.com/semaphoreui/semaphore/discussions/1873?converting=1)

---

## localhost 的 Gathering Facts 问题 {#gathering-facts-issue-for-localhost}

该问题可能出现在通过 [Snap](https://snapcraft.io/semaphore) 或 [Docker](https://hub.docker.com/r/semaphoreui/semaphore) 安装的 Semaphore UI 上。

```
4:10:16 PM
TASK [Gathering Facts] *********************************************************
4:10:17 PM
fatal: [localhost]: FAILED! => changed=false
```

### 原因 {#why-this-happens}

关于 Ansible 中 localhost 的使用，请阅读这篇文章：[Implicit 'localhost'](https://docs.ansible.com/ansible/latest/inventory/implicit_localhost.html)。

Ansible 尝试在本地收集 facts，但 Ansible 运行在一个受限的隔离容器中，不允许这样做。

### 如何修复 {#how-to-fix-this}

有两种方法：

1. 禁用 facts 收集：

```yaml
- hosts: localhost
  gather_facts: False
  roles:
    - ...
```

2. 显式将连接类型设置为 **ssh**：
```
[localhost]
127.0.0.1 ansible_connection=ssh ansible_ssh_user=your_localhost_user
```
---
## panic: pq: SSL is not enabled on the server {#panic-pq-ssl-is-not-enabled-on-the-server}

这表示您的 Postgres 未启用 SSL。

### 如何修复 {#how-to-fix-this-1}

在配置文件中添加 `sslmode=disable` 选项：

```json
	"postgres": {
		"host": "localhost",
		"user": "postgres",
		"pass": "pwd",
		"name": "semaphore",
		"options": {
			"sslmode": "disable"
		}
	},
```
---
## fatal: bad numeric config value '0' for 'GIT_TERMINAL_PROMPT': invalid unit {#fatal-bad-numeric-config-value-0-for-git_terminal_prompt-invalid-unit}

这表示您正在通过 HTTPS 访问一个需要身份验证的仓库。

### 如何修复 {#how-to-fix-this-2}

* 打开**密钥库**页面。
* 创建一个 `Login with password` 类型的新密钥。
* 填写您在 GitHub/BitBucket 等平台上的登录名。
* 填写密码。GitHub/BitBucket 不能使用账户密码，应改用个人访问令牌（PAT）。更多信息请[点击这里](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)。
* 创建密钥后，打开**仓库**页面，找到您的仓库并指定该密钥。

---

## Git 克隆或拉取间歇性失败 {#git-clone-or-pull-fails-intermittently}

任务日志中可能出现类似 `Git pull failed (...), retrying in 2s` 的消息，之后要么成功，要么在多次尝试后最终失败。

### 原因 {#why-this-happens-1}

Git 服务器（GitHub、GitLab、Bitbucket 或自托管实例）暂时不可达、返回了瞬时 HTTP 错误，或者 Semaphore 与服务器之间的网络出现了短暂中断。Semaphore 会在将任务标记为失败之前自动重试克隆和拉取操作。

### 如何修复 {#how-to-fix-this-3}

1. **瞬时故障**：通常会自行恢复。Semaphore 最多重试 `git_attempts` 次（默认 4 次），并在两次尝试之间采用指数退避。
2. **频繁失败**：在配置中增大重试次数：

```json
{
  "git_attempts": 8
}
```

或者使用环境变量：

```bash
export SEMAPHORE_GIT_ATTEMPTS=8
```

3. **立即且持续失败**：重试无济于事。请检查仓库 URL、分支名称、访问密钥，以及从 Semaphore 服务器或运行器主机出发的网络连通性。

关于 `git_client` 和 `git_attempts` 的详细信息，请参阅 [Git 操作](/admin-guide/configuration/config-file#git-operations)。

---

## Bash 脚本输出缺失或不完整 {#bash-script-output-is-missing-or-incomplete}

Bash 任务成功结束，但日志中几乎看不到 `echo`、`printf` 或其他命令的输出——尤其是在脚本很快退出时。

### 原因 {#why-this-happens-2}

Semaphore 在 shell 命令运行期间捕获 stdout 和 stderr。非常短的脚本可能在所有缓冲输出被读取之前就已结束，因此最后几行可能会从任务日志中丢失。

### 如何修复 {#how-to-fix-this-4}

1. **升级**：较新的 Semaphore 版本会在将任务标记为完成之前读完进程输出。如果您使用的是旧版本，请更新服务器和运行器。
2. 当需要确保输出送达时，**在脚本中刷新输出**：

```bash
#!/bin/bash
echo "Starting deploy"
echo "Done" >&2
```

对于关键的诊断信息，请写入仓库工作区内的文件，并在脚本末尾用 `cat` 输出该文件。
3. **避免静默提前退出**：使用 `set -euo pipefail` 和明确的错误消息，这样即使输出很少，失败也能被发现。

---

## unable to read LDAP response packet: unexpected EOF {#unable-to-read-ldap-response-packet-unexpected-eof}

很可能您正在以不安全的方式连接 LDAP 服务器，而该服务器要求安全连接（通过 TLS）。

### 如何修复 {#how-to-fix-this-5}

在 `config.json` 文件中启用 TLS：

```json
...
"ldap_needtls": true
...
```

---

## LDAP Result Code 49 "Invalid Credentials" {#ldap-result-code-49-invalid-credentials}

密码或 `binddn` 不正确。

### 如何修复 {#how-to-fix-this-6}

使用 `ldapwhoami` 工具检查您的 binddn 是否有效：

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=/your/ldap_binddn/value/in/config/file"\
  -x\
  -W
```

它会交互式地询问密码，并应返回代码 **0** 且回显所指定的 **DN**。

您还可以阅读以下文章： 
* [ldapsearch: Invalid credentials (49)](https://serverfault.com/q/771549/443463)
* [https://github.com/semaphoreui/semaphore/issues/906](https://github.com/semaphoreui/semaphore/issues/906)

---

## LDAP Result Code 32 "No Such Object" {#ldap-result-code-32-no-such-object}

目录中不存在 Semaphore 所查询的 distinguished name 对应的条目。绝大多数情况下
是 `ldap_searchdn` 有误，较少情况下是 `ldap_binddn` 有误。

### 如何修复 {#how-to-fix-this-7}

使用与 Semaphore 相同的凭据，检查搜索基准（base）是否存在：

```bash
ldapsearch\
  -H ldap://ldap.example.com:389\
  -D "CN=/your/ldap_binddn/value/in/config/file"\
  -b "/your/ldap_searchdn/value/in/config/file"\
  -x\
  -W\
  -s base
```

- 该命令返回结果代码 **32**，说明 base 本身不存在。
  请修正 `config.json` 中的 `ldap_searchdn`；常见原因是某一部分拼写有误，
  例如实际为 `OU=People` 却写成了 `OU=Users`。
- 结果代码 **0** 说明 base 没有问题，问题出在 `ldap_searchfilter`：
  它在该 base 下没有匹配到任何条目。

关于每个选项的含义，请参阅 [LDAP 与 AD](/admin-guide/authentication/ldap)。
