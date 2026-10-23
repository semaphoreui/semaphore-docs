---
title: Armazenamento de segredos CyberArk
description: Opção Enterprise para ler e armazenar segredos do Key Store no CyberArk Privileged Access Manager por meio da API REST do PVWA.
sidebar_custom_props:
  edition: pro
---

# Armazenamento de segredos CyberArk <Enterprise />

O Semaphore UI Enterprise pode usar o **CyberArk Privileged Access Manager** (PAM Self-Hosted ou Privilege Cloud) como armazenamento externo para segredos do Key Store em vez do banco de dados. O Semaphore se comunica com a API REST do Password Vault Web Access (PVWA): cada chave do Semaphore é mapeada para uma **conta** do CyberArk dentro de um **Safe**.

## Opções de configuração {#configuration-options}

Ao criar um armazenamento **CyberArk** em **Key Store → Storages**, configure:

| Campo | Descrição |
|-------|-----------|
| **URL do servidor** | Endereço base do PVWA, por exemplo `https://pvwa.example.com`. Uma barra final `/PasswordVault` é aceita. Obrigatório. |
| **Ignorar verificação do certificado TLS** | Desativa a validação do certificado. Apenas para ambientes de teste. |
| **Método de autenticação** | Método de logon do PVWA para o usuário do Semaphore: `CyberArk` (padrão), `LDAP`, `RADIUS` ou `Windows`. |
| **Nome de usuário** | O usuário do PVWA com o qual o Semaphore faz logon. Obrigatório. |
| **Senha** | Senha desse usuário. Pode ser armazenada no banco de dados, lida de uma variável de ambiente ou carregada de um arquivo. |
| **Safe padrão** | Safe usada quando uma chave faz referência a uma conta sem prefixo de Safe e caminho de sincronização padrão. |
| **ID da plataforma para novas contas** | Plataforma atribuída às contas criadas pelo Semaphore (por exemplo `UnixSSH`). Obrigatório apenas quando o armazenamento não for somente leitura e você criar chaves no Semaphore. |
| **Endereço para novas contas** | Propriedade de endereço opcional para contas criadas pelo Semaphore. Algumas plataformas exigem isso. |

O armazenamento pode operar em modo somente leitura. Nesse modo, o Semaphore apenas lê e sincroniza contas e nunca cria, atualiza ou exclui nada no Vault.

### Permissões obrigatórias do PVWA {#required-pvwa-permissions}

Conceda ao usuário do Semaphore as seguintes permissões em cada Safe utilizado:

| Operação | Permissões do Safe |
|----------|-------------------|
| Ler uma chave, sincronização | **Listar contas**, **Recuperar contas** |
| Criar uma chave a partir do Semaphore | **Adicionar contas** |
| Atualizar uma chave a partir do Semaphore | **Atualizar valor da senha**, **Atualizar propriedades da conta** |
| Excluir uma chave a partir do Semaphore | **Excluir contas** |

O Semaphore sempre solicita uma sessão concorrente do PVWA (`concurrentSession`), de modo que vários nós do Semaphore ou uma tarefa em execução e uma sincronização agendada possam compartilhar o mesmo usuário sem desconectar uns aos outros. Isso requer PVWA 11.3 ou posterior.

:::warning
Não ative "exigir motivo" ou integração com sistemas de chamados para os Safes usados pelo Semaphore. O Semaphore envia um motivo fixo, mas não pode fornecer números de tíquetes.
:::

## Como usar {#how-to-use}

1. No seu projeto, abra **Key Store → Storages** e crie um armazenamento **CyberArk**.
2. Ao criar ou editar uma chave, selecione esse armazenamento e insira a conta como `Safe/AccountName`. O nome da conta é o nome do objeto exibido no PVWA. Se o armazenamento tiver um Safe padrão, apenas `AccountName` é suficiente.
3. Opcionalmente configure [caminhos de sincronização](/user-guide/key-store/secret-sync) para importar Safes inteiros automaticamente com base em um agendamento.

### Mapeamento de tipos de chave {#key-type-mapping}

| Tipo de chave do Semaphore | Conta do CyberArk |
|----------------------------|-------------------|
| **Login com senha** | Conta de senha: `userName` torna-se o login, o segredo da conta torna-se a senha. |
| **SSH** | Conta de chave (`secretType: key`): `userName` torna-se o login, o segredo da conta é a chave privada. Chaves SSH com senha secreta não podem ser armazenadas no CyberArk. |
| **Segredo / string** | Conta de senha sem nome de usuário. O segredo da conta é usado no formato original. |

Quando o Semaphore cria uma conta, o gerenciamento automático pelo Central Policy Manager (CPM) é desativado para que o CyberArk não rotacione um segredo recém-gravado pelo Semaphore. Se desejar que o CyberArk rotacione a credencial, gerencie a conta no PVWA e marque o armazenamento como somente leitura no Semaphore.

## Sincronização de segredos {#syncing-secrets}

Um caminho de sincronização é o nome de um Safe. O Semaphore importa cada conta do Safe como uma chave nomeada a partir da conta (com o prefixo opcional). O tipo de chave é detectado a partir da conta: contas de chave tornam-se chaves SSH, contas de senha com nome de usuário tornam-se chaves de login com senha e contas sem nome de usuário tornam-se segredos simples. Consulte [Sincronização de segredos de armazenamentos remotos](/user-guide/key-store/secret-sync).
