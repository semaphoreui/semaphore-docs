# Vaults

O comando `semaphore vault` gerencia a criptografia dos segredos que o Semaphore
armazena no banco de dados — **segredos das chaves de acesso** (chaves SSH, pares de login/senha,
strings secretas) e a **chave de assinatura JWT**.

```bash
semaphore vault --help
```

> `vault` é um alias para `vaults`.

Ele possui dois subcomandos:

| Comando | Finalidade |
|---------|---------|
| [`vault rekey`](#re-encrypting-secrets-vault-rekey) | Recriptografa todos os segredos armazenados com a chave de criptografia ativa. |
| [`vault check`](#checking-key-usage-vault-check) | Informa qual ID de chave criptografa cada segredo armazenado (somente leitura). |

Para saber como as chaves de criptografia são configuradas e rotacionadas, consulte
[Chaves de criptografia](/admin-guide/security/encryption).

## Recriptografando segredos (`vault rekey`) {#re-encrypting-secrets-vault-rekey}

Recriptografa todos os segredos armazenados localmente — segredos das chaves de acesso e a chave de assinatura
JWT — com a chave de criptografia **ativa**, gravando o ID dessa chave em cada
valor. Segredos mantidos em um armazenamento de segredos externo são ignorados (eles não são
criptografados com o keyring do Semaphore).

```bash
semaphore vault rekey
```

### Rotação de chaves sem tempo de inatividade {#zero-downtime-key-rotation}

A chave ativa criptografa as novas gravações; todas as outras chaves do conjunto ainda
podem descriptografar os dados antigos. A rotação, portanto, consiste em: adicionar uma chave, trocar o ponteiro ativo,
recriptografar em segundo plano e, então, remover a chave antiga.

1. Adicione uma nova chave ao conjunto de chaves (um arquivo em `keys_folder` ou uma entrada em `keys:`) e
   aponte o ponteiro ativo (`active.secret_key` ou `secret_key_file`) para ela.
   A alteração é aplicada dentro de `keys_poll_interval` (padrão `15s`), ou
   imediatamente com `kill -HUP <pid>` — sem necessidade de reiniciar.
2. Execute `semaphore vault rekey` para recriptografar os dados existentes com a nova chave.
3. Execute [`semaphore vault check`](#checking-key-usage-vault-check); quando a chave antiga
   mostrar `0 rows`, é seguro removê-la do conjunto de chaves.

### Opções {#options}

| Flag | Descrição |
|------|-------------|
| `--old-key <key>` | Chave de criptografia antiga explícita para uma migração legada de chave única. Não é necessária quando a chave antiga já está no conjunto de chaves como secundária. Usada para descriptografar dados sem prefixo (legados) que não têm ID de chave gravado. |
| `--backup <file>` | Grava um backup dos textos cifrados atuais das chaves de acesso em `<file>` antes de recriptografar. |
| `--rollback <file>` | Restaura os textos cifrados das chaves de acesso a partir de um arquivo de backup em vez de recriptografar. |

### Backup e rollback {#backup-and-rollback}

Faça um snapshot dos textos cifrados atuais antes de recriptografar e restaure-o
se algo der errado:

```bash
# Back up current ciphertexts, then re-encrypt to the active key:
semaphore vault rekey --backup /var/backups/vault.jsonl

# Restore the ciphertexts from the backup:
semaphore vault rekey --rollback /var/backups/vault.jsonl
```

O backup é um arquivo JSON-lines, com uma entrada por chave de acesso (`project_id`,
`key_id`, `secret`). Um rollback grava esses textos cifrados de volta exatamente como estavam.

### Migração legada de chave única {#legacy-single-key-migration}

Se seus dados foram criptografados por uma versão mais antiga do Semaphore que usava a chave única
`access_key_encryption` (sem rotação, sem ID de chave gravado), informe essa chave
explicitamente para que os dados possam ser descriptografados antes de serem recriptografados com a chave ativa:

```bash
semaphore vault rekey --old-key <base64-old-key>
```

Isso deixa de ser necessário quando a chave antiga faz parte do conjunto de chaves — o Semaphore localiza cada
valor pelo ID gravado e descriptografa automaticamente com a chave correspondente.

## Verificando o uso das chaves (`vault check`) {#checking-key-usage-vault-check}

Somente leitura. Informa, por ID de chave, quantos segredos de chaves de acesso armazenados localmente (e
a chave de assinatura JWT) essa chave criptografa, além do status da chave de assinatura JWT. Execute-o
após `vault rekey` para confirmar que uma chave aposentada pode ser removida com segurança: uma chave sem
referências pode ser excluída do conjunto de chaves.

```bash
semaphore vault check
```

Exemplo de saída:

```text
Access keys: 12 total
  IFTi6Ipik8Q: 12 rows — active
  rcGGC2AQfKo: 0 rows — retired, SAFE TO REMOVE
JWT signing key: IFTi6Ipik8Q
```

Cada ID de chave é informado com um dos seguintes status:

| Status | Significado |
|--------|---------|
| `active` | A chave criptografa atualmente as novas gravações. |
| `retired, rekey pending` | A chave ainda criptografa algumas linhas; execute `vault rekey` para movê-las para a chave ativa. |
| `retired, SAFE TO REMOVE` | Nenhuma linha referencia a chave (`0 rows`) — ela pode ser removida do conjunto de chaves. |
| `legacy (no id)` | Linhas criptografadas antes da existência de IDs de chave; execute o rekey para gravar um ID. |
| `MISSING KEY (cannot decrypt)` | Um ID de chave referenciado está ausente do conjunto de chaves. |

A última linha informa qual chave criptografa a chave de assinatura JWT, ou
`JWT signing key: not set` se nenhuma tiver sido gerada ainda.

Se algum segredo referenciar um ID de chave ausente do conjunto de chaves, o comando
sinaliza essas linhas e **encerra com status diferente de zero** — adicione a chave ausente de volta
ao conjunto de chaves para que esses dados possam ser descriptografados.
