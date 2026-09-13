---
title: "Armazenamento de segredos no OpenBao"
---

# Armazenamento de segredos no OpenBao <Pro />

O Semaphore UI oferece suporte ao [OpenBao](https://openbao.org) como armazenamento de segredos.

O OpenBao é um fork de código aberto do HashiCorp Vault e é compatível com a API dele, portanto o armazenamento funciona exatamente como o [armazenamento HashiCorp Vault](/user-guide/key-store/hashicorp-vault).

Você pode fornecer as seguintes opções:
- **URL do Servidor** — endereço do seu servidor OpenBao.
- **Mount** — o caminho de montagem do mecanismo de segredos KV v2 (`secret` por padrão).
- **Namespace** — namespace do OpenBao (v2.3+), opcional.
- **Token** — token de autenticação. O token pode ser:
    - Armazenado no banco de dados.
    - Fornecido por meio de uma variável de ambiente.
    - Fornecido por meio de um arquivo.
      :::warning
      Quando o token vem de um **arquivo**, esse arquivo deve estar **dentro** do diretório de segredos usado pelo Semaphore. Configure esse diretório usando `dirs.secrets` ou a variável de ambiente `SEMAPHORE_SECRETS_PATH`. A opção legada de nível superior `secrets_path` ainda é aceita para configurações antigas. Se nenhuma delas estiver definida, o padrão é `/tmp/semaphore`. Consulte [Diretório de segredos](/admin-guide/configuration/config-file#secrets-directory) para detalhes sobre a precedência.
      :::

O armazenamento pode funcionar em modo somente leitura.

## Como usar {#how-to-use}

1. No seu projeto, abra **Armazenamento de Chaves** → **Armazenamentos** e crie um novo armazenamento **OpenBao** (URL, caminho de montagem e token).
2. Ao criar ou editar uma chave no Armazenamento de Chaves, selecione seu armazenamento OpenBao como o tipo de armazenamento.
3. Forneça o caminho do segredo no OpenBao onde a credencial deve ser armazenada.

## Sincronizando segredos {#syncing-secrets}

Os segredos armazenados no OpenBao podem ser importados automaticamente para o Armazenamento de Chaves e mantidos sincronizados, da mesma forma que nos outros armazenamentos externos. Consulte [Sincronizando segredos de armazenamentos remotos](/user-guide/key-store/secret-sync).

## Grupos de Variáveis {#variable-groups}

O OpenBao também pode ser usado como armazenamento para [Grupos de Variáveis](/user-guide/environment). Ao editar um grupo de variáveis, selecione seu armazenamento OpenBao como o tipo de armazenamento e especifique o caminho da pasta onde os segredos serão armazenados.
