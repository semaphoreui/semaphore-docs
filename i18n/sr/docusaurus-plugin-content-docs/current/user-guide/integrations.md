# Integracije

Integracija pokreće šablon zadatka kada neki spoljni servis pozove Semaphore URL. Pozivalac može biti GitHub, GitLab, Bitbucket, sistem za nadzor ili bilo koji program koji ume da pošalje HTTP zahtev. Zahtev ne samo da pokreće izvršavanje: delovi zahteva — ime brancha, commit, oznaka izdanja — mogu se preneti u zadatak kao promenljive.

![Lista integracija](/assets/integrations-list.webp)

Svaka integracija ima četiri dela:

| Deo | Odgovara na pitanje |
|---|---|
| **Alias** | Koji URL pozivalac poziva? |
| **Metod autentifikacije** | Sme li ovaj zahtev bilo šta da pokrene? |
| **Matcheri** | Da li je *ovo* zahtev koji integracija čeka? |
| **Ekstraktori vrednosti** | Koja polja zahteva stižu do zadatka, i kao šta? |

Da biste je napravili, otvorite **Integrations** u meniju projekta i kliknite **New Integration**: dajte ime, izaberite šablon zadatka koji pokreće i metod autentifikacije. Zatim kliknite integraciju u listi da podesite njen alias, matchere i ekstraktore vrednosti.

![Detalji integracije](/assets/integration-detail.webp)

## Kako se poziv obrađuje {#how-a-call-is-handled}

1. Pozivalac poziva `/api/integrations/<alias>` metodom `GET` ili `POST`.
2. Semaphore iz aliasa razrešava integracije koje sme da pokrene. Krajnja tačka je javna — štite je samo alias i metod autentifikacije.
3. Svaka od tih integracija proverava zahtev svojim **metodom autentifikacije**. Zahtev koji ne prođe proveru ne pokreće ništa.
4. Ako je poziv došao preko **aliasa projekta**, izračunavaju se **matcheri** integracije. Svi moraju da se poklope, inače se integracija preskače.
5. Pokreću se **ekstraktori vrednosti** i pretvaraju delove zahteva u promenljive i parametre zadatka.
6. Zadatak se kreira i stavlja u red, isto kao da je neko ručno pokrenuo šablon.

Obrađen poziv dobija `204 No Content` sa praznim telom, bez obzira na to da li je nešto pokrenuto. Šta je pokrenuto javljaju zaglavlja odgovora:

| Zaglavlje odgovora | Vrednost |
|---|---|
| `X-Semaphore-Task-ID` | Kreirani zadatak |
| `X-Semaphore-Template-ID` | Šablon koji on izvršava |
| `X-Semaphore-Project-ID` | Projekat kojem zadatak pripada |
| `X-Semaphore-Integration-ID` | Integracija koja ga je pokrenula |
| `X-Semaphore-Inventory-ID` | Inventar zadatka, kada ga ima |

Svaki poziv poznatog aliasa upisuje se i u [istoriju poziva](#call-history) — tamo treba gledati kada webhook ne radi ono što očekujete.

## Aliasi {#aliases}

Alias je slučajni, nepogodljivi deo webhook URL-a: `/api/integrations/<random_string>`. Prihvata `GET` i `POST`. Postoje dve vrste, a integracija u jednom trenutku koristi samo jednu od njih.

**Alias projekta** se kreira dugmetom **Add Alias** iznad liste integracija i dele ga sve integracije projekta kojima je prekidač **Use project alias** uključen. Jedan dolazni zahtev ponudi se svima njima, a svaka preko svojih matchera odlučuje da li će se izvršiti. To je alias koji se jednom predaje GitHubu ili GitLabu, a događaji se posle razvrstavaju matcherima.

**Alias integracije** se kreira dugmetom **Add Alias** na strani same integracije i pripada samo njoj. Poziv ga odmah pokreće — **matcheri se uopšte ne izračunavaju**. Koristite ga kada je pozivalac posvećen samo jednom poslu ili kada je telo u formatu koji matcheri ne mogu da pregledaju.

:::warning
Prekidač **Use project alias** na strani integracije odlučuje koja vrsta aliasa radi. Dok je uključen, integracija odgovara na alias projekta, a njeni sopstveni aliasi se ignorišu; dok je isključen, alias projekta nikada ne stiže do integracije i njeni matcheri se nikada ne koriste.
:::

Projekat može imati više aliasa obe vrste. Brisanje aliasa ikonicom korpe pored njega odmah ga zaustavlja, dok pozivi koje je već primio ostaju u istoriji.

## Autentifikacija {#authentication}

Webhook krajnja tačka nije zaštićena prijavom, pa je metod autentifikacije ono što sprečava nepoznate da pokreću vaše zadatke. Izaberite ga u formi integracije; **Auth secret** je ključ iz [skladišta ključeva](/user-guide/key-store).

| Metod autentifikacije | Šta Semaphore proverava | Auth secret |
|---|---|---|
| **None** | Ništa — svako ko sazna URL može da pokrene šablon | — |
| **GitHub Webhooks** | `X-Hub-Signature-256` je jednako `sha256=` plus HMAC-SHA256 tela | Ključ tipa string ili lozinka ključa login/lozinka |
| **Bitbucket Webhooks** | `X-Hub-Signature` na isti način | Ključ tipa string ili lozinka ključa login/lozinka |
| **Token** | Zaglavlje navedeno u **Auth header** jednako je tajni | Ključ tipa string ili lozinka ključa login/lozinka |
| **HMAC** | Zaglavlje navedeno u **Auth header** sadrži HMAC-SHA256 tela | Ključ tipa string ili lozinka ključa login/lozinka |
| **HMAC (SHA-512)** | Isto, ali sa HMAC-SHA512 | Ključ tipa string ili lozinka ključa login/lozinka |
| **BasicAuth** | Zaglavlje `Authorization` nosi login *i* lozinku | Samo ključ login/lozinka |

Ključ tipa **string** koristi svoju vrednost kao deljenu tajnu; ključ login/lozinka koristi svoju lozinku, a samo BasicAuth upoređuje i login. Ključ tipa koji metod ne može da upotrebi dovodi do odbijanja zahteva, umesto da se neslaganje prećutno ignoriše.

### HMAC autentifikacija {#hmac-authentication}

Metodi HMAC autentifikacije (`hmac` / SHA-256 i `hmac-sha512` / SHA-512) proveravaju da je telo webhooka potpisano deljenom tajnom.

Podesite:

1. **Auth header** — zaglavlje zahteva koje nosi potpis (na primer `X-Signature` ili `X-Hub-Signature-256`).
2. **Auth secret** — ključ tipa **string** iz skladišta ključeva (tajna je njegova vrednost) ili akreditiv login/lozinka (tajna je njegova **lozinka**).

Pošiljalac mora u to zaglavlje da upiše HMAC digest sirovog tela zahteva u **čistom heksadecimalnom** obliku (bez prefiksa `sha256=` / `sha512=`; metodi GitHub i Bitbucket, naprotiv, očekuju taj prefiks, a HMAC metodi ne). Semaphore ga upoređuje sa `HMAC-SHA256` ili `HMAC-SHA512` tela izračunatim pomoću podešene tajne.

Primer (SHA-512) sa OpenSSL-om:

```bash
SECRET='your-webhook-secret'
BODY='{"event":"deploy"}'
SIG="$(printf '%s' "$BODY" | openssl dgst -sha512 -hmac "$SECRET" | awk '{print $2}')"

curl -X POST "https://semaphore.example.com/api/integrations/<alias>" \
  -H "Content-Type: application/json" \
  -H "X-Signature: ${SIG}" \
  --data "$BODY"
```

## Matcheri {#matchers}

Matcher je jedan uslov nad dolaznim zahtevom: *ovo zaglavlje je jednako tome*, *ovo JSON polje sadrži to*. Matcheri su razlog zašto jedan alias projekta može da služi mnogim integracijama: GitHub šalje svaki događaj na isti URL, a matcheri odlučuju koja integracija reaguje na koji događaj.

Matcher odlučuje samo o tome da li će se integracija izvršiti. Zadatak nikada ne menja — za to postoje ekstraktori.

Matcheri se izračunavaju **samo za pozive koji dolaze preko aliasa projekta** (prekidač **Use project alias** uključen). Poziv sopstvenog aliasa integracije pokreće je ne gledajući ih.

### Polja matchera {#matcher-fields}

| Polje | Značenje |
|---|---|
| **Name** | Oznaka za listu. Slobodan tekst, ne učestvuje u upoređivanju |
| **Match on** | **Body** ili **Header** — odakle dolazi vrednost |
| **Body Data Format** | **JSON** ili **String**, prikazuje se samo za **Body** |
| **Key** | Ime zaglavlja ili putanja do polja u JSON telu |
| **Comparison Method** | `==`, `!=` ili **Contains** |
| **Value** | Tekst sa kojim se upoređuje vrednost iz zahteva |

**Match on: Header** — **Key** je ime zaglavlja i veličina slova nije važna, pa su `X-GitHub-Event` i `x-github-event` isto zaglavlje. Zaglavlje koje zahtev ne nosi ponaša se kao vrednost koja nedostaje (vidi niže). Kada se zaglavlje pojavi više puta, upoređuje se samo prva vrednost.

**Match on: Body, JSON** — **Key** je putanja kroz raščlanjeno telo, opisana u sledećem odeljku. Telo koje nije ispravan JSON daje nedostajuću vrednost za svaki ključ.

**Match on: Body, String** — vrednost je celo sirovo telo, a **Key** se ignoriše. Forma ipak traži ključ jer je polje obavezno; upišite crticu. To je jedini način da se uporedi telo koje nije JSON — kombinujte ga sa **Contains**.

I **Key** i **Value** su obavezni, pa matcherom nije moguće proveriti praznu vrednost. Da biste reagovali na nedostatak polja, uporedite ga pomoću `!=` sa vrednošću koju nikada nema.

### JSON ključevi {#json-keys}

Ključ je putanja kroz JSON dokument. Nivoi se razdvajaju tačkama, a element niza se navodi indeksom u uglastim zagradama, počev od nule. Veličina slova u imenima je važna.

```json
{
  "ref": "refs/heads/main",
  "repository": { "name": "semaphore", "private": false },
  "commits": [
    { "id": "9fceb02", "message": "Fix the deploy" },
    { "id": "1c4a7b8", "message": "Bump the version" }
  ]
}
```

| Ključ | Na šta pokazuje |
|---|---|
| `ref` | `refs/heads/main` |
| `repository.name` | `semaphore` |
| `repository.private` | `false` |
| `commits.[0].id` | `9fceb02` |
| `commits.[1].message` | `Bump the version` |
| `commits` | Ceo niz |
| `repository.url` | Ni na šta — to polje ne postoji |

Istu sintaksu koristi i polje **Key** ekstraktora vrednosti.

### Kako matcher upoređuje vrednosti {#how-a-matcher-compares-values}

Vrednost iz zahteva pretvara se u tekst i upoređuje sa **Value** kao tekst, pa polju **Value** nikada nisu potrebni navodnici, zagrade ni escape znakovi.

- **Stringovi** se upoređuju bukvalno, uz razlikovanje velikih i malih slova: `Push` se ne poklapa sa `push`.
- **Brojevi** se upoređuju bez decimalnog dela kada ga nemaju: `42` u telu poklapa se sa vrednošću `42`, a ne sa `42.0`. Decimalni broj upoređuje se onako kako je zapisan, pa se `1.5` poklapa sa `1.5`.
- **Logičke vrednosti** poklapaju se sa `true` i `false`.
- **Vrednost koja nedostaje** — zaglavlje kojeg nema, JSON putanja koja ne postoji, `null` ili telo koje nije ispravan JSON — upoređuje se kao bukvalan tekst `<nil>`. Iz toga sledi nešto što vredi zapamtiti: `==` nikada ne može da se poklopi sa poljem koje nedostaje, a `!=` se sa njim poklapa uvek.
- **Objekti i nizovi** nemaju čitljiv tekstualni oblik; ne upoređujte ih. Ključ umesto toga usmerite na skalarno polje unutra.
- **Contains** je obična provera podstringa, osetljiva na veličinu slova, bez džoker znakova i bez regularnih izraza.

### Više matchera {#several-matchers}

Integracija može imati bilo koliko matchera, a kombinuju se pomoću **I**: integracija se izvršava samo kada se poklopi svaki od njih. Unutar jedne integracije nije moguće izraziti *ili* — za alternativni uslov napravite drugu integraciju nad istim šablonom.

:::warning
Integracija koja koristi alias projekta a **nema matchere** nikada se ne pokreće, jer nema ničega što bi moglo da se poklopi. Dajte joj najmanje jedan matcher ili isključite **Use project alias** i pozivajte sopstveni alias integracije.
:::

### Primeri matchera {#matcher-examples}

| Cilj | Match on | Format | Key | Metod | Value |
|---|---|---|---|---|---|
| Samo GitHub push | Header | — | `X-GitHub-Event` | `==` | `push` |
| Samo push na `main` | Body | JSON | `ref` | `==` | `refs/heads/main` |
| Svaki branch osim `main` | Body | JSON | `ref` | `!=` | `refs/heads/main` |
| Samo tagovi | Body | JSON | `ref` | Contains | `refs/tags/` |
| Samo spojeni GitLab merge requestovi | Body | JSON | `object_attributes.state` | `==` | `merged` |
| Ignoriši commitove bota | Body | JSON | `pusher.name` | `!=` | `dependabot` |
| Samo objavljena GitHub izdanja | Body | JSON | `action` | `==` | `published` |
| Tekstualno upozorenje koje pominje disk | Body | String | `-` | Contains | `disk` |

Prva dva reda zajedno uobičajena su konfiguracija integracije za isporuku: tip događaja iz zaglavlja i branch iz tela, pri čemu oba moraju da se poklope.

## Ekstraktori vrednosti {#value-extractors}

Ekstraktor vrednosti kopira jedan deo dolaznog zahteva u zadatak koji će upravo biti pokrenut. Tako webhook prenosi branch, hash commita, autora ili verziju izdanja automatizaciji koju pokreće.

Ekstraktori se izvršavaju uvek, bez obzira na vrstu aliasa preko koje je poziv došao, i to nakon što su autentifikacija i matcheri prošli.

### Polja ekstraktora {#extractor-fields}

| Polje | Značenje |
|---|---|
| **Name** | Oznaka za listu. Slobodan tekst |
| **Source of the Value** | **Body** ili **Header** |
| **Data Type of Body** | **JSON** ili **String**, prikazuje se samo za **Body** |
| **Key** | Ime zaglavlja ili [JSON ključ](#json-keys) — ista sintaksa kao kod matchera |
| **Variable Usage** | **Variables** ili **Task Params** — gde se vrednost dostavlja |
| **Variable** | Ime koje vrednost dobija u zadatku |

Uz **Body** i **String** celo sirovo telo postaje vrednost, a **Key** se ignoriše, isto kao kod matchera.

### Šta promenljiva dobija {#what-the-variable-receives}

Za razliku od matchera, ekstraktor ništa ne pretvara u tekst: JSON vrednost zadržava svoj tip, pa broj ostaje broj a objekat ostaje objekat.

| Šta zahtev sadrži | Šta promenljiva dobija |
|---|---|
| Zaglavlje | Njegov tekst; prazan string kada zaglavlja nema |
| JSON string, broj ili logičku vrednost | Istu vrednost, sa njenim tipom |
| JSON objekat ili niz | Ceo objekat ili niz, sa sačuvanom strukturom |
| JSON `null`, putanju koja ne postoji ili telo koje nije ispravan JSON | Ništa — promenljiva se **uopšte ne postavlja**, a ono što šablon definiše ostaje na svom mestu |
| Telo kao **String** | Celo sirovo telo kao tekst |

Razlika između „prazno“ i „nije postavljeno“ je važna: zaglavlje koje nedostaje daje zadatku prazan string, dok JSON polje koje nedostaje ostavlja netaknutu sopstvenu vrednost šablona.

### Variable Usage: Variables {#variable-usage-variables}

Vrednost se pridružuje promenljivama zadatka — istom skupu koji popunjava polje **Variables** u dijalogu za novi zadatak. Semaphore ih prenosi alatu kao dodatne promenljive (`--extra-vars` za Ansible, `-var` za Terraform) i one nadjačavaju istoimeni ključ iz [grupe promenljivih](/user-guide/environment) šablona.

Nazovite promenljivu tačno kao [survey promenljivu](/user-guide/task-templates/survey-vars) šablona i webhook će popuniti tu survey promenljivu umesto čoveka.

### Variable Usage: Task Params {#variable-usage-task-params}

Parametri zadatka su ugrađeni [promptovi](/user-guide/task-templates/prompts) šablona, a ne promenljive za playbook. Izdvojena vrednost prenosi se nepromenjena, pa njen JSON tip mora biti onaj koji parametar očekuje — `true`, a ne `"true"`.

| Promenljiva | Važi za | Očekuje |
|---|---|---|
| `git_branch` | Svaku aplikaciju | Branch koji treba preuzeti. Vodeći `refs/heads/` se uklanja, pa se GitHubov `ref` može koristiti takav kakav je |
| `limit`, `tags`, `skip_tags` | Ansible | Listu stringova |
| `debug`, `dry_run`, `diff` | Ansible | `true` ili `false` |
| `plan`, `destroy`, `auto_approve`, `upgrade`, `reconfigure` | Terraform, OpenTofu, Terragrunt | `true` ili `false` |

Da bi vrednost imala efekta, šablon mora da dozvoli nadjačavanje: **Allow override branch in task** za `git_branch` i odgovarajući prompt za `limit`, `tags` i `skip_tags`. Bez te dozvole vrednost se odbacuje i zadatak se izvršava sa podešavanjem samog šablona.

### Primer ekstraktora: GitHub push {#extractor-example-github-push}

GitHub push webhook šalje telo koje počinje ovako:

```json
{
  "ref": "refs/heads/main",
  "after": "9fceb02d0ae598e95dc970b74767f19372d61af8",
  "repository": { "name": "semaphore", "default_branch": "main" },
  "pusher": { "name": "octocat", "email": "octocat@example.com" }
}
```

Četiri ekstraktora pretvaraju ga u potpuno opisan zadatak:

| Name | Source | Format | Key | Usage | Variable |
|---|---|---|---|---|---|
| Branch | Body | JSON | `ref` | Task Params | `git_branch` |
| Commit | Body | JSON | `after` | Variables | `COMMIT` |
| Author | Body | JSON | `pusher.name` | Variables | `AUTHOR` |
| Event | Header | — | `X-GitHub-Event` | Variables | `EVENT` |

Zadatak zatim preuzima `main` (prefiks `refs/heads/` uklanja se umesto vas) i izvršava se sa promenljivama `COMMIT`, `AUTHOR` i `EVENT` dostupnim playbooku. Da vidite šta je stvarni poziv zaista dostavio, otvorite ga u tabu History i uporedite njegovo telo sa svojim ključevima.

## Unapred podešeni parametri zadatka {#task-parameters}

Kada u formi integracije izaberete šablon, pojavljuju se njegove sopstvene opcije pokretanja: poruka, njegove survey promenljive, inventar, Git branch kada šablon dozvoljava nadjačavanje, i promptovi aplikacije. Ono što tu podesite postaje podrazumevana vrednost svakog zadatka koji ova integracija pokrene, pa vrednosti koje se nikada ne menjaju — inventar, fiksna poruka — pripadaju ovde, a ne ekstraktoru.

Ekstraktori se primenjuju preko tih vrednosti: promenljiva ili parametar zadatka koji ekstraktor napravi zamenjuje istoimenu unapred podešenu vrednost, a ta vrednost ostaje kada ekstraktor ne nađe ništa.

## Integracije sa workflowima <FeatureState feature="workflows" /> {#workflow-integrations}

Integracija može pokrenuti [workflow](/user-guide/workflows) umesto jednog šablona. Prebacite **Runs** na **Workflow** u formi integracije i izaberite workflow.

Ekstraktori rade na isti način, uz jednu razliku: **Variable Usage** se ignoriše, a svaka izdvojena vrednost dostavlja se kao odgovor na survey workflowa pod imenom iz **Variable**. Workflow potom proverava te odgovore i prenosi ih svojim čvorovima kroz njihove veze, pa vrednost na koju nijedan čvor nije vezan nikada ne stigne do zadatka. Uspešan poziv javlja `X-Semaphore-Workflow-ID` i `X-Semaphore-Workflow-Run-ID` uz zaglavlja zadatka.

## Istorija poziva {#call-history}

Tab **History** na strani integracija prikazuje svaki poziv koji je projekat primio preko bilo kog svog aliasa, od najnovijeg. Nadživljava alias, integraciju i zadatak koji je pokrenula, jer se čuva po projektu, a ne po integraciji.

| Kolona | Prikazuje |
|---|---|
| **Time** | Kada je poziv stigao |
| **Integration** | Integraciju koja ga je obradila, a ispod alias — klik na alias filtrira listu po njemu |
| **Source IP** | Adresu sa koje je poziv došao |
| **Method** | `GET` ili `POST` |
| **Status** | Šta je integracija uradila sa pozivom, i zašto |
| **Task** | Pokrenuti zadatak ili izvršavanje workflowa |
| **Duration** | Koliko je integraciji trebalo da obradi poziv |

Moguća su četiri statusa:

| Status | Značenje |
|---|---|
| `ok` | Zadatak ili izvršavanje workflowa je počelo |
| `unauthorized` | Zahtev nije prošao metod autentifikacije integracije |
| `skipped` | Matcheri se nisu poklopili ili alias nije pokrenuo nijednu integraciju |
| `error` | Pokretanje je pokušano i nije uspelo — šablona više nema, survey je odbio vrednosti |

Klik na red otvara poziv, uključujući telo zahteva onako kako je primljeno (prvih 64 KiB; ako je bilo duže, prikazuju se i sačuvana i originalna veličina). Zaglavlja zahteva se **nikada ne čuvaju**: nose potpis ili token kojim se pošiljalac autentifikovao. Ni telo poziva koji nije prošao autentifikaciju se ne čuva, jer takav poziv može poslati svako ko zna URL.

Filtrirajte listu po integraciji i po aliasu kontrolama nad tabelom, a kroz stranice se krećite strelicama ispod. Istorija nema rok čuvanja — raste dok se projekat ne izbriše.

## Rešavanje problema {#troubleshooting}

| Simptom | Šta proveriti |
|---|---|
| U History se ne pojavljuje nijedan red | Alias u URL-u je pogrešan ili izbrisan. Ni poziv sopstvenog aliasa integracije dok je **Use project alias** uključen ne beleži se nigde |
| `unauthorized` | Ime zaglavlja za autentifikaciju, ključ u skladištu ključeva i da li pošiljalac šalje potpis sa prefiksom `sha256=` koji metod očekuje. GitHub i Bitbucket koriste svoja zaglavlja nezavisno od **Auth header** |
| `skipped`, razlog *No integration matched the alias* | Alias postoji, ali nijedna integracija projekta nema uključen **Use project alias** |
| `skipped`, razlog *No matcher matched the request* | Otvorite poziv i uporedite njegovo telo sa svojim matcherima. Zapamtite da polje koje nedostaje nikada ne odgovara uz `==`, da je veličina slova u ključevima važna i da **Contains** nema džoker znakove. Integracija bez ijednog matchera preskače se iz istog razloga |
| Zadatak se izvršava, ali je promenljiva prazna ili je nema | JSON ključ ne odgovara sadržaju (otvorite poziv i pogledajte telo), vrednost je bila `null`, ili se ime u **Variable** razlikuje od survey promenljive koju treba popuniti |
| Branch se ne nadjačava | Šablonu je potrebno **Allow override branch in task**, a ekstraktor mora da piše u parametar zadatka `git_branch` |
| Jedan poziv pokreće više zadataka | Više integracija koristi alias projekta i svi njihovi matcheri se poklapaju. Suzite matchere ili dajte integracijama sopstvene aliase |
