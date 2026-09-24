---
title: Vodič za korisnike
description: "Za inženjere koji rade unutar Semaphore projekta: resursi, šabloni zadataka, zadaci, rasporedi i pristup tima."
---

# Vodič za korisnike

Ovaj odeljak je namenjen ljudima koji već imaju pristup Semaphore projektu. Sve
što je ovde opisano dešava se u veb interfejsu ili kroz API projekta. Instalacija
servera, njegova konfiguracija i povezivanje sa provajderom identiteta opisani su
u [Vodiču za administratore](/admin-guide).

Rad u Semaphore-u prati jedan lanac. **Projekat** sadrži sve ostalo. Unutar njega
registrujete resurse koji su potrebni za izvršavanje: **repozitorijum** sa vašim
playbook-ovima ili skriptama, **ključeve** kojima se povezujete na njega i na svoje
hostove, **inventar** ciljnih mašina i **grupe promenljivih** sa vrednostima i
tajnama. **Šablon zadatka** to spaja u definiciju onoga što se pokreće, a svako
pokretanje tog šablona je **zadatak**. Rasporedi, tokovi rada i dolazni webhook-ovi
pokreću šablone umesto vas.

## Podešavanje projekta {#set-up-a-project}

Ovim redosledom, jer svaki korak zavisi od prethodnog.

| Stranica | Šta obuhvata |
|---|---|
| [Projekti](/user-guide/projects) | Kreiranje projekta, odeljci u bočnoj traci, rezervna kopija i vraćanje podataka. |
| [Timovi](/user-guide/team) | Četiri ugrađene uloge i prilagođene uloge u izdanju Enterprise. |
| [Skladište ključeva](/user-guide/key-store) | SSH ključevi, prijave i spoljna skladišta tajni. |
| [Repozitorijumi](/user-guide/repositories) | Git repozitorijumi i lokalne putanje koje sadrže vašu automatizaciju. |
| [Host config](/user-guide/host-config) | Pristupni podaci za Git hostove i URL-ove repozitorijuma koje ključ repozitorijuma ne pokriva: podmoduli, Galaxy uloge, Terraform moduli. |
| [Inventar](/user-guide/inventory) | Hostovi i podešavanja veze za Ansible, radni prostori za Terraform. |
| [Grupe promenljivih](/user-guide/environment) | Promenljive i tajne koje se prosleđuju zadacima i mogu se ponovo koristiti. |

## Definisanje i izvršavanje posla {#define-and-run-work}

| Stranica | Šta obuhvata |
|---|---|
| [Šabloni zadataka](/user-guide/task-templates) | Svako polje forme šablona, kao i tipovi šablona. |
| [Aplikacije](/user-guide/apps) | Šta svaka aplikacija pokreće: Ansible, Terraform, OpenTofu, Terragrunt i skripte. |
| [Zadaci](/user-guide/tasks) | Pokretanje zadatka, statusi zadataka, logovi, zaustavljanje i ponovno pokretanje. |
| [Rasporedi](/user-guide/schedules) | Pokretanje šablona po cron rasporedu. |
| [Tokovi rada](/user-guide/workflows) | Povezivanje šablona u lanac uz odobrenja i grananje. |
| [Integracije](/user-guide/integrations) | Pokretanje zadataka pomoću dolaznih webhook-ova. |
| [Runneri projekta](/user-guide/projects/runners) | Slanje zadataka projekta na vaše sopstvene runnere. |
| [Vaš nalog](/user-guide/account) | Lična podešavanja i API tokeni. |

## Odakle početi {#where-to-start}

Ako vas je neko upravo dodao u projekat, pročitajte [Projekte](/user-guide/projects)
da biste se snašli, a zatim [Zadatke](/user-guide/tasks) da pokrenete jedan zadatak
i pročitate njegov log. Ako projekat postavljate od nule, pratite tabelu iznad redom.

Potpuno ste novi u Semaphore-u? Počnite sa [Prvim koracima](/getting-started).
