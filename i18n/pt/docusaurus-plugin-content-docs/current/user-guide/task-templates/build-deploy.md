# Modelos de build e deploy

Além dos modelos **Task** simples, o Semaphore possui dois tipos de modelo que formam um pipeline simples: **Build** cria um artefato versionado e **Deploy** envia uma versão escolhida para os servidores. Ambos os tipos são selecionados no formulário do modelo e alteram o que o usuário vê ao iniciar uma tarefa.

## Modelos de build {#build-templates}

Um modelo de build produz um artefato: um tarball, uma imagem de contêiner, um pacote. Cada tarefa de build recebe uma versão incrementada automaticamente, a partir do **Start Version** do modelo (por exemplo, `1.0.0`). A versão é exibida na coluna **Version** da lista de modelos e no histórico de tarefas.

<div class="DialogScreenshot">
  ![Janela New Task de um modelo de build](/assets/task-new-build.webp)
</div>

Use a versão no seu playbook por meio de `semaphore_vars.task_details.target_version` para nomear o artefato.

## Modelos de deploy {#deploy-templates}

Um modelo de deploy é vinculado a um modelo de build pelo campo **Build Template**. Quando um usuário clica em **Deploy**, a janela New Task pede a **Build Version** a ser implantada; o build bem-sucedido mais recente já vem selecionado.

<div class="DialogScreenshot">
![Janela New Task de um modelo de deploy](/assets/task-new-deploy.webp)
</div>

Ative **Autorun** no modelo de deploy para iniciar um deploy automaticamente após cada build bem-sucedido. A versão a ser implantada está disponível no playbook como `semaphore_vars.task_details.incoming_version`.

## A variável `semaphore_vars` {#the-semaphore_vars-variable}

O Semaphore passa a variável `semaphore_vars` para cada playbook do Ansible que executa. Use-a para saber qual tipo de tarefa foi executada, qual versão deve ser construída ou implantada, quem executou a tarefa e a mensagem da tarefa.

Exemplo para tarefas `build`:

```yaml
semaphore_vars:
    task_details:
        type: build
        username: user123
        message: New version of some feature
        target_version: 1.5.33
```

Exemplo para tarefas `deploy`:

```yaml
semaphore_vars:
    task_details:
        type: deploy
        username: user123
        message: Deploy new feature to servers
        incoming_version: 1.5.33
```

Para modelos **Bash**, **PowerShell** e **Python**, o Semaphore fornece os mesmos valores de `task_details` como variáveis de ambiente:

| Campo de `task_details` | Variável de ambiente | Observações |
| --- | --- | --- |
| `type` | `SEMAPHORE_TASK_DETAILS_TYPE` | `build` ou `deploy` |
| `username` | `SEMAPHORE_TASK_DETAILS_USERNAME` | Usuário que iniciou a tarefa |
| `message` | `SEMAPHORE_TASK_DETAILS_MESSAGE` | Mensagem da tarefa |
| `target_version` | `SEMAPHORE_TASK_DETAILS_TARGET_VERSION` | Presente em tarefas `build` |
| `incoming_version` | `SEMAPHORE_TASK_DETAILS_INCOMING_VERSION` | Presente em tarefas `deploy` |

Exemplo para Bash:

```bash
echo "$SEMAPHORE_TASK_DETAILS_TYPE"
echo "$SEMAPHORE_TASK_DETAILS_TARGET_VERSION"
```

Exemplo para PowerShell:

```powershell
$env:SEMAPHORE_TASK_DETAILS_TYPE
$env:SEMAPHORE_TASK_DETAILS_INCOMING_VERSION
```

Exemplo para Python:

```python
import os

task_type = os.getenv("SEMAPHORE_TASK_DETAILS_TYPE")
target_version = os.getenv("SEMAPHORE_TASK_DETAILS_TARGET_VERSION")
incoming_version = os.getenv("SEMAPHORE_TASK_DETAILS_INCOMING_VERSION")
```

## Exemplo de pipeline {#example-pipeline}

Uma role do Ansible de `build`:

1. Obtenha o código-fonte da aplicação no GitHub.
2. Compile o código-fonte.
3. Empacote o binário em `app-{{ semaphore_vars.task_details.target_version }}.tar.gz`.
4. Envie o tarball para um bucket S3.

Uma role do Ansible de `deploy`:

1. Baixe `app-{{ semaphore_vars.task_details.incoming_version }}.tar.gz` do bucket S3 para os servidores de destino.
2. Descompacte-o no diretório de destino.
3. Crie ou atualize os arquivos de configuração.
4. Reinicie o serviço da aplicação.

Para encadear mais de duas etapas, adicionar aprovações ou ramificar em caso de falha, use [Workflows](../workflows).
