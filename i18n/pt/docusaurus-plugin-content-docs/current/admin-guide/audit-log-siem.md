---
title: Envie o log de auditoria para um SIEM
description: Configure o Semaphore Pro para enviar eventos de auditoria para um SIEM via Syslog com TLS e prepare o rsyslog ou o Vector para recebê-los.
---

# Envie o log de auditoria para um SIEM <FeatureState feature="audit-siem-export" />

O Semaphore Pro envia cada evento do [log de auditoria](/admin-guide/audit-log) para um SIEM como uma mensagem
Syslog RFC 5424 sobre TLS.

## Antes de começar {#before-you-begin}

- Uma licença do Semaphore Pro.
- O [log de auditoria ativado](/admin-guide/audit-log#enable).
- Um receptor Syslog que aceite TLS, por exemplo rsyslog ou Vector, veja
  [Exemplos de receptores](#receivers).
- O certificado da CA que assinou o certificado do receptor, em formato PEM, se ele não estiver no repositório
  confiável do sistema.

## Passos {#steps}

Para enviar o log de auditoria para um SIEM, siga estes passos:

1. Adicione a seção `audit.syslog` ao `config.json`:

   ```json
   {
     "audit": {
       "enabled": true,
       "instance_id": "prod-eu",
       "syslog": {
         "id": "siem",
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
   SEMAPHORE_AUDIT_SYSLOG_ID=siem
   SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
   SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
   SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
   SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
   ```

   `id` e `address` são obrigatórios. `ca_file` adiciona uma CA ao repositório confiável do sistema.
   `server_name` substitui o nome verificado no certificado do receptor. `timeout` limita a conexão e a
   escrita, 10 segundos por padrão.
2. Reinicie o Semaphore. Um arquivo de CA ilegível ou a falta de `id` ou `address` interrompe a inicialização
   com um erro.
3. Faça login com uma senha errada. O SIEM recebe um evento `auth.login` com o resultado `failure`.

## Como os eventos são entregues {#delivery}

- O Semaphore guarda sua posição no log sob o `id`. Após uma reinicialização, ele continua dali, e os eventos
  registrados enquanto o receptor estava inacessível são enviados quando ele volta. Um novo `id` começa no
  evento atual e não envia os anteriores.
- A entrega é de melhor esforço: um evento escrito em uma conexão que cai silenciosamente pode ser perdido.
- Um evento pode chegar duas vezes, por exemplo após um erro de rede ou um failover. Remova duplicatas por
  `event_id` e ordene os eventos por `seq`.
- Com [alta disponibilidade](/admin-guide/ha), um nó envia por vez. Outro nó assume quando ele para.

## Exemplos de receptores {#receivers}

O Semaphore envia mensagens RFC 5424 com enquadramento por contagem de octetos (RFC 5425). O corpo da mensagem é o
JSON do evento. O `HOSTNAME` do Syslog é o ID do nó ou, sem HA, o ID da instância, e `MSGID` é o `event_code`.

### rsyslog {#rsyslog}

Receba eventos via TLS e escreva um evento JSON por linha:

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

### Vector {#vector}

Receba eventos via TLS e analise o JSON do evento:

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

## Próximos passos {#whats-next}

- [Log de auditoria](/admin-guide/audit-log) — o esquema do evento e o que é registrado.
- [Eventos de auditoria](/reference/audit-events) — cada evento com seus resultados, motivos e metadados.
- [Configuração](/reference/configuration) — cada opção `audit.*`.
