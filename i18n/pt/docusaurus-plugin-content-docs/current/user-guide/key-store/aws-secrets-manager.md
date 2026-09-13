# Armazenamento de segredos no AWS Secrets Manager

<Enterprise />

O Semaphore UI Enterprise pode usar o **AWS Secrets Manager** como armazenamento externo para os segredos do Armazenamento de Chaves em vez do banco de dados.

## Opções de configuração {#configuration-options}

Ao criar um armazenamento **AWS Secrets Manager** em **Armazenamento de Chaves → Armazenamentos**, configure:

| Campo | Descrição |
|-------|-------------|
| **Region** | Região da AWS onde os segredos estão (por exemplo, `us-east-1`). Obrigatório. |
| **Endpoint URL** | Endpoint personalizado opcional. Deixe vazio para usar o endpoint padrão da API da AWS. Útil para LocalStack ou endpoints de VPC. |
| **Use IAM Role / Instance Profile** | Quando habilitado, o Semaphore usa a cadeia de credenciais da AWS do ambiente (perfil de instância EC2, role de tarefa ECS, EKS IRSA etc.) e não exige chaves de acesso estáticas. |
| **Access Key ID** | Obrigatório quando o modo de role do IAM está desativado. |
| **Secret Access Key** | Obrigatório quando o modo de role do IAM está desativado. Pode ser armazenado no banco de dados, lido de uma variável de ambiente ou carregado de um arquivo. |

### Role do IAM vs. chaves de acesso {#iam-role-vs-access-keys}

- **Role do IAM / perfil de instância** (recomendado na AWS): habilite **Use IAM Role / Instance Profile** e conceda ao host do servidor ou do runner do Semaphore permissão para ler os segredos que você referencia. Nenhuma chave de longa duração é armazenada no Semaphore.
- **Chaves de acesso**: deixe a caixa de seleção desmarcada e forneça um par de chaves de acesso de usuário ou role do IAM com `secretsmanager:GetSecretValue` (e as permissões relacionadas de list/describe para a sincronização).

Ao editar um armazenamento existente, o Semaphore infere o modo de role do IAM se nenhum ID de chave de acesso tiver sido salvo.

## Como usar {#how-to-use}

1. No seu projeto, abra **Armazenamento de Chaves → Armazenamentos** e crie um armazenamento **AWS Secrets Manager**.
2. Ao criar ou editar uma chave, selecione esse armazenamento e forneça o nome ou o ARN do segredo no AWS Secrets Manager.
3. Opcionalmente, configure [caminhos de sincronização](/user-guide/key-store/secret-sync) para importar segredos automaticamente de forma agendada.

O armazenamento pode funcionar em modo somente leitura.

## Sincronizando segredos {#syncing-secrets}

Os segredos no AWS Secrets Manager podem ser importados para o Armazenamento de Chaves e mantidos sincronizados como nos outros armazenamentos externos. O separador de caminho padrão é `/`. Consulte [Sincronizando segredos de armazenamentos remotos](/user-guide/key-store/secret-sync).
