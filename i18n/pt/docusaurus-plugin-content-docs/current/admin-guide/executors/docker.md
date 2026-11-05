---
title: Executor Docker
description: Execute cada tarefa de um runner em um novo contêiner Docker em um daemon local ou remoto, com exemplos de configuração, notas de segurança e solução de problemas.
sidebar_custom_props:
  edition: pro
---

# Executor Docker <FeatureState feature="docker-executor" />

Com o executor Docker, o runner inicia cada tarefa em um novo contêiner e o remove quando
a tarefa termina. O runner se comunica com um daemon Docker pela API dele: o daemon pode
estar no mesmo host ou ser remoto, via TLS.

Como uma tarefa em contêiner é executada, o que há dentro do contêiner e o que não é
suportado está descrito em [Executores](./#how-a-container-task-runs). Esta página trata da configuração do Docker.

## Antes de começar {#before-you-begin}

- Um servidor Semaphore com licença Pro ou Enterprise.
- Um runner registrado no servidor, consulte [Runners](/admin-guide/runners). Use a
  imagem `semaphoreui/runner` ou o binário oficial `semaphore`.
- Docker Engine acessível a partir do runner e permissão para usá-lo: participação no
  grupo `docker`, acesso ao socket montado ou certificados de cliente TLS.
- O daemon consegue baixar `semaphoreui/job` e `semaphoreui/helper` (ou suas próprias imagens).

## Início rápido {#quick-start}

Adicione o executor à configuração do runner e reinicie o runner:

```json
{
  "web_host": "https://semaphore.example.com",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker"
    }
  }
}
```

Sem outras opções, o runner usa o socket local (`DOCKER_HOST`, se definido; caso
contrário, `unix:///var/run/docker.sock`), a imagem build `semaphoreui/job:latest` e
a rede `bridge`.

Execute qualquer tarefa direcionada a este runner. O log da tarefa começa com:

```text
docker: prepared task 42 (workspace volume semaphore-workspace-42-a1b2c3, secrets=true)
=== git-clone ===
Cloning into '/workspace/repo'...
=== build ===
semaphore: container executor: task 42, template 7
```

Enquanto a tarefa roda, você pode ver os contêineres dela:

```bash
docker ps --filter label=com.semaphoreui.runner=semaphore
```

## Exemplos {#examples}

### Binário do runner em um host Docker {#runner-binary-on-a-docker-host}

O runner roda como serviço systemd no mesmo host do Docker. Dê ao usuário dele acesso
ao socket:

```bash
sudo usermod -aG docker semaphore
sudo systemctl restart semaphore-runner
```

```json
{
  "web_host": "https://semaphore.example.com",
  "tmp_path": "/tmp/semaphore",
  "runner": {
    "token_file": "/var/lib/semaphore/runner_token.txt",
    "executor": {
      "type": "docker",
      "docker": {
        "image": "semaphoreui/job:latest",
        "cpu_limit": 2,
        "memory_limit": "2g"
      }
    }
  }
}
```

### Runner em um contêiner com o socket do host {#runner-in-a-container-with-the-host-socket}

O contêiner do runner controla o daemon do host pelo socket montado; os contêineres das
tarefas são irmãos do runner, não aninhados nele. A imagem do runner roda com UID
`1001`, então adicione-a ao grupo dono do socket:

```bash
docker run -d --name semaphore-runner \
  --restart unless-stopped \
  -e SEMAPHORE_WEB_ROOT=https://semaphore.example.com \
  -e SEMAPHORE_RUNNER_REGISTRATION_TOKEN=<registration token> \
  -e SEMAPHORE_RUNNER_EXECUTOR_TYPE=docker \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v semaphore-runner-data:/var/lib/semaphore \
  --group-add "$(stat -c %g /var/run/docker.sock)" \
  semaphoreui/runner:latest
```

O volume `semaphore-runner-data` guarda o token do runner emitido no registro, para que
o runner não se registre novamente após reiniciar.

O mesmo com Docker Compose:

```yaml
services:
  runner:
    image: semaphoreui/runner:latest
    restart: unless-stopped
    environment:
      SEMAPHORE_WEB_ROOT: https://semaphore.example.com
      SEMAPHORE_RUNNER_REGISTRATION_TOKEN: ${RUNNER_REGISTRATION_TOKEN}
      SEMAPHORE_RUNNER_EXECUTOR_TYPE: docker
      SEMAPHORE_RUNNER_DOCKER_IMAGE: semaphoreui/job:latest
      SEMAPHORE_RUNNER_DOCKER_PULL_POLICY: if-not-present
      SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT: 2g
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - runner-data:/var/lib/semaphore
    group_add:
      - "${DOCKER_GID}"   # stat -c %g /var/run/docker.sock

volumes:
  runner-data:
```

Os segredos chegam à tarefa por um volume nomeado no daemon, nunca pelo sistema de
arquivos do runner, então nenhum outro caminho precisa ser compartilhado entre o runner e o host.

### Daemon Docker remoto via TLS {#remote-docker-daemon-over-tls}

O runner e o daemon estão em máquinas diferentes. Proteja a porta do daemon com TLS
mútuo (consulte [Protect the Docker daemon socket](https://docs.docker.com/engine/security/protect-access/))
e coloque os arquivos de cliente no runner:

```text
/etc/semaphore/docker-certs/
├── ca.pem     # CA that signed the daemon certificate
├── cert.pem   # client certificate
└── key.pem    # client key
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "host": "tcp://docker-build-01.internal:2376",
        "cert_path": "/etc/semaphore/docker-certs"
      }
    }
  }
}
```

Quando `cert_path` está definido, o runner verifica o certificado do daemon com `ca.pem` e
se autentica com `cert.pem` e `key.pem`. Os nomes dos arquivos são fixos.

:::warning
Sem `cert_path`, uma conexão `tcp://` é HTTP simples, e qualquer pessoa que alcance a porta
controla o daemon. `tls_verify` sozinho não ativa o TLS (⚠️ 2026-11-05: a opção é
lida, mas não aplicada); sempre defina `cert_path` para um daemon remoto.
:::

### Uma rede para serviços internos {#a-network-for-internal-services}

Por padrão, os contêineres das tarefas entram na rede `bridge`. Para que as tarefas
alcancem serviços pelo nome do contêiner, ou para isolá-las em uma rede própria, crie
uma rede e defina-a:

```bash
docker network create semaphore-tasks
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "network": "semaphore-tasks"
      }
    }
  }
}
```

`network` aceita qualquer modo de rede que o Docker entenda: um nome de rede, `bridge`,
`host` ou `none`. O contêiner de clonagem entra na mesma rede, então com `none` o
repositório não pode ser clonado.

### Imagens de um registry privado {#images-from-a-private-registry}

O executor baixa imagens sem credenciais de registry. Para uma imagem privada, faça login
e baixe-a no host do daemon, e mantenha uma política de pull que não baixe novamente:

```bash
docker login registry.example.com
docker pull registry.example.com/semaphore/job-aws:1.0
```

```json
{
  "runner": {
    "executor": {
      "type": "docker",
      "docker": {
        "image": "registry.example.com/semaphore/job-aws:1.0",
        "pull_policy": "if-not-present"
      }
    }
  }
}
```

Com `if-not-present`, use uma tag de versão em vez de `latest`: uma tag que já está no
daemon nunca é atualizada. Com `never`, uma imagem ausente faz a tarefa falhar em vez de
tentar um pull.

### O bloco inteiro como uma variável {#the-whole-block-as-one-variable}

Para implantações configuradas apenas pelo ambiente, passe o bloco do executor como
JSON:

```bash
SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"network":"semaphore-tasks","memory_limit":"4g","cpu_limit":2}}'
```

## Referência de configuração {#configuration-reference}

Todas as opções ficam em `runner.executor.docker` na configuração do runner.

| Opção | Variável de ambiente | Padrão | Descrição |
|---|---|---|---|
| `host` | `SEMAPHORE_RUNNER_DOCKER_HOST` | `DOCKER_HOST`, depois o socket da plataforma | Endereço do daemon: `unix:///path`, `tcp://host:port` ou `npipe:////./pipe/name`. |
| `cert_path` | `SEMAPHORE_RUNNER_DOCKER_CERT_PATH` | — | Diretório com `ca.pem`, `cert.pem` e `key.pem` para TLS mútuo. Defini-lo ativa o TLS. |
| `tls_verify` | `SEMAPHORE_RUNNER_DOCKER_TLS_VERIFY` | `false` | Ainda não aplicado; use `cert_path`. |
| `image` | `SEMAPHORE_RUNNER_DOCKER_IMAGE` | `semaphoreui/job:latest` | Imagem build. O campo **Executor image** de um modelo a substitui. |
| `helper_image` | `SEMAPHORE_RUNNER_DOCKER_HELPER_IMAGE` | `semaphoreui/helper:latest` | Imagem do contêiner de clonagem e do preenchimento do volume de segredos. |
| `network` | `SEMAPHORE_RUNNER_DOCKER_NETWORK` | `bridge` | Rede dos contêineres de clonagem e build. |
| `pull_policy` | `SEMAPHORE_RUNNER_DOCKER_PULL_POLICY` | `if-not-present` | `always`, `if-not-present` ou `never`. Um valor desconhecido volta para `if-not-present`. |
| `cpu_limit` | `SEMAPHORE_RUNNER_DOCKER_CPU_LIMIT` | sem limite | CPUs por contêiner, como `docker run --cpus`. Frações permitidas: `0.5`. |
| `memory_limit` | `SEMAPHORE_RUNNER_DOCKER_MEMORY_LIMIT` | sem limite | Memória por contêiner: bytes, ou com `k`, `m`, `g` (`512m`, `2g`). Um valor inválido significa sem limite. |
| `privileged` | `SEMAPHORE_RUNNER_DOCKER_PRIVILEGED` | `false` | Executa os contêineres com `--privileged`. |
| `cleanup_grace_seconds` | `SEMAPHORE_RUNNER_DOCKER_CLEANUP_GRACE_SECONDS` | `30` | Segundos que o `docker stop` aguarda após **Stop** antes de matar o contêiner. |
| `poll_interval_seconds` | `SEMAPHORE_RUNNER_DOCKER_POLL_INTERVAL_SECONDS` | `2` | Não usado: o executor aguarda o contêiner terminar em vez de consultá-lo. |

Os limites, a rede e `privileged` se aplicam igualmente ao contêiner de clonagem e ao de build.

## Parar e limpar {#stop-and-clean-up}

**Stop** na interface envia `docker stop` ao contêiner em execução, aguarda até
`cleanup_grace_seconds` e então remove os contêineres e os dois volumes.

Se o processo do runner for morto durante uma tarefa, os contêineres e volumes dela
permanecem no daemon; o runner não os recolhe na próxima inicialização. Tudo o que o
executor cria leva o rótulo `com.semaphoreui.runner=semaphore`, e
`com.semaphoreui.task-id` contém o ID da tarefa. Remova os restos quando nenhuma tarefa
estiver rodando neste daemon:

```bash
docker ps -a --filter label=com.semaphoreui.runner=semaphore
docker rm -f $(docker ps -aq --filter label=com.semaphoreui.runner=semaphore)
docker volume rm $(docker volume ls -q --filter label=com.semaphoreui.runner=semaphore)
```

## Solução de problemas {#troubleshooting}

| Mensagem | Causa e solução |
|---|---|
| `docker executor is only available in the proprietary build` (log do runner) | O runner é uma build Community. Use `semaphoreui/runner` ou o binário oficial. |
| `docker executor: daemon not reachable` | `host` errado, o daemon está parado ou o usuário do runner não consegue abrir o socket (`permission denied`). Verifique com `docker -H <host> info` como usuário do runner; adicione o usuário ao grupo do socket. |
| `pull image ...: ... unauthorized` ou `not found` | A imagem é privada ou o nome está errado. Baixe-a primeiro no host do daemon, consulte [registry privado](#images-from-a-private-registry). |
| `git clone exited with status 128` | A URL do repositório, o branch ou a chave SSH estão errados, ou a rede bloqueia o host Git. A saída da clonagem acima da linha mostra o erro do Git. |
| `interpreter python3 not found in image; set a runner image that provides it` | A imagem build não tem o binário do aplicativo. Defina uma imagem que o tenha, no runner ou no **Executor image** do modelo. |
| `ssh-agent / ssh-add not found in image; skipping SSH key install` | A imagem não tem cliente OpenSSH; o Ansible não consegue usar a chave do inventário. Instale `openssh-client`. |
| `Permission denied` em `/workspace` | Uma imagem personalizada roda com um usuário que não pode gravar em `/workspace`. Consulte [Criar uma imagem personalizada](./#build-a-custom-image). |
| `build container exited with status N` | O aplicativo falhou com o código de saída `N`; o motivo está no log acima. |
| `inventory login_password authentication is not supported` | Consulte [Limitações](./#limitations). |

## Páginas relacionadas {#related-pages}

- [Executores](/admin-guide/executors): como as tarefas em contêiner são executadas, imagens, limitações.
- [Executor Kubernetes](./kubernetes): o mesmo modelo em um cluster.
- [Runners](/admin-guide/runners): registrar e iniciar um runner.
- [Imagem do executor](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners): uma imagem diferente para um modelo.
