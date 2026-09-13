# Aplicações

Uma aplicação é a ferramenta que um modelo de tarefa executa. O Semaphore vem com sete aplicações integradas; os administradores podem ativá-las e desativá-las, além de registrar as suas próprias.

| Aplicação | ID | O que um modelo executa | Guia |
|---|---|---|---|
| Playbook do Ansible | `ansible` | `ansible-playbook` com o inventário selecionado | [Ansible](./ansible) |
| Código Terraform | `terraform` | `terraform` no subdiretório e no workspace selecionados | [Terraform/OpenTofu](./terraform) |
| Código OpenTofu | `tofu` | `tofu`, com as mesmas opções do Terraform | [Terraform/OpenTofu](./terraform) |
| Código Terragrunt | `terragrunt` | `terragrunt` encapsulando o Terraform ou o OpenTofu | [Terragrunt](./terragrunt) |
| Script Bash | `bash` | um script de shell com `/bin/bash` | [Shell](./bash) |
| Script PowerShell | `powershell` | um script `.ps1` com `pwsh` | [PowerShell](./powershell) |
| Script Python | `python` | um script `.py` com `python3` | [Python](./python) |

A ferramenta em si precisa estar instalada na máquina que executa as tarefas: o servidor do Semaphore ou o [runner](/admin-guide/runners). A imagem Docker oficial contém Ansible, Terraform, OpenTofu, Bash e Python.

## Gerenciando aplicações {#managing-applications}

Os administradores abrem **Aplicações** a partir do menu da conta na parte inferior da barra lateral.

![Página de aplicações](/assets/apps-list.webp)

O interruptor em cada linha ativa ou desativa a aplicação. Uma aplicação desativada não é oferecida no formulário do modelo, mas os modelos existentes continuam funcionando. Apenas as aplicações ativadas aparecem ao criar um modelo, portanto desative as ferramentas que não estão instaladas no seu servidor.

Clique em uma aplicação para alterar o seu título, ícone, caminho do binário e prioridade (a ordem no formulário do modelo).

## Aplicações personalizadas {#custom-applications}

**New App** registra qualquer ferramenta de linha de comando como uma aplicação:

| Campo | Descrição |
|---|---|
| **ID** | Identificador curto usado na API e nos modelos, por exemplo `pulumi`. |
| **Icon** | Ícone exibido ao lado do nome. |
| **Name** | Título exibido no formulário do modelo. |
| **Path** | Caminho para o executável no servidor ou no runner. |
| **Priority** | Posição na lista de aplicações. |
| **Active** | Se a aplicação é oferecida nos modelos. |

Um modelo de uma aplicação personalizada executa o executável com o arquivo de script do repositório como argumento e recebe os grupos de variáveis como variáveis de ambiente, da mesma forma que os modelos [Bash](./bash).

As aplicações também podem ser predefinidas na configuração do servidor, consulte a seção `apps` em [Configuração](/admin-guide/configuration).
