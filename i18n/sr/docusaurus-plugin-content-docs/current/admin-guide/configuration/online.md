---
title: Koristite onlajn konfigurator
description: Generišite komande za binarnu instalaciju ili Docker Compose datoteku pomoću Semaphore onlajn konfiguratora.
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Koristite onlajn konfigurator

Popunite obrazac da biste generisali komande za podešavanje novog Semaphore servera. Pregled se ažurira tokom izmene; primenite rezultat na svom serveru da biste završili podešavanje.

## Pre nego što počnete {#before-you-begin}

- Izaberite binarnu ili Docker instalaciju i verziju Semaphore-a. Linkovi i snimci koriste **2.19**; na sajtu izaberite svoju verziju.
- Za MySQL ili Postgres pripremite podatke za povezivanje. Za SQLite izaberite putanju datoteke baze podataka na koju korisnik Semaphore servisa može da piše.
- Koristite sopstvenu administratorsku lozinku. Snimci sadrže demonstracione vrednosti.

## Koraci {#steps}

Pratite odeljak za svoj način instalacije.

### Binarna instalacija {#binary-installation}

1. Otvorite [stranicu za binarnu instalaciju](https://semaphoreui.com/install/binary/2_19/install). Pronađite platformu, arhitekturu i tip paketa. Kliknite na red da prikažete komande; kopirajte ih i izvršite na serveru ili koristite **Download** da preuzmete paket.
2. Otvorite [Server setup](https://semaphoreui.com/install/binary/2_19/config). U **Database settings** izaberite **SQLite**, **MySQL** ili **Postgres** i unesite putanju datoteke ili podatke za povezivanje. U **Admin user** unesite korisničko ime, lozinku, ime i email.
3. Vratite se na **Config file** i kliknite na ikonu za kopiranje. Pregledajte komande pre nego što ih izvršite u direktorijumu na serveru u koji možete da pišete. One kreiraju `config.json`, dodaju administratora i pokreću Semaphore. Sačuvajte konfiguraciju i generisane ključeve za šifrovanje za naredna pokretanja.

![Proširen red Linux amd64 deb sa komandama za instalaciju](/img/admin-guide/configuration/online/binary-install.png)

![Polja baze podataka i administratora popunjena demonstracionim vrednostima](/img/admin-guide/configuration/online/binary-settings.png)

Video prikazuje izbor paketa, podešavanja servera i kopiranje komandi.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/binary-output.png')} aria-label="Video prikazuje izbor paketa, podešavanja servera i kopiranje komandi.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/binary-setup.webm')} type="video/webm" />
</video>

### Docker instalacija {#docker-installation}

1. Otvorite [Docker konfigurator](https://semaphoreui.com/install/docker/2_19). U **Container settings** podesite naziv i port hosta. U **Docker volumes** uključite volumene za podatke i konfiguraciju kako biste ih zadržali pri zameni kontejnera.
2. Izaberite bazu podataka i popunite **Admin user**, uključujući sopstvenu lozinku. Za spoljnu bazu koristite host dostupan iz kontejnera.
3. Izaberite **Docker Compose** i kliknite na ikonu za preuzimanje. Sačuvajte rezultat kao `docker-compose.yml` u direktorijumu za postavljanje, pregledajte ga i tamo pokrenite `docker compose up -d`. Alternativno, izaberite **Docker command** i kopirajte generisanu komandu `docker run`.

![Podešavanja Docker kontejnera sa uključenim trajnim volumenima za podatke i konfiguraciju](/img/admin-guide/configuration/online/docker-settings.png)

Video prikazuje podešavanja kontejnera, trajne volumene i preuzimanje Docker Compose datoteke.

<video controls preload="none" playsInline poster={useBaseUrl('/img/admin-guide/configuration/online/docker-compose.png')} aria-label="Video prikazuje podešavanja kontejnera, trajne volumene i preuzimanje Docker Compose datoteke.">
  <source src={useBaseUrl('/img/admin-guide/configuration/online/docker-setup.webm')} type="video/webm" />
</video>

## Šta dalje {#whats-next}

Otvorite server u pregledaču, na primer `http://localhost:3000` kada ga pokrećete lokalno, i prijavite se administratorskim podacima koje ste uneli.

- [Pokretanje binarne datoteke kao servisa](/admin-guide/installation/binary-file#run-as-a-service).
- [Detalji Docker postavljanja](/admin-guide/installation/docker).
- [Sve opcije konfiguracije](/reference/configuration).
