# Sinhronizacija tajni iz udaljenih skladišta

Semaphore se može povezati sa eksternim menadžerom tajni — kao što su **HashiCorp Vault**, **OpenBao**, **AWS Secrets Manager**, **Azure Key Vault** ili **Devolutions Server (DVLS)** — i automatski uvoziti tajne iz njega u skladište ključeva (Key Store). Umesto da kredencijale ručno kopirate u Semaphore i održavate ih ažurnim, usmerite Semaphore na svoje udaljeno skladište i on će za vas održavati lokalnu kopiju.

**Putanje sinhronizacije** (Sync paths) su pravila koja govore Semaphore-u *koje* tajne da uveze iz udaljenog skladišta i *kako* da ih imenuje kada stignu. Menadžer tajni može da sadrži hiljade tajni u mnogo foldera; putanje sinhronizacije vam omogućavaju da izaberete samo podstabla koja vas zanimaju i da kontrolišete imenovanje ključeva koji se kreiraju.

## Ključni pojmovi {#key-concepts}

- **Udaljeno skladište** — konfigurisana veza sa eksternim menadžerom tajni, uključujući njegovu adresu i kredencijal koji Semaphore koristi za čitanje iz njega.
- **Sinhronizacija** — proces čitanja tajni iz udaljenog skladišta i njihovog usklađivanja sa ključevima sačuvanim u Semaphore-u.
- **Putanja sinhronizacije** — jedno pravilo uvoza, sastavljeno od *putanje*, *prefiksa* i *separatora*.

## Kako radi putanja sinhronizacije {#how-a-sync-path-works}

Svaka putanja sinhronizacije ima tri polja:

- **Path** — lokacija u udaljenom skladištu iz koje se uvozi. To je osnovni folder, prefiks ili podstablo koje Semaphore izlistava i čita. Sve što se nađe pod njim postaje kandidat za uvoz.
- **Prefix** — string koji se dodaje na početak svakog generisanog naziva ključa. Koristite ga da uvezene tajne smestite u zaseban prostor imena kako se ne bi sudarale sa ključevima iz drugih putanja ili drugih skladišta (na primer `prod-`).
- **Separator** — znak koji se koristi za spajanje delova udaljene lokacije tajne u jedan naziv ključa. Pošto udaljena tajna može biti nekoliko foldera duboko, separator određuje kako se ta hijerarhija spljošti u jedan čitljiv naziv.

Kada se sinhronizacija pokrene, Semaphore obilazi **putanju** i za svaku tajnu koju nađe gradi naziv ključa tako što kombinuje lokaciju tajne pomoću **separatora** i dodaje **prefiks** na početak. Tip kreiranog ključa (SSH ključ, korisničko ime/lozinka ili običan tajni string) automatski se izvodi iz oblika udaljene tajne.

Na jednom skladištu možete definisati **više putanja sinhronizacije**. Svaka putanja se uvozi nezavisno, tako da možete preuzimati iz nekoliko nepovezanih oblasti istog menadžera tajni i svakoj dati sopstveni prefiks i stil imenovanja.

:::tip
Razumne podrazumevane vrednosti primenjuju se po provajderu — na primer, HashiCorp Vault, OpenBao i AWS Secrets Manager podrazumevano koriste `/` kao separator, Azure Key Vault `-`, a Devolutions Server `\` — tako da u većini slučajeva treba da popunite samo putanju.
:::

## Pokretanje sinhronizacije {#running-a-sync}

Sinhronizacija se odvija na dva načina:

1. **Ručno.** Otvorite skladište i koristite akciju **Sync now**. Semaphore odmah usklađuje to skladište sa njegovim konfigurisanim putanjama sinhronizacije. Ovo je korisno za prvi uvoz ili da odmah preuzmete neku promenu.
2. **Automatski, po rasporedu.** Uključite **Sync keys** za skladište i podesite **interval sinhronizacije** u minutima. Semaphore zatim u pozadini ponovo pokreće sinhronizaciju tim ritmom. Interval `0` isključuje automatsku sinhronizaciju i ostavlja samo ručnu opciju.

Svako skladište beleži kada je poslednji put sinhronizovano i da li je poslednji pokušaj bio neuspešan, tako da uvek možete videti stanje kopije.

:::note
U okruženju visoke dostupnosti automatske sinhronizacije se koordiniraju između čvorova, tako da se određena sinhronizacija izvršava samo na jednom čvoru u datom trenutku — nećete dobiti duplirane uvoze.
:::

## Šta sinhronizacija radi sa vašim ključevima {#what-syncing-does-to-your-keys}

Sinhronizacija je **potpuna kopija** (full mirror), a ne jednokratno kopiranje. Pri svakom pokretanju Semaphore usklađuje udaljeno skladište sa ključevima koje je ranije uvezao:

- **Nove** tajne pronađene pod putanjom sinhronizacije kreiraju se kao ključevi.
- **Postojeći** uvezeni ključevi se **ažuriraju** da odgovaraju trenutnoj udaljenoj vrednosti.
- Ključevi koji su ranije uvezeni, ali **više ne postoje** u udaljenom skladištu, **uklanjaju se**.

Dira se samo u ključeve koje je Semaphore uvezao — ključeve koje ste ručno kreirali sinhronizacija nikada ne menja niti briše.

:::warning
Pošto su uvezeni ključevi upravljane kopije udaljenih tajni, brisanje skladišta (ili isključivanje njegove sinhronizacije) uklanja i ključeve koji su iz njega došli.
:::

## Dva opsega: deljeni ključevi i promenljive okruženja {#two-scopes-shared-keys-and-environment-variables}

Putanje sinhronizacije se mogu konfigurisati na dva mesta:

- **Nivo skladišta** — uvezene tajne postaju **deljeni ključevi**, dostupni u celom projektu (Project) gde god se ključevi koriste.
- **Nivo okruženja** — [grupa promenljivih](/user-guide/environment) (Variable Group) može da pokazuje na skladište i njegove putanje sinhronizacije da bi uvezla tajne kao **promenljive okruženja** ograničene na tu grupu.

Mehanizam je identičan; razlikuje se samo odredište uvezenih tajni.

## Napomene i ograničenja {#notes-and-limitations}

- Sinhronizacija je podržana samo za **eksterne** tipove skladišta (HashiCorp Vault, OpenBao, AWS Secrets Manager, Azure Key Vault, Devolutions Server). Ugrađeno skladište **Database** čuva tajne izvorno i nema šta da sinhronizuje.
- Sam kredencijal udaljenog skladišta (token ili ključ koji Semaphore koristi za autentifikaciju) čuva se bezbedno i odvojeno od tajni koje uvozi.
- Ako je sinhronizacija isključena i nema preostalih putanja, konfiguracija sinhronizacije za to skladište se briše.
