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
* Uma instância **Redis** (ou um cluster Redis) acessível por todos os nós.
* Um **balanceador de carga** com suporte a tráfego HTTP e WebSocket.
* Dois ou mais servidores para executar as instâncias do Semaphore.

Todos os nós do Semaphore devem usar o mesmo banco de dados, a mesma instância Redis e a mesma configuração (exceto `ha.node_id`, que deve ser único em cada nó).

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

### O que acontece se um nó do Semaphore falhar? {#what-happens-if-one-semaphore-node-fails}

O balanceador de carga direciona o tráfego para os nós restantes. Os jobs em execução continuam nas outras instâncias, e os novos jobs são capturados por qualquer nó disponível.

### Posso escalar horizontalmente? {#can-i-scale-horizontally}

Sim. Você pode adicionar nós do Semaphore atrás do balanceador de carga para aumentar a capacidade web/API e adicionar [runners](/admin-guide/runners) para aumentar a capacidade de execução de tarefas.
