
# PowerShell

O Semaphore pode executar scripts PowerShell em hosts Windows (ou a partir de um runner Windows). Para isso, crie um modelo de tarefa do tipo **PowerShell**.

## Criando um modelo PowerShell {#creating-a-powershell-template}

1. Vá até a seção **Modelos de Tarefa** e clique no botão **Novo Modelo**.
2. Selecione **PowerShell** como o tipo de app.
3. Configure o modelo:

| Campo | Descrição |
|---|---|
| **Nome** | Um nome descritivo para o modelo |
| **Repositório** | Repositório que contém o seu script `.ps1` |
| **Playbook / Script** | Caminho relativo do script, por exemplo `scripts/deploy.ps1` |
| **Grupos de Variáveis** | Grupos de variáveis cujos valores são injetados como variáveis de ambiente |

4. Clique em **Criar**.
5. Clique em **Executar** para executar o modelo.

## Passando variáveis para os scripts {#passing-variables-to-scripts}

As variáveis dos **Grupos de Variáveis** selecionados são injetadas como variáveis de ambiente antes da execução do script. Acesse-as no PowerShell com `$env:VARIABLE_NAME`:

```powershell
Write-Host "Deploying to $env:TARGET_HOST"
```

## Executando em hosts Windows {#running-on-windows-hosts}

Os modelos PowerShell exigem uma das seguintes opções:
- Um **runner Windows** — um runner do Semaphore implantado em um host Windows. Consulte [Runners](/admin-guide/runners).
- O próprio servidor Semaphore em execução no Windows.

## Observações {#notes}

- Os scripts são executados de forma não interativa. Evite prompts que exijam entrada do usuário.
- O código de saída `0` significa sucesso; qualquer código de saída diferente de zero marca a tarefa como falha.
