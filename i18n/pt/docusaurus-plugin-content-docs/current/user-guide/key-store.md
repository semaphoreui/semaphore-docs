# Armazenamento de Chaves

O Armazenamento de Chaves no Semaphore é usado para armazenar credenciais para acessar Repositórios remotos, acessar hosts remotos, credenciais de sudo e senhas do Ansible vault.

![Armazenamento de Chaves](/assets/key-store-keys.webp)

A aba **Chaves** lista as credenciais do projeto com seus tipos. A aba **Armazenamentos** (Pro) lista os armazenamentos externos de segredos configurados para o projeto, consulte [Armazenamentos de Segredos](#secret-storages).

## Tipos {#types}

### 1. SSH {#1-ssh}
As chaves SSH são usadas para acessar servidores remotos e também Repositórios remotos.

Se você precisar de ajuda para gerar rapidamente uma chave e colocá-la no seu host, [aqui está um guia rápido.](https://www.digitalocean.com/community/tutorials/how-to-set-up-ssh-keys-on-ubuntu-20-04)

Para Repositórios Git que usam autenticação SSH, o Repositório Git a partir do qual você está tentando clonar precisa ter sua chave pública associada à chave privada.

Abaixo estão links para a documentação de alguns Repositórios Git comuns:
* [GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account)
* [GitLab](https://docs.gitlab.com/ee/user/ssh.html)
* [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/set-up-an-ssh-key/)

### 2. Login com Senha {#2-login-with-password}
Login com Senha é uma combinação de nome de usuário e senha/token de acesso que pode ser usada para:
* Autenticar em hosts remotos (embora isso seja menos seguro do que usar chaves SSH)
* Credenciais de sudo em hosts remotos
* Autenticar em Repositórios Git remotos via HTTPS (embora SSH seja mais seguro)
* Desbloquear Ansible vaults

:::tip
    Esse tipo de segredo pode ser usado como Personal Access Token (PAT) ou string secreta. Basta deixar o campo Login vazio.
:::

### 3. Nenhum {#3-none}
Isso é usado como preenchimento para Repositórios que não exigem autenticação, como um Repositório de código aberto no GitLab.


## Armazenamentos de Segredos {#secret-storages}

O Semaphore UI oferece suporte a diferentes armazenamentos para segredos. Você pode escolher o armazenamento por segredo ao criar ou editar um segredo.

Os armazenamentos externos são criados na aba **Armazenamentos** do Armazenamento de Chaves (Pro). Cada armazenamento tem um nome e um tipo; as chaves então referenciam o armazenamento e o caminho do segredo dentro dele.

![Armazenamentos de segredos](/assets/key-store-storages.webp)

### Banco de dados {#database}

Por padrão, os segredos são armazenados no banco de dados de forma criptografada. A chave de criptografia é configurada por meio da opção de configuração
`access_key_encryption` ou `SEMAPHORE_ACCESS_KEY_ENCRYPTION` (deve ser gerada usando `head -c32 /dev/urandom | base64`).

### Variável de ambiente ou arquivo {#environment-variable-or-file}

Uma chave pode ler seu valor a partir de uma variável de ambiente do servidor Semaphore ou de um arquivo no servidor
(por exemplo, uma chave SSH montada no contêiner). As abas **Env** e **File** do formulário da chave selecionam esse modo.

Os arquivos devem estar dentro do diretório de segredos configurado (`dirs.secrets` / `SEMAPHORE_SECRETS_PATH`, padrão `/tmp/semaphore`),
e as chaves SSH e Login com Senha devem ser envolvidas em um pequeno documento JSON.

[Leia mais...](/user-guide/key-store/env-and-file-sources)

### HashiCorp Vault {#hashicorp-vault}

Os segredos podem ser armazenados em uma instância externa do HashiCorp Vault em vez do banco de dados.

[Leia mais...](/user-guide/key-store/hashicorp-vault)

### OpenBao {#openbao}

Os segredos podem ser armazenados em uma instância externa do [OpenBao](https://openbao.org) (um fork de código aberto e compatível com a API do HashiCorp Vault).

[Leia mais...](/user-guide/key-store/openbao)

### AWS Secrets Manager {#aws-secrets-manager}

<Enterprise />

Os segredos podem ser armazenados no AWS Secrets Manager. Autentique-se com uma role/perfil de instância do IAM ou com chaves de acesso estáticas.

[Leia mais...](/user-guide/key-store/aws-secrets-manager)

### Devolutions Server {#devolutions-server}

Os segredos podem ser armazenados em uma instância externa do Devolutions Server em vez do banco de dados.

[Leia mais...](/user-guide/key-store/devolutions-server)

## Sincronizando segredos de armazenamentos remotos {#syncing-secrets-from-remote-storages}

O Semaphore pode importar automaticamente segredos de um gerenciador de segredos externo (HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault ou Devolutions Server) e mantê-los sincronizados. Os caminhos de sincronização permitem escolher quais segredos importar e como nomeá-los.

[Leia mais...](/user-guide/key-store/secret-sync)
