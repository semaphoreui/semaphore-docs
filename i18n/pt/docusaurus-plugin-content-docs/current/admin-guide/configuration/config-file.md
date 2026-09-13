
# Arquivo de configuração

## Criando o arquivo de configuração {#creating-configuration-file}

O Semaphore usa um arquivo `config.json` para sua configuração principal. Você pode gerar esse arquivo de forma interativa usando as ferramentas integradas ou por meio de um configurador baseado na web.

### Gerar pela CLI {#generate-via-cli}

Use os seguintes comandos para gerar o arquivo de configuração de forma interativa:

* Para o servidor do Semaphore:
  ```
  semaphore setup
  ```
* Para o runner do Semaphore:
  ```
  semaphore runner setup
  ```
  
  :::tip
    Para mais detalhes sobre a configuração do runner, consulte a seção <a href="./../runners">Runners</a>.
  :::

### Gerar no site {#generate-on-the-website}

Como alternativa, você pode usar o configurador interativo baseado na web:
* [Configurador do servidor](https://semaphoreui.com/install/binary/2_13/config)
* [Configurador do runner](https://semaphoreui.com/install/binary/2_13/runner)

## Exemplo de arquivo de configuração {#configuration-file-example}

O Semaphore usa um arquivo de configuração `config.json` com o seguinte conteúdo:

```javascript
{
	"mysql_test": {
		"host": "127.0.0.1:3306",
		"user": "root",
		"pass": "***",
		"name": "semaphore"
	},

	"dialect": "mysql",

	"git_client": "go_git",
	"git_attempts": 4,

	"auth": {
		"totp": {
			"enabled": false,
			"allow_recovery": true
		}
	},

	"use_remote_runner": true,
	"runner_registration_token": "73fs***",

 	"tmp_path": "/tmp/semaphore",
 	"cookie_hash": "96Nt***",
 	"cookie_encryption": "x0bs***",
 	"access_key_encryption": "j1ia***",

	"max_tasks_per_template": 3,

	"schedule": {
		"timezone": "UTC"
	},

	"log": {
		"events": {
			"enabled": true,
			"path": "./events.log"
		}
	},

	"process": {
		"chroot": "/opt/semaphore/sandbox"
	}
 }
```

## Uso do arquivo de configuração {#configuration-file-usage}

* Para o servidor do Semaphore:

```bash
semaphore server --config ./config.json
```

* Para o runner do Semaphore:

```bash
semaphore runner start --config ./config.json
```

## Diretório de segredos {#secrets-directory}

O Semaphore lê arquivos de segredos (por exemplo, [entradas do Armazenamento de Chaves baseadas em arquivo](/user-guide/key-store/env-and-file-sources) ou tokens do HashiCorp Vault e do OpenBao lidos do disco) somente de um diretório configurável.

| Opção | Variável de ambiente | Descrição |
|--------|---------------------|-------------|
| `dirs.secrets` | `SEMAPHORE_SECRETS_PATH` | Diretório dos arquivos de segredos. Padrão: `/tmp/semaphore`. |
| `secrets_path` (legado) | `SEMAPHORE_SECRETS_PATH` | Configuração de nível superior mantida por compatibilidade retroativa. Usada somente quando `dirs.secrets` não está definido ou ainda está no caminho padrão. |

**Precedência**: um `dirs.secrets` diferente do padrão prevalece sobre o `secrets_path` legado. Quando você define `SEMAPHORE_SECRETS_PATH`, o Semaphore o aplica a ambos os campos.

Exemplo usando o layout atual:

```json
{
  "dirs": {
    "secrets": "/var/lib/semaphore/secrets"
  }
}
```

Instalações legadas ainda podem usar:

```json
{
  "secrets_path": "/var/lib/semaphore/secrets"
}
```

Os arquivos de chave selecionados na aba **Arquivo** do formulário do Armazenamento de Chaves, e os arquivos de token referenciados por armazenamentos de segredos externos, devem ficar dentro desse diretório. Caminhos fora dele são rejeitados com `file path must be inside secrets path`. Consulte [Chaves a partir de variáveis de ambiente e arquivos](/user-guide/key-store/env-and-file-sources).

## Operações do Git {#git-operations}

O Semaphore clona e atualiza os repositórios das tarefas antes de cada execução. Duas opções controlam esse comportamento:

| Opção | Variável de ambiente | Descrição |
|--------|---------------------|-------------|
| `git_client` | `SEMAPHORE_GIT_CLIENT` | Implementação do cliente Git: `cmd_git` (padrão, usa o binário `git` do sistema) ou `go_git` (cliente em Go puro). |
| `git_attempts` | `SEMAPHORE_GIT_ATTEMPTS` | Número de tentativas das operações de clone e pull antes que a tarefa falhe. Padrão: `4`. Defina como `1` para tentar uma única vez, sem repetições. |

Quando um clone ou pull falha e ainda restam tentativas, o Semaphore aguarda com backoff exponencial (começando em 1 segundo, dobrando a cada tentativa, com limite de 60 segundos) e registra uma mensagem como `Git pull failed (...), retrying in 2s`. As repetições se aplicam somente a operações de rede; uma falha de checkout ou um erro de autenticação ainda faz a tarefa falhar depois que todas as tentativas se esgotam.

Se o seu servidor Git estiver intermitentemente indisponível, aumente `git_attempts`. Se as falhas forem imediatas e persistentes (credenciais incorretas, repositório inexistente), corrija o problema subjacente — as repetições não ajudarão.
