---
title: "Tokovi rada"
sidebar_custom_props:
  edition: pro
---

# Tokovi rada <Pro />

Tokovi rada (Workflow) omogućavaju da povežete više šablona zadataka (Task Template) u
usmereni graf (DAG) sa grananjem, odobrenjima i vremenskim pauzama. Izvršavanje toka rada
napreduje automatski kako se svaki korak završava — graf jednom dizajnirate u vizuelnom
uređivaču, a zatim pokrećete izvršavanja sa stranice Workflows.

:::info
Tokovi rada su funkcija **Semaphore Pro** izdanja. Stavka menija Workflows pojavljuje se
samo kada je vaša pretplata obuhvata.
:::

## Pregled {#overview}

Tok rada se sastoji od:

- **Čvorova** — koraka u grafu (pokretanje šablona, čekanje na odobrenje, pauza radi
  odlaganja ili beleška kao napomena).
- **Ivica** — veza između čvorova, pri čemu je svaka označena **uslovom** koji određuje
  kada nizvodni čvor počinje.

Kada pokrenete tok rada, Semaphore kreira **izvršavanje toka rada** (workflow run). Server
upravlja napredovanjem: kako se zadaci završavaju, odobrenja razrešavaju ili odlaganja
isteknu, nizvodni čvorovi se pokreću u skladu sa uslovima ivica.

## Kreiranje toka rada {#creating-a-workflow}

1. Otvorite svoj projekat (Project) i idite na **Workflows**.
2. Kliknite na **New Workflow**.
3. Dodajte prvi čvor: kliknite na vrstu u **Palette**, prevucite je na platno ili
   koristite dugme **+** u gornjem desnom uglu platna.
4. Zadržite pokazivač iznad čvora i kliknite na ručicu **+** na njegovom izlaznom portu
   da biste dodali sledeći korak. Novi čvor se postavlja desno i povezuje ivicom
   **On success**. Čvorove možete povezati i prevlačenjem sa izlaznog porta na ulazni
   port.
5. Kliknite na čvor da biste ga uredili u **tabli sa svojstvima** sa desne strane: vrsta
   čvora, šablon zadatka i parametri zadatka, vremensko ograničenje i poruka odobrenja,
   trajanje odlaganja, konvergencija.
6. Kliknite na **oznaku uslova** na sredini ivice da biste promenili njen uslov, ili
   zadržite pokazivač iznad nje i kliknite na **×** da biste uklonili ivicu.
7. Postavite **naziv** (i opciono **početnu verziju** za verzionisanje izvršavanja).
8. Rešite probleme navedene u čipu **problems** na traci sa alatkama, a zatim kliknite na
   **Save**.

![Uređivač tokova rada](/assets/workflow-editor.webp)

Uređivač proverava ispravnost grafa dok radite. Čvorovi sa problemom prikazuju značku
upozorenja, a čip na traci sa alatkama navodi svaki problem; kliknite na neki od njih da
biste izabrali čvor. Ispravan tok rada mora imati najmanje jedan čvor, tačno jedan početni
čvor (bez dolaznih ivica), bez ciklusa, i potpunu konfiguraciju na svakom izvršnom čvoru.
Dugme **Save** ostaje onemogućeno dok graf ne postane ispravan.

![Meni za brzo dodavanje](/assets/workflow-editor-quick-add.webp)

### Kontrole uređivača {#editor-controls}

Platno se može pomerati i zumirati mišem, dodirnom tablom, dugmadima u donjem
levom uglu ili tastaturom. Prečice na tastaturi rade dok platno ima fokus:
prvo kliknite na prazno platno ili pritiskajte <kbd>Tab</kbd> dok platno ne
dobije fokus. <kbd>Tab</kbd> zatim prelazi sa čvora na čvor; <kbd>Enter</kbd> na čvoru
ga bira i otvara njegovu tablu sa svojstvima (u prikazu izvršavanja otvara dnevnik
zadatka). Ista navigacija radi i u prikazu izvršavanja.

| Radnja | Miš | Dodirna tabla | Dugmad | Tastatura |
|--------|-----|---------------|--------|-----------|
| Pomeranje platna (pan) | Prevucite prazno platno ili skrolujte točkićem (vertikalno) i <kbd>Shift</kbd>+točkić (horizontalno) | Skrolovanje sa dva prsta u bilo kom smeru | — | <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd>; držite <kbd>Shift</kbd> za veće korake |
| Uvećanje / umanjenje | <kbd>Ctrl</kbd>+točkić (<kbd>Cmd</kbd>+točkić na macOS-u); zumira ka pokazivaču | Uštinite | **+** / **−** | <kbd>+</kbd> / <kbd>−</kbd> |
| Uklapanje celog grafa na ekran | — | — | **fit view** | <kbd>0</kbd> |
| Vraćanje zuma na 100 % | — | — | — | <kbd>1</kbd> |
| Automatsko raspoređivanje čvorova | — | — | **tidy up** | — |

Uređivač uklapa graf na ekran pri otvaranju. Trenutni nivo zuma prikazan je
ispod dugmadi. Čvorovi se pri pomeranju poravnavaju na mrežu od 20 px.

| Radnja uređivanja | Kako |
|-------------------|------|
| Dodavanje čvora | Ručica **+** na čvoru, klik ili prevlačenje iz palete, dugme **+** u gornjem desnom uglu ili desni klik na prazno platno. |
| Povezivanje čvorova | Prevucite sa izlaznog porta čvora (desna ivica) na ulazni port drugog čvora (leva ivica). |
| Promena uslova ivice | Kliknite na oznaku uslova na ivici i izaberite uslov. |
| Brisanje izabranog čvora ili ivice | <kbd>Delete</kbd> (<kbd>Cmd</kbd>+<kbd>Backspace</kbd> na macOS-u), dugme za brisanje u tabli sa svojstvima ili **×** na oznaci uslova ivice iznad koje je pokazivač. |
| Opozovi / ponovi | <kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Z</kbd> (<kbd>Cmd</kbd> na macOS-u) ili strelice na traci sa alatkama. Do 50 koraka. |
| Poništavanje izbora | <kbd>Esc</kbd> zatvara tablu sa svojstvima i poništava izbor. |

Napuštanje uređivača sa nesačuvanim izmenama traži potvrdu. Tačka na dugmetu **Save**
pokazuje da se graf razlikuje od sačuvane verzije.

## Vrste čvorova {#node-kinds}

| Vrsta | Namena |
|------|---------|
| **Task** | Pokreće šablon zadatka. Parametre šablona (inventar, okruženje, Ansible limit, dodatne argumente komandne linije) možete zameniti po čvoru pomoću **task params**. |
| **Approval** | Pauzira izvršavanje dok korisnik sa odgovarajućom dozvolom ne odobri ili odbije. Opciono postavite vremensko ograničenje (u sekundama) i poruku odobrenja. |
| **Delay** | Čeka podešeni broj sekundi pre nastavka ka nizvodnim čvorovima. Korisno za periode mirovanja, prozore održavanja ili razmak između zavisnih koraka. |
| **Note** | Slobodna napomena na platnu. Čvorovi tipa Note se ne izvršavaju i ne povezuju se ivicama — služe isključivo za dokumentovanje. |

### Konvergencija {#convergence}

Čvorovi sa više dolaznih ivica mogu zahtevati da se završe **svi** uzvodni čvorovi
(podrazumevano) ili **bilo koji** od njih. Podesite **Convergence** u tabli sa svojstvima
čvora.

### Čvorovi odlaganja {#delay-nodes}

Čvor odlaganja pauzira izvršavanje toka rada za podešeno trajanje (najmanje 1 sekunda).
Tokom čekanja:

- Izvršavanje ostaje u statusu **running**.
- Prikaz izvršavanja prikazuje odbrojavanje uživo na čvoru odlaganja.
- Nizvodni čvorovi povezani ivicama ne pokreću se dok se odlaganje ne završi.

Ako je izvršavanje toka rada **zaustavljeno** dok je odlaganje aktivno, odlaganje se
otkazuje i izvršavanje se završava u statusu **stopped**.

### Čvorovi odobrenja {#approval-nodes}

Kada izvršavanje stigne do čvora odobrenja, status izvršavanja se menja u **approval** dok
neko ne odobri ili odbije. Kartica odobrenja u prikazu izvršavanja prikazuje poruku
odobrenja sa dugmadima **Approve** i **Reject** za korisnike koji mogu da pokreću zadatke
u projektu. Odbijeno odobrenje dovodi do neuspeha čvora, a izvršavanje se nastavlja duž
ivica **On failure** ili **Always**.

## Uslovi ivica {#edge-conditions}

Svaka ivica ima uslov koji određuje kada nizvodni čvor postaje spreman:

| Uslov | Nizvodni čvor počinje kada se uzvodni čvor… |
|-----------|-------------------------------------------|
| **On success** | Uspešno završi (podrazumevano). |
| **On failure** | Završi sa greškom. |
| **Always** | Završi u bilo kom konačnom stanju (uspeh ili neuspeh). |

Koristite grane **On failure** za kompenzacione radnje ili obaveštenja. Koristite
**Always** kada sledeći korak treba da se izvrši bez obzira na ishod.

## Pokretanje i praćenje {#running-and-monitoring}

- **Run workflow** — pokreće novo izvršavanje sa liste Workflows.
- **Prikaz izvršavanja** — isti graf kao u uređivaču, samo za čitanje, sa statusom uživo
  na svakom čvoru. Ikona statusa u uglu kartice prikazuje uspeh, neuspeh, izvršavanje,
  čekanje na odobrenje ili odbrojavanje odlaganja; podnaslov prikazuje trajanje. Čvorovi
  koji još nisu počeli su zatamnjeni, a ivica koja vodi do čvora koji se izvršava je
  animirana.
- **Dnevnik zadatka** — kliknite na čvor zadatka koji je počeo da biste otvorili njegov
  dnevnik zadatka.
- **Stop** — dok je izvršavanje u stanju `running` ili `approval`, korisnici sa dozvolom
  `run_project_tasks` mogu da ga zaustave. Svi aktivni zadaci se zaustavljaju, odobrenja na
  čekanju se odbijaju, a izvršavanje se označava kao **stopped**.

![Prikaz izvršavanja toka rada](/assets/workflow-run.webp)

![Odobrenje na čekanju u prikazu izvršavanja](/assets/workflow-run-approval.webp)

Statusi izvršavanja: `running`, `approval`, `success`, `failed`, `stopped`.

## Verzionisanje izvršavanja {#run-versioning}

Podesite **Start version** na toku rada (na primer `1.0.0`) da biste omogućili oznake
verzija na svakom izvršavanju. Semaphore povećava verziju pri uzastopnim izvršavanjima,
slično kao kod build šablona.

## Artefakti toka rada (set_stats) {#workflow-artifacts-set_stats}

Kada Ansible zadatak u toku rada koristi `set_stats`, promenljive se čuvaju kao
**artefakti toka rada** za to izvršavanje. Nizvodni čvorovi tipa Task u istom izvršavanju
automatski ih dobijaju kao dodatne promenljive.

:::warning
Ako se koraci u toku rada izvršavaju na **udaljenim runner-ima**, artefakti toka rada se
još uvek ne prenose kroz korake na udaljenim runner-ima — prosleđuju se samo između
zadataka koji se izvršavaju lokalno na Semaphore serveru. Planirajte predaju artefakata u
skladu s tim ili držite korake koji proizvode i koriste artefakte na istoj putanji
izvršavanja.
:::

## Dozvole {#permissions}

- Upravljanje tokovima rada (kreiranje, uređivanje, brisanje) zahteva dozvole za upravljanje
  resursima projekta.
- Pokretanje tokova rada zahteva `run_project_tasks`.
- Razrešavanje odobrenja zahteva odgovarajući pristup projektu (isti korisnici koji mogu da
  pokreću zadatke u projektu).

## API {#api}

Šabloni tokova rada i izvršavanja dostupni su na putanji
`/api/project/{project_id}/workflows`. Pogledajte
[dokumentaciju API-ja](/reference/api) za šeme zahteva i odgovora, uključujući polja
čvora `delay` (`delay_seconds`) i krajnju tačku za zaustavljanje
(`POST …/runs/{run_id}/stop`).
