# Istorija

Kartica **History** (Istorija) na kontrolnoj tabli projekta (Project) prikazuje sve zadatke (Tasks) projekta, od najnovijeg. To je podrazumevani prikaz kada otvorite projekat.

![Istorija projekta](/assets/project-dashboard-history.webp)

## Kolone {#columns}

| Kolona | Sadržaj |
|---|---|
| **Task** | Broj zadatka, šablon iz kog je kreiran i commit poruka revizije repozitorijuma koja je korišćena. Ikona sa leve strane prikazuje aplikaciju (Ansible, Terraform, Bash itd.). |
| **Version** | Za [šablone za build i deploy](../task-templates/build-deploy): izgrađena ili isporučena verzija. Za ostale šablone samo ikona statusa. |
| **Status** | Oznaka trenutnog statusa, pogledajte [Statusi zadataka](../tasks#task-statuses). |
| **User** | Ko je pokrenuo zadatak. Zadaci pokrenuti rasporedom (Schedule) ili integracijom (Integration) nemaju korisnika. |
| **Start** | Datum i vreme početka u vremenskoj zoni vašeg pregledača. |
| **Duration** | Koliko dugo se zadatak izvršavao. |

Lista je podeljena na stranice. Kliknite na broj zadatka ili naziv šablona da otvorite [prozor zadatka](../tasks#task-window) sa logom, detaljima i rezimeom. Kliknite na naziv šablona u zaglavlju prozora zadatka da odete na stranicu šablona.

## Čuvanje zadataka {#task-retention}

Podrazumevano se svi zadaci i njihovi logovi čuvaju zauvek. Da biste ograničili istoriju po šablonu, podesite `max_tasks_per_template` u `config.json` ili promenljivu okruženja `SEMAPHORE_MAX_TASKS_PER_TEMPLATE`:

```json
{
  "max_tasks_per_template": 30
}
```

Kada se dostigne ograničenje, najstariji zadaci tog šablona se brišu zajedno sa svojim logovima. Pogledajte [Konfiguracija](/admin-guide/configuration) za potpunu listu opcija.

## Pogledajte i {#see-also}

- [Statistika](./stats): zbirni rezultati zadataka po danima.
- [Aktivnost](./activity): revizorski log promena u projektu.
