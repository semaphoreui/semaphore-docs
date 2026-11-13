---
title: Keš za autentifikaciju runnera
description: Zašto Semaphore kešira zapise runnera po tokenu, kako HA čvorovi dele keš preko Redis-a, kada se stavke poništavaju i šta se dešava kada Redis otkaže.
---

# Keš za autentifikaciju runnera

Svaki zahtev koji [runner](/admin-guide/runners) šalje serveru nosi njegov token, a server mora da pretvori taj token u zapis o runneru pre nego što uradi bilo šta drugo. Runneri se javljaju svakih nekoliko sekundi i izveštavaju o napretku svake sekunde dok se posao izvršava, pa bi bez keša svaki od tih zahteva koštao jedan upit ka bazi podataka. Keš runnera na većinu njih odgovara iz memorije.

Jedan čvor čuva keš u sopstvenoj memoriji. U HA režimu to nije dovoljno: ako izmenite runner na čvoru A, čvor B ne sme da nastavi da služi stari zapis. Zato u HA režimu keš živi u Redisu i dele ga svi čvorovi, a promena napravljena preko bilo kog čvora odmah je vidljiva svima.

:::note
Ovaj keš nije isto što i radnja **Clear cache** na stranici Runners. Ta radnja traži od samog runnera da obriše radne direktorijume na svojoj mašini.
:::

## Šta se kešira i koliko dugo {#runner-cache-ttl}

Keširana vrednost je zapis o runneru bez njegovih oznaka i bez tokena. Token nikada ne stiže u Redis: ključ se izvodi iz SHA-256 heša tokena, a polje tokena se prazni pre nego što se zapis sačuva.

Unos živi najviše 30 sekundi. U praksi se odbacuje mnogo ranije, jer svaka promena napravljena kroz Semaphore odmah poništava keš:

* Kreiranje, ažuriranje, brisanje ili ponovno registrovanje runnera, kao i brisanje projekta, odbacuje **svaki** keširani runner na svim čvorovima.
* Heartbeat runnera odbacuje **samo unos tog runnera**, tako da sačuvano vreme „poslednji put viđen" ostaje sveže bez diranja ostalih. Heartbeat se upisuje najviše jednom po intervalu koji iznosi trećinu `runners.offline_timeout_sec`, ograničeno na 45 sekundi; sa podrazumevanim vremenom isteka od 120 sekundi to je svakih 40 sekundi.

Istek od 30 sekundi je bitan samo za promene napravljene mimo Semaphorea, na primer direktnim uređivanjem tabele `runner` ili vraćanjem rezervne kopije.

## Kako se sprečavaju zastareli upisi {#runner-cache-generation}

Pretraga koja promaši keš čita runner iz baze podataka, a zatim ga upisuje. Između ta dva koraka drugi čvor može da izmeni runner. Da bi se osiguralo da pretraga nikada ne kešira ono što je pročitala pre promene, keš održava brojač koji raste pri svakom poništavanju. Pretraga pamti vrednost brojača koju je videla pre odlaska u bazu podataka, a upis se odbija ako je brojač u međuvremenu odmakao. Svaki korak se izvršava kao jedna Lua skripta u Redisu, pa se brojač i unos čitaju i upisuju zajedno.

## Redis ključevi {#runner-cache-redis-keys}

| Ključ | Tip | Namena |
| --- | --- | --- |
| `ha:runner:gen` | string, integer | Brojač. Raste za jedan pri svakom poništavanju, bilo celog keša ili jednog runnera. |
| `ha:runner:inv` | string, integer | Vrednost brojača pri poslednjem potpunom poništavanju. Deo je ključa svakog unosa, pa potpuno poništavanje odjednom čini sve postojeće unose nedostupnim; oni zatim sami ističu. |
| `ha:runner:token:<inv>:<sha256(token)>` | string, binary | Keširani zapis o runneru. Ističe posle 30 s. |
| `ha:runner:forgot:<sha256(token)>` | string, integer | Vrednost brojača pri poslednjem heartbeatu ovog runnera. Pretraga koja je počela pre heartbeata ne može da sačuva zapis od pre heartbeata. Ističe posle 30 s. |

Kontrolna tabla klastera (Cluster dashboard) prikazuje broj ključeva `ha:runner:token:*` kao veličinu keša runnera.

## Ponašanje pri problemima sa Redisom {#runner-cache-failures}

Keš nikada ne dovodi do neuspeha zahteva runnera. Svaka operacija keša ograničena je na 500 milisekundi; ako je Redis spor ili nedostupan, pretraga se tretira kao promašaj i odlazi u bazu podataka, a ništa se ne upisuje. Jedini slučaj na koji treba obratiti pažnju jeste poništavanje koje ne uspe zato što je Redis nedostupan u trenutku kada se runner menja: ostali čvorovi tada mogu da služe stari zapis dok ne istekne, najkasnije 30 sekundi kasnije. Neuspeh se beleži u log na nivou greške.

## Povezane stranice {#related-pages}

- [Visoka dostupnost](/admin-guide/ha) — arhitektura, konfiguracija i podešavanje balansera opterećenja.
- [Koordinacija klastera](/admin-guide/ha/coordination) — Redis ključevi, brave i kanali koje čvorovi dele.
- [Runneri](/admin-guide/runners) — registracija i podešavanje runnera.
