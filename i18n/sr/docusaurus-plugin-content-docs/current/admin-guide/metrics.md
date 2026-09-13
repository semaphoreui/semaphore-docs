# Metrike

:::info
Krajnja tačka za metrike dostupna je od **Semaphore verzije 2.20**. Ako koristite stariju verziju, nadogradite je da biste koristili ovu funkciju.
:::

Semaphore izlaže krajnju tačku `GET /api/metrics` u standardnom Prometheus tekstualnom formatu, tako da postojeća Prometheus + Grafana postavka može da nadzire server bez ikakvog spoljnog alata za prozivanje.

Izlažu se dve kategorije metrika:

- **Metrike procesa:** statistika Go runtime-a i procesa — broj gorutina, memorija (heap/rezidentna), CPU vreme, GC pauze. One dolaze besplatno iz standardnih Prometheus kolektora za Go/procese.
- **Metrike zadataka**, specifične za sopstveno opterećenje Semaphore-a:
  - `semaphore_tasks_running` (gauge): broj zadataka koji se trenutno izvršavaju, u ovom trenutku.
  - `semaphore_tasks_total{status}` (counter): ukupan broj završenih zadataka, razvrstan po ishodu: `success`, `error`, `stopped`.

Obe se ažuriraju u realnom vremenu kako zadaci menjaju stanje — nema kašnjenja zbog prozivanja, jer se brojači ažuriraju direktno unutar izvršioca zadataka u trenutku kada se status zadatka zaista promeni.

## Uključivanje metrika {#enabling-metrics}

Krajnja tačka je podrazumevano isključena i zahteva HTTP Basic Auth sa statičkim, servisnim kredencijalom — koji nije vezan ni za jedan korisnički nalog, jer Prometheus ne može da obavi interaktivnu prijavu:

```json
{
  "metrics": {
    "enabled": true,
    "username": "prometheus",
    "password": "changeme"
  }
}
```

Ili pomoću promenljivih okruženja:

```bash
SEMAPHORE_METRICS_ENABLED=true
SEMAPHORE_METRICS_USERNAME=prometheus
SEMAPHORE_METRICS_PASSWORD=changeme
```

### Opcije metrika {#metrics-options}

| Parametar  | Promenljive okruženja         | Opis |
| ---------- | ------------------------------ | ------------ |
| `enabled`  | `SEMAPHORE_METRICS_ENABLED`    | Uključuje ili isključuje krajnju tačku `/api/metrics`. Podrazumevano isključeno. |
| `username` | `SEMAPHORE_METRICS_USERNAME`   | Basic Auth korisničko ime potrebno za čitanje krajnje tačke. |
| `password` | `SEMAPHORE_METRICS_PASSWORD`   | Basic Auth lozinka potrebna za čitanje krajnje tačke (osetljivo). |

Ako `enabled` ostane `false` (podrazumevano) ili kredencijali nedostaju ili su pogrešni, svaki zahtev ka `/api/metrics` vraća `401 Unauthorized`.

## Prikupljanje pomoću Prometheus-a {#scraping-with-prometheus}

Podesite scrape job sa `basic_auth` koristeći gore navedene kredencijale:

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

## Pregled metrika u Grafani {#viewing-metrics-in-grafana}

Prikaz **Explore** u Grafani omogućava vam da direktno izvršite bilo koji PromQL upit nad metrikama i vidite sirove rezultate, bez prethodnog pravljenja kontrolne table:

![Grafana Explore sa prikupljenim Semaphore metrikama](/assets/semaphore-grafana-explore.png)

Nad istim metrikama zatim se može napraviti kontrolna tabla — ovaj primer pokriva obe kategorije sa četiri panela: zadaci u toku, ukupan broj zadataka po ishodu, gorutine i rezidentna memorija procesa.

![Grafana kontrolna tabla sa Semaphore panelima](/assets/semaphore-grafana-dashboard.png)

