# Chaves a partir de variáveis de ambiente e arquivos

Além de armazenar um segredo no banco de dados, uma entrada do Armazenamento de Chaves pode ler seu valor no momento da tarefa a partir de
um **arquivo** no servidor Semaphore ou de uma **variável de ambiente** do processo do servidor Semaphore.
Isso é útil quando a credencial já é provisionada fora do Semaphore, por exemplo:

* uma chave SSH montada no contêiner do Semaphore como um secret do Docker ou do Kubernetes;
* um token gravado em disco por um agente (HashiCorp Vault Agent, cert-manager etc.) e rotacionado regularmente;
* uma senha injetada no ambiente do contêiner pelo seu orquestrador.

O Semaphore não copia o valor para o seu banco de dados. Sempre que uma tarefa precisa da chave, o servidor
lê o arquivo ou a variável novamente, de modo que rotacionar a credencial no disco tem efeito na próxima tarefa.

:::info
O arquivo ou a variável é lido pelo **servidor Semaphore**, não por um runner. Quando você usa runners remotos,
monte o arquivo no host do servidor; o servidor resolve o segredo e o entrega ao runner.
:::

## Escolhendo a origem {#choosing-the-source}

Ao criar ou editar uma chave (**Armazenamento de Chaves → Nova Chave**), a parte superior do formulário tem abas de origem:

| Aba | De onde vem o valor | O que informar |
|-----|---------------------|----------------|
| **Local** | Banco de dados do Semaphore (criptografado) | O login, a senha ou a chave privada no formulário |
| **Storage** <Pro /> | Armazenamento de segredos externo, como o [HashiCorp Vault](/user-guide/key-store/hashicorp-vault) | O armazenamento e o caminho do segredo |
| **Env** | Uma variável de ambiente do processo do servidor Semaphore | O nome da variável, por exemplo `PROD_SSH_KEY` |
| **File** | Um arquivo no servidor Semaphore | O caminho **absoluto** do arquivo, por exemplo `/var/lib/semaphore/secrets/prod.json` |

Com **Env** ou **File** selecionado, os campos de login, senha e chave privada desaparecem. A credencial
completa, incluindo o login para chaves SSH e Login com Senha, deve estar no arquivo ou na variável.

## 1. Permitir o diretório {#allow-the-directory}

Por segurança, o Semaphore só lê arquivos de chave que estejam dentro do seu **diretório de segredos**. Qualquer outro
caminho é rejeitado quando uma tarefa é iniciada:

```
Failed to install inventory: file path must be inside secrets path
```

O diretório de segredos padrão é `/tmp/semaphore`. Aponte-o para o diretório onde seus arquivos de chave
estão usando `dirs.secrets` no `config.json` ou a variável de ambiente `SEMAPHORE_SECRETS_PATH`.
Consulte [Diretório de segredos](/admin-guide/configuration/config-file#secrets-directory) para as regras de precedência.

Exemplo de Docker Compose que monta um diretório do host e o permite:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      SEMAPHORE_SECRETS_PATH: /var/lib/semaphore/secrets
    volumes:
      - /srv/semaphore/secrets:/var/lib/semaphore/secrets:ro
```

Fragmento equivalente de `config.json`:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

Regras para o caminho informado na aba **File**:

* deve ser absoluto (`/var/lib/semaphore/secrets/prod.json`, e não `prod.json`);
* não deve conter segmentos `..`;
* deve resolver para um local dentro do diretório de segredos (subdiretórios são permitidos);
* o arquivo deve ser legível pelo usuário com o qual o Semaphore é executado (na imagem Docker oficial, esse usuário é `semaphore`, UID 1001).

Variáveis de ambiente não têm essa restrição; o servidor simplesmente lê a variável indicada do seu próprio ambiente.

## 2. Formatar o valor {#format-the-value}

O conteúdo do arquivo (ou o valor da variável) depende do tipo de chave. Uma única quebra de linha
no final de um arquivo é ignorada; todo o restante é usado literalmente.

### Chave SSH {#ssh-key}

O Semaphore espera um **documento JSON**, e não um arquivo de chave privada PEM ou OpenSSH bruto:

```json
{
  "login": "deploy",
  "passphrase": "",
  "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"
}
```

* `login` — o nome de usuário SSH, passado ao Ansible como `--user`. Deixe vazio para que o inventário decida (`ansible_user`). Para Repositórios Git, um login vazio assume `git` como padrão.
* `passphrase` — a senha (passphrase) da chave privada, ou uma string vazia.
* `private_key` — a chave privada com as quebras de linha codificadas como `\n`.

Gere o documento a partir de uma chave existente com o `jq`, que cuida do escape:

```bash
jq -n --arg login deploy --rawfile key ~/.ssh/id_ed25519 \
  '{login: $login, passphrase: "", private_key: $key}' \
  > /srv/semaphore/secrets/prod_ssh.json
chmod 0400 /srv/semaphore/secrets/prod_ssh.json
```

Em seguida, crie uma chave do tipo **SSH**, abra a aba **File** e informe `/var/lib/semaphore/secrets/prod_ssh.json`
(o caminho como visto **dentro** do contêiner).

<div class="DialogScreenshot DialogScreenshot--small">

![](/assets/key-file-source.webp)

</div>

:::warning
Apontar a aba **File** para uma chave privada bruta, como `~/.ssh/id_ed25519`, não funciona.
O arquivo é interpretado como JSON e a tarefa falha ao carregar o inventário.
:::

### Login com Senha {#login-with-password}

Também um documento JSON:

```json
{
  "login": "svc-ansible",
  "password": "s3cr3t"
}
```

Deixe `login` vazio para usar a chave como um token ou senha simples, por exemplo como senha de um Ansible vault.

## Exemplo com variável de ambiente {#environment-variable-example}

O mesmo formato JSON se aplica à aba **Env**. No Docker Compose:

```yaml
services:
  semaphore:
    image: semaphoreui/semaphore:latest
    environment:
      PROD_SSH_KEY: '{"login":"deploy","passphrase":"","private_key":"-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"}'
```

Crie uma chave **SSH**, selecione a aba **Env** e informe `PROD_SSH_KEY` como o nome da variável.

:::tip
Variáveis de ambiente são visíveis para todos os processos do contêiner e frequentemente acabam nos
metadados e logs do orquestrador. Sempre que possível, prefira a aba **File** com um secret montado.
:::

## Solução de problemas {#troubleshooting}

| Erro | Causa | Solução |
|------|-------|---------|
| `file path must be absolute` | Foi informado um caminho relativo | Informe o caminho completo começando com `/` |
| `file path must not contain traversal segments` | O caminho contém `..` | Informe o caminho resolvido |
| `file path must be inside secrets path` | O arquivo está fora de `dirs.secrets` | Defina `SEMAPHORE_SECRETS_PATH` como o diretório do arquivo, ou mova o arquivo |
| `no such file or directory` | O caminho está errado ou não foi montado no contêiner | Verifique a montagem do volume e use o caminho de dentro do contêiner |
| `permission denied` | O processo do Semaphore não consegue ler o arquivo | Corrija o proprietário ou as permissões do arquivo |
| `invalid character '-' looking for beginning of value` | Foi fornecida uma chave privada bruta em vez do documento JSON | Envolva a chave no JSON conforme mostrado acima |
