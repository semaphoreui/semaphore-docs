# Logs

O Semaphore grava os logs do servidor no **stdout** e armazena os logs de **Tarefas** e de **Atividade** em um **banco de dados**, centralizando as informações de log mais importantes e eliminando a necessidade de fazer backup de arquivos de log separadamente. Os únicos dados armazenados no sistema de arquivos são dados de cache.

---

## Log do servidor {#server-log}

O Semaphore não grava logs em arquivos. Em vez disso, todos os logs da aplicação são escritos no **stdout**.  
Se o Semaphore estiver em execução como um serviço systemd, você pode visualizar os logs com o seguinte comando:

```bash
journalctl -u semaphore.service -f
```

Se o Semaphore estiver em execução em um contêiner Docker, você pode visualizar os logs com o seguinte comando:
```
docker logs -f my-semaphore-container
```

Isso fornece uma visualização ao vivo (em streaming) dos logs.

---

## Log de atividade {#activity-log}

O Log de Atividade registra ações de usuários realizadas no Semaphore, incluindo:

- Adição ou remoção de recursos (por exemplo, Templates, Inventários, Repositórios).
- Adição ou remoção de membros da equipe.

### Versão Pro 2.10 e posteriores <Pro /> {#pro-version-210-and-later}

O **Semaphore Pro** 2.10+ permite gravar o Log de Atividade e o log de Tarefas em um arquivo. Para habilitar isso, adicione a seguinte configuração ao seu `config.json`:

```json
{
  "log": {
    "events": {
      "enabled": true,
      "logger": {
        "filename": "./events.log"
        // other logger options
      }
    },
    "tasks": {
      "enabled": true,
      "logger": {
        "filename": "./tasks.log"
        // other logger options
      },
			"result_logger": {
				"filename": "./task_results.log"
        // other logger options
			}
    }
  }
}
```


Ou você pode fazer isso usando as seguintes variáveis de ambiente:

```bash
export SEMAPHORE_EVENT_LOG_ENABLED=True
export SEMAPHORE_EVENT_LOGGER={"filename": "./events.log"}

export SEMAPHORE_TASK_LOG_ENABLED=True
export SEMAPHORE_TASK_LOGGER={"filename": "./tasks.log"}
```

#### Opções de log de atividade (eventos) {#activity-events-logging-options}

As opções de log de Atividade (eventos) permitem configurar como o Semaphore registra ações de usuários e eventos do sistema em um arquivo. Essas configurações controlam o comportamento do log de eventos, incluindo se ele está habilitado, o formato dos registros de log e configurações específicas do logger. Quando habilitado, ações de usuários como criar templates ou gerenciar equipes serão gravadas no arquivo de log especificado de acordo com essas configurações.

| Parâmetro             | Variáveis de ambiente | Descrição             |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_EVENT_LOG_ENABLED` | Habilita o log de eventos em arquivo. |
| `format`              | `SEMAPHORE_EVENT_LOG_FORMAT`  | Formato do registro de log. Deixe vazio para o formato raw ou defina como `json`. |
| `logger`              | `SEMAPHORE_EVENT_LOGGER`      | [Opções do logger](#logger-options). |

#### Opções de log de tarefas {#tasks-logging-options}

As opções de log de Tarefas permitem configurar como o Semaphore registra os detalhes da execução de tarefas em um arquivo. Essas configurações controlam o registro de eventos relacionados a tarefas, incluindo início, conclusão e status de execução das tarefas. Quando habilitado, todas as operações de tarefas e seus resultados serão gravados no arquivo de log especificado de acordo com essas configurações, fornecendo uma trilha de auditoria detalhada do histórico de execução de tarefas.

| Parâmetro             | Variáveis de ambiente | Descrição             |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_TASK_LOG_ENABLED` | Habilita o log de tarefas em arquivo. |
| `format`              | `SEMAPHORE_TASK_LOG_FORMAT`  | Formato do registro de log. Deixe vazio para o formato raw ou defina como `json`. |
| `logger`              | `SEMAPHORE_TASK_LOGGER`      | [Opções do logger](#logger-options). |
| `result_logger`       | `SEMAPHORE_TASK_RESULT_LOGGER`  | Opções do logger. |



#### Opções do logger {#logger-options}

| Parâmetro             | Tipo    | Descrição             |
| --------------------- | ------- | --------------------- |
| `filename`     | String  | Caminho e nome do arquivo em que os logs serão gravados. Os arquivos de log de backup serão mantidos no mesmo diretório.  Se vazio, usa `processname`-lumberjack.log no diretório temporário. |
| `maxsize`      | Integer | Tamanho máximo, em megabytes, do arquivo de log antes de ser rotacionado. O padrão é 100 megabytes. |
| `maxage`       | Integer | Número máximo de dias para manter arquivos de log antigos, com base no timestamp codificado no nome do arquivo.  Observe que um dia é definido como 24 horas e pode não corresponder exatamente a dias do calendário devido ao horário de verão, segundos intercalares etc. Por padrão, arquivos de log antigos não são removidos com base na idade. |
| `maxbackups`   | Integer | Número máximo de arquivos de log antigos a manter.  O padrão é manter todos os arquivos de log antigos (embora MaxAge ainda possa fazer com que sejam excluídos). |
| `localtime`    | Boolean | Determina se o horário usado para formatar os timestamps nos arquivos de backup é o horário local do computador.  O padrão é usar o horário UTC. |
| `compress`     | Boolean | Determina se os arquivos de log rotacionados devem ser compactados com gzip. O padrão é não compactar. |



Cada linha do arquivo segue este formato:

```
2024-01-03 12:00:34 user=234234 object=template action=delete
```

---

## Histórico de tarefas {#task-history}

O Semaphore armazena informações sobre a execução de tarefas no banco de dados. O histórico de tarefas fornece uma visão detalhada de todas as tarefas executadas, incluindo status e logs. Você pode monitorar tarefas em tempo real ou revisar logs históricos pela interface web.

### Configurando a retenção de tarefas {#configuring-task-retention}

Por padrão, o Semaphore armazena todas as tarefas no banco de dados. Se você executa um grande número de tarefas, elas podem ocupar um espaço em disco significativo.

Você pode configurar quantas tarefas são mantidas por template usando uma das seguintes abordagens:

1. **Variável de ambiente**  
   ```bash
   SEMAPHORE_MAX_TASKS_PER_TEMPLATE=30
   ```
2. **Opção no `config.json`**  
   ```json
   {
     "max_tasks_per_template": 30
   }
   ```

Quando o número de tarefas excede esse limite, os Logs de Tarefas mais antigos são excluídos automaticamente.

---

## Suporte ao protocolo syslog <Enterprise /> {#syslog-protocol-support}

O Semaphore pode encaminhar entradas de log de atividade e de tarefas para um coletor syslog externo, para armazenamento de longo prazo ou monitoramento centralizado. O encaminhamento via syslog é desabilitado por padrão.

Configure o suporte a syslog no `config.json`:

```json
"syslog": {
  "enabled": true,
  "network": "udp",
  "address": "logs.example.com:514",
  "tag": "semaphore"
}
```

As mesmas opções estão disponíveis por meio de variáveis de ambiente, caso você prefira não editar o arquivo JSON:

```bash
SEMAPHORE_SYSLOG_ENABLED=true
SEMAPHORE_SYSLOG_NETWORK=udp
SEMAPHORE_SYSLOG_ADDRESS=logs.example.com:514
SEMAPHORE_SYSLOG_TAG=semaphore
```

#### Opções de syslog {#syslog-options}

| Parâmetro             | Variáveis de ambiente | Descrição             |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_SYSLOG_ENABLED` | Ativa ou desativa o encaminhamento via syslog. |
| `network`              | `SEMAPHORE_SYSLOG_NETWORK`  | Protocolo usado para alcançar o coletor, como `udp` ou `tcp`. |
| `address`              | `SEMAPHORE_SYSLOG_ADDRESS`  | Endereço do coletor no formato `host:port`. |
| `tag`              | `SEMAPHORE_SYSLOG_TAG`  | Identificador opcional adicionado ao início de cada mensagem. |


Reinicie o serviço do Semaphore após alterar esses valores para que o novo destino syslog seja aplicado.

---

## Integração com SIEM <Enterprise /> {#siem-integration}

O Semaphore 2.20+ registra uma trilha de auditoria de segurança adequada para encaminhamento a um SIEM (Splunk, Elastic Security, QRadar, Wazuh etc.).

Cada evento de auditoria inclui a **ação** (`create`, `update`, `delete`, `login_success`, `login_fail`, `logout`), o **endereço IP do cliente** e o **user agent**, além do usuário que executou a ação e do objeto afetado. Além das alterações em recursos, o Semaphore registra:

- Logins bem-sucedidos (senha, LDAP e OpenID), logouts, tentativas de login malsucedidas e verificações de MFA malsucedidas.
- Criação, atualização e exclusão de contas de usuário e alterações de senha.
- Criação e exclusão de tokens de API (apenas o prefixo curto do token é registrado, nunca o segredo).

Há três maneiras de entregar eventos de auditoria ao seu SIEM:

1. **Pull:** leia `/api/events` (consulte a [documentação da API](/reference/api)).
2. **Coletor de arquivos:** habilite o arquivo do Log de Atividade (Pro, veja acima) e envie o `events.log` (formato JSON recomendado) com Filebeat, Fluentd ou um Splunk Universal Forwarder.
3. **Webhook de auditoria (Pro):** envie eventos em tempo real via HTTPS — um endpoint JSON genérico ou o Splunk HTTP Event Collector.

### Webhook de auditoria {#audit-webhook}

```json
{
  "log": {
    "audit_webhook": {
      "enabled": true,
      "url": "https://splunk.example.com:8088/services/collector/event",
      "format": "splunk_hec",
      "headers": {
        "Authorization": "Splunk <your-hec-token>"
      }
    }
  }
}
```

Ou usando variáveis de ambiente:

```bash
SEMAPHORE_AUDIT_WEBHOOK_ENABLED=true
SEMAPHORE_AUDIT_WEBHOOK_URL=https://splunk.example.com:8088/services/collector/event
SEMAPHORE_AUDIT_WEBHOOK_FORMAT=splunk_hec
```

#### Opções do webhook de auditoria {#audit-webhook-options}

| Parâmetro             | Variáveis de ambiente | Descrição             |
| --------------------- | --------------------- | --------------------- |
| `enabled`             | `SEMAPHORE_AUDIT_WEBHOOK_ENABLED` | Ativa ou desativa o encaminhamento de eventos de auditoria. |
| `url`                 | `SEMAPHORE_AUDIT_WEBHOOK_URL`  | URL completa do endpoint receptor. |
| `format`              | `SEMAPHORE_AUDIT_WEBHOOK_FORMAT`  | Formato do payload: vazio para JSON simples ou `splunk_hec` para um envelope Splunk HEC. |
| `headers`             | `SEMAPHORE_AUDIT_WEBHOOK_HEADERS`  | Cabeçalhos HTTP extras, por exemplo, o token HEC: `{"Authorization": "Splunk <token>"}`. |

A entrega é assíncrona: os eventos são enfileirados em memória e reenviados até três vezes com backoff, de modo que um receptor indisponível nunca atrasa nem faz falhar as requisições dos usuários. Se o receptor permanecer indisponível, os eventos enfileirados são descartados com um aviso no log do servidor.

## Resumo {#summary}

- **Log do servidor:** gravado no stdout; pode ser visualizado com `journalctl` se estiver em execução sob o systemd.  
- **Log de atividade e de tarefas:** registra todas as ações de usuários. Opcionalmente, o **Pro 2.10+** pode gravá-los em um arquivo.  
- **Histórico de tarefas:** armazena logs de execução de tarefas em tempo real e históricos. A retenção é configurável por template.

Seguir essas orientações garante a visibilidade adequada das operações do Semaphore UI, ao mesmo tempo em que controla o uso de armazenamento e a retenção de logs.
