---
title: "Alta disponibilidade"
---

# Alta disponibilidade <Enterprise />

:::info
A alta disponibilidade está disponível na edição **Semaphore Enterprise**.
:::

O Semaphore UI oferece suporte a implantações de alta disponibilidade (HA) no modo ativo-ativo, em que várias instâncias são executadas simultaneamente atrás de um balanceador de carga. Cada instância é totalmente capaz de atender requisições da interface, chamadas de API, jobs agendados e execução de tarefas. Se uma instância falhar, os nós restantes continuam operando sem interrupção.

## Arquitetura {#architecture}

Uma implantação ativo-ativo típica é composta pelos seguintes componentes:

**Balanceador de carga** — Os usuários se conectam por meio de um balanceador de carga (por exemplo, NGINX, HAProxy ou um balanceador de carga em nuvem). O balanceador de carga distribui o tráfego HTTP e WebSocket entre os nós do Semaphore disponíveis.

**Nós do Semaphore** — Cada nó executa uma instância idêntica do Semaphore UI. Qualquer nó pode receber requisições de usuários, iniciar jobs de automação, processar tarefas agendadas e enviar atualizações em tempo real. Todos os nós são iguais — não há nó primário nem nó em espera.

**Banco de dados compartilhado** — Todas as instâncias se conectam a um banco de dados PostgreSQL ou MySQL compartilhado. O banco de dados atua como a única fonte de verdade para projetos, templates, inventários, agendamentos, histórico de tarefas, contas de usuário e configuração de RBAC.

:::warning
SQLite e BoltDB não são suportados em implantações HA. Use PostgreSQL ou MySQL.
:::

**Redis** — O Redis fornece a camada de coordenação que permite que vários nós se comportem como um único sistema. Ele desempenha três funções:

* **Locks distribuídos** garantem que apenas uma instância execute um determinado job por vez, evitando a execução duplicada de tarefas.
* **Estado compartilhado da fila de tarefas** mantém a fila de tarefas para que cada job seja capturado por exatamente um worker. Todos os nós veem a mesma fila e coordenam a execução.
* **Mensageria Pub/Sub** permite que os nós transmitam eventos como atualizações de tarefas, notificações do cluster, invalidação de cache e mudanças de estado da interface. Isso mantém todos os nós sincronizados em tempo real.

## Pré-requisitos {#prerequisites}

Antes de configurar o HA, você precisa de:

* Chave de assinatura do **Semaphore Enterprise**.
* Um banco de dados **PostgreSQL** ou **MySQL** compartilhado, acessível por todos os nós.
* Um servidor **Redis** ou uma implantação **Redis Sentinel**, acessível por todos os nós. O Redis Cluster não é suportado.
* Um **balanceador de carga** com suporte a tráfego HTTP e WebSocket.
* Dois ou mais servidores para executar as instâncias do Semaphore.

Todos os nós do Semaphore devem usar o mesmo banco de dados, o mesmo backend Redis e a mesma configuração (exceto `ha.node_id`, que deve ser único em cada nó).

## Configuração {#configuration}

Habilite o HA adicionando o bloco `ha` ao seu `config.json` em cada nó:

```json
{
  "dialect": "postgres",
  "postgres": {
    "host": "db.example.com:5432",
    "name": "semaphore",
    "user": "semaphore",
    "pass": "***"
  },

  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "redis": {
      "addr": "redis.example.com:6379",
      "db": 0,
      "pass": "***"
    }
  },

  "cookie_hash": "...",
  "cookie_encryption": "...",
  "access_key_encryption": "..."
}
```

Cada nó deve ter um `ha.node_id` único. Todo o restante da configuração deve ser idêntico em todos os nós.

### Variáveis de ambiente {#environment-variables}

Como alternativa, configure o HA usando variáveis de ambiente:

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_REDIS_ADDR=redis.example.com:6379
SEMAPHORE_HA_REDIS_DB=0
SEMAPHORE_HA_REDIS_PASS=***
```

### Redis Sentinel {#redis-sentinel}

Para sobreviver à perda do próprio servidor Redis, aponte o cluster para uma implantação do [Redis Sentinel](https://redis.io/docs/latest/operate/oss_and_stack/management/sentinel/) em vez de um único endereço. Defina `ha.engine` como `redis_sentinel` e descreva a configuração do Sentinel em `ha.redis_sentinel`:

```json
{
  "ha": {
    "enabled": true,
    "node_id": "node-1",
    "engine": "redis_sentinel",
    "redis_sentinel": {
      "master_name": "mymaster",
      "addrs": ["sentinel-1.example.com:26379", "sentinel-2.example.com:26379", "sentinel-3.example.com:26379"],
      "pass": "***"
    }
  }
}
```

Cada nó pergunta aos sentinelas qual é o master atual e acompanha um failover sem reinicialização: uma tarefa que está em execução no momento em que o master muda continua rodando, e as novas tarefas, os agendamentos e as atualizações em tempo real seguem na réplica promovida.

A mesma configuração com variáveis de ambiente (a lista de sentinelas é um array JSON):

```bash
SEMAPHORE_HA_ENABLED=true
SEMAPHORE_HA_NODE_ID=node-1
SEMAPHORE_HA_ENGINE=redis_sentinel
SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME=mymaster
SEMAPHORE_HA_REDIS_SENTINEL_ADDRS='["sentinel-1.example.com:26379","sentinel-2.example.com:26379","sentinel-3.example.com:26379"]'
SEMAPHORE_HA_REDIS_SENTINEL_PASS=***
```

Observações:

* `ha.engine` decide qual bloco é lido. `redis` (o padrão) lê `ha.redis`; `redis_sentinel` lê `ha.redis_sentinel`. O outro bloco, se estiver presente, é ignorado e um aviso é registrado na inicialização.
* Com `redis_sentinel`, `master_name` e ao menos um endereço em `addrs` são obrigatórios; o nó se recusa a iniciar sem eles.
* `user` e `pass` autenticam nos nós de dados do Redis. Se os próprios sentinelas exigirem autenticação (`requirepass` no `sentinel.conf`), defina também `sentinel_user` e `sentinel_pass`.
* `tls` e `tls_skip_verify` se aplicam tanto às conexões com o Sentinel quanto às conexões com os nós de dados do Redis.

### Referência de configuração {#configuration-reference}

| Opção do arquivo de configuração | Variável de ambiente | Descrição |
| --- | --- | --- |
| `ha.enabled` | `SEMAPHORE_HA_ENABLED` | Habilita o modo de alta disponibilidade. |
| `ha.node_id` | `SEMAPHORE_HA_NODE_ID` | Identificador único deste nó. |
| `ha.redis.addr` | `SEMAPHORE_HA_REDIS_ADDR` | Endereço do servidor Redis (por exemplo, `localhost:6379`). |
| `ha.redis.db` | `SEMAPHORE_HA_REDIS_DB` | Número do banco de dados Redis. |
| `ha.redis.pass` | `SEMAPHORE_HA_REDIS_PASS` | Senha do servidor Redis. |
| `ha.redis.user` | `SEMAPHORE_HA_REDIS_USER` | Nome de usuário do servidor Redis. |
| `ha.redis.tls` | `SEMAPHORE_HA_REDIS_TLS` | Habilita TLS na conexão com o Redis. |
| `ha.redis.tls_skip_verify` | `SEMAPHORE_HA_REDIS_TLS_SKIP_VERIFY` | Ignora a verificação do certificado TLS do Redis. |
| `ha.engine` | `SEMAPHORE_HA_ENGINE` | Backend do Redis: `redis` (servidor único, padrão) ou `redis_sentinel`. |
| `ha.redis_sentinel.master_name` | `SEMAPHORE_HA_REDIS_SENTINEL_MASTER_NAME` | Nome do master monitorado conforme configurado no Sentinel. |
| `ha.redis_sentinel.addrs` | `SEMAPHORE_HA_REDIS_SENTINEL_ADDRS` | Endereços dos sentinelas, `host:port`. Array JSON na variável de ambiente. |
| `ha.redis_sentinel.sentinel_user` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_USER` | Nome de usuário dos próprios nós Sentinel. |
| `ha.redis_sentinel.sentinel_pass` | `SEMAPHORE_HA_REDIS_SENTINEL_SENTINEL_PASS` | Senha dos próprios nós Sentinel. |
| `ha.redis_sentinel.db` | `SEMAPHORE_HA_REDIS_SENTINEL_DB` | Número do banco de dados Redis nos nós de dados. |
| `ha.redis_sentinel.user` | `SEMAPHORE_HA_REDIS_SENTINEL_USER` | Nome de usuário dos nós de dados do Redis. |
| `ha.redis_sentinel.pass` | `SEMAPHORE_HA_REDIS_SENTINEL_PASS` | Senha dos nós de dados do Redis. |
| `ha.redis_sentinel.tls` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS` | Habilita TLS nas conexões com o Sentinel e com o Redis. |
| `ha.redis_sentinel.tls_skip_verify` | `SEMAPHORE_HA_REDIS_SENTINEL_TLS_SKIP_VERIFY` | Ignora a verificação do certificado TLS nas conexões com o Sentinel e com o Redis. |

Consulte [Configuração](/admin-guide/configuration) para ver a lista completa de opções disponíveis.

## Balanceador de carga {#load-balancer}

Coloque um balanceador de carga na frente dos nós do Semaphore para distribuir o tráfego. O balanceador de carga deve oferecer suporte a **conexões WebSocket** para as atualizações da interface em tempo real.

### Exemplo com NGINX {#nginx-example}

```nginx
upstream semaphore {
    server node1.example.com:3000 max_fails=3 fail_timeout=10s;
    server node2.example.com:3000 max_fails=3 fail_timeout=10s;
    server node3.example.com:3000 max_fails=3 fail_timeout=10s;
}

server {
    listen 443 ssl;
    server_name semaphore.example.com;

    ssl_certificate     /etc/ssl/certs/semaphore.crt;
    ssl_certificate_key /etc/ssl/private/semaphore.key;

    location / {
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        proxy_pass http://semaphore;

        proxy_connect_timeout 3s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }


    location /api/ws {
        
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://semaphore;
        
        proxy_connect_timeout 3s;
        proxy_send_timeout 1h;
        proxy_read_timeout 1h;

        proxy_next_upstream error timeout http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
    }
}
```

Consulte [Proxy reverso](/admin-guide/reverse-proxy/nginx) para mais detalhes sobre a configuração do NGINX.

## Como funciona a execução de jobs {#how-job-execution-works}

Em uma implantação com vários nós, a execução de tarefas segue um fluxo coordenado:

1. **O usuário dispara uma tarefa.** Um usuário inicia um job pela interface ou pela API. A requisição pode chegar a qualquer nó do Semaphore.
2. **Os metadados da tarefa são armazenados.** O nó que recebeu a requisição grava os metadados da tarefa no banco de dados e sinaliza o trabalho por meio do Redis.
3. **Um nó captura a tarefa.** Um dos nós disponíveis obtém a tarefa do Redis, adquire um lock distribuído e a marca como em execução no banco de dados.
4. **A tarefa é executada.** O nó executa a tarefa localmente ou a delega a um [runner remoto](/admin-guide/runners). O progresso e os logs são gravados de volta no banco de dados.
5. **Os resultados são transmitidos.** As atualizações da tarefa se propagam pelo Pub/Sub do Redis, de modo que todos os nós e os clientes da interface conectados permaneçam sincronizados.

## Como o HA funciona por baixo dos panos {#under-the-hood}

Os nós do Semaphore nunca se comunicam diretamente entre si. Tudo em que eles precisam concordar passa pelo Redis: quem está vivo, qual tarefa pertence a qual nó, quem dispara um agendamento e quais mensagens da interface devem ser retransmitidas. Cada parte desse estado é um pequeno conjunto de chaves do Redis com expiração, de modo que um nó que falhou não consegue deixar nada para trás por muito tempo. Os dados duráveis (tarefas, templates, logs, runners) sempre ficam no banco de dados; o Redis guarda apenas o estado de coordenação.

Todas as chaves usam os prefixos fixos `ha:` e `tasks:`. Eles não são configuráveis, portanto dois clusters do Semaphore que compartilham o mesmo servidor Redis devem usar números de banco de dados diferentes (`ha.redis.db`).

### Registro de nós {#node-registry}

Cada nó se registra na inicialização e, em seguida, atualiza seu registro a cada 10 segundos. O registro expira após 30 segundos, portanto um nó que para de atualizá-lo é considerado morto em no máximo meio minuto. Em um desligamento normal, o nó remove seu registro imediatamente.

| Chave | Tipo | Finalidade |
| --- | --- | --- |
| `ha:node:<node_id>` | string, JSON | Heartbeat de um nó: `node_id`, `started_at`, `version`, `last_beat`. Expira 30 s após a última atualização. |
| `ha:nodes` | set | IDs de todos os nós registrados. Os membros cuja chave de heartbeat expirou são removidos pelos outros nós. |

O registro de nós é o que o painel do Cluster exibe e o que o limpador de órfãos (abaixo) consulta para decidir se o dono de uma tarefa ainda está vivo.

### Fila de tarefas e tarefas em execução {#task-queue}

A fila de tarefas é compartilhada, portanto uma tarefa iniciada em um nó pode ser despachada, acompanhada e finalizada por qualquer outro. O Redis armazena apenas os IDs das tarefas e alguns campos transitórios; a tarefa em si é carregada do banco de dados pelo nó que precisar dela.

| Chave | Tipo | Finalidade |
| --- | --- | --- |
| `tasks:queue` | list | IDs das tarefas aguardando despacho, em ordem. |
| `tasks:claim:<task_id>` | string | ID do nó que é dono da tarefa. Gravado atomicamente junto com a remoção da fila, de modo que uma tarefa é capturada por exatamente um nó. Expira após 5 minutos; o dono o atualiza a cada minuto. |
| `tasks:running` | set | IDs das tarefas que estão em execução no momento. |
| `tasks:active:<project_id>` | set | IDs das tarefas ativas (aguardando ou em execução) em um projeto. Usado para os limites de concorrência por projeto. |
| `tasks:task_project` | hash | `task_id` → `project_id`, para que qualquer nó possa carregar a tarefa do banco de dados. |
| `tasks:aliases` | hash | `alias` → `task_id` para as tarefas que são referenciadas por um alias. |
| `tasks:runtime:<task_id>` | hash | Campos que mudam enquanto a tarefa é executada, como o ID do runner e o usuário que a iniciou. |
| `tasks:finalize:<task_id>` | string | Lock adquirido pelo nó que grava o resultado final de uma tarefa executada em um runner remoto. Expira após 5 minutos. |

As entradas em `tasks:task_project`, `tasks:aliases` e `tasks:runtime:*` são removidas quando a tarefa termina e, adicionalmente, expiram após 7 dias como medida de segurança.

Um nó pega uma tarefa da fila com uma única operação atômica: ele verifica se a tarefa ainda está na fila, grava a captura, remove a tarefa da fila e a adiciona ao conjunto de tarefas em execução. Se dois nós tentarem ao mesmo tempo, apenas um tem sucesso.

**Limpador de órfãos.** Uma vez por minuto, cada nó revisa as tarefas em execução cujo dono está morto, ou seja, cuja captura expirou ou cujo heartbeat do dono desapareceu. Uma tarefa que o banco de dados já mostra como finalizada é simplesmente removida do Redis. Uma tarefa que nunca foi entregue a um runner é devolvida à fila para que um nó vivo a despache. Uma tarefa que já está sendo executada em um runner é deixada em paz: o runner continua trabalhando, e a tarefa é limpa assim que o banco de dados a mostrar como finalizada.

### Locks {#locks}

Os locks são chaves únicas criadas com `SET NX`: o nó que consegue criar a chave detém o lock. Todo lock tem uma expiração, e os locks mantidos por muito tempo são renovados pelo seu dono, de modo que um nó que falhou libera seus locks automaticamente.

| Chave | Expiração | Finalidade |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 s | Um lock por agendamento por minuto. O nó que o cria dispara o agendamento; os outros o ignoram. |
| `ha:wf:lock:<project_id>:<run_id>` | 30 s, renovado a cada 10 s | Apenas um nó avança uma determinada execução de workflow por vez. |
| `ha:wf:start:<project_id>:<template_id>` | 10 s | Lock curto enquanto uma nova execução de workflow é criada, para que dois nós não iniciem o mesmo workflow duas vezes. |
| `ha:audit:export:<destination_id>` | 30 s, renovado a cada 10 s | Apenas um nó exporta eventos de auditoria para um determinado destino. Se o Redis estiver indisponível, nenhum nó exporta, de modo que os eventos nunca são enviados duas vezes. |

Os locks de agendamento e de workflow falham de forma aberta: se o Redis não puder ser alcançado, o nó prossegue em vez de pular o trabalho, e as atualizações condicionais no banco de dados mantêm o resultado correto. O lease de exportação de auditoria falha de forma fechada, porque uma exportação duplicada não pode ser desfeita.

### Canais Pub/Sub {#pubsub-channels}

| Canal | Finalidade |
| --- | --- |
| `ha:ws:broadcast` | Mensagens WebSocket para a interface. Um nó entrega uma mensagem aos seus próprios navegadores conectados e a publica aqui; os outros nós a retransmitem aos seus. |
| `tasks:events` | Mudanças na fila de tarefas e no conjunto de tarefas em execução, atualizações dos campos de runtime e solicitações de parada forçada. Os nós usam esses eventos para manter atualizada sua visão em memória da fila e para parar uma tarefa que outro nó pediu para parar. |

As mensagens carregam o ID do nó remetente, de modo que um nó ignora suas próprias mensagens.

### Chaves do cache de runners {#runner-cache-keys}

As chaves `ha:runner:*` pertencem ao [cache de runners](#runner-cache), descrito na próxima seção.

## Cache de runners {#runner-cache}

Toda requisição que um [runner](/admin-guide/runners) envia ao servidor carrega seu token, e o servidor precisa transformar esse token em um registro de runner antes de poder fazer qualquer outra coisa. Os runners consultam o servidor a cada poucos segundos e relatam o progresso a cada segundo enquanto um job é executado, portanto, sem um cache, cada uma dessas requisições custaria uma consulta ao banco de dados. O cache de runners responde à maioria delas a partir da memória.

Um nó único mantém o cache em sua própria memória. No modo HA isso não é suficiente: se você editar um runner no nó A, o nó B não pode continuar servindo o registro antigo. Por isso, no modo HA o cache fica no Redis e é compartilhado por todos os nós, e uma alteração feita por meio de qualquer nó fica visível para todos eles de uma só vez.

:::note
Este cache não é a ação **Limpar cache** da página Runners. Essa ação pede ao próprio runner que exclua os diretórios de trabalho em sua máquina.
:::

### O que é armazenado em cache e por quanto tempo {#runner-cache-ttl}

O valor armazenado em cache é o registro do runner sem suas tags e sem o token. O token nunca chega ao Redis: a chave é derivada de um hash SHA-256 do token, e o campo do token é apagado antes de o registro ser armazenado.

Uma entrada vive por no máximo 30 segundos. Na prática, ela é descartada muito antes, porque toda alteração feita por meio do Semaphore invalida o cache imediatamente:

* Criar, atualizar, excluir ou registrar novamente um runner, ou excluir um projeto, descarta **todos** os runners em cache em todos os nós.
* Um heartbeat de runner descarta **apenas a entrada daquele runner**, de modo que o horário de "visto pela última vez" armazenado permanece atualizado sem tocar nos demais. Um heartbeat é gravado no máximo uma vez por intervalo equivalente a um terço de `runners.offline_timeout_sec`, limitado a 45 segundos; com o tempo limite padrão de 120 segundos, isso é a cada 40 segundos.

A expiração de 30 segundos só importa para alterações feitas por fora do Semaphore, por exemplo editando a tabela `runner` diretamente ou restaurando um backup.

### Como as gravações obsoletas são evitadas {#runner-cache-generation}

Uma consulta que não encontra a entrada no cache lê o runner do banco de dados e depois o armazena. Entre esses dois passos, outro nó pode alterar o runner. Para garantir que a consulta nunca armazene em cache o que leu antes da alteração, o cache mantém um contador que cresce a cada invalidação. A consulta lembra o valor do contador que viu antes de ir ao banco de dados, e a gravação é rejeitada se o contador tiver avançado nesse meio-tempo. Cada passo é executado como um único script Lua no Redis, de modo que o contador e a entrada são lidos e gravados juntos.

### Chaves do Redis {#runner-cache-redis-keys}

| Chave | Tipo | Finalidade |
| --- | --- | --- |
| `ha:runner:gen` | string, inteiro | O contador. Cresce em um a cada invalidação, seja de todo o cache ou de um único runner. |
| `ha:runner:inv` | string, inteiro | Valor do contador na última invalidação completa. Ele faz parte de toda chave de entrada, portanto uma invalidação completa torna todas as entradas existentes inacessíveis de uma só vez; elas então expiram por conta própria. |
| `ha:runner:token:<inv>:<sha256(token)>` | string, binário | O registro do runner em cache. Expira após 30 s. |
| `ha:runner:forgot:<sha256(token)>` | string, inteiro | Valor do contador no último heartbeat deste runner. Uma consulta iniciada antes do heartbeat não pode armazenar o registro anterior ao heartbeat. Expira após 30 s. |

O painel do Cluster informa o número de chaves `ha:runner:token:*` como o tamanho do cache de runners.

### Comportamento em caso de problemas no Redis {#runner-cache-failures}

O cache nunca faz uma requisição de runner falhar. Toda operação de cache é limitada a 500 milissegundos; se o Redis estiver lento ou inacessível, a consulta é tratada como uma falha de cache e vai ao banco de dados, e nada é armazenado. O único caso do qual é preciso estar ciente é uma invalidação que falha porque o Redis está fora do ar no momento em que um runner é alterado: os outros nós podem então servir o registro antigo até que ele expire, no máximo 30 segundos depois. A falha é registrada no nível de erro.

## Escalando com runners {#scaling-with-runners}

O HA também permite o escalonamento horizontal da execução de tarefas. Em vez de executar jobs apenas nos próprios nós do Semaphore, a execução pode ser delegada a vários [runners](/admin-guide/runners). Isso permite:

* Distribuir a carga de trabalho pela sua infraestrutura.
* Escalar a capacidade de automação de forma independente da camada web/API.
* Isolar os ambientes de execução para limitar o raio de impacto.
* Executar tarefas em muitos nós em paralelo.

Consulte [Runners](/admin-guide/runners) para ver as instruções de configuração.

## Benefícios {#benefits}

* **Maior confiabilidade** — Se uma instância falhar, as outras continuam atendendo o tráfego e executando jobs.
* **Manutenção sem tempo de inatividade** — Os nós podem ser atualizados ou reiniciados individualmente sem parar o sistema.
* **Escalabilidade horizontal** — Adicione nós do Semaphore atrás do balanceador de carga para aumentar a capacidade.
* **Sem dependência de um nó primário** — Todos os nós são iguais, o que elimina mecanismos complexos de failover.
* **Estado consistente do cluster** — O banco de dados compartilhado e a coordenação via Redis mantêm todas as instâncias sincronizadas.

## Perguntas frequentes {#faq}

### O que é alta disponibilidade ativo-ativo? {#what-is-active-active-high-availability}

HA ativo-ativo significa que várias instâncias da aplicação são executadas simultaneamente e todas atendem requisições. Não há nó primário — qualquer instância pode atender o tráfego e executar jobs.

### Por que o Semaphore usa o Redis no modo HA? {#why-does-semaphore-use-redis-in-ha-mode}

O Redis atua como uma camada de coordenação entre as instâncias. Ele fornece locks distribuídos, estado compartilhado da fila de tarefas e mensageria Pub/Sub para garantir que os nós não executem o mesmo job simultaneamente.

### Qual banco de dados devo usar em implantações HA? {#what-database-should-i-use-for-ha-deployments}

O Semaphore oferece suporte a PostgreSQL e MySQL como banco de dados compartilhado. SQLite e BoltDB não podem ser usados no modo HA porque não oferecem suporte a acesso concorrente de vários processos.

### O que acontece se o Redis falhar? {#what-happens-if-redis-fails}

Com um único servidor Redis (`ha.engine: redis`), os nós não conseguem se coordenar até que o Redis volte. Com o [Redis Sentinel](#redis-sentinel), os sentinelas promovem uma réplica e cada nó do Semaphore passa a usá-la automaticamente, normalmente em poucos segundos, sem reinicialização.

### O que acontece se um nó do Semaphore falhar? {#what-happens-if-one-semaphore-node-fails}

O balanceador de carga direciona o tráfego para os nós restantes. Os jobs em execução continuam nas outras instâncias, e os novos jobs são capturados por qualquer nó disponível.

### Posso escalar horizontalmente? {#can-i-scale-horizontally}

Sim. Você pode adicionar nós do Semaphore atrás do balanceador de carga para aumentar a capacidade web/API e adicionar [runners](/admin-guide/runners) para aumentar a capacidade de execução de tarefas.
