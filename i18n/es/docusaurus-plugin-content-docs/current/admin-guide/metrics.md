# Métricas

:::info
El endpoint de métricas está disponible desde **Semaphore versión 2.20**. Si ejecuta una versión anterior, actualice para usar esta funcionalidad.
:::

Semaphore expone un endpoint `GET /api/metrics` en el formato de exposición de texto estándar de Prometheus, de modo que una instalación existente de Prometheus + Grafana pueda supervisar el servidor sin ninguna herramienta externa de sondeo.

Se exponen dos categorías de métricas:

- **Métricas de proceso:** estadísticas del runtime de Go y del proceso: número de goroutines, memoria (heap/residente), tiempo de CPU, pausas del GC. Se obtienen sin coste adicional a partir de los colectores estándar de Go/proceso de Prometheus.
- **Métricas de tareas**, específicas de la carga de trabajo propia de Semaphore:
  - `semaphore_tasks_running` (gauge): número de tareas que se están ejecutando en este momento.
  - `semaphore_tasks_total{status}` (counter): total de tareas finalizadas, desglosado por resultado: `success`, `error`, `stopped`.

Ambas se actualizan en tiempo real a medida que las tareas cambian de estado; no hay retraso de sondeo, ya que los contadores se actualizan directamente dentro del ejecutor de tareas en el momento en que el estado de una tarea cambia realmente.

## Habilitar las métricas {#enabling-metrics}

El endpoint está deshabilitado de forma predeterminada y requiere HTTP Basic Auth con una credencial estática a nivel de servicio, no vinculada a ninguna cuenta de usuario, ya que Prometheus no puede realizar un inicio de sesión interactivo:

```json
{
  "metrics": {
    "enabled": true,
    "username": "prometheus",
    "password": "changeme"
  }
}
```

O mediante variables de entorno:

```bash
SEMAPHORE_METRICS_ENABLED=true
SEMAPHORE_METRICS_USERNAME=prometheus
SEMAPHORE_METRICS_PASSWORD=changeme
```

### Opciones de métricas {#metrics-options}

| Parámetro  | Variables de entorno         | Descripción |
| ---------- | ------------------------------ | ------------ |
| `enabled`  | `SEMAPHORE_METRICS_ENABLED`    | Activa o desactiva el endpoint `/api/metrics`. Deshabilitado de forma predeterminada. |
| `username` | `SEMAPHORE_METRICS_USERNAME`   | Nombre de usuario de Basic Auth necesario para consultar el endpoint. |
| `password` | `SEMAPHORE_METRICS_PASSWORD`   | Contraseña de Basic Auth necesaria para consultar el endpoint (dato sensible). |

Si `enabled` se deja en `false` (el valor predeterminado), o si las credenciales faltan o son incorrectas, toda petición a `/api/metrics` devuelve `401 Unauthorized`.

## Recopilación con Prometheus {#scraping-with-prometheus}

Configure un trabajo de scraping con `basic_auth` usando las credenciales anteriores:

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

## Ver las métricas en Grafana {#viewing-metrics-in-grafana}

La vista **Explore** de Grafana permite ejecutar cualquier consulta PromQL directamente sobre las métricas y ver los resultados sin procesar, sin necesidad de crear primero un panel:

![Grafana Explore mostrando las métricas de Semaphore recopiladas](/assets/semaphore-grafana-explore.png)

Después se puede construir un panel sobre esas mismas métricas; este ejemplo cubre ambas categorías con cuatro paneles: tareas en ejecución, total de tareas por resultado, goroutines y memoria residente del proceso.

![Panel de Grafana con paneles de Semaphore](/assets/semaphore-grafana-dashboard.png)
