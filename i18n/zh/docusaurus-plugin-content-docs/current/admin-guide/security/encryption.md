---
id: encryption
title: 加密密钥
sidebar_label: 加密密钥
description: Semaphore 如何加密机密数据、如何配置加密密钥，以及如何零停机轮换密钥。
---

# 加密密钥

Semaphore 使用 AES‑256‑GCM 加密其存储的最敏感数据——**访问密钥（Access Key）的机密内容**
（SSH 私钥、登录名/密码对、机密字符串）以及 **JWT 签名密钥**。
本页说明如何配置这些密钥、轮换如何工作，以及如何安全地运维。

:::info 两把密钥，两种用途

| 密钥 | 保护对象 | 活动指针 |
|-----|----------|----------------|
| **机密密钥（Secrets key）** | 存储在数据库中的访问密钥机密内容 | `active.secret_key` |
| **选项密钥（Options key）** | 加密的数据库选项（JWT 签名密钥） | `active.option_key` |

如果未配置选项密钥，选项将回退使用机密密钥。
:::

---

## 快速开始 {#quick-start}

最简单的设置是在主配置中提供单个密钥：

```yaml title="config.yml"
encryption:
  keys_file: /etc/semaphore/encryption-keys.yml
```

```yaml title="/etc/semaphore/encryption-keys.yml"
keys:
  key1: { value: "REPLACE_WITH_openssl_rand_-base64_32" }
active:
  secret_key: key1
```

使用以下命令生成密钥：

```bash
openssl rand -base64 32
```

就是这样——Semaphore 现在使用 `key1` 加密机密数据。JWT 签名密钥也使用同一把密钥
（选项回退使用机密密钥）。

:::tip 生产环境
优先使用 **`file:` 引用**或 **`keys_folder`**（见下文），而不是内联的
`value:`，这样密钥材料存放在挂载的 Secret 中，而不是配置文件里。
:::

---

## 密钥如何被识别 {#how-keys-are-identified}

每把密钥都有一个由密钥材料本身派生的**密钥 id**——即指纹
`base64url(sha256(key))[:8]`。与每个加密值一起存储的是这个 id（而不是密钥），
因此解密就是直接查找写入该值时所用的那把密钥。

这意味着：

- **标签可以随意重命名。** `key1`、`secrets_key_primary.txt`——这些是给人看的。
  数据库从不存储它们，只存储指纹。
- **密钥永远不会被指错。** 改变密钥的字节，它就变成一个*新的* id；
  旧数据仍然引用旧 id。
- **移除密钥会明确报错**，而不是静默失败——缺失的密钥 id 是一个显式错误，
  绝不会输出垃圾数据。

您永远不需要手动设置 id；Semaphore 会自动计算。

---

## 密钥文件 {#the-keys-file}

`encryption.keys_file` 指向一个文件，其内容是一个**密钥注册表**，
外加按用途指向活动密钥的**指针**。该文件**无论扩展名如何，都按 YAML 或 JSON**
解析。

提供注册表有两种方式——内联映射、文件夹中的文件，或者两者组合。

### 内联映射 {#inline-map}

```yaml
keys:
  key1: { value: "2hmxtfgK6LkJfJK9ZNZ9GUMmEwTQwHIFamijclUem48=" }   # inline (dev)
  key2: { file: /run/secrets/secret_key }                         # from a file (prod)
active:
  secret_key: key1
  option_key: key2
```

每个条目都是一个 [`KeySource`](#keysource)：要么是 `value`（内联 base64），**要么**是
`file`（包含 base64 密钥的文件路径）——不能同时使用两者。

### 密钥文件夹 {#folder-of-key-files}

将 `keys_folder` 指向一个目录；**每个常规文件就是一把密钥**，以其文件名作为标签。
非常适合挂载的 Docker/Kubernetes Secret。

```yaml
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt   # filename in keys_folder (relative)
  option_key_file: options_key_primary.txt
```

```text title="/run/secrets/enc-keys/"
secrets_key_primary.txt     # one base64 key per file
secrets_key_old.txt         # retired keys stay as files
options_key_primary.txt
```

:::note 对 Kubernetes 友好
`keys_folder` 会跳过以点开头的条目（`..data`、`..2024_*`）并跟随符号链接，
因此可以直接配合 Kubernetes 挂载 `Secret`/`ConfigMap` 卷的方式使用。
:::

### 组合使用 {#combined}

`keys` 与 `keys_folder` 会合并为一个注册表；`active` 可以按标签*或*按文件名指向：

```yaml
keys:
  inline1: { value: "..." }
keys_folder: /run/secrets/enc-keys
active:
  secret_key: inline1
  option_key_file: options_key_primary.txt
```

---

## 轮换（零停机） {#rotation-zero-downtime}

活动密钥用于加密**新的**写入；注册表中的其他所有密钥仍可**解密**旧数据。
因此，轮换就是：添加一把密钥，切换指针，在后台重新加密，然后移除旧密钥。

```bash
# 1. Add a new key to the registry (a file in keys_folder, or a keys: entry)
#    and point the active pointer at it:
#      active.secret_key: key2        # (or secret_key_file: ...)

# 2. Apply it without a restart — within keys_poll_interval (default 15s),
#    or immediately:
kill -HUP $(pidof semaphore)

# 3. Re-encrypt existing data to the new key:
semaphore vault rekey --config /etc/semaphore/config.yml

# 4. Confirm nothing still uses the old key:
semaphore vault check --config /etc/semaphore/config.yml

# 5. When the old key shows "0 rows", remove it from the registry.
```

任何步骤都不需要重启进程。

### 无需重启即可应用更改 {#applying-changes-without-a-restart}

Semaphore 会重新读取密钥文件（以及它引用的密钥文件），并原子地替换内存中的密钥。
有两种触发方式：

| 触发方式 | 行为 |
|---------|-----------|
| **文件监视器** | 每隔 `encryption.keys_poll_interval`（默认 `15s`）轮询一次。设为 `"0"` 可禁用。 |
| **`SIGHUP`** | `kill -HUP <pid>` 强制立即重新加载（仅限 Unix）。 |

:::caution Windows
Windows 没有 `SIGHUP`。请依赖**轮询器**（默认方式）——它在所有平台上都可用——
或者重启服务。
:::

重新加载会先校验新密钥，一旦出现任何错误，正在运行的密钥保持不变。

---

## CLI 命令 {#cli-commands}

### `vault check` {#vault-check}

只读。按密钥 id 报告每把密钥加密了多少条已存储的机密数据，让您了解哪些数据在活动密钥上，
以及哪些密钥可以安全移除。

```bash
semaphore vault check --config /etc/semaphore/config.yml
```

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: active:IFTi6Ipik8Q
```

状态包括：`active`、`retired, rekey pending`、`retired, SAFE TO REMOVE`、
`legacy (no id)` 以及 `MISSING KEY`（被引用的密钥不存在——退出码为 1）。

### `vault rekey` {#vault-rekey}

使用活动密钥重新加密所有已存储的机密数据（以及 JWT 签名密钥）。

```bash
semaphore vault rekey --config /etc/semaphore/config.yml

# Snapshot ciphertexts before re-encrypting, and roll back if needed:
semaphore vault rekey --backup /var/backups/vault.jsonl --config ...
semaphore vault rekey --rollback /var/backups/vault.jsonl --config ...

# Legacy: decrypt pre-existing un-prefixed data with an explicit old key:
semaphore vault rekey --old-key <base64-old-key> --config ...
```

---

## 向后兼容 {#backward-compatibility}

升级是安全的，**无需数据迁移**：

- 已设置 **`access_key_encryption`**（或 `SEMAPHORE_ACCESS_KEY_ENCRYPTION`
  环境变量）的现有安装继续照常工作——该扁平密钥成为活动的机密密钥。
- 旧版 Semaphore 写入的数据（没有密钥 id）仍可解密。在下一次写入时，
  或执行 `vault rekey` 之后，它会被重新标记上密钥 id。
- **完全不加密**（未配置任何密钥）时，机密数据继续以纯 base64 存储，并以同样的方式解密。

要将旧的单密钥安装迁移到密钥文件，只需把旧密钥放进注册表：

```yaml
keys:
  old: { value: "<the old access_key_encryption value>" }
  new: { value: "<a freshly generated key>" }
active:
  secret_key: new
```

旧数据通过 `old` 解密；运行 `vault rekey` 将所有数据迁移到 `new`。

---

## Kubernetes 与 Docker {#kubernetes--docker}

将密钥作为 `Secret` 卷挂载，并将 `keys_folder` 指向它：

```yaml title="Pod spec (excerpt)"
volumes:
  - name: enc-keys
    secret:
      secretName: semaphore-encryption-keys
containers:
  - name: semaphore
    volumeMounts:
      - name: enc-keys
        mountPath: /run/secrets/enc-keys
        readOnly: true
```

```yaml title="encryption-keys.yml"
keys_folder: /run/secrets/enc-keys
active:
  secret_key_file: secrets_key_primary.txt
  option_key_file: options_key_primary.txt
```

当您更新 `Secret` 时，Kubernetes 会刷新挂载的文件，轮询器会在 `keys_poll_interval`
内应用更改——无需重启 Pod。

---

## 安全最佳实践 {#security-best-practices}

:::danger 保护密钥文件
- 限制权限：`chmod 0400`，所有者为 Semaphore 服务用户。
- **切勿将真实密钥提交**到版本控制——将该文件加入 `.gitignore`。
- 安全地备份。**丢失所有密钥意味着丢失所有加密数据。**
- 优先使用挂载的 Secret（`file:` / `keys_folder`）而不是内联 `value:`，
  环境变量则优于两者都不用——`value:` 会把密钥留在配置文件中。
:::

---

## 参考 {#reference}

### `encryption`（主配置） {#encryption-main-config}

| 字段 | 环境变量 | 默认值 | 说明 |
|-------|-----|---------|-------------|
| `keys_file` | `SEMAPHORE_ENCRYPTION_KEYS_FILE` | — | 密钥文件的路径（YAML/JSON）。 |
| `keys_poll_interval` | `SEMAPHORE_ENCRYPTION_KEYS_POLL_INTERVAL` | `15s` | 轮询密钥文件的频率。`"0"` 表示禁用轮询。 |

### 旧版扁平密钥（主配置） {#legacy-flat-keys-main-config}

| 字段 | 环境变量 | 说明 |
|-------|-----|-------------|
| `access_key_encryption` | `SEMAPHORE_ACCESS_KEY_ENCRYPTION` | 单一机密密钥，不支持轮换。在未设置 `keys_file` 时使用。 |
| `option_encryption` | `SEMAPHORE_OPTION_ENCRYPTION` | 单一选项密钥，不支持轮换。回退使用机密密钥。 |

### 密钥文件 {#keys-file}

| 字段 | 说明 |
|-------|-------------|
| `keys` | `label → KeySource` 的映射（内联注册表）。 |
| `keys_folder` | 密钥文件目录（每个常规文件一把密钥，以文件名作为标签）。 |
| `active.secret_key` | 活动机密密钥的标签（在 `keys` 中）。 |
| `active.option_key` | 活动选项密钥的标签。 |
| `active.secret_key_file` | 活动机密密钥在 `keys_folder` 中的文件名（相对路径）。 |
| `active.option_key_file` | 活动选项密钥在 `keys_folder` 中的文件名（相对路径）。 |

### KeySource {#keysource}

| 字段 | 说明 |
|-------|-------------|
| `value` | 内联的 base64 密钥材料。 |
| `file` | 包含 base64 密钥的文件路径。 |

`value` 与 `file` 互斥。密钥必须是 **16、24 或 32 字节**（AES‑128/192/256）的 base64 编码。

---

## 故障排除 {#troubleshooting}

| 现象 | 原因 / 修复 |
|---------|-------------|
| 启动时崩溃：`encryption_keys… not found` / `invalid` | 密钥文件或被引用的密钥文件缺失/格式错误，或密钥不是 16/24/32 字节的有效 base64。修复该文件；启动时快速失败是有意为之。 |
| `vault check` 显示 `MISSING KEY <id>`（退出码 1） | 数据是用一把已不在注册表中的密钥加密的。先把该密钥加回来，才能解密。 |
| `cannot decrypt access key, perhaps encryption key was changed` | 旧版（无前缀）值无法被任何已配置的密钥解密。确保原始密钥存在（在注册表中或 `access_key_encryption` 中）。 |
| 轮换未生效 | 检查 `keys_poll_interval`（不为 `"0"`）且密钥文件确实发生了变化；或者发送 `SIGHUP`。 |
| `active.secret_key: no key labelled "…"` | 活动指针指向的标签/文件名不在 `keys`/`keys_folder` 中。 |
