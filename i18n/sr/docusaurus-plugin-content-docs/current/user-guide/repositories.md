import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

### Podešavanje Deploy ključeva {#deploy-keys}

U enterprise okruženjima automatizacije, korišćenje namenskih **Deploy ključeva** (ili Access ključeva) vezanih za pojedinačni repozitorijum je preporučena praksa u poređenju sa ličnim SSH ključevima korisnika ili Personal Access Token-ima (PAT). Deploy ključevi obezbeđuju:
* **Izolaciju životnog ciklusa**: CI/CD i automatizacioni procesi ne zavise od naloga pojedinačnih zaposlenih ili ličnih akreditiva.
* **Minimalne privilegije**: Deploy ključevi se mogu podesiti isključivo za pristup samo za čitanje, osiguravajući da Semaphore ne može slati neželjene izmene u izvorni repozitorijum.
* **Ograničen obim uticaja**: Ako je potrebno zameniti ključ, uticaj postoji samo na taj specifični repozitorijum.

:::tip Generisanje SSH ključeva direktno u Semaphore-u
Nema potrebe da generišete SSH ključeve preko komandne linije. U Semaphore-u idite na **Key Store** &rarr; **Novi ključ** &rarr; izaberite **SSH Key** &rarr; kliknite na **Generate**. Semaphore će kreirati bezbedan par ključeva i prikazati dijalog sa **Javnim ključem** spremnim za kopiranje. Pogledajte [Key Store](/user-guide/key-store#built-in-ssh-key-generator) za detalje.
:::

Kopirajte javni ključ generisan u Semaphore-u i dodajte ga svom Git provajderu:

<Tabs groupId="git-provider">
  <TabItem value="github" label="GitHub" default>

1. GitHub: **Settings** &rarr; **Deploy keys** &rarr; **Add deploy key**.
2. Title: `Semaphore UI Runner`.
3. Key: Public Key.
4. **Allow write access**: Unchecked.

```text
git@github.com:organization/repository.git
```

  </TabItem>
  <TabItem value="gitlab" label="GitLab">

1. GitLab: **Settings** &rarr; **Repository** &rarr; **Deploy keys**.
2. Title: `Semaphore UI Runner`.
3. Key: Public Key.
4. **Grant write permissions**: Unchecked.

```text
git@gitlab.com:organization/project.git
```

  </TabItem>
  <TabItem value="bitbucket" label="Bitbucket">

1. Bitbucket: **Repository settings** &rarr; **Access keys**.
2. Label: `Semaphore UI Runner`.
3. Key: Public Key.
4. Permissions: `Read`.

```text
git@bitbucket.org:workspace/repository.git
```

  </TabItem>
</Tabs>

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

Pošto svi šabloni rade u istom preuzimanju na istoj grani, šablon monorepo repozitorijuma ne može imati sopstvenu granu (**Branch**) i ne može uključiti upit **Branch** koji zadatku omogućava da izabere granu ili commit. Forma šablona onemogućava oboje i objašnjava zašto, a API odbija takav šablon. Vodite računa da playbook-ovi ne pišu u preuzimanje: izmenjeno radno stablo prekida sledeći pull, pa Semaphore tada uklanja preuzimanje i ponovo ga klonira.

## Playbook-ovi u poddirektorijumima {#subdirectories}

Enterprise repozitorijumi često organizuju automatizaciju kroz namenske direktorijume, monorepozitorijume ili strukture za više okruženja umesto postavljanja svih playbook-ova u koren repozitorijuma.

```text
my-automation-repo/
├── ansible.cfg
├── collections/
│   └── requirements.yml
├── roles/
│   └── common/
└── playbooks/
    ├── site.yml
    ├── provisioning/
    │   └── aws-vms.yml
    └── maintenance/
        └── patch-nodes.yml
```

Prilikom kreiranja [Šablona zadatka](/user-guide/task-templates), **Ime fajla playbook-a** se uvek navodi **relativno u odnosu na koren repozitorijuma**:

* **Koristite relativne putanje**: Unesite `playbooks/site.yml` ili `playbooks/provisioning/aws-vms.yml`.
* **Bez početne kose crte**: Nemojte koristiti `/playbooks/site.yml`. Početna kosa crta navodi izvršilac da traži fajl od korena sistema umesto unutar klona repozitorijuma.
* **Unix kose crte**: Uvek koristite `/`, čak i kada radite na Windows runner čvorovima.
* **Razlikovanje velikih i malih slova**: Putanje moraju tačno odgovarati nazivima fascikli i fajlova (na primer, `playbooks/site.yml`).

:::info Radni direktorijum i zahtevi
Kada se playbook izvršava iz poddirektorijuma (kao što je `playbooks/site.yml`), Semaphore procenjuje i direktorijum playbook-a (`playbook_dir`) i koren repozitorijuma (`repo_path`) prilikom pronalaženja uloga i kolekcija. Pogledajte [Zahtevi](#requirements) u nastavku za tačan redosled pretrage.
:::

## Izmena postojećeg repozitorijuma {#editing-an-existing-repository}
1. Idite u odeljak Repozitorijumi u Semaphore-u.

2. Kliknite na ikonu olovke pored repozitorijuma koji želite da promenite i prikazaće vam se konfiguracija repozitorijuma.

## Brisanje repozitorijuma {#deleting-a-repository}
Proverite da repozitorijum koji brišete ne koristi nijedan šablon zadatka.
Repozitorijum se ne može obrisati ako se koristi u bilo kom šablonu zadatka:
1. Idite u odeljak Repozitorijumi u Semaphore-u.

2. Kliknite na ikonu kante za otpatke pored repozitorijuma koji želite da obrišete.

3. Kliknite Yes u dijalogu za potvrdu ako ste sigurni da želite da obrišete ovaj repozitorijum.

### Zaštita zavisnosti i provera korišćenja {#dependency-protection}

Repozitorijum se ne može izbrisati ako je trenutno dodeljen jednom ili više šablona zadataka.

Pre pokušaja brisanja, Semaphore proverava aktivne reference šablona:
1. U listi repozitorijuma, klik na ikonicu kante proverava da li neki šablon projekta koristi taj repozitorijum.
2. Ako zavisnosti postoje, Semaphore prikazuje prozor sa upozorenjem koji navodi tačne šablone zadataka koji koriste ovaj repozitorijum, sa direktnim linkovima ka svakom šablonu.
3. Ako se repozitorijum pokuša izbrisati direktno preko API-ja dok je u upotrebi, zahtev se odbija sa HTTP `400 Bad Request`:

```json
{
  "error": "Repository is in use by one or more templates",
  "inUse": true
}
```

Da biste bezbedno izbrisali repozitorijum:
1. Idite na **Šabloni** i preusmerite svaki zavisni šablon na drugi repozitorijum ili izbrišite šablone koji se više ne koriste.
2. Vratite se na **Repozitorijumi** i kliknite na ikonicu kante pored repozitorijuma.
3. Potvrdite brisanje u iskačućem prozoru.

:::tip Automatsko čišćenje keša kloniranja
Kada se repozitorijum uspešno izbriše, Semaphore automatski briše lokalni radni direktorijum klona sa fajl sistema domaćina/runner-a, oslobađajući prostor na disku.
:::

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
