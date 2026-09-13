---
title: Obaveštenja
description: Kako Semaphore isporučuje upozorenja o zadacima, koje kanale podržava i koja dva prekidača moraju biti uključena da bi se išta poslalo.
---

# Obaveštenja

Semaphore prijavljuje rezultate zadataka u chat i na e-poštu. Kanal se konfiguriše
jednom na serveru, u `config.json` ili preko promenljivih okruženja, i zatim važi
za svaki projekat. To koji zadaci proizvode upozorenje odlučuje se po projektu i po
šablonu u veb interfejsu.

## Kako isporuka funkcioniše {#how-delivery-works}

Tri podešavanja odlučuju da li se poruka šalje i sva tri moraju to da dozvole:

1. **Kanal je konfigurisan na serveru.** Svaki provajder ima sopstvene ključeve u
   datoteci `config.json`. Pogledajte stranicu tog provajdera u nastavku.
2. **Projekat dozvoljava upozorenja.** *Allow alerts for this project* u
   [podešavanjima projekta](/user-guide/projects/settings) je glavni prekidač. Kada
   je isključen, nijedan kanal ne šalje ništa o tom projektu.
3. **Šablon to traži.** Šablon zadatka bira da li šalje upozorenje pri uspehu, pri
   grešci ili nikako, pogledajte [Šablone zadataka](/user-guide/task-templates).

Koristite **Test alerts** u podešavanjima projekta da biste poslali testnu poruku
kroz svaki konfigurisani kanal bez pokretanja zadatka.

## Kanali {#channels}

| Kanal | Stranica |
|---|---|
| E-pošta (SMTP) | [E-pošta](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

Više kanala može biti uključeno istovremeno; svaki od njih prima svako upozorenje
koje prođe tri provere iznad.

## Prilagođavanja po projektu {#per-project-overrides}

Telegram podržava chat po projektu: podesite **Telegram Chat ID** u
[podešavanjima projekta](/user-guide/projects/settings) da biste upozorenja jednog
projekta usmerili u drugi chat umesto u onaj koji važi za ceo server. Ostali kanali
za sve projekte koriste konfiguraciju servera.

## Odakle početi {#where-to-start}

Prvo konfigurišite jedan kanal, uključite *Allow alerts for this project* i
pritisnite **Test alerts**. Kada testna poruka stigne, uključite upozorenja na
šablonima koji su vam važni.
