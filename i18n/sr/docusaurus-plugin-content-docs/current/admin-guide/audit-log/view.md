---
title: Pregled dnevnika revizije
description: "Pregled dnevnika revizije u veb interfejsu: najnoviji događaji, sva polja događaja i, uz Semaphore Pro, filteri i izvoz u CSV ili JSON Lines."
---

# Pregled dnevnika revizije

Administratori otvaraju **Audit log** iz korisničkog menija. Najnoviji događaji su prvi, po 50 na stranici.

![Dnevnik revizije, najnoviji događaji prvi](/assets/audit-log-list.png)

Kliknite na događaj da vidite sva njegova polja. Dugme za kopiranje kopira događaj u formatu u kojem ga
Semaphore šalje u SIEM.

![Događaj sa svim svojim poljima](/assets/audit-log-card.png)

## Filtriranje i izvoz <FeatureState feature="audit-log-filters" /> {#filter-export}

Filtrirajte po periodu, korisniku, vrsti događaja, rezultatu, projektu ili IP adresi. U događaju su korisnik,
adresa, objekat i projekat veze koje filtriraju dnevnik po njima.

![Dnevnik filtriran po adresi događaja](/assets/audit-log-filters.png)

Kada kombinacija filtera nađe malo događaja, Semaphore pretražuje po dve sekunde i prikazuje dokle je stigao
unazad. Kliknite na **Search older** da nastavite.

**Export** čuva svaki događaj koji odgovara filterima kao CSV ili JSON Lines datoteku. Svaki izvoz se beleži kao
događaj `audit.log/export`.

![Izvoz kao CSV ili JSON Lines](/assets/audit-log-export.png)
