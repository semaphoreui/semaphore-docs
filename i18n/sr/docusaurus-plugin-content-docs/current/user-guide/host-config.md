---
title: Konfiguracija hostova
description: "Dajte privatnim submodulima, Galaxy ulogama, Terraform modulima i hostovima inventara sopstvene pristupne podatke iz Skladišta ključeva, bez izmene repozitorijuma."
---

# Konfiguracija hostova

## Zašto vam je potrebna {#why}

[Repozitorijum](/user-guide/repositories) ima tačno jedan ključ: onaj kojim ga Semaphore klonira. To je dovoljno sve dok sve što je zadatku potrebno živi u tom repozitorijumu. U praksi zadatak poseže i za drugim mestima, a svako od njih može da zahteva različite pristupne podatke:

```mermaid
flowchart LR
  Task[Zadatak] -->|ključ repozitorijuma| Repo[Glavni repozitorijum]
  Repo -.-> Sub[Submodul na drugom serveru]
  Repo -.-> Req[Uloge iz requirements.yml]
  Repo -.-> Mod[Terraform / OpenTofu moduli]
  Task -.-> InvRepo[Inventar u drugom repozitorijumu]
  Task -.-> Hosts[Hostovi inventara sa sopstvenim SSH ključem]
  classDef gap stroke-dasharray: 5 5,stroke:#c62828,color:#c62828
  class Sub,Req,Mod,InvRepo,Hosts gap
```

Isprekidane strelice su praznina: ključ repozitorijuma se ne nudi tim serverima, pa zadatak ne uspeva uz **Permission denied** ili **Authentication failed** čim ih dotakne. Do sada su jedina zaobilazna rešenja bila da se jednom ključu da pristup svuda ili da se pristupni podaci ugrade u fajlove repozitorijuma.

**Host config** (konfiguracija hostova) rešava ovo bez diranja repozitorijuma. Vi kažete Semaphore-u *„kad god se projekat poveže na ovaj host ili ovaj URL, koristi te pristupne podatke iz [Skladišta ključeva](/user-guide/key-store)"*. Mapiranje se primenjuje na svaku Git i SSH vezu zadatka, bez obzira odakle je pokrenut.

| Imate | Šta je u repozitorijumu | Bez mapiranja | Sa mapiranjem |
|---|---|---|---|
| **Privatni submodul** na drugom Git serveru | `.gitmodules` koji pokazuje na `git@gitlab.example.com:infra/common.git` | `git submodule update` se odbija: deploy ključ glavnog repozitorijuma tamo nije poznat | Mapiranje tipa **Host** za `gitlab.example.com` sa ključem dozvoljenim na tom serveru |
| **Privatne uloge ili kolekcije** u Ansible `requirements.yml` | `src: https://gitlab.example.com/ansible/role-nginx.git` | `ansible-galaxy install` traži prijavu i ne uspeva | Mapiranje tipa **URL** za `https://gitlab.example.com/ansible/` sa GitLab pristupnim tokenom |
| **Privatni Terraform / OpenTofu moduli** koji se preuzimaju iz Git-a | `source = "git::https://github.com/acme/tf-modules.git"` | `terraform init` ne može da preuzme modul | Mapiranje tipa **URL** za `https://github.com/acme/` sa SSH ključem ili tokenom |
| **Inventar** čijim hostovima treba **drugačiji SSH ključ** od ključa repozitorijuma | Inventar sa `db-01.internal`, `db-02.internal` | Inventar može da imenuje samo jedan ključ, a ključ repozitorijuma je pogrešan za te hostove | Mapiranje tipa **Host** za svaki naziv hosta, ili jedno mapiranje sa ključem inventara za host koji dele |

Jedno mapiranje pokriva sve ovo odjednom; ne podešavate ih po šablonu. Kada projekat nema mapiranja, ništa se ne menja: zadaci nastavljaju da koriste ključ repozitorijuma, tačno kao i ranije.

## Kako radi {#how-it-works}

Mapiranje je pravilo sa tri dela: **šta** se poklapa (naziv hosta ili URL prefiks), **koji** pristupni podaci iz Skladišta ključeva se koriste, i ništa više. Semaphore instalira mapiranja projekta pre prve Git komande zadatka i uklanja ih kada se zadatak završi. Svaka veza koju zadatak otvori, od njegovog sopstvenog kloniranja do modula `git` unutar playbook-a, prolazi kroz njih.

```mermaid
flowchart LR
  Task["Zadatak<br/>kloniranje · submoduli · requirements.yml<br/>terraform init · hostovi inventara"] --> HC
  subgraph Project
    KS[Skladište ključeva]
    HC[Host config]
  end
  KS -->|ključ A| HC
  KS -->|token B| HC
  HC -->|"Host github.com → ključ A"| GH[github.com]
  HC -->|"URL https://gitlab.example.com/ansible/ → token B"| GL[gitlab.example.com]
```

Stranica se nalazi u meniju projekta, ispod stavke **Repositories**. Dodavanje, izmena i brisanje mapiranja zahtevaju dozvolu za upravljanje resursima projekta, istu koju zahteva i Skladište ključeva.

![Stranica Host config projekta sa tri mapiranja](/assets/host-config-page.webp)

## Tipovi mapiranja {#mapping-types}

Pritisnite **Add mapping** (dodaj mapiranje) i izaberite šta mapiranje treba da poklapa.

### Host {#host}

Mapiranje tipa **Host** poklapa SSH naziv hosta, na primer `github.com` ili `gitlab.example.com`, i zahteva **SSH** ključ. Kad god zadatak otvori SSH vezu ka tom hostu, autentifikuje se mapiranim ključem: repozitorijum ili submodul kloniran preko SSH-a, `git@host:group/repo.git` URL u `requirements.yml`, a takođe i hostovi Ansible inventara sa tim nazivom. Kada ključ ima prijavu (login), ona se koristi kao SSH korisnik za taj host.

<div style={{maxWidth: 720}}>

![Dijalog Add mapping sa izabranim tipom Host](/assets/host-config-form-host.webp)

</div>

### URL {#url}

Mapiranje tipa **URL** poklapa `https://` ili `http://` URL repozitorijuma. Može da imenuje jedan repozitorijum, `https://gitlab.example.com/infra/network.git`, ili da se završava sa `/` i pokrije svaki repozitorijum unutar grupe, `https://gitlab.example.com/ansible/`. Kada se poklapa više mapiranja, pobeđuje najkonkretniji URL, pa mapiranje jednog repozitorijuma nadjačava mapiranje grupe koja ga sadrži.

Pristupni podaci odlučuju kako se URL doseže:

| Pristupni podaci | Šta se dešava |
|---|---|
| **SSH** ključ | URL se prepisuje u svoj SSH oblik i veza se autentifikuje ključem. Prijava ključa je SSH korisnik, `git` kada je ključ nema. |
| **Prijava lozinkom** | Prijava i lozinka se dodaju u URL i šalju preko HTTPS-a. Ostavite prijavu praznu da biste koristili lični pristupni token. Samo `https://` URL prihvata ove pristupne podatke, tako da tajna nikada ne putuje u čitljivom obliku. |

URL ne sme da sadrži sopstvene pristupne podatke, razmake, navodnike ni znak `=`.

<div style={{maxWidth: 720}}>

![Dijalog za izmenu mapiranja tipa URL koje koristi prijavu lozinkom](/assets/host-config-form-url.webp)

</div>

## Gde se mapiranja primenjuju {#where-mappings-apply}

Mapiranja projekta se instaliraju pre prve Git komande zadatka i ostaju na snazi dok se on ne završi. Ona pokrivaju:

- kloniranje i ažuriranje repozitorijuma šablona, uključujući njegove submodule;
- uloge i kolekcije instalirane iz `requirements.yml`, pogledajte [Galaxy zahteve](/user-guide/apps/ansible#galaxy-requirements);
- module koje preuzimaju `terraform init` ili `tofu init`;
- Git komande koje pokreće sam playbook ili skripta, na primer Ansible modul `git`;
- repozitorijum inventara koji se čuva u Git-u;
- hostove inventara, kada se mapiranje tipa **Host** poklapa sa njihovim nazivom;
- pregledanje grana i playbook-ova repozitorijuma u formi šablona i proveru rasporeda koji se pokreću na novi commit.

Zadaci poslati [udaljenom runner-u](/admin-guide/runners) dobijaju mapiranja zajedno sa zadatkom, pa se i tamo ponašaju isto.

Mapiranje nadjačava unos za isti host u SSH konfiguraciji celog servera (`ssh.config_path` u [konfiguraciji](/reference/configuration)); svaki drugi unos iz tog fajla nastavlja da radi. Mapiranja zahtevaju Git klijent komandne linije, što je podrazumevano `git_client: cmd_git`; sa ugrađenim `go_git` klijentom zadatak projekta sa mapiranjima ne uspeva uz grešku sa objašnjenjem umesto da koristi pogrešne pristupne podatke.

## Pristupni podaci {#credentials}

Privatni ključevi nikada ne dodiruju disk: svako SSH mapiranje drži svoj ključ u SSH agentu koji živi koliko i zadatak, a generisana SSH konfiguracija navodi samo agenta. Prijava lozinkom se prosleđuje Git-u kroz njegovo konfiguraciono okruženje, a ne u komandnoj liniji, a Git u logu zadatka prijavljuje izvorni URL, tako da se tajna ne pojavljuje ni na jednom mestu.

Ključ na koji se poziva mapiranje ne može da se obriše; dijalog za potvrdu prikazuje mapiranja koja ga koriste. Promena tipa takvog ključa u tip koji mapiranje ne može da koristi, na primer pretvaranje SSH ključa mapiranja tipa Host u prijavu lozinkom, takođe se odbija.

## Primer {#example}

Playbook se nalazi na GitHub-u, koristi submodul sa samostalno hostovanog GitLab-a i instalira ulogu iz druge GitLab grupe preko `requirements.yml`:

```yaml
# requirements.yml
- src: https://gitlab.example.com/ansible/role-nginx.git
  version: v2.1.0
```

Tri mapiranja omogućavaju da zadatak radi bez ikakve izmene repozitorijuma:

| Tip | Host ili URL | Pristupni podaci |
|---|---|---|
| Host | `github.com` | Deploy ključ GitHub repozitorijuma |
| URL | `https://gitlab.example.com/ansible/` | GitLab pristupni token, kao prijava lozinkom |
| URL | `https://gitlab.example.com/infra/network.git` | SSH ključ dozvoljen samo na tom repozitorijumu |

## Rezervne kopije {#backups}

Mapiranja su deo [rezervne kopije projekta](./projects/settings#danger-zone). Na svoje pristupne podatke pozivaju se po nazivu, pa ih vraćeni projekat zadržava vezane za vraćene ključeve. Kao i kod svakog ključa, sama tajna vrednost se ne izvozi.
