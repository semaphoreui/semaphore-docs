---
title: Log de auditoria
description: O log de auditoria de segurança que o Semaphore mantém para logins, MFA, usuários, permissões, tokens de API e configurações, e como ativá-lo.
---

# Log de auditoria

O log de auditoria é uma trilha de auditoria de segurança: quem fez o quê, de onde, em qual objeto e com qual
resultado. Analistas de segurança e equipes de conformidade o leem, geralmente em um SIEM. Cada evento tem um
esquema estável e documentado, para que um analista possa escrever regras de detecção sem conhecer o
funcionamento interno do Semaphore.

O log de auditoria é separado do [log de atividades](/admin-guide/logs). O log de atividades é um feed para os
usuários de um projeto. O log de auditoria é uma trilha para quem verifica se o sistema é usado corretamente.

## Como funciona {#overview}

Com o log de auditoria ativado, o Semaphore registra um evento para cada ação relevante para a segurança que
chega pela interface web ou pela API: logins e logouts, verificações de MFA, alterações de usuários, membros de
projetos, papéis e permissões, tokens de API e configurações do sistema. As solicitações recusadas também são
registradas: um login com falha, um token de API desconhecido ou expirado, uma permissão negada, uma
solicitação entre sites bloqueada.

Os eventos são armazenados no banco de dados do Semaphore. O Semaphore Pro pode enviá-los para um SIEM, veja
[Exportação para um SIEM](#siem-export).

## Esquema do evento {#event-schema}

Cada evento é um objeto JSON com os mesmos campos. Para a lista de eventos, seus resultados, motivos e
metadados, veja [Eventos de auditoria](/reference/audit-events).

| Campo | Descrição |
| --- | --- |
| `event_id` | ID único do evento. Use-o para remover duplicatas no SIEM. |
| `seq` | Número de sequência sem lacunas que cresce a cada evento. Use-o para ordenar os eventos. |
| `timestamp` | Hora do evento em UTC. |
| `schema_version` | Versão deste esquema. Só muda quando um campo é renomeado, removido ou muda de tipo. |
| `category` | `auth`, `iam`, `resource`, `secret`, `task`, `runner`, `system` ou `audit`. |
| `event_code` | Do que trata o evento, por exemplo `iam.api_token`. |
| `type` | Tipo de alteração: `creation`, `change`, `deletion`, `access`, `start`, `end`, `denied` ou `info`. |
| `action` | O que foi feito, por exemplo `create`. |
| `outcome` | `success` ou `failure`. |
| `reason` | Por que a ação falhou, de uma lista fixa por evento. Vazio em caso de sucesso. |
| `actor` | Quem agiu: seu `type` (`user`, `anonymous`, `system`, `runner`, `integration`), `id` e `name`. Para um usuário, também `auth` (`session` ou `api_token`) e, para um token de API, `token_fingerprint`. |
| `source` | Para solicitações à interface web e à API: o `ip` e o `user_agent` do cliente. |
| `target` | O objeto da ação: seu `type`, `id` e `name`. |
| `scope` | O `project_id` para eventos dentro de um projeto. |
| `request_id` | ID da solicitação HTTP. O Semaphore também o retorna no cabeçalho de resposta `X-Request-ID`. |
| `instance_id` | Nome desta instalação do Semaphore, de `audit.instance_id`. |
| `node_id` | Nó que registrou o evento, quando a [alta disponibilidade](/admin-guide/ha) está ativada. |
| `metadata` | Detalhes extras que dependem do evento. |

`timestamp` é a hora do banco de dados, em microssegundos, ou em milissegundos no SQLite. Ordene os eventos por
`seq`: dois eventos podem ter a mesma hora, mas nunca o mesmo `seq`.

No MySQL, a coluna `created` da tabela `audit_event` usa o fuso horário da opção de conexão
`loc`, UTC por padrão. O `timestamp` de cada evento está sempre em UTC.

Cada inicialização do servidor registra `audit.lifecycle` com a ação `start`. Não há evento de parada: uma
parada, uma falha ou a desativação do log de auditoria aparece como uma lacuna de tempo antes do próximo
`start`.

## O que nunca é registrado {#never-recorded}

O log de auditoria nunca contém senhas, códigos de uso único, segredos e códigos QR de TOTP, códigos de
recuperação, cookies de sessão, tokens, códigos e claims de OAuth, chaves privadas, frases secretas, valores de
segredos, valores de ambiente e de pesquisas, corpos de webhooks, saída de tarefas, endereços de e-mail ou URLs.
Um token de API é identificado apenas pela sua impressão digital: os primeiros 16 caracteres hexadecimais do seu
hash SHA-256.

O ID e o nome de usuário identificam quem agiu. Um login com falha registra o login digitado, cortado em 64
bytes, porque a investigação de logins com falha precisa dele.

## Ative o log de auditoria {#enable}

Defina `audit.enabled` e dê um nome à instalação em `audit.instance_id`. O nome tem de 1 a 255 caracteres ASCII
imprimíveis sem espaços e aparece em cada evento.

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

Ou usando variáveis de ambiente:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

Reinicie o Semaphore para aplicar a alteração. Para todas as opções, veja
[Configuração](/reference/configuration).

## Endereço do cliente atrás de um proxy reverso {#trusted-proxies}

Atrás de um proxy reverso, o interlocutor direto do Semaphore é o proxy, e o endereço do cliente vem do
cabeçalho `X-Forwarded-For` ou `X-Real-IP`. O Semaphore lê esses cabeçalhos apenas quando o interlocutor direto
está dentro de `audit.trusted_proxy_cidrs`. Caso contrário, registra o endereço do interlocutor, para que um
cliente não possa falsificar seu endereço.

Liste em `audit.trusted_proxy_cidrs` apenas seus proxies reversos, nunca redes de clientes. Um cliente dentro de
um intervalo confiável pode colocar qualquer endereço em `X-Forwarded-For`.

O endereço registrado é o mais à direita em `X-Forwarded-For` que não é um proxy confiável.
`X-Real-IP` é usado apenas quando não há `X-Forwarded-For`, e apenas se tiver um único valor.

## Armazenamento {#storage}

Os eventos são armazenados no banco de dados do Semaphore e nunca são excluídos: esta versão não tem retenção.
Planeje o tamanho do banco de dados de acordo com o número de logins e alterações da sua instalação.

## Mapeamento de conformidade {#compliance}

O Semaphore registra os eventos de que você precisa para estes controles. Ele não torna sua instalação
conforme por si só.

| Requisito | Coberto por | Status |
| --- | --- | --- |
| PCI DSS 10.2.1.1 acesso a dados sensíveis (análogo: segredos) | `iam.mfa/view_qr` | Disponível |
| PCI DSS 10.2.1.1 acesso a dados sensíveis (análogo: segredos) | `resource.project_backup/export` | Planejado |
| PCI DSS 10.2.1.2 ações de administradores / ISO 27002 8.15 uso de privilégios | `iam.*`, `system.*` | Disponível |
| PCI DSS 10.2.1.2 ações de administradores / ISO 27002 8.15 uso de privilégios | `resource.*`, `secret.*` | Planejado |
| PCI DSS 10.2.1.2 ações de administradores / ISO 27002 8.15 uso de privilégios | `runner.*`, `task.control`, `task.history` | Planejado |
| PCI DSS 10.2.1.3 acesso aos logs de auditoria | Não se aplica: o Semaphore não dá acesso à trilha de auditoria. | — |
| PCI DSS 10.2.1.4 tentativas de acesso lógico inválidas / ISO tentativas de acesso recusadas | `auth.login` failure, `auth.mfa` failure, `auth.api_token/reject`, `auth.authorization/deny`, `auth.csrf/block` | Disponível |
| PCI DSS 10.2.1.4 tentativas de acesso lógico inválidas / ISO tentativas de acesso recusadas | `runner.lifecycle/register` failure | Planejado |
| PCI DSS 10.2.1.5 alterações em credenciais de identificação e autenticação | `iam.user*`, `iam.mfa`, `iam.api_token`, `iam.external_identity`, `iam.membership`, `iam.*role*` | Disponível |
| PCI DSS 10.2.1.5 alterações em credenciais de identificação e autenticação | `runner.credential` | Planejado |
| PCI DSS 10.2.1.6 início, parada e pausa dos logs de auditoria / ISO ativação de sistemas de segurança | `audit.lifecycle/start`; uma parada aparece como a lacuna anterior | Disponível |
| PCI DSS 10.2.1.7 criação e exclusão de objetos de sistema | `resource.*` create/delete | Planejado |
| PCI DSS 10.2.1.7 criação e exclusão de objetos de sistema | `runner.lifecycle` create/delete | Planejado |
| PCI DSS 10.2.2 campos obrigatórios | `actor`, `event_code` e `action`, `timestamp`, `outcome`, `source` ou `node_id`, `target` ou `scope` | Disponível |
| PCI DSS 10.3.3 cópia imediata para um servidor central de logs | Exportação para um SIEM via Syslog+TLS | Disponível |
| PCI DSS 10.3.3 cópia imediata para um servidor central de logs | Exportação para um SIEM via Splunk HEC | Planejado |

Os eventos planejados não são registrados nesta versão.

## O que não é registrado nesta versão {#not-recorded}

- Ações feitas com o comando `semaphore` no servidor, como `user add` ou `user token`. Elas alteram o banco de
  dados diretamente, e quem pode executá-las também pode alterar a tabela de auditoria.
- Remoção da licença, configurações de runtime dos apps, limpeza do estado de tarefas de HA, aliases de
  inventários Terraform, execuções de workflows e convites para projetos. Eles ainda não têm evento de auditoria.

## Exportação para um SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

O Semaphore Pro envia o log de auditoria para um SIEM via Syslog com TLS. Ele guarda sua posição no log para o
SIEM, então os eventos registrados enquanto o SIEM está inacessível são enviados quando ele volta. Para as
etapas, veja [Envie o log de auditoria para um SIEM](/admin-guide/audit-log-siem).

## Próximos passos {#whats-next}

- [Envie o log de auditoria para um SIEM](/admin-guide/audit-log-siem) — exporte os eventos via Syslog+TLS.
- [Eventos de auditoria](/reference/audit-events) — cada evento com seus resultados, motivos e metadados.
- [Configuração](/reference/configuration) — cada opção `audit.*`.
