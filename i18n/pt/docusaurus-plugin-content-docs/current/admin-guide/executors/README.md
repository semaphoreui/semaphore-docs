---
title: Executores
description: Como um runner executa tarefas com o executor local, Docker ou Kubernetes, o que roda dentro dos contêineres e o que os executores de contêiner não suportam.
---

# Executores

Um executor decide **onde o runner inicia o processo da tarefa**. O runner continua
consultando o servidor, recebendo a tarefa e enviando o log de volta; muda apenas o lugar
onde o processo do Ansible, Terraform ou shell é executado.

| Executor | `runner.executor.type` | Onde a tarefa é executada | Edição |
|---|---|---|---|
| Local | `local` (padrão) | Um processo filho no host do runner, com os arquivos, ferramentas e `PATH` do runner. | Community |
| Docker | `docker` | Um novo contêiner em um daemon Docker, removido após a tarefa. | <FeatureState feature="docker-executor" /> |
| Kubernetes | `k8s` | Um novo Pod em um namespace do Kubernetes, excluído após a tarefa. | <FeatureState feature="k8s-executor" /> |

O executor é uma configuração do **runner**, não do servidor nem do modelo. O próprio
servidor do Semaphore sempre executa as tarefas localmente; para executar tarefas em
contêineres, inicie um [runner](/admin-guide/runners) e direcione os modelos para ele com uma tag de runner.

## Escolher um executor {#choose-an-executor}

| Você precisa de | Use |
|---|---|
| Ferramentas instaladas em uma máquina, acesso aos arquivos dela, saídas de workflow | Local |
| Um ambiente limpo para cada tarefa, conjuntos de ferramentas diferentes por modelo, em um ou poucos hosts | [Docker](./docker) |
| Tarefas distribuídas em um cluster, RBAC e Secrets do Kubernetes, sem socket Docker | [Kubernetes](./kubernetes) |

## Definir o executor {#set-the-executor}

Adicione o bloco `executor` à seção `runner` do arquivo de configuração do runner:

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker"
    }
  }
}
```

Ou defina a variável de ambiente:

```bash
SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker   # or k8s
```

Cada opção tem uma variável de ambiente; as listas completas estão nas páginas
[Docker](./docker#configuration-reference) e [Kubernetes](./kubernetes#configuration-reference).
Reinicie o runner após trocar o executor.

:::info
Os executores de contêiner fazem parte da build Pro do runner. Use a imagem
`semaphoreui/runner` ou o binário oficial `semaphore`. A imagem
`semaphoreui/runner-community` é compilada sem eles e registra
`docker executor is only available in the proprietary build` na inicialização.
:::

## Como uma tarefa em contêiner é executada {#how-a-container-task-runs}

Os dois executores de contêiner executam uma tarefa da mesma forma:

1. **Preparação.** O runner cria um workspace compartilhado e coloca os segredos da tarefa
   (chaves SSH, senhas do vault, variáveis extras, um inventário estático) onde os
   contêineres possam lê-los.
2. **Clonagem.** Um contêiner *auxiliar* (helper) de curta duração clona o repositório em
   `/workspace/repo` (`git clone --depth 1` do branch da tarefa).
3. **Build.** O contêiner *build* inicia em `/workspace/repo` e executa o aplicativo:
   `ansible-playbook`, `terraform`/`tofu`/`terragrunt`, `bash`, `python3`,
   `powershell` ou o binário de um aplicativo personalizado. O código de saída dele é o resultado da tarefa.
4. **Log.** A saída dos dois contêineres é transmitida para o log da tarefa enquanto eles rodam.
5. **Limpeza.** Contêineres, volumes, Secrets e ConfigMaps da tarefa são removidos,
   seja a tarefa bem-sucedida, com falha ou interrompida.

| Etapa | Docker | Kubernetes |
|---|---|---|
| Workspace | Volume nomeado `semaphore-workspace-<task>-<random>` | Volume `emptyDir` do Pod |
| Segredos | Volume nomeado `semaphore-secrets-<task>-<random>`, montado somente leitura | Um Secret ou ConfigMap por tipo, montado somente leitura |
| Clonagem | Contêiner `semaphore-job-<task>-<random>-clone` | Init container `git-clone` |
| Build | Contêiner `semaphore-job-<task>-<random>-build` | Contêiner `build` do Pod `semaphore-job-<task>-<random>` |
| Botão de parada | `docker stop` com `cleanup_grace_seconds`, depois remoção | Pod excluído com `cleanup_grace_seconds` |

Uma tarefa interrompida pela interface termina com o status **Stopped**, como no executor local.

## Dentro do contêiner build {#inside-the-build-container}

| Caminho | Conteúdo |
|---|---|
| `/workspace` | Workspace gravável; também é o `HOME` da tarefa. |
| `/workspace/repo` | O repositório clonado; o diretório de trabalho. |
| `/secrets/ssh/<key id>/id_rsa` | Chave SSH privada do repositório ou do inventário. Carregada no `ssh-agent` antes de o aplicativo iniciar. |
| `/secrets/vault/<name>` | Senha do Ansible vault, passada como `--vault-id=<name>@<path>`. |
| `/secrets/extra-vars/values.json` | Variáveis extras do Variable Group mais `semaphore_vars`, passadas como `--extra-vars @<path>`. |
| `/secrets/inventory/inventory.cfg` ou `inventory.yml` | Um inventário estático armazenado no Semaphore. Inventários de arquivo são lidos do repositório. |

O contêiner recebe um conjunto fixo de variáveis de ambiente, listado em
[Variáveis de ambiente da tarefa](/reference/task-environment#container-executors). Os
`env_vars`, `forwarded_env_vars`, `PATH` e caminhos `apps.*` do próprio runner **não**
são passados para o contêiner.

## Imagens {#images}

Duas imagens participam de cada tarefa:

| Imagem | Padrão | Usada para | Requisitos |
|---|---|---|---|
| Imagem build | `semaphoreui/job:latest` | Executar o aplicativo. | `sh`, o binário do aplicativo no `PATH`; para chaves SSH `ssh-agent`, `ssh-add`, `setsid`. |
| Imagem auxiliar | `semaphoreui/helper:latest` | Clonar o repositório (o Docker também a usa para preencher o volume de segredos). | `sh`, `git`, `ssh-agent`, `ssh-add`. |

`semaphoreui/job` é um Debian com Ansible 9 (ansible-core 2.16–2.17), Python 3,
OpenSSH, Git, Terraform, OpenTofu e Terragrunt. Roda como usuário `nobody`, grupo `0`.

A imagem build é definida por runner (`image`) e pode ser substituída por modelo no
campo **Executor image**, consulte
[Imagem do executor](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners).
A imagem auxiliar é definida apenas por runner.

### Criar uma imagem personalizada {#build-a-custom-image}

Estenda `semaphoreui/job` quando suas tarefas precisarem de coleções Ansible, pacotes
Python ou ferramentas extras. Os executores de contêiner **não** instalam o `requirements.yml`
do repositório, então inclua coleções e roles na imagem:

```dockerfile
FROM semaphoreui/job:latest

USER root
RUN pip3 install --no-cache-dir --break-system-packages hvac boto3 \
 && ansible-galaxy collection install -p /usr/share/ansible/collections \
      community.general amazon.aws
USER nobody:0
```

```bash
docker build -t registry.example.com/semaphore/job-aws:1.0 .
docker push registry.example.com/semaphore/job-aws:1.0
```

Se você criar uma imagem do zero, mantenha estas propriedades de `semaphoreui/job`:

- `/workspace` existe e é gravável pelo usuário com o qual o contêiner roda.
- `/etc/passwd` é gravável pelo grupo (`chmod g=u /etc/passwd`). Assim, um contêiner iniciado
  com um UID aleatório (OpenShift) recebe uma entrada no passwd, exigida pelo OpenSSH e pelo Git.
- A imagem não precisa de um entrypoint especial: o executor roda seu script com `sh -c`.

## Limitações {#limitations}

Em comparação com o executor local, os executores de contêiner atualmente não suportam:

| Não suportado | O que fazer em vez disso |
|---|---|
| Credenciais de inventário do tipo **Login with password** (senha SSH ou senha de become) | Use uma chave SSH. Uma tarefa com essa chave falha com `inventory login_password authentication is not supported`. |
| Tarefas Terraform que aguardam confirmação manual | Ative **Auto approve** no modelo ou execute apenas tarefas de plan. Caso contrário, a tarefa falha com `terraform manual approval is not supported`. |
| Repositórios do tipo **Local** | O workspace fica vazio; use um repositório Git. |
| Instalação do `requirements.yml` (roles e coleções do Galaxy) | [Inclua-os na imagem](#build-a-custom-image). |
| Saídas de workflow (`SEMAPHORE_OUTPUTS_FILE`) | Use o executor local para tarefas cujas saídas um workflow lê. |
| Credenciais por host vindas da configuração do host | Use o executor local. |
| Histórico Git além do último commit | O clone é raso (`--depth 1`). |

As chaves de host SSH não são verificadas: o clone aceita uma chave de host nova, e o Ansible
roda com `ANSIBLE_HOST_KEY_CHECKING=False`.

## Páginas relacionadas {#related-pages}

- [Executor Docker](./docker): configuração, opções, segurança, solução de problemas.
- [Executor Kubernetes](./kubernetes): RBAC, implantação do runner, opções, solução de problemas.
- [Runners](/admin-guide/runners): registrar e iniciar um runner.
- [Opções de configuração](/reference/configuration): todas as opções `runner.executor.*`.
