# Timovi

U Semaphore UI, svaki projekat (Project) je povezan sa **timom** (Team). Samo članovi tima i administratori mogu pristupiti projektu. Svakom članu tima dodeljuje se jedna od četiri ugrađene uloge, koje određuju nivo pristupa i radnje koje može da izvodi.

U izdanju **Enterprise**, ugrađene uloge mogu se proširiti [prilagođenim ulogama](#extended-rbac-enterprise) koje daju dodatne, precizno određene dozvole nad određenim šablonima zadataka (Task Template).

:::tip
Da ne biste izgubili pristup projektu, preporučuje se da postoje najmanje dva člana tima sa ulogom <b>Owner</b>.
:::

Odeljak **Team** projekta ima dve kartice: **Members** sa korisnicima i njihovim ulogama, i **Roles** sa prilagođenim ulogama (Enterprise).

![Članovi tima](/assets/team-members.webp)

## Ugrađene uloge {#built-in-roles}

Svaki član tima ima tačno jednu od ove četiri uloge:

- **Owner**
- **Manager**
- **Task Runner**
- **Guest**

Ispod slede detaljni opisi svake uloge i njenih dozvola.

### Owner {#owner}

- **Pune dozvole**<br />
  Vlasnici mogu da rade sve unutar projekta, uključujući upravljanje ulogama, dodavanje i uklanjanje članova i podešavanje svih postavki projekta.

- **Više vlasnika**<br />
  Projekat može imati više vlasnika, čime se obezbeđuje da postoji više od jedne osobe sa punim ovlašćenjima.

- **Ograničenja za samouklanjanje**<br />
  Vlasnik ne može da ukloni samog sebe ako je jedini vlasnik projekta. Time se sprečava da projekat ostane bez vlasnika.

- **Upravljanje drugim vlasnicima**<br />
  Vlasnici mogu da upravljaju svim članovima tima (uključujući uklanjanje ili promenu uloga), pa i drugim vlasnicima.

### Manager {#manager}

- **Široka kontrola nad projektom:** Menadžeri imaju gotovo iste dozvole kao vlasnici, što im omogućava da obavljaju većinu svakodnevnih poslova i upravljaju okruženjem projekta.

- Menadžeri **ne mogu**:
  - Da uklone projekat.
  - Da uklone vlasnike ili promene njihove uloge.

- **Tipičan slučaj upotrebe:** Dodelite ulogu Manager iskusnijim članovima tima kojima je potreban širok pristup, ali ne i ovlašćenje da brišu projekat ili upravljaju vlasnicima.

### Task Runner {#task-runner}

- **Pokretanje zadataka:** Task Runner korisnici mogu da izvršavaju bilo koji šablon zadatka koji postoji u projektu.

- **Pristup samo za čitanje ostalim resursima:** Iako mogu da pokreću zadatke, ostalim resursima kao što su inventar (Inventory), promenljive, repozitorijumi i slično pristupaju samo za čitanje.

- **Tipičan slučaj upotrebe:** Programeri ili QA inženjeri kojima je potrebno da pokreću i prate zadatke, ali ne i da menjaju postavke projekta ili upravljaju članstvom u timu.

### Guest {#guest}

- **Pristup samo za čitanje:** Gosti imaju pristup samo za čitanje svim resursima projekta (na primer, pregled logova, inventara, kontrolnih tabli).

- **Bez dozvola za pisanje:** Ne mogu da menjaju postavke, pokreću zadatke niti menjaju uloge.

- **Tipičan slučaj upotrebe:** Zainteresovane strane ili drugi saradnici kojima je potrebno samo da vide status i detalje projekta, bez uvođenja izmena.

---

## Prošireni RBAC <Enterprise /> {#extended-rbac-enterprise}

:::info
Prošireni RBAC dostupan je u izdanju **Semaphore Enterprise**, počev od [Semaphore v2.17](https://semaphoreui.com/releases/semaphore-v2_17).
:::

Prošireni RBAC dodaje dodatne dozvole povrh četiri ugrađene uloge. Same ugrađene uloge ostaju nepromenjene. Ako ne definišete prilagođene uloge, svaki projekat se ponaša potpuno isto kao u community izdanju.

Uz prošireni RBAC, prilagođene uloge mogu dodeliti pojedinačne dozvole na nivou celog projekta. Takođe možete dodeliti ulozi dozvole nad izabranim šablonima zadataka. Time članu tima dajete pristup šablonima koji su mu potrebni, bez unapređenja u višu ugrađenu ulogu.

### Prilagođene uloge {#custom-roles}

Prilagođena uloga je imenovani skup dozvola koji dopunjuje ugrađenu ulogu člana u projektu. Svaki član tima zadržava svoju ugrađenu ulogu. Prilagođene uloge joj dodaju dozvole.

Prilagođene uloge dostupne su na dva nivoa:

- **Globalne uloge** definišu se na nivou instance i mogu se koristiti u bilo kom projektu.
- **Uloge projekta** definišu se unutar jednog projekta i dostupne su samo u tom projektu.

### Nivoi dozvola {#permission-levels}

Prilagođene uloge dodeljuju dozvole na dva nivoa:

- **Dozvole na nivou projekta** proširuju pristup korisnika kroz ceo projekat. Birate ih pri kreiranju uloge.
- **Dozvole nad šablonom** određuju radnje nad jednim šablonom zadatka. Birate ih na kartici **Permissions** tog šablona, nakon što ulogu dodate šablonu.

### Kreiranje prilagođene uloge {#create-a-custom-role}

Izaberite nivo pre otvaranja obrasca uloge.

#### Globalna uloga {#global-role}

Globalne uloge kreiraju se jednom i mogu se dodeliti korisnicima u bilo kom projektu. Samo administrator instance može kreirati globalnu ulogu.

Otvorite administratorski meni u donjem levom uglu i izaberite **Roles**.

Na listi uloga na nivou instance izaberite **New Role**.

![Otvorite Roles iz administratorskog menija, zatim izaberite New Role](/assets/custom-roles-navigation-to-new-role-annotated-v4.png)

#### Uloga projekta {#project-role}

Uloge projekta dostupne su samo u projektu u kojem su kreirane. Mogu ih kreirati vlasnici i menadžeri projekta.

1. Otvorite projekat i idite na **Team** > **Roles**.
2. Izaberite **New Role**.

Kartica **Roles** je prazna dok se ne kreira prva uloga projekta. Na njoj se prikazuju sve uloge projekta i nalazi se dugme **New Role**.

![](https://www.semaphoreui.com/uploads/v2.17/roles1.webp)

### Podešavanje prilagođene uloge {#configure-a-custom-role}

Oba puta otvaraju isti obrazac uloge. Podesite ulogu tako da odgovara pristupu koji je potreban članu vašeg tima.

![Dijalog New Role sa poljima i poljima za potvrdu dozvola](/assets/custom-roles-global-role-form.jpg)

| Polje | Opis |
| --- | --- |
| **Name** | Čitljiv naziv uloge. |
| **Slug** | Jedinstveni tehnički identifikator koji se koristi za referenciranje uloge. Koristite mala slova, brojeve, donje crte ili crtice, na primer `release_operator`. |
| **Permissions** | Dozvole na nivou projekta koje uloga dodeljuje. |

#### Dozvole na nivou projekta {#project-wide-permissions}

Izaberite samo one dozvole na nivou projekta koje su ulozi potrebne:

| Dozvola | Opis |
| --- | --- |
| **Can run project tasks** | Pokretanje zadataka projekta. |
| **Can update project** | Uređivanje osnovnih informacija o projektu u **Dashboard** > **Settings**. |
| **Can manage project resources** | Upravljanje resursima projekta, kao što su šabloni zadataka, repozitorijumi, inventar, okruženja, stavke skladišta ključeva (Key Store), rasporedi, integracije i runner-i. Ovo je pristup na nivou celog projekta. Ne može se ograničiti na pojedinačne resurse koji nisu šabloni. |
| **Can manage project users** | Upravljanje članstvom u projektu i dodelom uloga. |

Dozvole na nivou projekta ne mogu se ograničiti na jedan inventar, repozitorijum, okruženje ili stavku skladišta ključeva. Šabloni zadataka su jedini tip resursa koji podržava preciznu dodelu uloga.

:::tip Pristup samo šablonima
Da biste kreirali preciznu ulogu koja dodaje pristup samo izabranim šablonima zadataka, ostavite sve dozvole na nivou projekta neoznačene. Uloga tada ne dodaje nikakve sopstvene dozvole na nivou projekta. Dodajte je potrebnim šablonima i tamo izaberite samo radnje koje su toj ulozi potrebne.
:::

Kada je konfiguracija uloge spremna, izaberite **Save**.

### Podešavanje pristupa određenim šablonima zadataka {#configure-access-to-specific-task-templates}

Dozvole nad šablonom dodaju pristup izabranim šablonima zadataka. Primer ispod koristi prilagođenu ulogu bez dozvola na nivou projekta. Ova konfiguracija po principu najmanjih privilegija korisna je kada su članu tima potrebne samo pojedine radnje nad šablonima. Dozvole nad šablonom možete dodati i ulozi koja već daje pristup na nivou projekta.

**Otvorite potrebni šablon**

1. Otvorite **Task Templates** i izaberite ciljni šablon.
2. Otvorite karticu **Permissions**.

Kartica **Permissions** prikazuje uloge koje su već dodate šablonu.

![](https://www.semaphoreui.com/uploads/v2.17/roles2.webp)

**Dodajte ulogu i dodelite dozvole nad šablonom**

1. Izaberite **Add Role** i odaberite prilagođenu ulogu koju dodajete ovom šablonu.
2. Izaberite samo one dozvole nad šablonom koje su ulozi potrebne, kao što su **Can run tasks** ili **Can update the template**.

Ovaj primer koristi prethodno kreiranu ulogu bez dozvola na nivou projekta. Možete izabrati bilo koju prilagođenu ulogu koja je dostupna u projektu.

![Dijalog dozvola nad šablonom sa istaknutim potrebnim kontrolama](/assets/custom-roles-template-permissions-annotated.png)

Da biste istoj ulozi dodelili pristup dodatnim šablonima, ponovite ove korake za svaki šablon.

:::note Postojeći pristup projektu
Dozvole nad šablonom su aditivne. One dodaju pristup, ne zamenjujući niti umanjujući pristup koji proističe iz ugrađene uloge korisnika ili drugih prilagođenih uloga. Ako korisnik već može da pokreće ili menja sve šablone zadataka, dodavanje uloge vezane za šablon neće suziti taj pristup.
:::

### Dodela prilagođene uloge u projektu {#assign-a-custom-role-in-a-project}

Nakon kreiranja i podešavanja globalne uloge ili uloge projekta, dodelite je potrebnom članu tima:

1. Otvorite projekat i idite na **Team**.
2. Proširite **Roles** pored potrebnog korisnika.
3. Izaberite prilagođenu ulogu.

### Trenutno nije podržano {#not-currently-supported}

- **Mapiranje LDAP / OIDC grupa.** Prilagođene uloge dodeljuju se po korisniku. Mapiranje grupa iz spoljnog direktorijuma na prilagođene uloge nije podržano.
- **Precizne dozvole za resurse koji nisu šabloni.** Danas se prilagođenim ulogama na nivou pojedinačnog resursa mogu kontrolisati samo šabloni.

---

## Upravljanje članovima tima {#managing-team-members}

- **Pozivanje novih članova:** **Vlasnici** i **menadžeri** mogu pozvati nove korisnike da se pridruže timu i dodeliti im početnu ulogu.

- **Promena uloga:** Vlasnici uvek mogu da promene ulogu bilo kom članu tima. Menadžeri mogu da menjaju uloge korisnicima **Task Runner** i **Guest**, ali **ne** i drugim menadžerima ili vlasnicima.

- **Uklanjanje članova:** Vlasnici i menadžeri mogu da uklone članove tima sa nižim ulogama.
  - Vlasnik može da ukloni bilo koga (uključujući druge vlasnike), ali ne može da ukloni samog sebe ako je jedini vlasnik.
  - Menadžer može da ukloni korisnike **Task Runner** i **Guest**, ali **ne** i druge menadžere ili vlasnike.

---

## Najbolje prakse {#best-practices}

1. **Održavajte redundansu:** Dodelite ulogu **Owner** najmanje dvema osobama kako biste obezbedili neprekidan pristup i sprečili jedinstvenu tačku otkaza.
2. **Pridržavajte se principa najmanjih privilegija:**
   - Dajte članovima tima najmanju ulogu potrebnu za njihove zadatke.
   - Koristite uloge **Task Runner** ili **Guest** za one kojima su potrebne samo ograničene dozvole.
   - U izdanju Enterprise, radije koristite [prilagođene uloge](#extended-rbac-enterprise) za dodelu pristupa određenim šablonima umesto da članu podižete ugrađenu ulogu.
3. **Redovno preispitujte članstvo:**
   - Kako se struktura tima menja, iznova procenite uloge.
   - Opozovite pristup ili snizite uloge korisnicima kojima više nisu potrebne visoke privilegije.
4. **Koristite menadžere za svakodnevnu administraciju:**
   - Rezervišite ulogu Owner za manju grupu sa krajnjim ovlašćenjima.
   - Rutinske poslove upravljanja projektom delegirajte menadžerima kako biste smanjili rizik od slučajnih velikih izmena ili brisanja projekta.

---

## Često postavljana pitanja {#frequently-asked-questions}

### 1. Može li vlasnik da ukloni drugog vlasnika? {#1-can-an-owner-remove-another-owner}
Da, vlasnik može da ukloni ili promeni ulogu bilo kom drugom vlasniku, osim ako je taj poslednji preostali vlasnik u projektu.

### 2. Ko može da obriše projekat? {#2-who-can-delete-the-project}
Projekat mogu da obrišu samo **vlasnici**.

### 3. Mogu li menadžeri da dodaju ili uklanjaju druge menadžere? {#3-can-managers-add-or-remove-other-managers}
Ne. Menadžeri mogu da dodaju ili uklanjaju samo korisnike sa ulogama **Task Runner** ili **Guest**. Za upravljanje vlasnicima ili drugim menadžerima morate biti vlasnik.

### 4. Šta se dešava ako slučajno uklonim sve vlasnike? {#4-what-happens-if-i-remove-all-owners-by-accident}
Semaphore UI sprečava uklanjanje vlasnika ako bi projekat time ostao potpuno bez vlasnika. U svakom trenutku mora postojati najmanje jedan vlasnik.

### 5. Mogu li gosti da pokreću zadatke? {#5-can-guests-run-tasks}
Ne. Gosti imaju pristup samo za čitanje i ne mogu pokretati niti upravljati zadacima. U izdanju Enterprise možete gostu dodeliti dozvolu da pokreće pojedinačne šablone putem [prilagođene uloge](#extended-rbac-enterprise).

### 6. Da li prilagođene uloge zamenjuju ugrađene uloge? {#6-do-custom-roles-replace-the-built-in-roles}
Ne. Prilagođene uloge proširuju ugrađene uloge dodatnim dozvolama na nivou projekta i šablona. Svaki član tima i dalje ima tačno jednu ugrađenu ulogu.

### 7. Da li je prošireni RBAC dostupan u community izdanju? {#7-is-extended-rbac-available-in-the-community-edition}
Ne. Prošireni RBAC zahteva pretplatu na **Semaphore Enterprise**.
