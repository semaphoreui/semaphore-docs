---
title: Vodič za administratore
description: Za administratore koji instaliraju, konfigurišu, obezbeđuju i održavaju Semaphore server za svoje timove.
---

# Vodič za administratore

Ovaj odeljak je namenjen administratorima koji instaliraju i održavaju Semaphore
za druge ljude. Za sve što je ovde opisano potreban je pristup samom serveru:
konfiguracionoj datoteci, promenljivama okruženja, komandnoj liniji ili mašini na
kojoj Semaphore radi. Rad unutar projekta kroz veb interfejs opisan je u
[Vodiču za korisnike](/user-guide).

Semaphore je jedan Go binarni fajl sa veb interfejsom i REST API-jem. Podatke
čuva u SQLite, MySQL ili PostgreSQL bazi, kredencijale drži šifrovane, a zadatke
izvršava ili na samom serveru ili na zasebnim runnerima. Ispravna instalacija se
zato svodi na četiri odluke: kako ga instalirati, gde se nalazi baza podataka,
kako se korisnici prijavljuju i gde se zadaci izvršavaju.

## Podešavanje {#set-up}

Sve što konfigurišete pre pokretanja servera ili u vezi sa njim.

| Stranica | Šta obuhvata |
|---|---|
| [Instalacija](/admin-guide/installation) | Menadžer paketa, Docker, binarni fajl, Kubernetes i ručno podešavanje. |
| [Konfiguracija](/admin-guide/configuration) | Datoteka `config.json`, promenljive okruženja i sve podržane opcije. |
| [Nadogradnja](/admin-guide/upgrading) | Prelazak na noviju verziju i šta prvo proveriti. |
| [Obrnuti proksi](/admin-guide/reverse-proxy) | Serviranje Semaphore-a iza nginx-a, Apache-a ili Caddy-ja, uz TLS. |
| [Bezbednost](/admin-guide/security) | Heširanje lozinki, šifrovanje tajni, ojačavanje mreže i JWT-ovi zadataka. |
| [Autentifikacija](/admin-guide/authentication) | Lokalni nalozi i dvofaktorska autentifikacija, LDAP i Active Directory, i jedinstvena prijava preko dvanaest OpenID Connect provajdera. |
| [Runneri](/admin-guide/runners) | Izvršavanje zadataka na mašinama koje nisu server. |
| [Visoka dostupnost](/admin-guide/ha) | Pokretanje više Semaphore čvorova nad jednom bazom podataka. |

## Rad sa serverom {#operate}

Sve što radite na serveru koji je već pokrenut.

| Stranica | Šta obuhvata |
|---|---|
| [CLI](/reference/cli) | Upravljanje korisnicima, projektima, vaultovima, runnerima i migracijama baze podataka iz komandne linije. |
| [API](/reference/api) | Autentifikacija tokenom i programsko upravljanje Semaphore-om. |
| [CI/CD integracija](/admin-guide/cicd) | Pokretanje Semaphore zadataka iz spoljnog pipeline-a. |
| [Logovi](/admin-guide/logs) | Logovi servera, logovi zadataka i njihovo prosleđivanje drugim sistemima. |
| [Metrike](/admin-guide/metrics) | Prometheus endpoint i metrike koje izlaže. |
| [Obaveštenja](/admin-guide/notifications) | Kanali za isporuku upozorenja: e-pošta, Telegram, Slack i drugi. |
| [Licenca](/admin-guide/license) | Aktivacija Pro ili Enterprise pretplate. |

## Odakle početi {#where-to-start}

Ako Semaphore instalirate prvi put, pročitajte
[Instalaciju](/admin-guide/installation) i izaberite jedan metod, a zatim
[Konfiguraciju](/admin-guide/configuration) da biste saznali kako se opcije
zadaju. Postavite server iza [obrnutog proksija](/admin-guide/reverse-proxy) sa
TLS-om pre nego što ga bilo ko drugi počne koristiti.

Da biste videli šta donosi plaćena pretplata, pogledajte [Izdanja](/editions).
