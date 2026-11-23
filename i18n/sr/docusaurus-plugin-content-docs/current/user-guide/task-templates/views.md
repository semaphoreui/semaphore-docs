# Prikazi

Prikazi (Views) grupišu šablone zadataka (Task Templates) u kartice iznad liste šablona. Projekat počinje sa jednim prikazom **Svi** (All); možete dodati sopstvene, na primer **Build**, **Deploy** i **Alati**, tako da ljudi brzo pronađu pravi šablon u projektima sa mnogo šablona.

![Lista šablona sa karticama prikaza](/assets/templates-list.webp)

## Upravljanje prikazima {#managing-views}

Korisnici sa ulogom **Menadžer** (Manager) ili višom mogu da uređuju prikaze. Kliknite na ikonu olovke pored kartica prikaza da biste otvorili dijalog **Uredi prikaze** (Edit views), a zatim pomoću **Dodaj prikaz** (Add view) kreirajte novu karticu. Svaki prikaz ima sledeća podešavanja:

| Podešavanje | Opis |
|---|---|
| **Naslov** (Title) | Oznaka kartice. |
| **Tip** (Type) | **Prilagođen** (Custom) prikazuje samo šablone dodeljene ovom prikazu. **Svi** (All) prikazuje sve šablone projekta. |
| **Sortiraj po** (Sort by) i **Obrnuto** (Reverse) | Podrazumevani redosled sortiranja šablona na kartici. |
| **Sakriven** (Hidden) | Zadržava prikaz, ali sakriva karticu. |
| **Show task counts** | Prikazuje na kartici koliko je njenih šablona u kom stanju, pogledajte [Broj šablona na karticama](#template-counts). Podrazumevano isključeno. |

Prevlačite prikaze u dijalogu da biste promenili redosled kartica. Brisanje prikaza ne briše njegove šablone, oni ostaju vidljivi u prikazu **Svi** (All).

## Dodeljivanje šablona prikazu {#assigning-a-template-to-a-view}

Otvorite formu šablona i izaberite karticu u polju **Prikaz** (View). Šablon istovremeno pripada samo jednom prilagođenom prikazu i uvek je naveden u prikazima tipa **Svi** (All).

## Broj šablona na karticama {#template-counts}

Prikaz sa uključenom opcijom **Show task counts** prikazuje pored naslova koliko je njegovih šablona u kom stanju, kao jedan čip od obojenih segmenata. Stanje šablona je status njegovog poslednjeg zadatka. Segment se ne prikazuje kada je njegov broj nula, a brojevi prate zadatke dok se izvršavaju. Kod novog prikaza opcija je isključena, a brojevi se računaju samo za prikaze kod kojih je uključena.

| Boja | Šabloni koji se broje |
|---|---|
| Zelena | Poslednji zadatak je uspešno završen. |
| Crvena | Poslednji zadatak nije uspeo. |
| Siva | Poslednji zadatak je zaustavljen ili se zaustavlja, ili šablon nikada nije pokrenut. |
| Narandžasta | Poslednji zadatak čeka potvrdu. |
| Plava | Poslednji zadatak čeka u redu, pokreće se ili se izvršava. |

Brojevi obuhvataju samo šablone koje smete da vidite.

## Kolone {#columns}

Ikona zupčanika u gornjem desnom uglu liste šablona otvara birač kolona. Važi za sve prikaze i čuva se u vašem pregledaču.

![Birač kolona](/assets/templates-columns.webp)
