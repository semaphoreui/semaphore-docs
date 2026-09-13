# Runners

Os runners permitem executar tarefas em um servidor separado do Semaphore UI.

Os runners do Semaphore funcionam com o mesmo princípio dos runners do GitLab ou do GitHub Actions:

- Você inicia um runner em um servidor separado, informando o endereço do servidor Semaphore e um token de autenticação.
- O runner se conecta ao Semaphore e sinaliza que está pronto para aceitar tarefas.
- Quando uma nova tarefa surge, o Semaphore fornece ao runner todas as informações necessárias, e ele, por sua vez, clona o repositório e executa Ansible, Terraform, PowerShell etc.
- O runner envia os resultados da execução da tarefa de volta ao Semaphore.

Para os usuários finais, trabalhar com o Semaphore com ou sem runners parece exatamente igual.

Quando nenhum runner está definido, o próprio servidor do Semaphore UI atua como runner. Todas as tarefas são executadas no contexto do servidor do Semaphore UI, com acesso ao sistema de arquivos.

O uso de runners oferece as seguintes vantagens:
- Execução de tarefas com mais segurança. Por exemplo, um runner pode estar em uma sub-rede fechada ou em um contêiner Docker isolado.
- Distribuição da carga de trabalho entre vários servidores. Você pode iniciar vários runners, e as tarefas serão distribuídas aleatoriamente entre eles.

## Configuração {#set-up}

### Configurar um servidor {#set-up-a-server}

Para configurar o servidor para trabalhar com runners, você deve adicionar a seguinte opção à configuração do seu servidor Semaphore:

```json
{
  "use_remote_runner": true,
  "runner_registration_token": "long string of random characters"
}
```

ou usando variáveis de ambiente:

```bash
SEMAPHORE_USE_REMOTE_RUNNER=True
SEMAPHORE_RUNNER_REGISTRATION_TOKEN=long_string_of_random_characters
```

### Configurar um runner {#setup-a-runner}

Para configurar o runner, use o seguinte comando:

```bash
semaphore runner setup --config /path/to/your/config/file.json
```

Este comando criará um arquivo de configuração em `/path/to/your/config/file.json`.

Mas, antes de usar este comando, você precisa entender como os runners são registrados no servidor.

### Registrando o runner no servidor {#registering-the-runner-on-the-server}

Há duas maneiras de registrar um runner no servidor Semaphore:
1) Adicioná-lo pela interface web ou pela API.
2) Usar a linha de comando com o comando `semaphore runner register`.

#### Adicionando o runner pela interface web {#adding-the-runner-via-the-web-ui}

![Imagem do Runner](https://github.com/user-attachments/assets/8b0f7890-5767-4139-932d-3e39c217fd57)

#### Registrando pela CLI {#registering-via-cli}

Para registrar um runner desta forma, você precisa adicionar a opção `runner_registration_token` ao arquivo de configuração do seu servidor Semaphore. Essa opção deve ser definida com uma string arbitrária. Escolha uma string suficientemente complexa para evitar problemas de segurança.

Quando o comando `semaphore runner setup` perguntar se você tem um token de Runner, responda Não. Em seguida, use o seguinte comando para registrar o runner:

`semaphore runner register --config /path/to/your/config/file.json`

ou

`echo REGISTRATION_TOKEN | semaphore runner register --stdin-registration-token --config /path/to/your/config/file.json`

### Arquivo de configuração {#configuration-file}

Como resultado da execução do comando `semaphore runner setup`, será criado um arquivo de configuração como o seguinte:

```json
{
  "tmp_path": "/tmp/semaphore",
  "web_host": "https://semaphore_server_host",

  // Here you can provide other settings, for example: git_client, ssh_config_path, etc.
  // ...
  
  // Runner specific options
  "runner": {
    "token": "your runner's token",
    // or
    "token_file": "path/to/the/file/where/runner/saves/token",

    // How often (in seconds) the runner polls the server for jobs and reports
    // progress. Default: 1. Raise this when many runners share one server.
    "check_interval_seconds": 1

    // Other runner-specific options: max_parallel_tasks, webhook, one_off, etc.
  }
}
```

Você pode editar este arquivo manualmente sem precisar executar `semaphore runner setup` novamente.

Para registrar o runner novamente, você pode usar o comando `semaphore runner register`. Isso sobrescreverá o token no arquivo especificado na configuração.

## Executando o runner {#running-the-runner}

Agora você pode iniciar o runner com o comando:

```
semaphore runner start --config /path/to/your/config/file.json
```

Seu runner está pronto para executar tarefas.

### Executando o runner no Docker {#running-the-runner-in-docker}

A imagem `semaphoreui/runner` inicia o runner automaticamente. Informe a URL do servidor e o token de registro por meio de variáveis de ambiente:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  semaphoreui/runner:latest
```

Se os seus playbooks precisarem de pacotes Python extras, monte um `requirements.txt` em `/etc/semaphore/requirements.txt`. O contêiner o instala com o `pip3` a cada inicialização, antes de o runner se conectar ao servidor:

```bash
docker run -d \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<token> \
  -v "$(pwd)/requirements.txt:/etc/semaphore/requirements.txt:ro" \
  semaphoreui/runner:latest
```

Consulte [Instalando dependências Python adicionais](/admin-guide/installation/docker#installing-additional-python-dependencies) para detalhes sobre onde os pacotes são instalados e como as falhas são tratadas.

### Intervalo de consulta (`check_interval_seconds`) {#poll-interval-check_interval_seconds}

Cada runner consulta o servidor Semaphore em um intervalo fixo em busca de novos jobs e para
relatar o progresso das tarefas. Configure-o no arquivo de configuração do runner:

```json
{
  "runner": {
    "check_interval_seconds": 5
  }
}
```

Ou com uma variável de ambiente:

```bash
SEMAPHORE_RUNNER_CHECK_INTERVAL_SECONDS=5
```

| Valor | Efeito |
|-------|--------|
| **1** (padrão) | Os jobs são capturados em cerca de um segundo; ideal para execuções de baixa latência. |
| **Maior** (por exemplo, 5–30) | Reduz o tráfego HTTP quando você opera muitos runners contra um único servidor. Os jobs podem começar um pouco mais tarde. |

A página Runners no Semaphore UI expõe essa opção em **Opções avançadas** ao
gerar os trechos de configuração (exemplos de arquivo de configuração, Docker e variáveis de ambiente).

Valores inválidos ou zero recorrem ao padrão de 1 segundo.

### Tags de runner (Pro) {#runner-tags-pro}

Você pode atribuir uma ou mais tags a um runner de projeto. Os modelos de tarefa podem então exigir uma tag para que as tarefas sejam executadas apenas nos runners correspondentes. Configure as tags ao adicionar um runner na interface do projeto e defina a tag exigida nas configurações do modelo.

## Cancelamento do registro do runner {#runner-deregistration}

Você pode remover um runner pela interface web.

![Imagem do Runner](https://github.com/user-attachments/assets/431291eb-8f48-42c1-b56e-87fc8e9ba040)

---

Ou cancele o registro do runner pela CLI:

```
semaphore runner unregister --config /path/to/your/config/file.json
```

## Segurança {#security}

Os runners se autenticam no servidor com um bearer token opaco
(`X-Runner-Token`), emitido no registro. Proteja esse token como qualquer outra
credencial — armazene-o em um arquivo de configuração com acesso restrito ou em um gerenciador de segredos.

:::warning
Use HTTPS para a comunicação entre o servidor e o runner, especialmente quando
eles não estiverem na mesma rede privada. Para certificados autoassinados ou de uma CA
interna, configure `runner.connection.server_ca_cert_file` no runner.
Não use `runner.connection.skip_tls_verify` em produção.
:::
