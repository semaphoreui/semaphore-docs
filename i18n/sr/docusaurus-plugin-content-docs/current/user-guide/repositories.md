# Repozitorijumi

Repozitorijum (Repository) je mesto za čuvanje i upravljanje Ansible sadržajem kao što su playbook-ovi i role.

![Lista repozitorijuma](/assets/repositories-list.webp)

Lista prikazuje naziv, Git URL sa granom i ključ koji se koristi za autentifikaciju.

Semaphore razume repozitorijume koji su:
  * lokalni sistem datoteka (`/path/to/the/repo`)
  * lokalni Git repozitorijum (`file://`)
  * udaljeni Git repozitorijum kome se pristupa preko HTTPS-a (`https://`), SSH-a (`ssh://` ili kratki oblik `git@host:org/repo.git`)
  * protokol `git://` je podržan, ali se ne preporučuje iz bezbednosnih razloga.

Svi šabloni zadataka (Task Templates) zahtevaju repozitorijum da bi se izvršili.

## Autentifikacija {#authentication}
Ako koristite udaljeni repozitorijum koji zahteva autentifikaciju, moraćete da konfigurišete ključ u odeljku **Key Store** (skladište ključeva) Semaphore-a.

Za udaljene repozitorijume koji koriste SSH moraćete da koristite svoj SSH ključ u odeljku **Key Store**.

Za udaljene repozitorijume koji nemaju autentifikaciju možete kreirati ključ tipa `None`.

Ključ repozitorijuma koristi se samo za taj repozitorijum. Da biste dosegli submodule, uloge iz `requirements.yml` ili druge repozitorijume hostovane na drugom mestu sa sopstvenim pristupnim podacima, dodajte mapiranje u [Host config](/user-guide/host-config).

## Kreiranje novog repozitorijuma {#creating-a-new-repository}
1. Proverite da ste u odeljku skladišta ključeva konfigurisali ključ za repozitorijum koji dodajete.

2. Idite u odeljak Repozitorijumi (Repositories) u Semaphore-u i kliknite na dugme **New Repository** u gornjem desnom uglu.

3. Konfigurišite repozitorijum:
    * Dajte naziv repozitorijumu
    * Dodajte URL. URL mora da počinje jednim od sledećeg:
        * `/path/to/the/repo` za lokalni folder na sistemu datoteka
        * `https://` za udaljeni Git repozitorijum kome se pristupa preko HTTPS-a
        * `ssh://` za udaljeni Git repozitorijum kome se pristupa preko SSH-a
        * `file://` za lokalni Git repozitorijum
        * `git://` za udaljeni Git repozitorijum kome se pristupa preko Git protokola
    * Podesite granu repozitorijuma; ako niste sigurni koja bi trebalo da bude, verovatno je master ili main
    * Označite **Single checkout for all templates** (jedno preuzimanje za sve šablone) ako je repozitorijum monorepo koji svi šabloni treba da dele, pogledajte [Monorepo](#monorepo)
    * Izaberite **Access Key** koji ste konfigurisali pre podešavanja ovog repozitorijuma.

4. Kliknite Save kada je sve konfigurisano.

## Monorepo: jedno preuzimanje za sve šablone {#monorepo}

:::info Od verzije 2.20
Opcija **Single checkout for all templates** dostupna je od verzije **Semaphore 2.20**. Ranije verzije uvek kloniraju repozitorijum jednom po šablonu.
:::

Semaphore podrazumevano klonira repozitorijum jednom po šablonu, tako da svaki šablon radi u sopstvenoj kopiji. Za veliki repozitorijum koji deli mnogo šablona kopije zauzimaju prostor na disku, a svaki zadatak počinje kloniranjem ili pull-om sopstvene kopije.

Označite **Single checkout for all templates** da bi se repozitorijum klonirao jednom i da bi se to preuzimanje (checkout) delilo između svih šablona projekta. Opcija nije dostupna za lokalni folder (`/path/to/the/repo`), koji se nikada ne klonira.

<div style={{maxWidth: 450}}>

![Forma repozitorijuma sa uključenom opcijom Single checkout for all templates](/assets/repository-monorepo.webp)

</div>

Kako deljeno preuzimanje radi:

* Pre nego što zadatak počne, Semaphore zaključava preuzimanje, radi fetch i pull grane podešene u repozitorijumu, a zatim otpušta zaključavanje. Zadaci drugih šablona čekaju na zaključavanje dok se preuzimanje ažurira, ali se sami zadaci izvršavaju paralelno.
* Svaka grana i dalje dobija sopstveno preuzimanje, tako da repozitorijumi sa različitim granama nikada ne dele radno stablo.
* Preuzimanje je deljeno, ali Ansible home direktorijum (role i kolekcije instalirane iz `requirements.yml`) ostaje odvojen za svaki šablon.

Pošto svi šabloni rade u istom preuzimanju na istoj grani, šablon monorepo repozitorijuma ne može imati sopstvenu granu (**Branch**) i ne može uključiti upit **Branch** koji zadatku omogućava da izabere granu ili commit. Forma šablona onemogućava oboje i objašnjava zašto, a API odbija takav šablon. Vodite računa da playbook-ovi ne pišu u preuzimanje: izmenjeno radno stablo prekida sledeći pull, pa Semaphore tada uklanja preuzimanje i ponovo ga klonira. Ako repozitorijum kasnije postane monorepo, grana koju njegovi šabloni još imaju, kao i grana ili commit koje zada zadatak, se ignorišu, a svaki zadatak se izvršava na grani repozitorijuma.

## Izmena postojećeg repozitorijuma {#editing-an-existing-repository}
1. Idite u odeljak Repozitorijumi u Semaphore-u.

2. Kliknite na ikonu olovke pored repozitorijuma koji želite da promenite i prikazaće vam se konfiguracija repozitorijuma.

## Brisanje repozitorijuma {#deleting-a-repository}
Proverite da repozitorijum koji brišete ne koristi nijedan šablon zadatka.
Repozitorijum se ne može obrisati ako se koristi u bilo kom šablonu zadatka:
1. Idite u odeljak Repozitorijumi u Semaphore-u.

2. Kliknite na ikonu kante za otpatke pored repozitorijuma koji želite da obrišete.

3. Kliknite Yes u dijalogu za potvrdu ako ste sigurni da želite da obrišete ovaj repozitorijum.

## Zahtevi {#requirements}
Pri inicijalizaciji projekta Semaphore traži i instalira Ansible role i kolekcije iz requirements.yml na sledećim lokacijama i sledećim redosledom.

### Role {#roles}

* `playbook_dir`/roles/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/roles/requirements.yml
* `repo_path`/requirements.yml

### Kolekcije {#collection}

* `playbook_dir`/collections/requirements.yml
* `playbook_dir`/requirements.yml
* `repo_path`/collections/requirements.yml
* `repo_path`/requirements.yml

### Logika obrade {#processing-logic}

* Svaka datoteka se obrađuje nezavisno
* Ako datoteka postoji, obrađuje se prema svom tipu (role ili kolekcija)
* Ako obrada bilo koje datoteke rezultuje greškom, proces instalacije se zaustavlja i vraća grešku
* Ista datoteka requirements.yml u korenim direktorijumima (**`playbook_dir`/requirements.yml** i **`repo_path`/requirements.yml**) obrađuje se dva puta - jednom za role i jednom za kolekcije

Semaphore će pokušati da obradi sve ove lokacije bez obzira na to da li su prethodne lokacije pronađene ili uspešno obrađene, osim u slučaju grešaka.
