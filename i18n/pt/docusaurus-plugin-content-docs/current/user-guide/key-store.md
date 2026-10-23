---
title: Key Store
description: Guia abrangente de credenciais no Semaphore Key Store, geração de pares de chaves SSH, senhas de login, segredos de token e armazenamentos externos.
---

# Key Store

O **Key Store** serve como o repositório centralizado de credenciais do Semaphore. Ele gerencia materiais de autenticação necessários para clonar repositórios Git remotos, conectar-se a hosts de infraestrutura de destino, elevar privilégios (`sudo`/`become`) e descriptografar segredos do Ansible Vault.

![Key Store](/assets/key-store-keys.webp)

O Key Store é dividido em duas visualizações principais:
* **Aba Keys**: Lista todas as credenciais provisionadas para o projeto atual, exibindo nome, backend de armazenamento, tipo e estado de sincronização.
* **Aba Storages (Pro)**: Configura backends de segredos externos (como HashiCorp Vault, OpenBao, AWS Secrets Manager ou CyberArk) para resolução dinâmica e sincronização automatizada.

---

## Tipos de credenciais {#types}

O Semaphore categoriza as credenciais armazenadas em três tipos fundamentais:

### 1. Chaves SSH {#1-ssh}
As chaves SSH fornecem autenticação criptográfica assimétrica para conectar-se a nós Linux/UNIX e clonar repositórios Git via SSH (`git@github.com:...`).

Ao configurar uma credencial de chave SSH, você pode especificar:
* **Nome da chave**: Um rótulo descritivo para a credencial em seus inventários e modelos de projeto.
* **Nome de usuário (Opcional)**: A conta de usuário remota padrão usada durante a conexão SSH (por exemplo, `ansible` ou `ubuntu`).
* **Senha da chave (Opcional)**: A senha necessária para descriptografar chaves privadas protegidas. Os campos de senha incluem um ícone de visibilidade (`olho`) e são mascarados por padrão.
* **Chave privada**: O texto original da chave privada PEM/OpenSSH.

#### Gerador de chaves SSH integrado {#built-in-ssh-key-generator}

Em vez de executar manualmente o `ssh-keygen` em máquinas externas, o Semaphore inclui um **gerador de pares de chaves SSH integrado de um clique** diretamente no modal:

![Generate SSH Key Modal](/assets/key-store-generate-ssh.webp)

1. Selecione **Chave SSH** no menu suspenso **Tipo**.
2. Marque a caixa de seleção **Gerar chave SSH**.
3. A área de texto para a **chave privada** manual será desativada e bloqueada automaticamente.
4. Clique em **Criar**. O Semaphore gerará automaticamente um par de chaves seguro (ED25519/RSA), criptografará a chave privada no banco de dados e exibirá a chave pública em uma caixa de diálogo dedicada:

![Generated SSH Public Key](/assets/key-store-generated-public-key.webp)

Use o botão **Copiar para a área de transferência** para copiar a chave pública e cole-a nas chaves de implantação do seu provedor Git ou no arquivo `~/.ssh/authorized_keys` dos nós de destino.

#### Extração posterior de chaves públicas (Gaveta de chave pública) {#extracting-public-keys-later}

Se você fechar a caixa de diálogo ou precisar recuperar a chave pública posteriormente, não será necessário gerar novamente o par de chaves. Ao editar qualquer chave criada com o gerador, o Semaphore disponibiliza uma gaveta expansível **Chave pública**:

![Public Key Drawer](/assets/key-store-public-key-drawer.webp)

* Clique em **Mostrar** / **Ocultar** para visualizar o texto da chave pública.
* Clique no ícone da área de transferência para copiar a chave pública instantaneamente.

#### Vinculação de chaves de implantação em provedores Git comuns

Para repositórios Git que exigem autenticação SSH, adicione a chave pública gerada como uma deploy key somente leitura:
* [GitHub Deploy Keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab Deploy Keys](https://docs.gitlab.com/ee/user/project/deploy_keys/)
* [Bitbucket Access Keys](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

---

### 2. Login com senha {#2-login-with-password}

O tipo de credencial **Login com senha** oferece suporte tanto à autenticação tradicional de usuário/senha quanto a sequências de caracteres de segredo independentes:

* **Autenticação de host e sudo**: Fornece acesso SSH baseado em senha e elevação de privilégios `sudo` nos hosts de destino.
* **Autenticação Git HTTPS**: Autentica em repositórios remotos via HTTPS usando nome de usuário e tokens de acesso pessoal (PAT).
* **Senhas do Ansible Vault**: Desbloqueia arquivos e variáveis criptografados do Ansible Vault em tempo de execução.

:::tip Strings de segredo e tokens de acesso pessoal (PAT)
Para armazenar uma string de segredo pura (como um token Bearer de API, senha do Vault ou PAT), **deixe o campo Usuário em branco**. O Semaphore tratará a entrada como um segredo isolado sem associar um usuário.
:::

#### Mascaramento de segredos e proteção contra sobrescrita {#secret-masking-and-override-protection}

Para proteger as credenciais contra exposição não autorizada e modificação acidental:
* Entradas de senha e passphrase são mascaradas na interface com controles opcionais de revelação.
* Ao editar uma credencial existente, as entradas de segredos confidenciais são desativadas por padrão.
* Para atualizar ou substituir um segredo existente, você deve marcar explicitamente a caixa de seleção **Sobrescrever** na parte inferior do formulário. Essa barreira de segurança evita sobrescritas acidentais em edições rotineiras.

---

### 3. Nenhum {#3-none}

A credencial **Nenhum** atua como um espaço reservado explícito para autenticação nula. É usada para repositórios Git públicos de código aberto (como no GitHub ou GitLab) e execuções de playbooks locais sem senhas ou chaves SSH.

---

## Armazenamentos de segredos {#secret-storages}

O Semaphore oferece suporte a arquiteturas desacopladas de armazenamento de segredos. Ao criar ou editar credenciais, você pode selecionar onde o material reside por meio das abas:

| Aba de armazenamento | Disponibilidade | Descrição |
| :--- | :--- | :--- |
| **Local** | Open Source & Pro | O segredo é armazenado diretamente no banco de dados do Semaphore protegido por criptografia de envelope. |
| **Storage** | Pro | O segredo faz referência a um mecanismo externo (por exemplo, HashiCorp Vault, AWS Secrets Manager). |
| **Env** | Open Source & Pro | O segredo é resolvido dinamicamente em tempo de execução a partir de uma variável de ambiente do servidor. |
| **File** | Open Source & Pro | O segredo é lido de um arquivo protegido localizado no diretório de segredos configurado. |

![Armazenamentos de segredos](/assets/key-store-storages.webp)

### Armazenamento em banco de dados (Local) {#database}

Por padrão, os segredos são armazenados no banco de dados do aplicativo em formato criptografado usando criptografia simétrica AES. A chave mestra é configurada na configuração do servidor:
* Chave de configuração: `access_key_encryption`
* Variável de ambiente: `SEMAPHORE_ACCESS_KEY_ENCRYPTION`

:::warning Geração da chave mestra de criptografia
Gere uma chave base64 de 32 bytes criptograficamente segura antes de iniciar instâncias de produção:
```bash
head -c32 /dev/urandom | base64
```
Faça backup dessa chave com segurança. Se ela for perdida, os segredos existentes no banco de dados não poderão ser recuperados.
:::

### Variáveis de ambiente e fontes de arquivo (Somente leitura) {#environment-variable-or-file}

Ao selecionar a aba **Env** ou **File**, o Semaphore trata o armazenamento como uma origem externa somente leitura. A interface exibe um aviso:

> **Read-only secret storage chosen.**

![Armazenamento somente leitura](/assets/key-store-env-readonly-storage.webp)

* **Origem Env**: Forneça o nome exato da variável de ambiente exportada no servidor (por exemplo, `SEMAPHORE_EXTERNAL_VAULT_TOKEN`).
* **Origem File**: Forneça o caminho relativo ao diretório de segredos configurado (`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, padrão `/tmp/semaphore`).

Para chaves estruturadas, o conteúdo de arquivos e variáveis deve ser formatado como objetos JSON válidos. Consulte [Fontes de ambiente e arquivo](/user-guide/key-store/env-and-file-sources).

### Mecanismos de segredos corporativos externos (Pro & Enterprise) {#external-secret-engines}

O Semaphore Pro e Enterprise estendem o Key Store com conectores nativos para os principais gerenciadores de segredos corporativos:

* **[HashiCorp Vault](/user-guide/key-store/hashicorp-vault)**: Conecta-se via autenticação AppRole ou Token para ler e gravar segredos KV v1/v2.
* **[OpenBao](/user-guide/key-store/openbao)**: Fork de código aberto compatível com a API do HashiCorp Vault.
* **[AWS Secrets Manager](/user-guide/key-store/aws-secrets-manager)** <Enterprise />: Integra-se com funções do IAM da AWS ou credenciais estáticas.
* **[Devolutions Server](/user-guide/key-store/devolutions-server)**: Integra-se com gerenciamento de acesso privilegiado centralizado.
* **[CyberArk PAM](/user-guide/key-store/cyberark)** <Enterprise />: Lê e grava segredos usando a API REST do CyberArk PVWA.

---

## Sincronização de segredos de armazenamentos remotos {#syncing-secrets-from-remote-storages}

Em vez de registrar credenciais manualmente uma a uma, o Semaphore oferece suporte à sincronização automatizada a partir de vaults externos.

Quando um segredo é mantido por meio de sincronização:
* Ele recebe uma etiqueta ativa **synchronized** na tabela do Key Store.
* A edição manual do conteúdo do segredo é desativada para manter o cofre externo como a fonte única da verdade.
* Quaisquer atualizações ou rotações no mecanismo externo se propagam automaticamente para o Semaphore com base no intervalo configurado.

Para instruções de configuração completas, consulte [Sincronização de segredos](/user-guide/key-store/secret-sync).
