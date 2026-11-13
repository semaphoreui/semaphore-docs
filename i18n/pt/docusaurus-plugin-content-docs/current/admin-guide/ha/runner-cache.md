---
title: Cache de autenticação de runners
description: Por que o Semaphore armazena em cache os registros de runners por token, como os nós HA compartilham o cache através do Redis, quando as entradas são invalidadas e o que acontece se o Redis falhar.
---

# Cache de autenticação de runners

Toda requisição que um [runner](/admin-guide/runners) envia ao servidor carrega seu token, e o servidor precisa transformar esse token em um registro de runner antes de poder fazer qualquer outra coisa. Os runners consultam o servidor a cada poucos segundos e relatam o progresso a cada segundo enquanto um job é executado, portanto, sem um cache, cada uma dessas requisições custaria uma consulta ao banco de dados. O cache de runners responde à maioria delas a partir da memória.

Um nó único mantém o cache em sua própria memória. No modo HA isso não é suficiente: se você editar um runner no nó A, o nó B não pode continuar servindo o registro antigo. Por isso, no modo HA o cache fica no Redis e é compartilhado por todos os nós, e uma alteração feita por meio de qualquer nó fica visível para todos eles de uma só vez.

:::note
Este cache não é a ação **Limpar cache** da página Runners. Essa ação pede ao próprio runner que exclua os diretórios de trabalho em sua máquina.
:::

## O que é armazenado em cache e por quanto tempo {#runner-cache-ttl}

O valor armazenado em cache é o registro do runner sem suas tags e sem o token. O token nunca chega ao Redis: a chave é derivada de um hash SHA-256 do token, e o campo do token é apagado antes de o registro ser armazenado.

Uma entrada vive por no máximo 30 segundos. Na prática, ela é descartada muito antes, porque toda alteração feita por meio do Semaphore invalida o cache imediatamente:

* Criar, atualizar, excluir ou registrar novamente um runner, ou excluir um projeto, descarta **todos** os runners em cache em todos os nós.
* Um heartbeat de runner descarta **apenas a entrada daquele runner**, de modo que o horário de "visto pela última vez" armazenado permanece atualizado sem tocar nos demais. Um heartbeat é gravado no máximo uma vez por intervalo equivalente a um terço de `runners.offline_timeout_sec`, limitado a 45 segundos; com o tempo limite padrão de 120 segundos, isso é a cada 40 segundos.

A expiração de 30 segundos só importa para alterações feitas por fora do Semaphore, por exemplo editando a tabela `runner` diretamente ou restaurando um backup.

## Como as gravações obsoletas são evitadas {#runner-cache-generation}

Uma consulta que não encontra a entrada no cache lê o runner do banco de dados e depois o armazena. Entre esses dois passos, outro nó pode alterar o runner. Para garantir que a consulta nunca armazene em cache o que leu antes da alteração, o cache mantém um contador que cresce a cada invalidação. A consulta lembra o valor do contador que viu antes de ir ao banco de dados, e a gravação é rejeitada se o contador tiver avançado nesse meio-tempo. Cada passo é executado como um único script Lua no Redis, de modo que o contador e a entrada são lidos e gravados juntos.

## Chaves do Redis {#runner-cache-redis-keys}

| Chave | Tipo | Finalidade |
| --- | --- | --- |
| `ha:runner:gen` | string, inteiro | O contador. Cresce em um a cada invalidação, seja de todo o cache ou de um único runner. |
| `ha:runner:inv` | string, inteiro | Valor do contador na última invalidação completa. Ele faz parte de toda chave de entrada, portanto uma invalidação completa torna todas as entradas existentes inacessíveis de uma só vez; elas então expiram por conta própria. |
| `ha:runner:token:<inv>:<sha256(token)>` | string, binário | O registro do runner em cache. Expira após 30 s. |
| `ha:runner:forgot:<sha256(token)>` | string, inteiro | Valor do contador no último heartbeat deste runner. Uma consulta iniciada antes do heartbeat não pode armazenar o registro anterior ao heartbeat. Expira após 30 s. |

O painel do Cluster informa o número de chaves `ha:runner:token:*` como o tamanho do cache de runners.

## Comportamento em caso de problemas no Redis {#runner-cache-failures}

O cache nunca faz uma requisição de runner falhar. Toda operação de cache é limitada a 500 milissegundos; se o Redis estiver lento ou inacessível, a consulta é tratada como uma falha de cache e vai ao banco de dados, e nada é armazenado. O único caso do qual é preciso estar ciente é uma invalidação que falha porque o Redis está fora do ar no momento em que um runner é alterado: os outros nós podem então servir o registro antigo até que ele expire, no máximo 30 segundos depois. A falha é registrada no nível de erro.

## Páginas relacionadas {#related-pages}

- [Alta disponibilidade](/admin-guide/ha) — arquitetura, configuração e balanceador de carga.
- [Coordenação do cluster](/admin-guide/ha/coordination) — as chaves, locks e canais do Redis compartilhados pelos nós.
- [Runners](/admin-guide/runners) — registro e configuração de runners.
