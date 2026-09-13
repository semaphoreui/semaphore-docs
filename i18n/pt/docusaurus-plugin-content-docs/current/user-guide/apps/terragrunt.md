# Terragrunt

O [Terragrunt](https://terragrunt.gruntwork.io/) é um wrapper para Terraform e OpenTofu que mantém as configurações DRY e gerencia dependências entre módulos. O Semaphore o executa da mesma forma que o [Terraform/OpenTofu](./terraform), com algumas diferenças descritas aqui.

## Pré-requisitos {#prerequisites}

1. Instale o binário `terragrunt` e um binário `terraform` ou `tofu` no servidor Semaphore ou no [runner](/admin-guide/runners) que executa as tarefas.
2. Habilite o aplicativo **Terragrunt Code**: ele vem desabilitado por padrão. Abra **Aplicativos** no menu da conta e ative a chave, consulte [Aplicativos](/user-guide/apps).

## Criando um modelo Terragrunt {#creating-a-terragrunt-template}

1. Vá até **Modelos de Tarefa** e clique em **Novo Modelo**.
2. Selecione **Terragrunt Code** como o app.
3. Defina o **Repositório** e o subdiretório com o seu `terragrunt.hcl`.
4. Selecione ou crie um **Workspace** no campo Inventário. Os modelos Terragrunt usam inventários do tipo `terragrunt-workspace`, consulte [Workspaces](./terraform/workspaces).
5. Clique em **Criar** e depois em **Executar**.

![Modelo Terragrunt](/assets/templates-list.webp)

## Executando tarefas {#running-tasks}

A caixa de diálogo Nova Tarefa oferece as mesmas opções que para o Terraform: **Plan**, **Destroy**, **Auto Approve**, **Upgrade** e **Reconfigure**.

O Semaphore chama `terragrunt run -- <terraform arguments>` e passa o binário do Terraform ou do OpenTofu com `--tf-path`, a menos que você já tenha definido `--tf-path` nos argumentos de CLI do modelo. A seleção do workspace é feita com `terragrunt run -- workspace select -or-create=true <name>`.

As variáveis dos **Grupos de Variáveis** selecionados são passadas como variáveis de ambiente, portanto use o prefixo `TF_VAR_` para as variáveis de entrada. Variáveis extras e variáveis de survey são passadas como argumentos `-var name=value`.

## Observações {#notes}

- O `terragrunt` executa `init` automaticamente antes de cada comando.
- O backend de estado HTTP e a lista de estados na aba **Workspaces** funcionam como no Terraform, consulte [Backend HTTP](./terraform/states).
- Para usar `run-all` em vários módulos, adicione os argumentos em **Argumentos de CLI** do modelo.
