# Tokovi rada (Pro)

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
3. U grafičkom uređivaču:
   - Prevucite čvorove sa palete na platno.
   - Povežite čvorove prevlačenjem sa izlazne tačke jednog čvora na drugi.
   - Kliknite na čvor ili ivicu da biste uredili njihova svojstva u bočnoj tabli.
4. Postavite **naziv** (i opciono **početnu verziju** za verzionisanje izvršavanja).
5. Rešite sve probleme navedene u tabli **Problems**, a zatim kliknite na **Save**.

![Uređivač tokova rada](/assets/workflow-editor.webp)

Uređivač proverava ispravnost grafa pre čuvanja. Ispravan tok rada mora imati najmanje
jedan čvor, tačno jedan početni čvor (bez dolaznih ivica), bez ciklusa, i potpunu
konfiguraciju na svakom izvršnom čvoru.

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

Kada izvršavanje stigne do čvora odobrenja, status se menja u **approval** dok neko ne
odobri ili odbije. Kontrole Approve/Reject pojavljuju se u prikazu izvršavanja. Odbijena
odobrenja dovode do neuspeha izvršavanja u skladu sa uslovima povezanih ivica.

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
- **Prikaz izvršavanja** — graf preko celog ekrana sa statusom uživo na svakom čvoru
  (running, success, failed, approval, odbrojavanje odlaganja).
- **Stop** — dok je izvršavanje u stanju `running` ili `approval`, korisnici sa dozvolom
  `run_project_tasks` mogu da ga zaustave. Svi aktivni zadaci se zaustavljaju, odobrenja na
  čekanju se odbijaju, a izvršavanje se označava kao **stopped**.

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
