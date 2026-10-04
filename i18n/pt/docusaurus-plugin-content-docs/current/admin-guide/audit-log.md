---
title: Log de auditoria
description: Ative o log de auditoria para ver quem fez o quê no Semaphore e envie eventos de auditoria do Semaphore Pro para um SIEM por Syslog ou HEC.
---

# Log de auditoria

O log de auditoria registra as ações importantes no Semaphore: quem entrou, quem alterou um usuário ou uma
função, quem criou um token de API. Cada evento mostra quem fez, quando, de qual endereço e se deu certo.
Use-o para descobrir o que aconteceu na sua instalação ou envie os eventos para o seu SIEM para mantê-los
junto com o restante dos seus logs.

O log de auditoria está disponível em todas as edições. Enviar eventos para um SIEM requer o Semaphore Pro.

## O que é registrado {#recorded-events}

Atualmente o Semaphore registra entradas e atividades de contas, projetos e tarefas:

- entradas, tentativas de entrada com falha, saídas e verificações do segundo fator;
- tokens de API rejeitados, solicitações negadas e solicitações entre sites bloqueadas;
- alterações em usuários, senhas, autenticação de dois fatores, identidades externas e tokens de API;
- alterações em membros do projeto, funções e permissões de modelos;
- alterações em projetos, inventários, repositórios, modelos, agendamentos, integrações, configurações de host,
  ambientes, credenciais e armazenamentos de segredos, e exportações e restaurações de backups de projeto;
- alterações nas configurações do sistema e a ativação da licença Pro;
- inícios de tarefas com o seu gatilho (API, agendamento, integração, execução automática, workflow), aprovações, interrupções,
  conclusões e histórico de tarefas excluído;
- alterações em runners, registros (incluindo tokens de registro recusados), cancelamentos de registro e relatórios de runners
  com um status inválido;
- cada início do servidor.

Para a lista completa, consulte
[Eventos de auditoria](/reference/audit-events).

Senhas, tokens, valores secretos e a saída das tarefas nunca aparecem nos eventos de auditoria. Tokens de
API são mostrados por uma impressão digital em vez do seu valor. Uma entrada com falha guarda o nome de
login digitado, que pode conter um endereço de e-mail.

No evento de conclusão de uma tarefa, `metadata.result` mostra o
status que o Semaphore atribuiu à tarefa, e `metadata.end_reason` indica por que o Semaphore a encerrou: `timeout` quando demorou
demais, `runner_lost` quando o runner dela parou de responder. Argumentos da tarefa, variáveis, tags de runner e tokens
não são registrados.

Durante uma atualização gradual de um cluster HA, uma tarefa iniciada em um nó atualizado e encerrada em um nó que
ainda não foi atualizado não tem evento de conclusão.

URLs de repositórios, URLs de configurações de host e aliases de integrações também não são registrados.

Às vezes o Semaphore salva ou exclui um objeto, mas uma parte posterior da mesma solicitação falha. A
interface ou a API mostra então um erro, embora o objeto tenha sido criado ou excluído. Esse evento é registrado
como sucesso com `metadata.partial=true`, e `reason` indica o que não foi concluído:

- `secret_failed`: um ambiente foi salvo ou excluído, mas alguns dos seus segredos não foram salvos ou não
  foram removidos;
- `inventory_failed`: um modelo foi criado, mas não o seu inventário do workspace do Terraform;
- `restore_failed`: um projeto foi restaurado de um backup, mas nem todos os seus objetos;
- `setup_failed`: um projeto foi criado, mas não foi totalmente configurado; por exemplo, seu criador não foi
  adicionado como proprietário.

## Ativar o log de auditoria {#enable}

O log de auditoria vem desativado por padrão. Para ativá-lo, defina `audit.enabled` e dê um nome à sua
instalação em `audit.instance_id`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

Ou usando variáveis de ambiente:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

O ID da instância tem de 1 a 255 caracteres sem espaços. Ele é adicionado a cada evento, para que você
possa distinguir suas instalações quando elas enviam eventos para o mesmo lugar.

Reinicie o Semaphore. O registro começa após a reinicialização; ações anteriores não são adicionadas. Para
todas as opções, consulte [Opções de configuração](/reference/configuration#audit-log).

## Registrar o endereço do cliente atrás de um proxy {#trusted-proxies}

Se o Semaphore roda atrás de um proxy reverso, os eventos mostram o endereço do proxy em vez do usuário.
Para registrar o endereço real do cliente, liste as redes dos seus proxies em `audit.trusted_proxy_cidrs`:

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
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

O Semaphore passa então a obter o endereço do cliente de `X-Forwarded-For` ou `X-Real-IP`, mas só para
solicitações vindas dessas redes. Se as solicitações passam por vários proxies, liste todos. Não inclua as
redes de onde seus usuários se conectam: qualquer pessoa nelas poderia colocar qualquer endereço nesses
cabeçalhos.

## Armazenamento {#storage}

Os eventos são armazenados no banco de dados do Semaphore, então seus backups normais do banco os incluem.
O Semaphore não mostra eventos de auditoria na interface e não apaga eventos antigos, por isso acompanhe o
tamanho do banco de dados.

O log de auditoria nunca atrapalha seus usuários. Se um evento não puder ser salvo, o Semaphore grava um
erro no log do servidor e a ação continua normalmente.

## Exportar para um SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

O Semaphore Pro pode enviar eventos de auditoria para um receptor Syslog via TLS, como rsyslog ou Vector, e
para qualquer receptor do protocolo Splunk HTTP Event Collector (HEC), como Splunk, Vector, Fluent Bit, o
OpenTelemetry Collector ou Cribl. Você pode configurar um destino Syslog e um HEC, ou ambos ao mesmo tempo.

Você vai precisar de:

- o nome de host e a porta do receptor;
- um nome para este destino, como `security-syslog`;
- o certificado da CA do receptor, se o host do Semaphore ainda não confiar nela.

Adicione `audit.syslog` ao `config.json`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "syslog": {
      "id": "security-syslog",
      "address": "siem.example.com:6514",
      "ca_file": "/etc/semaphore/siem-ca.pem",
      "server_name": "siem.example.com",
      "timeout": "10s"
    }
  }
}
```

Ou usando variáveis de ambiente:

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` e `address` são obrigatórios. O Semaphore lembra quais eventos já enviou para cada destino, então
mantenha o mesmo `id` ao mudar o endereço ou o certificado. Um `id` novo começa pelos eventos novos.

O Semaphore sempre verifica o certificado do receptor e usa TLS 1.2 ou mais recente. `ca_file` adiciona sua
CA aos certificados confiáveis, e `server_name` define o nome verificado no certificado quando ele difere do
endereço.

Reinicie o Semaphore. Se as configurações forem inválidas ou o arquivo da CA não puder ser lido, o
Semaphore não inicia.

### Verificar se os eventos chegam {#verify-siem-delivery}

O Semaphore registra um evento sempre que inicia. Após reiniciar, procure-o no receptor: `event_code` é
`audit.lifecycle`, `action` é `start` e `metadata.destinations` inclui o ID do seu destino.

### Enviar eventos por HEC {#hec}

Você vai precisar da URL do endpoint HEC, de um token HEC, de um nome para este destino, como `security-hec`,
e do certificado da CA do receptor, caso o host do Semaphore ainda não confie nela.

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "splunk_hec": {
      "id": "security-hec",
      "url": "https://splunk.example.com:8088/services/collector/event",
      "token": "<HEC token>",
      "index": "security",
      "ca_file": "/etc/semaphore/siem-ca.pem"
    }
  }
}
```

Ou usando variáveis de ambiente:

```bash
SEMAPHORE_AUDIT_SPLUNK_HEC_ID=security-hec
SEMAPHORE_AUDIT_SPLUNK_HEC_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_SPLUNK_HEC_TOKEN=<HEC token>
SEMAPHORE_AUDIT_SPLUNK_HEC_INDEX=security
SEMAPHORE_AUDIT_SPLUNK_HEC_CA_FILE=/etc/semaphore/siem-ca.pem
```

`id`, `url` e `token` são obrigatórios, e a URL deve começar com `https://`. Use um `id` diferente do usado
no Syslog. `source` e `sourcetype` têm como padrão `semaphore` e `semaphore:audit`. Os certificados são
verificados do mesmo modo que no Syslog, e as variáveis padrão `HTTPS_PROXY` e `NO_PROXY` se aplicam.

O Semaphore envia até 100 eventos por requisição. O campo `event` de cada evento HEC contém o JSON do evento
de auditoria, `time` é a hora do evento e `host` é o ID do nó HA, ou o ID da instância em um único nó.

### Como os eventos são entregues {#delivery}

- Se o receptor estiver fora do ar, os eventos aguardam no banco de dados e são enviados quando ele voltar.
  Os usuários não percebem nada.
- Após erros de rede, reinicializações ou um failover de HA, alguns eventos podem chegar duas vezes. Use
  `event_id` para descartar duplicatas e `seq` para ordenar os eventos.
- Se uma conexão cair sem erro, o evento enviado naquele momento pode ser perdido.
- Em uma [instalação HA](/admin-guide/ha), um nó por vez envia os eventos. Se o Redis estiver indisponível,
  o envio pausa e os eventos continuam sendo registrados.
- Por HEC, um evento só conta como enviado depois que o receptor responde com um status 2xx. Qualquer outra
  resposta, incluindo 4xx, é tentada de novo. Se o receptor falhar depois de responder, eventos que ele ainda
  não tinha armazenado podem ser perdidos.

Cada evento é enviado como uma mensagem Syslog RFC 5424 com o JSON do evento como corpo. `HOSTNAME` é o ID
do nó HA, ou o ID da instância em um único nó, e `MSGID` é o código do evento.

Os exemplos abaixo são mínimos e mostram apenas como receber os eventos. Eles aceitam conexões de qualquer
cliente que alcance a porta. Em produção, proteja o receptor para que apenas os seus servidores do Semaphore
possam enviar eventos a ele.

### Exemplo de rsyslog {#rsyslog}

Esta configuração do rsyslog aceita a conexão TLS e grava um evento por linha:

```text
global(
  DefaultNetstreamDriver="gtls"
  DefaultNetstreamDriverCAFile="/etc/rsyslog.d/ca.pem"
  DefaultNetstreamDriverCertFile="/etc/rsyslog.d/cert.pem"
  DefaultNetstreamDriverKeyFile="/etc/rsyslog.d/key.pem"
)

module(load="imtcp" StreamDriver.Name="gtls" StreamDriver.Mode="1" StreamDriver.AuthMode="anon")
input(type="imtcp" port="6514" ruleset="semaphore-audit")

template(name="semaphore-audit-json" type="string" string="%msg%\n")

ruleset(name="semaphore-audit") {
  action(type="omfile" file="/var/log/semaphore-audit.json" template="semaphore-audit-json")
}
```

### Exemplo de Vector {#vector}

Esta configuração do Vector aceita a conexão TLS, lê o JSON do evento e o grava em um arquivo:

```toml
[sources.semaphore_audit]
type = "syslog"
mode = "tcp"
address = "0.0.0.0:6514"
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[transforms.semaphore_audit_event]
type = "remap"
inputs = ["semaphore_audit"]
source = ". = parse_json!(.message)"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_event"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Exemplo de Vector com HEC {#vector-hec}

```toml
[sources.semaphore_audit_hec]
type = "splunk_hec"
address = "0.0.0.0:8088"
valid_tokens = ["<HEC token>"]
tls.enabled = true
tls.crt_file = "/etc/vector/cert.pem"
tls.key_file = "/etc/vector/key.pem"

[sinks.semaphore_audit_file]
type = "file"
inputs = ["semaphore_audit_hec"]
path = "/var/log/semaphore-audit.json"
encoding.codec = "json"
```

### Exemplo de Splunk {#splunk}

Crie um token HEC no Splunk (**Settings → Data inputs → HTTP Event Collector**), permita o índice `security`
para ele e defina `url` como `https://<splunk>:8088/services/collector/event`. Para encontrar os eventos,
pesquise por `index=security sourcetype="semaphore:audit"`.

### Solucionar problemas de exportação {#troubleshoot-export}

- **O Semaphore não inicia.** Verifique se `audit.syslog.id` e `audit.syslog.address` estão definidos, ou
  `audit.splunk_hec.id`, `url` e `token` no caso do HEC, e se o arquivo da CA contém certificados PEM.
- **A conexão TLS falha.** Verifique se o certificado do receptor corresponde a `server_name` e se foi
  assinado por uma CA em que o Semaphore confia.
- **Os eventos não chegam.** Verifique o log do servidor do Semaphore e o log do receptor. Após uma falha, o
  Semaphore espera um pouco antes de tentar de novo.
- **Alguns eventos chegam duas vezes.** Isso pode acontecer após novas tentativas e failovers. Descarte
  duplicatas pelo `event_id`.
- **O HEC responde 401 ou 403.** Verifique o token e os índices nos quais ele pode gravar. O token nunca
  aparece no log do Semaphore.

## O que não é registrado {#not-recorded}

A ferramenta de linha de comando `semaphore` trabalha diretamente com o banco de dados, então comandos como
`user add` e `user token` não são registrados.

Algumas ações na interface não são registradas: remover uma licença, configurações de apps, limpar o
estado das tarefas de HA, aliases de inventários do Terraform, excluir um estado do Terraform, execuções de
workflows e convites para projetos. Descrições de modelos, visualizações, a limpeza do cache do projeto e as
sincronizações agendadas de armazenamentos de segredos também não são registradas.

## Próximos passos {#whats-next}

- [Eventos de auditoria](/reference/audit-events) — o formato dos eventos e todos os eventos registrados.
- [Opções de configuração](/reference/configuration#audit-log) — todas as opções `audit.*` e variáveis de ambiente.
- [Logs](/admin-guide/logs) — logs do servidor, de atividade e de tarefas.
