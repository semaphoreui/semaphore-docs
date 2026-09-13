# Métricas

:::info
O endpoint de métricas está disponível desde a **versão 2.20 do Semaphore**. Se você estiver executando uma versão mais antiga, atualize para usar este recurso.
:::

O Semaphore expõe um endpoint `GET /api/metrics` no formato padrão de exposição em texto do Prometheus, de modo que uma configuração existente de Prometheus + Grafana pode monitorar o servidor sem nenhuma ferramenta externa de polling.

Duas categorias de métricas são expostas:

- **Métricas de processo:** estatísticas do runtime Go e do processo — número de goroutines, memória (heap/residente), tempo de CPU, pausas do GC. Elas vêm gratuitamente dos coletores padrão de Go/processo do Prometheus.
- **Métricas de tarefas**, específicas da carga de trabalho do próprio Semaphore:
  - `semaphore_tasks_running` (gauge): número de tarefas em execução neste exato momento.
  - `semaphore_tasks_total{status}` (counter): total de tarefas concluídas, detalhado por resultado: `success`, `error`, `stopped`.

Ambas são atualizadas em tempo real conforme as tarefas mudam de estado — não há atraso de polling, pois os contadores são atualizados diretamente dentro do executor de tarefas no momento em que o status de uma tarefa realmente muda.

## Habilitando as métricas {#enabling-metrics}

O endpoint é desabilitado por padrão e exige HTTP Basic Auth com uma credencial estática de nível de serviço — não vinculada a nenhuma conta de usuário, já que o Prometheus não consegue fazer login interativo:

```json
{
  "metrics": {
    "enabled": true,
    "username": "prometheus",
    "password": "changeme"
  }
}
```

Ou usando variáveis de ambiente:

```bash
SEMAPHORE_METRICS_ENABLED=true
SEMAPHORE_METRICS_USERNAME=prometheus
SEMAPHORE_METRICS_PASSWORD=changeme
```

### Opções de métricas {#metrics-options}

| Parâmetro  | Variáveis de ambiente          | Descrição    |
| ---------- | ------------------------------ | ------------ |
| `enabled`  | `SEMAPHORE_METRICS_ENABLED`    | Ativa ou desativa o endpoint `/api/metrics`. Desabilitado por padrão. |
| `username` | `SEMAPHORE_METRICS_USERNAME`   | Nome de usuário do Basic Auth necessário para coletar o endpoint. |
| `password` | `SEMAPHORE_METRICS_PASSWORD`   | Senha do Basic Auth necessária para coletar o endpoint (sensível). |

Se `enabled` for mantido como `false` (o padrão), ou se as credenciais estiverem ausentes ou incorretas, toda requisição a `/api/metrics` retorna `401 Unauthorized`.

## Coletando com o Prometheus {#scraping-with-prometheus}

Configure um job de scrape com `basic_auth` usando as credenciais acima:

```yaml
scrape_configs:
  - job_name: semaphore
    metrics_path: /api/metrics
    basic_auth:
      username: prometheus
      password: changeme
    static_configs:
      - targets: ["<semaphore-host>:3000"]
```

## Visualizando métricas no Grafana {#viewing-metrics-in-grafana}

A visualização **Explore** do Grafana permite executar qualquer consulta PromQL diretamente sobre as métricas e ver os resultados brutos, sem precisar criar um dashboard antes:

![Grafana Explore exibindo métricas coletadas do Semaphore](/assets/semaphore-grafana-explore.png)

Um dashboard pode então ser construído sobre as mesmas métricas — este exemplo cobre as duas categorias com quatro painéis: tarefas em execução, total de tarefas por resultado, goroutines e memória residente do processo.

![Dashboard do Grafana com painéis do Semaphore](/assets/semaphore-grafana-dashboard.png)
