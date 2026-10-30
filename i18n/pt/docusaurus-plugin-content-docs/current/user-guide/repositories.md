import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Repositórios

Um Repositório é um lugar para armazenar e gerenciar conteúdo do Ansible, como playbooks e roles.

![Lista de repositórios](/assets/repositories-list.webp)

A lista mostra o nome, a URL Git com o branch e a chave usada para autenticação.

O Semaphore entende Repositórios que são:
  * um sistema de arquivos local (`/path/to/the/repo`)
  * um repositório Git local (`file://`)
  * um Repositório Git remoto acessado por HTTPS (`https://`) ou SSH (`ssh://` ou a forma curta `git@host:org/repo.git`)
  * o protocolo `git://` é suportado, mas não é recomendado por motivos de segurança.

Todos os Templates de Tarefa precisam de um Repositório para serem executados.

## Autenticação {#authentication}
Se você estiver usando um Repositório remoto que exige autenticação, será necessário configurar uma chave na seção **Armazenamento de Chaves** do Semaphore.

Para Repositórios remotos que usam SSH, você precisará usar a sua chave SSH no **Armazenamento de Chaves**.

Para Repositórios remotos que não têm autenticação, você pode criar uma Chave do tipo `None`.

A chave de um Repositório é usada apenas para esse Repositório. Para alcançar submódulos, roles do `requirements.yml` ou outros repositórios hospedados em outro lugar com credenciais próprias, adicione um mapeamento em [Host config](/user-guide/host-config).

### Configuração de Deploy Keys {#deploy-keys}

Em ambientes de automação corporativa, o uso de **Deploy Keys** dedicadas (ou Access Keys) com escopo para um único repositório é a prática recomendada em comparação a chaves SSH de usuário pessoal ou Personal Access Tokens (PATs). As Deploy Keys garantem:
* **Isolamento do ciclo de vida**: Os pipelines de CI/CD e automação não dependem de contas individuais de funcionários ou credenciais pessoais.
* **Menor privilégio**: As Deploy Keys podem receber permissões estritamente de leitura, garantindo que o Semaphore não possa enviar alterações indesejadas para o repositório de origem.
* **Raio de alcance limitado**: Se uma chave precisar ser rotacionada, apenas o repositório específico será afetado.

:::tip Gerar chaves SSH diretamente no Semaphore
Você não precisa gerar chaves SSH na linha de comando. No Semaphore, vá para **Key Store** &rarr; **Nova chave** &rarr; selecione **SSH Key** &rarr; clique em **Generate**. O Semaphore criará um par de chaves seguro e exibirá uma caixa de diálogo com a **Chave pública** pronta para copiar. Veja [Key Store](/user-guide/key-store#built-in-ssh-key-generator) para obter detalhes.
:::

Copie a chave pública gerada no Semaphore e adicione-a ao seu provedor Git:

<Tabs groupId="git-provider">
  <TabItem value="github" label="GitHub" default>

1. GitHub: **Settings** &rarr; **Deploy keys** &rarr; **Add deploy key**.
2. Title: `Semaphore UI Runner`.
3. Key: Public Key.
4. **Allow write access**: Unchecked.

```text
git@github.com:organization/repository.git
```

  </TabItem>
  <TabItem value="gitlab" label="GitLab">

1. GitLab: **Settings** &rarr; **Repository** &rarr; **Deploy keys**.
2. Title: `Semaphore UI Runner`.
3. Key: Public Key.
4. **Grant write permissions**: Unchecked.

```text
git@gitlab.com:organization/project.git
```

  </TabItem>
  <TabItem value="bitbucket" label="Bitbucket">

1. Bitbucket: **Repository settings** &rarr; **Access keys**.
2. Label: `Semaphore UI Runner`.
3. Key: Public Key.
4. Permissions: `Read`.

```text
git@bitbucket.org:workspace/repository.git
```

  </TabItem>
</Tabs>

## Criando um novo Repositório {#creating-a-new-repository}
1. Certifique-se de ter configurado a chave do Repositório que você está prestes a adicionar na seção Armazenamento de Chaves.

2. Vá até a seção Repositórios do Semaphore e clique no botão **Novo Repositório** no canto superior direito.

3. Configure o Repositório:
    * Dê um nome ao Repositório
    * Adicione a URL. A URL deve começar com um dos seguintes:
        * `/path/to/the/repo` para uma pasta local no sistema de arquivos
        * `https://` para um Repositório Git remoto acessado por HTTPS
        * `ssh://` para um Repositório Git remoto acessado por SSH
        * `file://` para um Repositório Git local
        * `git://` para um Repositório Git remoto acessado pelo protocolo Git
    * Defina o branch do Repositório; se você não tem certeza de qual deve ser, provavelmente é master ou main
    * Marque **Checkout único para todos os templates** se o Repositório for um monorepo que todos os templates devem compartilhar, consulte [Monorepo](#monorepo)
    * Selecione a **Chave de Acesso** que você configurou antes de criar este Repositório.

4. Clique em Salvar quando tudo estiver configurado.

## Monorepo: um checkout para todos os templates {#monorepo}

:::info Desde a v2.20
A opção **Checkout único para todos os templates** está disponível desde o **Semaphore 2.20**. As versões anteriores sempre clonam um repositório uma vez por template.
:::

Por padrão, o Semaphore clona um Repositório uma vez por template, de modo que cada template trabalha em uma cópia própria. Para um repositório grande compartilhado por muitos templates, as cópias consomem espaço em disco e cada tarefa começa com um clone ou pull da sua própria cópia.

Marque **Checkout único para todos os templates** para clonar o Repositório uma única vez e compartilhar esse checkout entre todos os templates do projeto. A opção não está disponível para uma pasta local (`/path/to/the/repo`), que nunca é clonada.

<div style={{maxWidth: 450}}>

![Formulário do repositório com Checkout único para todos os templates ativado](/assets/repository-monorepo.webp)

</div>

Como funciona o checkout compartilhado:

* Antes de uma tarefa começar, o Semaphore obtém um lock no checkout, faz fetch e pull do branch configurado no Repositório e, em seguida, libera o lock. As tarefas de outros templates aguardam o lock enquanto o checkout está sendo atualizado, mas as tarefas em si são executadas em paralelo.
* Cada branch continua tendo o seu próprio checkout, portanto Repositórios com branches diferentes nunca compartilham uma árvore de trabalho.
* O checkout é compartilhado, mas o diretório home do Ansible (roles e coleções instaladas a partir do `requirements.yml`) permanece separado para cada template.

Como todos os templates trabalham no mesmo checkout e no mesmo branch, um template de um monorepo não pode ter um **Branch** próprio nem ativar o prompt **Branch**, que permite a uma tarefa escolher um branch ou commit. O formulário do template desativa ambos e explica o motivo, e a API rejeita esse template. Certifique-se de que os playbooks não gravem no checkout: uma árvore de trabalho alterada quebra o próximo pull, e o Semaphore então remove o checkout e o clona novamente.

## Playbooks em subdiretórios {#subdirectories}

Os repositórios corporativos frequentemente organizam a automação em diretórios dedicados, monorepositórios ou estruturas multiambiente em vez de colocar todos os playbooks na raiz do repositório.

```text
my-automation-repo/
├── ansible.cfg
├── collections/
│   └── requirements.yml
├── roles/
│   └── common/
└── playbooks/
    ├── site.yml
    ├── provisioning/
    │   └── aws-vms.yml
    └── maintenance/
        └── patch-nodes.yml
```

Ao criar um [Modelo de tarefa](/user-guide/task-templates), o **Nome do arquivo do playbook** é sempre especificado **relativo à raiz do repositório**:

* **Usar caminhos relativos**: Digite `playbooks/site.yml` ou `playbooks/provisioning/aws-vms.yml`.
* **Sem barra inicial**: Não use `/playbooks/site.yml`. Uma barra inicial faz com que o executor pesquise a partir do diretório raiz do sistema em vez do clone do repositório.
* **Barras padrão Unix**: Use sempre `/`, mesmo ao executar em nós runners do Windows.
* **Sensível a maiúsculas e minúsculas**: Os caminhos devem corresponder exatamente à grafia de pastas e arquivos (por exemplo, `playbooks/site.yml`).

:::info Diretório de trabalho e requisitos
Quando um playbook é executado a partir de um subdiretório (como `playbooks/site.yml`), o Semaphore avalia o diretório do playbook (`playbook_dir`) e a raiz do repositório (`repo_path`) ao resolver roles e coleções. Consulte [Requisitos](#requirements) abaixo para a ordem de pesquisa exata.
:::

## Editando um Repositório existente {#editing-an-existing-repository}
1. Vá até a seção Repositórios do Semaphore.

2. Clique no ícone de lápis ao lado do Repositório que deseja alterar e a configuração do Repositório será exibida.

## Excluindo um Repositório {#deleting-a-repository}
Certifique-se de que o Repositório que está prestes a ser excluído não esteja em uso por nenhum Template de Tarefa.
Um Repositório não pode ser excluído se estiver sendo usado em algum Template de Tarefa:
1. Vá até a seção Repositórios do Semaphore.

2. Clique no ícone de lixeira do Repositório que deseja excluir.

3. Clique em Sim na janela de confirmação se tiver certeza de que deseja excluir este Repositório.

### Proteção de dependências e salvaguardas de uso {#dependency-protection}

Um repositório não pode ser excluído se estiver atualmente atribuído a um ou mais modelos de tarefas.

Antes de tentar a exclusão, o Semaphore verifica as referências ativas de modelos:
1. Na lista de repositórios, clicar no ícone de lixeira verifica se o repositório é referenciado por modelos do projeto.
2. Se existirem dependências, o Semaphore exibirá uma caixa de diálogo de aviso listando os modelos de tarefas exatos que referenciam este repositório, com links diretos para cada modelo.
3. Se for excluído diretamente via API enquanto estiver em uso, a solicitação será rejeitada com HTTP `400 Bad Request`:

```json
{
  "error": "Repository is in use by one or more templates",
  "inUse": true
}
```

Para excluir um repositório com segurança:
1. Navegue até **Modelos** e reatribua cada modelo dependente a outro repositório ou exclua os modelos em desuso.
2. Retorne a **Repositórios** e clique no ícone de lixeira ao lado do repositório.
3. Confirme a exclusão na caixa de diálogo de confirmação.

:::tip Limpeza automática do cache de checkout
Quando um repositório é excluído com sucesso, o Semaphore limpa automaticamente o diretório de trabalho local do checkout no sistema de arquivos do host/runner, liberando espaço em disco.
:::

## Requirements {#requirements}
Na inicialização do projeto, o Semaphore procura e instala roles e coleções do Ansible a partir do requirements.yml nos seguintes locais e nesta ordem.

### Roles {#roles}

* `playbook_dir`/roles/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/roles/requirements.yml
* `repo_path`/requirements.yml

### Coleções {#collection}

* `playbook_dir`/collections/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/collections/requirements.yml
* `repo_path`/requirements.yml

### Lógica de processamento {#processing-logic}

* Cada arquivo é processado de forma independente
* Se um arquivo existir, ele será processado de acordo com o seu tipo (role ou coleção)
* Se o processamento de qualquer arquivo resultar em erro, o processo de instalação é interrompido e o erro é retornado
* O mesmo arquivo requirements.yml nos diretórios raiz (**`playbook_dir`/requirements.yml** e **`repo_path`/requirements.yml**) é processado duas vezes: uma para roles e outra para coleções

O Semaphore tentará processar todos esses locais independentemente de os locais anteriores terem sido encontrados ou processados com sucesso, exceto em caso de erros.
