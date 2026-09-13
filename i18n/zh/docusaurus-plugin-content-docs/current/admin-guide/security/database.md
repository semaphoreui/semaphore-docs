
# 数据库安全

## 数据加密 {#data-encryption}

敏感数据以加密形式存储在数据库中。你应在配置文件中设置配置选项 `access_key_encryption` 以启用访问密钥加密。该值必须通过以下命令生成：

```bash
head -c32 /dev/urandom | base64