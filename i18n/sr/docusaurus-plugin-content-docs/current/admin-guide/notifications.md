---
title: Obaveštenja
description: Kako Semaphore isporučuje obaveštenja o zadacima, koje kanale podržava i kako se serverski kanali odnose prema obaveštenjima po projektu.
---

# Obaveštenja

Semaphore prijavljuje rezultate zadataka u ćaskanja i e-poštom na dva načina:

- **Serverski kanali** se podešavaju jednom na serveru, u `config.json` ili preko promenljivih
  okruženja, i dostupni su svakom projektu. Ova stranica ih opisuje.
- **Obaveštenja projekta** su imenovana odredišta koja članovi projekta kreiraju na kartici
  [Obaveštenja](/user-guide/alerts) projekta, sa sopstvenim ćaskanjem, webhook-om ili
  primaocima, i vezuju za šablone i rasporede.

## Kako funkcioniše isporuka {#how-delivery-works}

Za serverski kanal tri podešavanja odlučuju da li se poruka šalje, i sva tri moraju to da dozvole:

1. **Kanal je podešen na serveru.** Svaki provajder ima sopstvene ključeve u `config.json`.
   Pogledajte stranicu tog provajdera ispod.
2. **Projekat koristi serverske kanale.** *Šalji obaveštenja ovog projekta na serverske kanale*
   na kartici [Obaveštenja](/user-guide/alerts#server-channels) projekta je glavni
   prekidač. Ako je isključen, serverski kanali ne šalju ništa o tom projektu. Obaveštenja
   projekta ne zavise od ovog prekidača.
3. **Šablon to traži.** Šablon koji koristi *podrazumevana podešavanja projekta* šalje na
   serverske kanale; šablon sa prilagođenom listom obaveštenja ne šalje. Šabloni takođe mogu da
   potisnu obaveštenja o uspehu ili grešci, pogledajte [Šablone zadataka](/user-guide/task-templates).

Kanali za ćaskanje prijavljuju uspeh, grešku i zadatke koji čekaju potvrdu; e-mail prijavljuje
samo greške. Obaveštenja projekta mogu da prepišu događaje po odredištu.

Koristite **Testiraj sve** na kartici Obaveštenja da biste poslali test poruku kroz svaki
serverski kanal i svako uključeno obaveštenje projekta bez pokretanja zadatka.

## Kanali {#channels}

| Kanal | Stranica |
|---|---|
| E-pošta (SMTP) | [Email](/admin-guide/notifications/email) |
| Telegram | [Telegram](/admin-guide/notifications/telegram) |
| Slack | [Slack](/admin-guide/notifications/slack) |
| Microsoft Teams | [Teams](/admin-guide/notifications/teams) |
| Rocket.Chat | [Rocket.Chat](/admin-guide/notifications/rocket) |
| DingTalk | [DingTalk](/admin-guide/notifications/ding) |
| Gotify | [Gotify](/admin-guide/notifications/gotify) |

Više kanala može biti uključeno istovremeno; svaki prima svako obaveštenje koje prođe tri
provere iznad. Isti provajderi su dostupni za obaveštenja projekta; e-mail i Telegram obaveštenja
projekta ponovo koriste SMTP server i token bota iz konfiguracije servera, a Gotify obaveštenje
projekta bez sopstvenog URL-a i tokena ponovo koristi serverski par.

## Prepisivanja po projektu {#per-project-overrides}

Telegram podržava ćaskanje po projektu: podesite **Telegram Chat ID** na kartici
[Obaveštenja](/user-guide/alerts#server-channels) projekta da biste poruke serverskih
kanala jednog projekta usmerili u ćaskanje različito od serverskog. Za bilo koje drugo odredište
po projektu kreirajte [obaveštenje projekta](/user-guide/alerts#project-alerts).

## Odakle početi {#where-to-start}

Prvo podesite jedan kanal, otvorite karticu Obaveštenja projekta, uključite *Šalji obaveštenja
ovog projekta na serverske kanale* i pritisnite **Testiraj sve**. Kada stigne test poruka,
prilagodite šablone koji su vam važni.
