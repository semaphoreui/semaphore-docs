
# Segurança do banco de dados

## Criptografia de dados {#data-encryption}

Os dados sensíveis são armazenados no banco de dados de forma criptografada. Você deve definir a opção de configuração `access_key_encryption` no arquivo de configuração para habilitar a criptografia das Access Keys. Ela deve ser gerada pelo comando:

```bash
head -c32 /dev/urandom | base64