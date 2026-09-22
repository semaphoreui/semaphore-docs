---
title: Obaveštenja
description: Kartica Obaveštenja projekta, gde se uključuju serverski kanali i gde se imenovana obaveštenja projekta kreiraju, testiraju i vezuju za šablone i rasporede.
---

# Obaveštenja

Kartica **Obaveštenja** projekta odlučuje gde se prijavljuju rezultati zadataka. Ima dva dela:

- **Serverski kanali** su provajderi obaveštenja koje je administrator podesio na serveru u `config.json`, pogledajte [Obaveštenja](/admin-guide/notifications). Dele ih svi projekti, a svaki projekat odlučuje da li ih koristi.
- **Obaveštenja projekta** su imenovana odredišta koja pripadaju projektu: Telegram ćaskanje, Slack webhook, lista e-mail adresa i tako dalje. Šabloni i rasporedi biraju koja obaveštenja šalju.

Oba dela mogu da se koriste istovremeno.

![Kartica Obaveštenja projekta](/assets/alerts-page.webp)

## Serverski kanali {#server-channels}

Kartica na vrhu stranice prikazuje kanale podešene na serveru. Uključite **Šalji obaveštenja ovog projekta na serverske kanale** da biste preko njih primali svaki rezultat zadatka ovog projekta. To je isti prekidač koji se u starijim verzijama zvao **Allow alerts for this project** u podešavanjima projekta.

Telegram se prikazuje čim server ima token bota, zasivljen dok ćaskanje nije poznato. Kliknite na čip da biste uneli **Telegram Chat ID** ovog projekta; on prepisuje serversko ćaskanje i obavezan je kada ga server nema.

Serverski kanali prijavljuju svaki bitan status: uspeh, grešku i *čekanje potvrde*. E-mail prijavljuje samo greške. Šablon i dalje može da potisne obaveštenja o uspehu ili grešci, pogledajte [Obaveštenja šablona](#template-alerts).

![Kartica serverskih kanala sa otvorenim Telegram chat ID-jem](/assets/alerts-server-channels.webp)

## Obaveštenja projekta {#project-alerts}

![Meni Novo obaveštenje](/assets/alerts-new-menu.webp)

Pritisnite **Novo obaveštenje** da biste kreirali odredište. Svako obaveštenje ima:

| Polje | Opis |
|---|---|
| **Naziv** | Prikazuje se u formama šablona i rasporeda. Jedinstven unutar projekta. |
| **Tip** | Kanal: Telegram, Slack, Email, Microsoft Teams, Rocket.Chat, DingTalk ili Gotify. Forma prikazuje polja odredišta koja kanal zahteva. |
| **Odredište** | ID ćaskanja i opcioni forum-topik za Telegram; webhook URL za Slack, Teams, Rocket.Chat i DingTalk; URL servera za Gotify; primaoci za e-mail (ostavite prazno da biste obavestili članove projekta koji su uključili obaveštenja u profilu). |
| **Tajna** | Telegram, Gotify i e-mail zahtevaju tajnu: token bota, token aplikacije, SMTP kredencijale. *Koristi podešavanja servera* je uzima iz konfiguracije servera; *Koristi moju* je uzima iz pristupnog ključa u Skladištu ključeva (tip *Tajni token* za tokene, *Prijava lozinkom* za SMTP). E-mail obaveštenje sa sopstvenim kredencijalima može da podesi i sopstveni SMTP host, port, pošiljaoca i šifrovanje. |
| **Šalji pri** | Događaji na koje obaveštenje reaguje: uspeh, greška, čekanje potvrde. Nova obaveštenja počinju sa podrazumevanim vrednostima kanala. |
| **Podrazumevano u projektu** | Označava obaveštenje kao jedno od podrazumevanih u projektu. Šalje ga svaki šablon koji koristi podrazumevana podešavanja projekta. |
| **Uključeno** | Isključeno obaveštenje se nikada ne šalje i nije podrazumevano u projektu. |
| **Šablon poruke** | Opcioni Go šablon za telo poruke. Ostavite ugrađeni tekst da biste pratili buduće nadogradnje servera. |

Tajne se nikada ne čuvaju na obaveštenju: nalaze se šifrovane u Skladištu ključeva, a ključ ne može da se obriše dok ga obaveštenje koristi. Kada server nema podešen token bota, SMTP server ili Gotify par, forma nudi samo *Koristi moju*. Webhook URL-ovi moraju da koriste `http` ili `https` i ne smeju da pokazuju na sam server.

Koristite **Pošalji test poruku** u listi da biste proverili jedno obaveštenje i **Testiraj sve** u traci sa alatkama da biste poslali test na svako uključeno odredište projekta, uključujući serverske kanale.

Obaveštenje vezano za šablon ili raspored ne može da se obriše. Dijalog prikazuje objekte koji ga koriste.

![Telegram obaveštenje sa sopstvenim tokenom bota](/assets/alert-form-telegram.webp)

![E-mail obaveštenje sa sopstvenim SMTP serverom](/assets/alert-form-email.webp)

### Šabloni poruka {#message-templates}

Telo je Go `text/template` (`html/template` za e-mail). Dostupna polja su:

| Polje | Vrednost |
|---|---|
| `.Name` | Naziv šablona |
| `.Author` | Ime korisnika koji je pokrenuo zadatak, ili `—` |
| `.Project.Name`, `.Project.ID` | Projekat |
| `.Playbook` | Playbook ili skripta šablona |
| `.ScheduleName` | Naziv rasporeda koji je pokrenuo zadatak, ako postoji |
| `.Task.ID`, `.Task.URL` | Broj zadatka i link ka njegovom logu |
| `.Task.Result` | Status sa ikonom, na primer `✅ SUCCESS` |
| `.Task.Desc` | Poruka uneta pri pokretanju zadatka |
| `.Task.Version` | Verzija build-a, ili dolazna verzija build-a za deploy zadatke |
| `.Task.Duration` | Vreme izvršavanja, prazno dok zadatak ne počne |
| `.Task.Trigger` | `manual`, `schedule`, `integration` ili `api` |
| `.Color` | Boja priloga za Slack i Rocket.Chat |

Za kanale za ćaskanje renderovani tekst mora da bude JSON dokument koji mesindžer očekuje; ugrađeni šablon je dobra polazna tačka. Telegram tela su običan tekst sa HTML formatiranjem; ćaskanje i topik dodaje Semaphore.

## Obaveštenja šablona {#template-alerts}

U odeljku **Napredno** šablona zadatka, **Obaveštenja** bira između:

- **Koristi podrazumevana podešavanja projekta** — serverski kanali, kada su uključeni za projekat, plus obaveštenja označena kao podrazumevana u projektu. Postojeći šabloni zadržavaju ovo ponašanje posle nadogradnje.
- **Koristi prilagođeni skup obaveštenja** — samo izabrana obaveštenja. Prazan izbor znači da šablon ništa ne šalje.

**Potisni obaveštenja o uspehu** i **Potisni obaveštenja o grešci** važe za oba izbora. Obaveštenja o zadatku koji čeka potvrdu se nikada ne potiskuju.

![Šablon zadatka sa prilagođenim skupom obaveštenja](/assets/template-form-alerts.webp)

## Obaveštenja rasporeda {#schedule-alerts}

Raspored može da **koristi obaveštenja šablona** ili da **koristi drugačiji skup obaveštenja**. Drugi izbor u potpunosti zamenjuje izbor šablona za zadatke pokrenute tim rasporedom, pa noćni posao može da prijavljuje dežurnom kanalu dok ručna pokretanja ostaju tiha.

![Raspored sa sopstvenim skupom obaveštenja](/assets/schedule-form-alerts.webp)

## Kako se zadatak usmerava {#how-a-task-is-routed}

Odredišta zadatka se fiksiraju pri njegovom kreiranju. Izmena obaveštenja, šablona ili rasporeda dok se zadatak izvršava ne menja gde taj zadatak prijavljuje. Svaka isporuka se beleži po zadatku, odredištu i događaju, pa u okruženju visoke dostupnosti svaku poruku šalje samo jedan serverski čvor.

## Rezervne kopije {#backups}

Obaveštenja projekta su deo [rezervne kopije projekta](./projects/settings#danger-zone). Šabloni i rasporedi ih referenciraju po nazivu, pa vraćeni projekat zadržava veze. Obaveštenja referenciraju svoj pristupni ključ po nazivu; kao i kod svakog ključa, sama vrednost tajne se ne izvozi.
