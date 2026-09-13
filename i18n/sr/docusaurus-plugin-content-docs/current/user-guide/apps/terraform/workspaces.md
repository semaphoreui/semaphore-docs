
# Radni prostori

![Kartica Radni prostori u šablonu](/assets/template-workspaces.webp)

Semaphore pruža ugrađenu podršku za Terraform radne prostore (Workspaces), što vam omogućava da upravljate više okruženja i konfiguracija unutar jednog projekta (Project). Ova funkcionalnost vam pomaže da održavate odvojene fajlove stanja za različita okruženja, kao što su razvoj, staging i produkcija.

## Funkcionalnosti {#features}

- **Upravljanje radnim prostorima**: kreirajte, menjajte i brišite radne prostore direktno iz Semaphore UI.
- **Izolacija stanja**: svaki radni prostor održava sopstveni fajl stanja, čime se sprečavaju konflikti između okruženja.
- **Promenljive okruženja**: konfigurišite promenljive okruženja specifične za radni prostor.
- **Izbor radnog prostora**: izaberite ciljni radni prostor prilikom izvršavanja Terraform komandi.

## Korišćenje radnih prostora u Semaphore-u {#using-workspaces-in-semaphore}

### Kreiranje radnog prostora {#creating-a-workspace}

U odeljku **Radni prostori** (Workspaces) Terraform/OpenTofu šablona u koji želite da dodate radni prostor pratite sledeće korake:

1. Kliknite na dugme ➕.  
2. U meniju koji se pojavi izaberite **Novi radni prostor** (New Workspace).  
3. U modalnom dijalogu unesite naziv radnog prostora i izaberite SSH ključ koji će se koristiti za kloniranje modula.  
4. Kliknite na dugme **Kreiraj** (Create) da biste dodali novi radni prostor u šablon.  
5. Sada možete koristiti ovaj radni prostor za izvršavanje zadataka (Task).


### Prebacivanje radnih prostora {#switching-workspaces}

Podrazumevani radni prostor za Terraform/OpenTofu šablon možete podesiti klikom na dugme **POSTAVI KAO PODRAZUMEVANI** (MAKE DEFAULT).


### Promenljive specifične za radni prostor {#workspace-specific-variables}

Semaphore trenutno ne podržava promenljive specifične za radni prostor.
