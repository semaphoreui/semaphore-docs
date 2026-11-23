---
title: Hosts
description: Do kojih hostova stižu vaši Ansible zadaci, kako je završio zadatak na svakom od njih i gde da gledate kada host otkaže ili do njega nikad ne stigne.
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

Stranica **Hosts** projekta navodi svaki host do kojeg su stigli Ansible zadaci projekta, sa
rezultatom poslednjeg pokretanja na njemu. Otvorite je kada želite da znate koji hostovi otkazuju,
do kojih se ne može doći i koje već duže vreme nijedan zadatak nije dotakao, bez otvaranja logova
zadataka jednog po jednog.

## Kako radi {#how-it-works}

Hostove ne dodajete ručno. Nakon svakog Ansible zadatka Semaphore beleži svaki host iz play-a sa
rezultatom na tom hostu: `ok`, `changed`, `failed` ili `unreachable`. Računaju se zadaci na serveru,
na runnerima i u Docker ili Kubernetes izvršiocima. Zadaci drugih aplikacija, kao što su Terraform
ili Bash, ne dodaju hostove.

Host je njegovo ime iz inventara. `web-01` u dva inventara je jedan host, a `Web-01` je isti host kao
`web-01`. Host do kojeg stižu zadaci više projekata naveden je u svakom projektu sa brojevima tog
projekta. Host ostaje na listi i nakon što izađe iz vašeg inventara, zajedno sa svojom istorijom.

## Pronađite host {#find-a-host}

- **Search** pronalazi hostove po imenu.
- **Failing now** prikazuje hostove čije je poslednje pokretanje otkazalo. **Unreachable** prikazuje
  hostove sa kojima Ansible nije mogao da uspostavi vezu. **Not seen 30 days** prikazuje hostove koje
  nijedan zadatak nije dotakao mesec dana.
- **Template** sužava listu na hostove jednog šablona.

Kliknite na host da otvorite njegovu karticu: kada je prvi put viđen, koliko je imao pokretanja,
koliko od poslednjih 10 pokretanja je otkazalo i zadaci koji su stigli do njega sa rezultatom na tom
hostu. Kliknite na zadatak da otvorite njegov log.

Kartica **Summary** zadatka prikazuje isto za jedno pokretanje: izaberite **All servers** da vidite
svaki host tog zadatka sa njegovim brojačima.

## Šta dalje {#whats-next}

- [Hosts za administratore](/admin-guide/hosts) — svi projekti, broj iz licence i ukidanje hostova.
- [Inventory](/user-guide/inventory) — definišite hostove na kojima se izvršavaju vaši zadaci.
