---
title: "Armazenamento de segredos no HashiCorp Vault"
---

# Armazenamento de segredos no HashiCorp Vault <Pro />

O Semaphore UI oferece suporte ao HashiCorp Vault como armazenamento de segredos.

![](/assets/vault1.webp)

Você pode fornecer as seguintes opções:
- **URL do HashiCorp Vault** — endereço do seu servidor Vault.
- **Mount** — o caminho de montagem do mecanismo de segredos.
- **Token** — token de autenticação. O token pode ser:
    - Armazenado no banco de dados.
    - Fornecido por meio de uma variável de ambiente.
    - Fornecido por meio de um arquivo (útil para o Vault Agent).
      :::warning
      Quando o token vem de um **arquivo**, esse arquivo deve estar **dentro** do diretório de segredos usado pelo Semaphore. Configure esse diretório usando `dirs.secrets` ou a variável de ambiente `SEMAPHORE_SECRETS_PATH`. A opção legada de nível superior `secrets_path` ainda é aceita para configurações antigas. Se nenhuma delas estiver definida, o padrão é `/tmp/semaphore`. Consulte [Diretório de segredos](/admin-guide/configuration/config-file#secrets-directory) para detalhes sobre a precedência.

      Exemplo de fragmento de `config.json`:

      ```json
      {
        "dirs": {
          "secrets": "/root/path/for/secrets"
        }
      }
      ```
      :::

O armazenamento pode funcionar em modo somente leitura.

## Como usar {#how-to-use}

1. Configure a conexão com o HashiCorp Vault nas configurações do Semaphore (URL, caminho de montagem e token).
2. Ao criar ou editar uma chave no Armazenamento de Chaves, selecione **HashiCorp Vault** como o tipo de armazenamento.
3. Forneça o caminho do segredo no Vault onde a credencial deve ser armazenada.

![](/assets/vault2.webp)

## HashiCorp Vault Agent {#hashicorp-vault-agent}

Em vez de armazenar o token do Vault diretamente, você pode usar o [HashiCorp Vault Agent](https://developer.hashicorp.com/vault/docs/agent-and-proxy/agent) para lidar automaticamente com a obtenção e a renovação do token.

O Vault Agent é executado como um processo sidecar ao lado do Semaphore e grava um token válido em um arquivo no disco. O Semaphore então lê o token desse arquivo.

Para configurar isso:

1. Configure e execute o Vault Agent com um [método de auto-auth](https://developer.hashicorp.com/vault/docs/agent-and-proxy/autoauth) apropriado (por exemplo, AppRole, Kubernetes, AWS IAM).
2. Configure o Vault Agent para gravar o token em um arquivo usando um bloco `sink`, por exemplo:

    ```hcl
    auto_auth {
    method {
        type = "approle"
        config = {
        role_id_file_path   = "/etc/vault/role-id"
        secret_id_file_path = "/etc/vault/secret-id"
        }
    }

    sink {
        type = "file"
        config = {
        path = "/etc/vault/token"
        }
    }
    }
    ```

3. No Semaphore, ao configurar a conexão com o HashiCorp Vault, selecione **Arquivo** como a origem do token e forneça o caminho do arquivo do token (por exemplo, `/etc/vault/token`).

Essa abordagem evita tokens estáticos de longa duração e permite que o Vault Agent cuide da autenticação e da renovação do token automaticamente.


## Grupos de Variáveis {#variable-groups}

O HashiCorp Vault também pode ser usado como armazenamento para [Grupos de Variáveis](/user-guide/environment). Ao editar um grupo de variáveis, selecione **HashiCorp Vault** como o tipo de armazenamento e especifique o caminho da pasta onde os segredos serão armazenados.

![](/assets/vault3.webp)
