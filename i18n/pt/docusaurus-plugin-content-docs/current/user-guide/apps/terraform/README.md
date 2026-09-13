
# Terraform/OpenTofu

Com o Semaphore UI você pode executar código Terraform. Para isso, você precisa criar um **Modelo de Código Terraform**.

1. Vá para a seção **Modelos de Tarefa** e clique no botão **Novo Modelo**.
2. Selecione **Terraform** como o tipo de aplicativo.
3. Configure o modelo e clique no botão **Criar**.
4. Clique em **Executar** para executar o modelo.

## Passando variáveis {#passing-variables}

As variáveis dos **Grupos de Variáveis** selecionados são injetadas como variáveis de ambiente. Prefixe os nomes com `TF_VAR_` para que o Terraform as reconheça como variáveis de entrada:

| Chave do Grupo de Variáveis | Variável do Terraform |
|---|---|
| `TF_VAR_region` | `var.region` |
| `TF_VAR_instance_type` | `var.instance_type` |

Para valores sensíveis, use a aba **Segredos** nos Grupos de Variáveis — eles são criptografados em repouso.

## Workspaces {#workspaces}

O Semaphore oferece suporte nativo a workspaces do Terraform/OpenTofu. Consulte [Workspaces](./workspaces) para criar e alternar workspaces e usar chaves SSH para módulos privados.

## Substituição de backend e backend HTTP (Pro) {#backend-override-and-http-backend-pro}

Você pode substituir o backend em um modelo para usar o backend HTTP integrado sem modificar seu código Terraform. Consulte [Backend HTTP (Pro)](./states) para mais detalhes.

## Flag de destroy e migração de estado {#destroy-flag-and-state-migration}

A caixa de diálogo de execução da tarefa inclui opções para `-destroy` e `-migrate-state`. Use-as ao desmontar a infraestrutura ou ao migrar o estado do Terraform.

## Observações {#notes}

- O Semaphore executa `terraform init` automaticamente antes de cada execução.
- O estado é gerenciado pelo backend configurado no seu código Terraform (local, S3, GCS etc.), a menos que você use o backend HTTP integrado (Pro).
