
# Ansible

Usando o Semaphore UI, você pode executar playbooks do Ansible. Para isso, é necessário criar um Modelo do tipo **Ansible Playbook**.

1. Vá até a seção **Modelos de Tarefa**, clique em **Novo Modelo** e depois em **Ansible Playbook**.

![](/assets/ansible_1.png)

2. Configure o modelo.

O modelo permite especificar os seguintes parâmetros:

* Repositório
* Caminho para o arquivo do playbook
* Diretório de trabalho (opcional)
* Inventário
* Grupos de Variáveis
* Vaults
* Argumentos extras de CLI (tags, skip-tags, limit, verbosidade)
* Variáveis de ambiente

![](/assets/ansible_2.png)

## Diretório de trabalho {#working-directory}

Use **Diretório de trabalho** para executar os comandos do Ansible a partir de um subdiretório do repositório do modelo. Informe um caminho relativo à raiz do repositório. Por exemplo, se o `ansible.cfg` estiver armazenado em `<repository>/automation`, informe `automation`. Caminhos absolutos e caminhos fora do repositório são rejeitados. Se omitido, o Semaphore usa a raiz do repositório.

O diretório de trabalho afeta o comportamento do Ansible que depende do diretório atual do processo. A [ordem de busca do arquivo de configuração][ansible-config-search] do Ansible inclui o `ansible.cfg` do diretório atual. O diretório de trabalho também afeta a resolução de caminhos relativos nos argumentos extras de CLI; alguns exemplos são [`--extra-vars @vars.yml`][ansible-extra-vars-file] e [`--private-key key.pem`][ansible-private-key]. Os caminhos do playbook e do inventário em arquivo continuam relativos às raízes dos respectivos repositórios.

Alterar o diretório de trabalho não adiciona, por si só, os subdiretórios `roles/` ou `collections/` desse diretório aos caminhos de busca do Ansible. A [descoberta de roles relativa ao playbook][ansible-role-search] e as [collections adjacentes a um playbook][ansible-playbook-collections] continuam baseadas na localização do playbook. Ainda assim, o diretório de trabalho pode afetar indiretamente essa descoberta quando o `ansible.cfg` selecionado configura `roles_path` ou `collections_path`.

[ansible-config-search]: https://docs.ansible.com/ansible/latest/reference_appendices/config.html#the-configuration-file
[ansible-extra-vars-file]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_variables.html#vars-from-a-json-or-yaml-file
[ansible-private-key]: https://docs.ansible.com/ansible/latest/cli/ansible-playbook.html#cmdoption-ansible-playbook-private-key
[ansible-role-search]: https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse_roles.html#storing-and-finding-roles
[ansible-playbook-collections]: https://docs.ansible.com/ansible/latest/collections_guide/collections_installing.html#installing-collections-adjacent-to-playbooks

## Tipos de modelo {#template-types}

Um modelo ansible-playbook pode ser de um dos seguintes tipos:

* [Tarefa](#task)
* [Build](#build)
* [Deploy](#deploy)

### Tarefa {#task}

Apenas executa os playbooks especificados com os parâmetros especificados.

Se você pretende iniciar o modelo por meio de uma chamada de API usando o recurso *limit*, certifique-se de ativar a opção *Ansible prompts: Limit*. Caso contrário, o limit definido na chamada de API será ignorado. Para a tarefa acionada pela API, isso não causará nenhum prompt interativo; a tarefa será executada sem intervenção.

### Build {#build}

Esse tipo de modelo deve ser usado para criar [artefatos](https://en.wikipedia.org/wiki/Artifact\_\(software\_development\)). A versão inicial do artefato pode ser especificada em um parâmetro do modelo. Cada execução incrementa a versão do artefato.

![](/assets/template_new_build_ipad1.png)

O Semaphore não oferece suporte a artefatos de forma nativa; ele fornece apenas o versionamento de tarefas. Você deve implementar a criação do artefato por conta própria. Leia o artigo [CI/CD](../../admin-guide/cicd) para saber como fazer isso.

### Deploy {#deploy}

Esse tipo de modelo deve ser usado para implantar artefatos nos servidores de destino. Cada modelo `deploy` está associado a um modelo `build`.


Isso permite implantar uma versão específica do artefato nos servidores.

## Opções do modelo {#template-options}

### Agendamento {#schedule}

Você pode configurar o agendamento de tarefas especificando uma expressão cron nas configurações do modelo. O formato da expressão cron pode ser encontrado na [documentação](https://pkg.go.dev/github.com/robfig/cron/v3#hdr-CRON\_Expression\_Format).


#### Executar uma tarefa quando um novo commit é adicionado ao repositório {#run-a-task-when-a-new-commit-is-added-to-the-repository}

Você pode usar o cron para verificar periodicamente se há novos commits no repositório e acionar uma tarefa quando eles chegarem.

Por exemplo, você tem o código-fonte do aplicativo em um repositório git. Você pode adicioná-lo em **Repositórios** e acionar a tarefa de Build para os novos commits.


### Tags, skip-tags e limit {#tags-skip-tags-and-limit}

Os modelos oferecem suporte às opções de CLI do Ansible:

- `--tags`
- `--skip-tags`
- `--limit`

Elas podem ser definidas no modelo e sobrescritas ao criar uma tarefa. Certifique-se de que os prompts correspondentes estejam habilitados se você planeja passar esses valores pela API.

### Requisitos do Galaxy {#galaxy-requirements}

Antes de executar um playbook, o Semaphore instala roles e collections a partir dos arquivos `requirements.yml` encontrados no diretório do playbook, na raiz do repositório e nos subdiretórios `roles/` e `collections/` de ambos, usando `ansible-galaxy install --force`.

Para evitar a reinstalação a cada execução, o Semaphore armazena um checksum de cada arquivo de requisitos e só executa a instalação novamente quando o arquivo muda. Duas opções do modelo na seção recolhível **Opções de instalação do Galaxy** (abaixo de **Prompts do Ansible**) controlam esse comportamento:

- **Pular instalação do Galaxy** — não executa o `ansible-galaxy` de forma alguma. Use quando os requisitos já estiverem pré-instalados na imagem do runner.
- **Forçar instalação do Galaxy** — sempre executa `ansible-galaxy install --force`, ignorando o checksum armazenado. Use quando um arquivo de requisitos aponta para um alvo em movimento (por exemplo, um branch em vez de uma tag) e você quer a versão mais recente a cada execução.

**Pular instalação do Galaxy** pode ser exposta no formulário de execução da tarefa habilitando a caixa de seleção de mesmo nome em **Prompts**, na parte inferior da seção. Quando um prompt está habilitado, o valor escolhido no momento da execução sobrescreve o padrão do modelo.

#### Argumentos extras do Galaxy {#galaxy-extra-args}

**Argumentos de instalação de roles** e **Argumentos de instalação de collections** (na seção recolhível **Opções de instalação do Galaxy**, abaixo de **Prompts do Ansible**; recolhida por padrão; o contador ao lado mostra quantas configurações do Galaxy foram personalizadas) acrescentam flags a `ansible-galaxy role install` e `ansible-galaxy collection install`, respectivamente. Eles são configurados separadamente porque os dois subcomandos aceitam flags diferentes: `--pre`, por exemplo, é válida apenas para collections.

Cada entrada é um token argv; um valor pode ser informado inline (`--timeout=60`) ou como a entrada seguinte (`--timeout`, `60`). Apenas as seguintes flags são aceitas:

| Escopo | Flags |
|-------|-------|
| Ambos | `-c`/`--ignore-certs`, `-f`/`--force`, `--force-with-deps`, `-i`/`--ignore-errors`, `-n`/`--no-deps`, `-s`/`--server <url>`, `--timeout <seconds>`, `-v`…`-vvvv`/`--verbose` |
| Somente roles | `-g`/`--keep-scm-meta` |
| Somente collections | `--pre`, `-U`/`--upgrade`, `--offline`, `--no-cache`, `--clear-response-cache`, `--disable-gpg-verify`, `--keyring <path>`, `--signature <url>`, `--required-valid-signature-count <n>`, `--ignore-signature-status-code(s) <code>` |

Qualquer outra coisa é rejeitada ao salvar o modelo. Em particular, `--token`/`--api-key` não são permitidas porque os argumentos de linha de comando ficam visíveis na lista de processos — em vez disso, configure as credenciais do Galaxy por meio de variáveis de ambiente (por exemplo, `ANSIBLE_GALAXY_SERVER_<NAME>_TOKEN`) em um grupo de variáveis. O arquivo de requisitos (`-r`) é definido pelo Semaphore, e os caminhos de instalação (`-p`, `--roles-path`, `--collections-path`) deliberadamente não são aceitos, para que um modelo não possa gravar fora do repositório — em vez disso, defina `roles_path`/`collections_path` no `ansible.cfg` ou por meio de `ANSIBLE_ROLES_PATH`/`ANSIBLE_COLLECTIONS_PATH`.

### Paralelismo (`--forks` / `-f`) {#parallelism---forks---f}

Controle a quantos hosts o Ansible se conecta em paralelo passando `--forks` ou
`-f` nos **Argumentos extras de CLI** do modelo. Os argumentos devem ser JSON válido —
use um array de tokens separados:

```json
["--forks", "10"]
```

A forma curta também é suportada:

```json
["-f", "10"]
```

Quando **Permitir sobrescrever argumentos na tarefa** está habilitado no modelo, uma tarefa pode
fornecer seu próprio valor de forks no momento da execução. O Ansible recebe tanto os argumentos do modelo quanto
os da tarefa; o último `--forks` / `-f` na linha de comando prevalece.

Se os argumentos não forem JSON válido, a tarefa falha com um erro de validação descritivo
antes de a execução começar.

### Autenticação {#authentication}

A autenticação nos hosts do playbook é feita usando as referências de usuário do Armazenamento de Chaves no inventário. O usuário para SSH é determinado pelo usuário opcional no elemento do Armazenamento de Chaves.

### Múltiplas senhas de vault {#multiple-vault-passwords}

Você pode anexar várias senhas de Vault do Armazenamento de Chaves a um modelo. Durante a execução, o Ansible tentará descriptografar usando as senhas fornecidas.

### Nível de verbosidade {#verbosity-level}

Você pode ajustar a verbosidade do Ansible para uma tarefa (por exemplo, `-v`, `-vvv`) no formulário do modelo/tarefa para ajudar na solução de problemas.
