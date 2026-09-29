---
title: Log de auditoria
description: Ative o log de auditoria de segurança, entenda o que ele registra e envie eventos de auditoria do Semaphore Pro para um SIEM via Syslog com TLS.
---

# Log de auditoria

O log de auditoria registra atividades relevantes para a segurança: quem realizou a ação, o que fez, qual objeto
foi afetado, de onde veio a solicitação e se ela foi bem-sucedida. Os operadores o usam para investigar alterações,
enquanto as equipes de segurança usam o formato documentado dos eventos para regras de detecção e evidências de conformidade.

A captura e o armazenamento local de auditoria estão disponíveis no Semaphore Community. O Semaphore Pro também
pode enviar os eventos capturados para um sistema de gerenciamento de eventos e informações de segurança (SIEM).

## Diferenças em relação a outros logs {#log-types}

| Log | Use-o para |
| --- | --- |
| Log do servidor | Diagnosticar erros de inicialização, configuração e execução do Semaphore. |
| Log de atividades | Mostrar aos usuários do projeto um feed das atividades do projeto. |
| Log e histórico de tarefas | Analisar a execução, o status e a saída das tarefas. |
| Log de auditoria | Investigar ações de autenticação e administrativas em toda a instalação. |

O log de auditoria é independente do [log de atividades](/admin-guide/logs#activity-log). Ativar ou exportar
um deles não ativa nem exporta o outro.

## O que é registrado {#recorded-events}

A versão atual registra os seguintes eventos de autenticação e gerenciamento de identidades:

- logins bem-sucedidos e com falha, logouts e verificações de TOTP;
- tokens de API rejeitados, permissões negadas e solicitações entre sites bloqueadas;
- alterações em usuários, senhas, inscrição no TOTP, identidades externas e tokens de API;
- alterações em membros de projetos, papéis e permissões de templates;
- alterações nas configurações do sistema e ativação da licença Pro;
- início da captura de auditoria junto com o servidor.

Um login bem-sucedido é registrado depois que o usuário conclui todas as etapas de autenticação necessárias,
incluindo o TOTP. Para consultar todos os eventos disponíveis e os planejados para versões futuras, veja
[Eventos de auditoria](/reference/audit-events).

## Dados confidenciais excluídos dos eventos {#sensitive-data}

Os eventos de auditoria identificam uma ação sem copiar suas credenciais ou conteúdo secreto. Eles excluem senhas,
códigos de acesso, segredos e códigos QR de TOTP, códigos de recuperação, cookies de sessão, tokens brutos, códigos e
declarações OAuth, chaves privadas, frases secretas, valores de segredos, valores de ambiente e de pesquisas, corpos de
webhooks, saída de tarefas e URLs de repositórios.

Os tokens de API são identificados por uma impressão digital, não pelo seu valor. Um login com falha inclui o
identificador de login informado, truncado em 64 bytes. Se os usuários entrarem com um endereço de e-mail, esse
identificador poderá conter um endereço de e-mail.

## Ativar o log de auditoria {#enable}

Escolha um nome estável para a instalação e defina `audit.enabled` e `audit.instance_id` em
`config.json`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu"
  }
}
```

O ID da instância deve conter de 1 a 255 caracteres ASCII imprimíveis sem espaços. Ele aparece em todos os eventos
e permite que um SIEM diferencie várias instalações do Semaphore.

Como alternativa, use variáveis de ambiente:

```bash
SEMAPHORE_AUDIT_ENABLED=true
SEMAPHORE_AUDIT_INSTANCE_ID=prod-eu
```

Reinicie o Semaphore para aplicar a alteração. A captura começa após a reinicialização; as atividades anteriores não
são adicionadas ao log de auditoria. O primeiro evento é `audit.lifecycle` com a ação `start`.

Para consultar todas as opções e variáveis de ambiente, veja
[Opções de configuração](/reference/configuration#audit-log).

## Registrar o endereço do cliente atrás de um proxy {#trusted-proxies}

Por padrão, um evento de auditoria HTTP registra o endereço que se conectou diretamente ao Semaphore. Se esse endereço
for de um proxy reverso, adicione somente as redes do proxy a `audit.trusted_proxy_cidrs`:

```json
{
  "audit": {
    "enabled": true,
    "instance_id": "prod-eu",
    "trusted_proxy_cidrs": ["10.0.0.0/8"]
  }
}
```

Ou defina:

```bash
SEMAPHORE_AUDIT_TRUSTED_PROXY_CIDRS='["10.0.0.0/8"]'
```

O Semaphore confia em `X-Forwarded-For` e `X-Real-IP` somente quando vêm dessas redes. Não adicione redes de clientes:
um cliente em uma rede confiável poderia escolher o endereço de origem registrado em seus eventos. Quando vários proxies
acrescentam valores a `X-Forwarded-For`, o Semaphore registra o endereço mais à direita que não seja um proxy confiável.

## Armazenamento e limitações {#storage}

O Semaphore armazena os eventos de auditoria em seu banco de dados. Esta versão não tem um visualizador de auditoria,
uma API de auditoria, retenção automática nem limpeza. Monitore o crescimento do banco de dados e inclua os dados de
auditoria na política de backup do banco de dados.

O registro de auditoria não bloqueia a ação que está sendo registrada. Se houver falha ao armazenar um evento, o Semaphore
grava um erro no log do servidor e continua a operação original. Os registros locais são protegidos pelos mesmos controles
de acesso ao banco de dados que o restante do Semaphore; eles não são imutáveis nem permitem detectar adulterações.

Cada inicialização do servidor registra `audit.lifecycle/start`. Não há evento de parada. Um desligamento, uma falha ou
um log de auditoria desativado aparece como um período sem eventos antes de um evento de início posterior.

## Exportar para um SIEM <FeatureState feature="audit-siem-export" /> {#siem-export}

O Semaphore Pro pode enviar os eventos capturados com sucesso para um receptor Syslog com TLS existente, como rsyslog ou
Vector. O receptor pode armazenar os eventos ou encaminhá-los ao seu SIEM.

Antes de começar, prepare:

- o nome do host e a porta do receptor;
- um ID de destino estável, como `security-syslog`;
- o certificado da CA que assinou o certificado do receptor, caso a CA ainda não seja confiável para o host do
  Semaphore.

Adicione `audit.syslog` a `config.json`:

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

Ou use variáveis de ambiente:

```bash
SEMAPHORE_AUDIT_SYSLOG_ID=security-syslog
SEMAPHORE_AUDIT_SYSLOG_ADDRESS=siem.example.com:6514
SEMAPHORE_AUDIT_SYSLOG_CA_FILE=/etc/semaphore/siem-ca.pem
SEMAPHORE_AUDIT_SYSLOG_SERVER_NAME=siem.example.com
SEMAPHORE_AUDIT_SYSLOG_TIMEOUT=10s
```

`id` e `address` são obrigatórios. Mantenha o mesmo ID ao alterar o endereço ou o certificado do receptor para que
o Semaphore retome o envio a partir da posição salva. Um novo ID começa com os eventos registrados após a inicialização
desse destino; os eventos que já estiverem armazenados nesse momento não serão enviados a ele.

`ca_file` adiciona certificados ao repositório confiável do sistema. `server_name` substitui o nome do host verificado no
certificado do receptor. O Semaphore exige TLS 1.2 ou posterior e sempre verifica o certificado do servidor. Ele não
permite desativar a verificação nem usar um certificado de cliente para essa conexão.

Reinicie o Semaphore. Configurações de destino inválidas ou um arquivo de CA ilegível impedem a inicialização do Semaphore.

### Verificar a entrega {#verify-siem-delivery}

Após a reinicialização, localize o novo evento no receptor e confirme:

- `event_code` é `audit.lifecycle`;
- `action` é `start`;
- `outcome` é `success`;
- `instance_id` corresponde ao nome configurado para a instalação;
- `metadata.destinations` contém o ID do destino.

### Comportamento da entrega {#delivery}

- Se o receptor estiver indisponível, o Semaphore manterá os eventos capturados localmente e tentará enviá-los novamente
  quando o receptor voltar. As solicitações dos usuários continuam normalmente.
- A entrega via Syslog é realizada conforme possível. Um evento gravado em uma conexão que falhe sem notificar o Semaphore
  pode ser perdido.
- Erros de rede, reinicializações e failover de HA podem gerar entregas duplicadas. Remova as duplicatas por
  `event_id` e ordene os eventos por `seq`.
- Em uma [instalação de HA](/admin-guide/ha), normalmente um nó por vez envia para um destino. A exportação
  é interrompida se o Redis estiver indisponível, enquanto a captura continua no banco de dados compartilhado.

O Semaphore envia mensagens RFC 5424 com TLS e enquadramento por contagem de octetos. O corpo da mensagem contém o JSON
do evento de auditoria. `HOSTNAME` é o ID do nó de HA ou o ID da instância em um único nó; `MSGID` é `event_code`.

### Exemplo de receptor rsyslog {#rsyslog}

Este fragmento de configuração do rsyslog aceita a conexão TLS e grava um objeto JSON de evento por linha:

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

### Exemplo de receptor Vector {#vector}

Esta configuração do Vector aceita a conexão TLS, analisa o JSON do evento e o grava em um arquivo:

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

### Solucionar problemas de exportação {#troubleshoot-export}

- Se o Semaphore não iniciar, verifique se `audit.syslog.id` e `audit.syslog.address` estão definidos e se
  o arquivo de CA contém certificados PEM legíveis.
- Se houver falha de TLS, verifique se o certificado do receptor é válido para `server_name` e se sua cadeia leva
  a uma CA do sistema ou configurada.
- Se um evento ainda não tiver chegado, verifique o log do servidor do Semaphore e o log de ingestão do receptor. As
  novas tentativas de exportação usam um atraso após as falhas.
- Se os eventos aparecerem duas vezes, elimine as duplicatas por `event_id`; duplicatas são esperadas após algumas
  novas tentativas e failovers.

## Ações sem cobertura de auditoria {#not-recorded}

O comando `semaphore` altera o banco de dados diretamente, portanto ações da CLI executadas no servidor, como `user add` e
`user token`, não são registradas. O acesso ao servidor e ao banco de dados deve ser controlado separadamente.

Esta versão também não tem eventos de auditoria para remoção de licença, configurações de execução dos aplicativos,
limpeza do estado de tarefas de HA, aliases de inventários do Terraform, execuções de workflows ou convites para projetos. O
[catálogo de eventos](/reference/audit-events) identifica os eventos planejados para versões futuras.

## Próximos passos {#whats-next}

- [Eventos de auditoria](/reference/audit-events) — campos dos eventos, eventos disponíveis e planejados e cobertura de conformidade.
- [Opções de configuração](/reference/configuration#audit-log) — todas as opções `audit.*` e variáveis de ambiente.
- [Logs](/admin-guide/logs) — logs do servidor, de atividades e de tarefas.
