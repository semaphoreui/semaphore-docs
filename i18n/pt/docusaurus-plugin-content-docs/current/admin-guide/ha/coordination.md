---
title: Coordenação do cluster
description: Como os nós HA do Semaphore se coordenam através do Redis, com cada chave, lock e canal Pub/Sub que compartilham e quanto tempo cada um vive.
---

# Coordenação do cluster <Enterprise />

Os nós do Semaphore nunca se comunicam diretamente entre si. Tudo em que eles precisam concordar passa pelo Redis: quem está vivo, qual tarefa pertence a qual nó, quem dispara um agendamento e quais mensagens da interface devem ser retransmitidas. Cada parte desse estado é um pequeno conjunto de chaves do Redis com expiração, de modo que um nó que falhou não consegue deixar nada para trás por muito tempo. Os dados duráveis (tarefas, templates, logs, runners) sempre ficam no banco de dados; o Redis guarda apenas o estado de coordenação.

Todas as chaves usam os prefixos fixos `ha:` e `tasks:`. Eles não são configuráveis, portanto dois clusters do Semaphore que compartilham o mesmo servidor Redis devem usar números de banco de dados diferentes (`ha.redis.db`).

## Registro de nós {#node-registry}

Cada nó se registra na inicialização e, em seguida, atualiza seu registro a cada 10 segundos. O registro expira após 30 segundos, portanto um nó que para de atualizá-lo é considerado morto em no máximo meio minuto. Em um desligamento normal, o nó remove seu registro imediatamente.

| Chave | Tipo | Finalidade |
| --- | --- | --- |
| `ha:node:<node_id>` | string, JSON | Heartbeat de um nó: `node_id`, `started_at`, `version`, `last_beat`. Expira 30 s após a última atualização. |
| `ha:nodes` | set | IDs de todos os nós registrados. Os membros cuja chave de heartbeat expirou são removidos pelos outros nós. |

O registro de nós é o que o painel do Cluster exibe e o que o limpador de órfãos (abaixo) consulta para decidir se o dono de uma tarefa ainda está vivo.

## Fila de tarefas e tarefas em execução {#task-queue}

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

## Locks {#locks}

Os locks são chaves únicas criadas com `SET NX`: o nó que consegue criar a chave detém o lock. Todo lock tem uma expiração, e os locks mantidos por muito tempo são renovados pelo seu dono, de modo que um nó que falhou libera seus locks automaticamente.

| Chave | Expiração | Finalidade |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 s | Um lock por agendamento por minuto. O nó que o cria dispara o agendamento; os outros o ignoram. |
| `ha:wf:lock:<project_id>:<run_id>` | 30 s, renovado a cada 10 s | Apenas um nó avança uma determinada execução de workflow por vez. |
| `ha:wf:start:<project_id>:<template_id>` | 10 s | Lock curto enquanto uma nova execução de workflow é criada, para que dois nós não iniciem o mesmo workflow duas vezes. |
| `ha:audit:export:<destination_id>` | 30 s, renovado a cada 10 s | Apenas um nó exporta eventos de auditoria para um determinado destino. Se o Redis estiver indisponível, nenhum nó exporta, de modo que os eventos nunca são enviados duas vezes. |

Os locks de agendamento e de workflow falham de forma aberta: se o Redis não puder ser alcançado, o nó prossegue em vez de pular o trabalho, e as atualizações condicionais no banco de dados mantêm o resultado correto. O lease de exportação de auditoria falha de forma fechada, porque uma exportação duplicada não pode ser desfeita.

## Canais Pub/Sub {#pubsub-channels}

| Canal | Finalidade |
| --- | --- |
| `ha:ws:broadcast` | Mensagens WebSocket para a interface. Um nó entrega uma mensagem aos seus próprios navegadores conectados e a publica aqui; os outros nós a retransmitem aos seus. |
| `tasks:events` | Mudanças na fila de tarefas e no conjunto de tarefas em execução, atualizações dos campos de runtime e solicitações de parada forçada. Os nós usam esses eventos para manter atualizada sua visão em memória da fila e para parar uma tarefa que outro nó pediu para parar. |

As mensagens carregam o ID do nó remetente, de modo que um nó ignora suas próprias mensagens.

## Chaves do cache de runners {#runner-cache-keys}

As chaves `ha:runner:*` pertencem ao cache compartilhado de registros de runners. Para mais informações, consulte [Cache de autenticação de runners](/admin-guide/ha/runner-cache).

## Páginas relacionadas {#related-pages}

- [Alta disponibilidade](/admin-guide/ha) — arquitetura, configuração e balanceador de carga.
- [Cache de autenticação de runners](/admin-guide/ha/runner-cache) — o cache compartilhado de registros de runners.
