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

Como todos os templates trabalham no mesmo checkout e no mesmo branch, um template de um monorepo não pode ter um **Branch** próprio nem ativar o prompt **Branch**, que permite a uma tarefa escolher um branch ou commit. O formulário do template desativa ambos e explica o motivo, e a API rejeita esse template. Certifique-se de que os playbooks não gravem no checkout: uma árvore de trabalho alterada quebra o próximo pull, e o Semaphore então remove o checkout e o clona novamente. Se um repositório se tornar um monorepo depois, o branch que seus templates ainda tiverem e o branch ou commit informados por uma tarefa são ignorados, e todas as tarefas são executadas no branch do repositório.

## Editando um Repositório existente {#editing-an-existing-repository}
1. Vá até a seção Repositórios do Semaphore.

2. Clique no ícone de lápis ao lado do Repositório que deseja alterar e a configuração do Repositório será exibida.

## Excluindo um Repositório {#deleting-a-repository}
Certifique-se de que o Repositório que está prestes a ser excluído não esteja em uso por nenhum Template de Tarefa.
Um Repositório não pode ser excluído se estiver sendo usado em algum Template de Tarefa:
1. Vá até a seção Repositórios do Semaphore.

2. Clique no ícone de lixeira do Repositório que deseja excluir.

3. Clique em Sim na janela de confirmação se tiver certeza de que deseja excluir este Repositório.

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
