# 故障排除

## 1. 运行器报错 404 {#1-runner-prints-error-404}

### 如何修复 {#how-to-fix}

[从运行器（Runner）收到 401 错误码](https://github.com/semaphoreui/semaphore/discussions/1873?converting=1)

---

## 2. localhost 的 Gathering Facts 问题 {#2-gathering-facts-issue-for-localhost}

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
## 3. panic: pq: SSL is not enabled on the server {#3-panic-pq-ssl-is-not-enabled-on-the-server}

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


## 4. fatal: bad numeric config value '0' for 'GIT_TERMINAL_PROMPT': invalid unit {#4-fatal-bad-numeric-config-value-0-for-git_terminal_prompt-invalid-unit}

这表示您正在通过 HTTPS 访问一个需要身份验证的仓库（Repository）。

### 如何修复 {#how-to-fix-this-2}

* 打开**密钥库**（Key Store）页面。
* 创建一个 `Login with password` 类型的新密钥。
* 填写您在 GitHub/BitBucket 等平台上的登录名。
* 填写密码。GitHub/BitBucket 不能使用账户密码，应改用个人访问令牌（PAT）。更多信息请[点击这里](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)。
* 创建密钥后，打开**仓库**（Repositories）页面，找到您的仓库并指定该密钥。


---

## 5. Git 克隆或拉取间歇性失败 {#5-git-clone-or-pull-fails-intermittently}

任务日志中可能出现类似 `Git pull failed (...), retrying in 2s` 的消息，之后要么成功，要么在多次尝试后最终失败。

### 原因 {#why-this-happens-1}

Git 服务器暂时不可达，或返回了瞬时错误。Semaphore 会在将任务标记为失败之前自动重试克隆和拉取操作。

### 如何修复 {#how-to-fix-this-3}

1. **瞬时故障**：通常会自行恢复。Semaphore 最多重试 `git_attempts` 次（默认 4 次），并采用指数退避。
2. **频繁失败**：在配置中增大 `git_attempts`，或设置 `SEMAPHORE_GIT_ATTEMPTS`。
3. **立即且持续失败**：检查仓库 URL、分支、访问密钥和网络连通性。

配置详情请参阅 [Git 操作](/admin-guide/configuration/config-file#git-operations)。

---

## 6. unable to read LDAP response packet: unexpected EOF {#6-unable-to-read-ldap-response-packet-unexpected-eof}

很可能您正在以不安全的方式连接 LDAP 服务器，而该服务器要求安全连接（通过 TLS）。

### 如何修复 {#how-to-fix-this-4}

在 `config.json` 文件中启用 TLS：

```json
...
"ldap_needtls": true
...
```

---

## 7. LDAP Result Code 49 "Invalid Credentials" {#7-ldap-result-code-49-invalid-credentials}

密码或 `binddn` 不正确。

### 如何修复 {#how-to-fix-this-5}

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

## 8. LDAP Result Code 32 "No Such Object" {#8-ldap-result-code-32-no-such-object}

即将推出。
