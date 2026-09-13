# Projetos

O comando `semaphore projects` exporta e importa projetos como arquivos de backup. Um
backup é um único documento JSON que contém os templates, inventários,
repositórios, ambientes, chaves, agendamentos e configurações relacionadas de um projeto.

```bash
semaphore projects --help
```

> `project` é um alias para `projects`.

Ele possui dois subcomandos:

| Comando | Finalidade |
|---------|---------|
| [`projects export`](#exporting-a-project-projects-export) | Grava o backup de um projeto em um arquivo (ou na saída padrão). |
| [`projects import`](#importing-projects-projects-import) | Restaura um ou mais projetos a partir de arquivos de backup. |

## Exportando um projeto (`projects export`) {#exporting-a-project-projects-export}

Exporta um único projeto, identificado pelo seu ID numérico ou pelo seu nome.

```bash
# Export by ID to a file:
semaphore project export --project-id 3 --file project-3.backup

# Export by name to stdout:
semaphore project export --project-name "My Project"
```

| Flag | Descrição |
|------|-------------|
| `--project-id <id>` | ID do projeto a ser exportado. |
| `--project-name <name>` | Nome do projeto a ser exportado (correspondência sem distinção entre maiúsculas e minúsculas). |
| `--file <path>` | Grava o backup neste arquivo. Se omitido, o backup é exibido na saída padrão. |

Exatamente uma das flags `--project-id` ou `--project-name` é obrigatória — informar ambas,
ou nenhuma, é um erro.

## Importando projetos (`projects import`) {#importing-projects-projects-import}

Importa um ou mais backups de projetos. Você pode importar um único arquivo ou todos os
backups encontrados em um diretório. Cada projeto importado é criado como um **novo**
projeto pertencente a um administrador existente (o primeiro administrador no banco de dados, ou o
primeiro usuário se não houver administrador), então a importação nunca sobrescreve um
projeto existente.

```bash
# Import a single backup:
semaphore project import --file project-3.backup

# Import a single backup under a new name:
semaphore project import --file project-3.backup --project-name "My Project (copy)"

# Import every backup in a directory:
semaphore project import --dir /path/to/backups
```

| Flag | Descrição |
|------|-------------|
| `--file <path>` | Caminho de um único arquivo de backup a ser importado. |
| `--dir <path>` | Diretório a ser verificado em busca de arquivos de backup. Arquivos terminados em `.json`, `.backup` ou `.bk` são importados, em ordem alfabética. |
| `--project-name <name>` | Substitui o nome do projeto importado. Válido apenas com `--file`. |

Exatamente uma das flags `--file` ou `--dir` é obrigatória — informar ambas, ou nenhuma, é
um erro. `--project-name` só pode ser combinada com `--file`.

Ao importar um diretório, os arquivos que falham na importação são reportados e ignorados;
o comando continua com os demais e termina com status diferente de zero apenas se
nada tiver sido importado.
