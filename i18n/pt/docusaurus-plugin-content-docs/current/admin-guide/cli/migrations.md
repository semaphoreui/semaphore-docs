# Migrações do banco de dados

O comando `semaphore migrate` atualiza ou reverte o esquema do banco de dados
do Semaphore para corresponder a uma determinada versão do Semaphore. Use-o para upgrades e downgrades.

```bash
semaphore migrate --help
```

:::info
Raramente você precisa executar `migrate` manualmente. `semaphore server`, `semaphore setup`
e todos os outros comandos da CLI que acessam o banco de dados aplicam as migrações pendentes
automaticamente antes de serem executados. O `migrate` serve para aplicar migrações sem
iniciar o servidor ou para revertê-las.
:::

:::warning
Sempre faça backup do seu banco de dados antes de aplicar ou reverter migrações.
:::

## Aplicando migrações {#applying-migrations}

Aplique todas as migrações pendentes e atualize o banco de dados:

```bash
semaphore migrate --config /path/to/config.json
```

Aplique migrações apenas até uma versão específica:

```bash
semaphore migrate --apply-to 2.15.1
```

## Revertendo migrações {#rolling-back-migrations}

Desfaça migrações até uma versão anterior:

```bash
semaphore migrate --undo-to 2.13
```

Use a versão do Semaphore para a qual você está fazendo downgrade. O binário com o qual você executa
`migrate` precisa conhecer todas as migrações que serão desfeitas, então execute-o com o binário
**mais novo** antes de instalar o mais antigo.

## Opções {#options}

| Flag | Descrição |
|------|-------------|
| `--apply-to <version>` | Aplica migrações até esta versão, inclusive (por exemplo, `2.15` ou `2.14.4`). |
| `--undo-to <version>` | Reverte migrações até esta versão. |

`--apply-to` e `--undo-to` são mutuamente exclusivos; passar ambos é um erro.
Sem nenhuma dessas flags, todas as migrações pendentes são aplicadas.

Ao concluir, o comando exibe a conexão com o banco de dados que foi usada.

:::note
O `semaphore migrate` ainda aceita `--err-log-size`, `--skip-task-output` e
`--merge-existing-users` por compatibilidade retroativa, mas nas versões 2.19 e posteriores
elas não têm efeito. Elas pertenciam à importação do BoltDB descrita abaixo.
:::

## Migração do BoltDB para SQLite/MySQL/PostgreSQL {#migration-from-boltdb-to-sqlitemysqlpostgresql}

*Disponível apenas nas versões 2.17 e 2.18*

O BoltDB foi descontinuado a partir da versão 2.16, e **o suporte foi removido na
versão 2.19**. A flag `--from-boltdb` e a variável de ambiente `SEMAPHORE_MIGRATE_FROM_BOLTDB`
não existem mais nas versões 2.19+, e o `semaphore setup` se recusa a
configurar um banco de dados BoltDB.

:::warning
Se você ainda usa o BoltDB, migre **antes** de atualizar para a versão 2.19 ou posterior.
Instale o Semaphore **2.17 ou 2.18**, realize a migração abaixo e só então
atualize para uma versão mais recente.
:::

Para migrar, primeiro instale o Semaphore versão 2.17 ou 2.18 e depois configure o
banco de dados de destino (SQLite, MySQL ou PostgreSQL) no seu `config.json`. Em
seguida, execute o comando abaixo para importar todos os dados do arquivo BoltDB antigo
para o novo banco de dados:

```bash
semaphore migrate --from-boltdb /path/to/boltdb/file --config /path/to/config.json
```

O comando lê todos os projetos, templates, inventários, repositórios, chaves,
usuários e o histórico de tarefas do BoltDB e os grava no banco de dados especificado
na configuração atual do Semaphore. O arquivo BoltDB original não é
modificado.

Argumentos adicionais (apenas nas versões 2.17 e 2.18):

| Flag | Descrição |
|------|-------------|
| `--err-log-size <n>` | Número máximo de linhas de erro exibidas na saída. |
| `--skip-task-output` | Não importa as saídas das tarefas. |
| `--merge-existing-users` | Reutiliza usuários existentes correspondidos pelo nome de usuário em vez de falhar em caso de conflito. |

Se você usa o contêiner Docker do Semaphore UI, pode definir a
variável de ambiente `SEMAPHORE_MIGRATE_FROM_BOLTDB` para importar automaticamente o
banco de dados BoltDB existente. A importação é executada apenas uma vez, na primeira inicialização do
contêiner. Exemplo:

```bash
docker run --name semaphore \
  -p 3000:3000 \
  -e SEMAPHORE_DB_DIALECT=sqlite \
  -e SEMAPHORE_ADMIN=admin \
  -e SEMAPHORE_ADMIN_PASSWORD=changeme \
  -e SEMAPHORE_ADMIN_NAME="Admin" \
  -e SEMAPHORE_MIGRATE_FROM_BOLTDB=/var/lib/semaphore/database.boltdb \
  -e SEMAPHORE_ADMIN_EMAIL=admin@localhost \
  -v semaphore_data:/var/lib/semaphore \
  -d semaphoreui/semaphore:v2.18.2
```

## Solução de problemas {#troubleshooting}

- Se uma migração falhar, verifique os logs para obter detalhes e confirme que o binário da CLI
  é da mesma versão que o servidor do Semaphore.
- Confirme que a CLI usa o mesmo arquivo de configuração (e, portanto, o mesmo
  banco de dados) que o servidor. Consulte
  [Como o arquivo de configuração é localizado](/admin-guide/cli#how-the-configuration-file-is-found).
