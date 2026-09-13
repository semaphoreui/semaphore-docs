# Vaš nalog

Vaša lična podešavanja nalaze se u meniju naloga na dnu bočne trake. Kliknite na svoje ime da biste ga otvorili.

![Meni naloga](/assets/user-menu.webp)

| Stavka | Opis |
|---|---|
| Verzija | Verzija Semaphore UI koja radi na serveru. |
| **API tokeni** (API Tokens) | Lični tokeni za [REST API](/reference/api). |
| **Izmeni nalog** (Edit Account) | Vaše ime, korisničko ime, e-mail, podešavanje obaveštenja i lozinka. |
| **Odjava** (Sign Out) | Završava sesiju. |

Pored menija nalaze se prekidač za **tamni režim** (dark mode) i birač **jezika** (language). Oba podešavanja se čuvaju u vašem pregledaču.

## Izmena naloga {#edit-account}

![Dijalog za izmenu naloga](/assets/account-edit.webp)

Kartica **Podešavanja** (Settings) sadrži:

| Polje | Opis |
|---|---|
| **Ime** (Name) | Prikazno ime koje se vidi u istoriji zadataka i aktivnostima. |
| **Korisničko ime** (Username) | Ime za prijavu. |
| **E-mail** (Email) | Adresa koja se koristi za e-mail obaveštenja i oporavak lozinke. |
| **Slanje obaveštenja** (Send alerts) | Primanje e-mail obaveštenja o zadacima (Task). Obaveštenja se šalju samo kada je [e-mail kanal](/admin-guide/notifications/email) konfigurisan i kada projekat (Project) dozvoljava obaveštenja. |

Oznake pored polja za potvrdu prikazuju vaše globalne atribute: **Pro korisnik** (Pro user) na Pro instanci, **Admin** za administratore, **Eksterni** (External) za naloge kojima upravlja LDAP ili OpenID Connect. Eksterni korisnici ovde ne mogu da menjaju korisničko ime ni lozinku.

Kartica **Bezbednost** (Security) omogućava promenu lozinke. Ako je administrator uključio vremenski ograničene jednokratne lozinke, drugi faktor se konfiguriše na istoj kartici.

![Kartica Bezbednost](/assets/account-security.webp)

## API tokeni {#api-tokens}

Izaberite **API tokeni** (API Tokens) u meniju naloga. Stranica prikazuje vaše tokene sa datumom kreiranja, datumom isteka i statusom. Link **API referenca** (API Reference) otvara Swagger UI ugrađen u vašu instancu.

![API tokeni](/assets/api-tokens.webp)

Kliknite **Novi token** (New Token), dajte tokenu naziv i izaberite kada ističe. Vrednost tokena se prikazuje samo jednom, nakon kreiranja, pa je odmah kopirajte.

![Dijalog za novi token](/assets/api-token-new.webp)

Token koristite u zaglavlju `Authorization: Bearer`, pogledajte [API](/reference/api). Da biste opozvali token, obrišite ga sa liste.
