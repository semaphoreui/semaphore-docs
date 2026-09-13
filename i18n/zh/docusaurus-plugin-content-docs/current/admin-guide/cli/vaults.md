# 密钥保险库

`semaphore vault` 命令用于管理 Semaphore 存储在数据库中的机密数据的加密——
包括**访问密钥的机密内容**（SSH 密钥、登录名/密码对、机密字符串）以及
**JWT 签名密钥**。

```bash
semaphore vault --help
```

> `vault` 是 `vaults` 的别名。

它有两个子命令：

| 命令 | 用途 |
|---------|---------|
| [`vault rekey`](#re-encrypting-secrets-vault-rekey) | 使用当前活动的加密密钥重新加密所有已存储的机密数据。 |
| [`vault check`](#checking-key-usage-vault-check) | 报告每条已存储的机密数据由哪个密钥 ID 加密（只读）。 |

关于加密密钥的配置和轮换方式，请参阅
[加密密钥](/admin-guide/security/encryption)。

## 重新加密机密数据（`vault rekey`） {#re-encrypting-secrets-vault-rekey}

使用**活动**加密密钥重新加密所有本地存储的机密数据——访问密钥的机密内容
和 JWT 签名密钥——并将该密钥的 ID 写入每个值中。由外部机密存储支持的
机密数据会被跳过（它们不使用 Semaphore 密钥环加密）。

```bash
semaphore vault rekey
```

### 零停机密钥轮换 {#zero-downtime-key-rotation}

活动密钥用于加密新写入的数据；密钥集中的其他所有密钥仍可解密旧数据。
因此轮换流程为：添加密钥、切换活动指针、在后台重新加密，然后移除旧密钥。

1. 向密钥集添加一个新密钥（`keys_folder` 中的一个文件，或一条 `keys:`
   条目），并将活动指针（`active.secret_key` 或 `secret_key_file`）指向它。
   更改会在 `keys_poll_interval`（默认 `15s`）内生效，或者通过
   `kill -HUP <pid>` 立即生效——无需重启。
2. 运行 `semaphore vault rekey`，将现有数据重新加密到新密钥。
3. 运行 [`semaphore vault check`](#checking-key-usage-vault-check)；一旦旧
   密钥显示为 `0 rows`，即可安全地将其从密钥集中移除。

### 选项 {#options}

| 选项 | 说明 |
|------|-------------|
| `--old-key <key>` | 用于旧版单密钥迁移的显式旧加密密钥。当旧密钥已作为辅助密钥存在于密钥集中时不需要。用于解密没有密钥 ID 标记的无前缀（旧版）数据。 |
| `--backup <file>` | 在重新加密之前，将当前访问密钥密文的备份写入 `<file>`。 |
| `--rollback <file>` | 从备份文件恢复访问密钥密文，而不是重新加密。 |

### 备份与回滚 {#backup-and-rollback}

在重新加密之前对当前密文做一份快照，出现问题时可以恢复：

```bash
# Back up current ciphertexts, then re-encrypt to the active key:
semaphore vault rekey --backup /var/backups/vault.jsonl

# Restore the ciphertexts from the backup:
semaphore vault rekey --rollback /var/backups/vault.jsonl
```

备份是一个 JSON Lines 文件，每个访问密钥对应一条记录（`project_id`、
`key_id`、`secret`）。回滚会将这些密文原样写回。

### 旧版单密钥迁移 {#legacy-single-key-migration}

如果你的数据是由使用单个 `access_key_encryption` 密钥的旧版 Semaphore
加密的（无轮换、无密钥 ID 标记），请显式传入该密钥，以便在重新加密到
活动密钥之前先完成解密：

```bash
semaphore vault rekey --old-key <base64-old-key>
```

一旦旧密钥已成为密钥集的一部分，就不再需要此操作——Semaphore 会根据每个
值上标记的 ID 查找并自动使用匹配的密钥解密。

## 检查密钥使用情况（`vault check`） {#checking-key-usage-vault-check}

只读操作。按密钥 ID 报告该密钥加密了多少条本地存储的访问密钥机密数据
（以及 JWT 签名密钥），并显示 JWT 签名密钥的状态。在 `vault rekey` 之后
运行它，以确认已退役的密钥可以安全移除：引用数为零的密钥可以从密钥集中
删除。

```bash
semaphore vault check
```

输出示例：

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: IFTi6Ipik8Q
```

每个密钥 ID 会以下列状态之一进行报告：

| 状态 | 含义 |
|--------|---------|
| `active` | 该密钥当前用于加密新写入的数据。 |
| `retired, rekey pending` | 该密钥仍加密着部分行；运行 `vault rekey` 将它们迁移到活动密钥。 |
| `retired, SAFE TO REMOVE` | 没有任何行引用该密钥（`0 rows`）——可以从密钥集中移除。 |
| `legacy (no id)` | 在密钥 ID 出现之前加密的行；重新加密即可标记 ID。 |
| `MISSING KEY (cannot decrypt)` | 被引用的密钥 ID 不在密钥集中。 |

最后一行报告 JWT 签名密钥由哪个密钥加密；如果尚未生成，则显示
`JWT signing key: not set`。

如果有任何机密数据引用了密钥集中不存在的密钥 ID，命令会标记这些行并
**以非零状态退出**——请先将缺失的密钥重新加入密钥集，然后才能解密这些
数据。
