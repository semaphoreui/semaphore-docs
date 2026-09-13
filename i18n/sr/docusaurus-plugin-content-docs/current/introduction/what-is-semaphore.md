---
title: Šta je Semaphore
description: Šta Semaphore UI radi, koje probleme rešava, kome je namenjen i u kojim slučajevima je neki drugi alat bolji izbor.
---

# Šta je Semaphore

Semaphore UI je samostalno hostovan veb interfejs i REST API za pokretanje automatizacije
koju već imate. Usmerite ga na Git repozitorijum sa vašim Ansible playbook-ovima,
Terraform konfiguracijama ili shell skriptama, kažete mu koje kredencijale i hostove da
koristi, i on postaje jedino mesto na kom vaš tim pokreće tu automatizaciju, čuva
tajne koje su joj potrebne i vodi evidenciju o svakom pokretanju.

Zadatke možete pokretati pojedinačno ili ih povezati u jedan pipeline pomoću
[Workflows](/user-guide/workflows) (Pro), objedinjujući build, testiranje, isporuku
i automatizaciju infrastrukture.

Semaphore ne zamenjuje Ansible, Terraform ili vaše skripte. On ih pokreće, na
serveru umesto na nečijem laptopu.

## Problem koji rešava {#the-problem-it-solves}

Automatizacija obično počinje na radnoj stanici. Jedan inženjer ima playbook,
inventar, SSH ključ i instaliranu odgovarajuću verziju Ansible-a. To funkcioniše dok
druga osoba ne bude morala da pokrene istu stvar, ili dok neko ne upita šta se prošlog
utorka promenilo na nekom hostu.

Semaphore premešta pokretanje na zajednički server i dodaje delove koji su nedostajali:

| Deo koji nedostaje | Šta Semaphore pruža |
|---|---|
| Svima su potrebni instalirani alati | Jedan server (ili runner) ih ima; korisnicima je potreban samo pregledač. |
| Kredencijali se kopiraju između laptopova | Šifrovano [Skladište ključeva](/user-guide/key-store) koje tajne predaje pokretanju, a nikada korisniku. |
| Nema evidencije o tome ko je šta pokrenuo | Svaki [zadatak](/user-guide/tasks) čuva svoj izlaz, izlazni status, korisnika i vreme. |
| Niko ne bi trebalo da ima root da bi pokrenuo jedan playbook | [Uloge](/user-guide/team) određuju ko sme da pokreće, menja ili samo posmatra. |
| Pokretanja se dešavaju kada se neko seti | Pokreću ih [rasporedi](/user-guide/schedules), [webhook-ovi](/user-guide/integrations) i API pozivi. |

## Kome je namenjen {#who-it-is-for}

- **Timovima za infrastrukturu i platforme** koji već koriste Ansible ili Terraform i žele
  da ih njihove kolege pokreću bez deljenja produkcionih kredencijala.
- **Timovima koji prave CI/CD pipeline-ove** i žele da povežu zadatke za build,
  testiranje i isporuku pomoću radnih tokova, uz operativne poslove po rasporedu i na zahtev.
- **Timovima sa CI/CD platformom** koji žele da operativna pokretanja — restartovanja, isporuke,
  obnove sertifikata — ostanu izvan build sistema i budu vidljiva ljudima koji ne
  čitaju pipeline YAML.

Semaphore je samostalno hostovan. Ne postoji SaaS verzija: binarnu datoteku ili kontejner
pokrećete na sopstvenoj infrastrukturi i vaše tajne je nikada ne napuštaju.

## Šta pokreće {#what-it-runs}

Svaki [šablon zadatka](/user-guide/task-templates) bira aplikaciju:

- [Ansible](/user-guide/apps/ansible) — playbook-ovi sa inventarima, vault lozinkama i
  kompletnim skupom `ansible-playbook` opcija.
- [Terraform, OpenTofu i Terragrunt](/user-guide/apps/terraform) — plan i apply sa
  workspace-ovima i stanjem koje čuva vaš backend.
- [Shell](/user-guide/apps/bash), [PowerShell](/user-guide/apps/powershell) i
  [Python](/user-guide/apps/python) — sve što nije pokriveno gore navedenim.

Zadaci se izvršavaju na samom serveru ili na [runner-ima](/admin-guide/runners) postavljenim blizu
sistema kojima upravljaju.

[Workflows](/user-guide/workflows) (Pro) povezuje šablone zadataka u pipeline pomoću
vizuelnog editora. Svaki korak može da pokreće drugu aplikaciju: na primer, da gradi i
testira izvorni kod pomoću shell skripti, priprema infrastrukturu pomoću Terraform-a,
a zatim vrši isporuku pomoću Ansible-a. Možete dodati korake za odobravanje, vremenske
pauze i grane koje se pokreću pri uspehu ili neuspehu. Semaphore automatski pokreće
naredne zadatke kada su njihovi uslovi ispunjeni.

## Kada ga ne koristiti {#when-not-to-use-it}

Poznavanje granica kasnije štedi vreme.

- **Kao zamenu za Ansible ili Terraform.** Semaphore nema sopstveni izvršni mehanizam. Ako
  vaš playbook ne radi iz shell-a, neće raditi ni iz Semaphore-a.
- **Kao CMDB.** [Inventari](/user-guide/inventory) su inventari koji su potrebni vašim
  pokretanjima, a ne izvor istine o vašoj infrastrukturi. Generišite ih iz stvarnog izvora
  pomoću dinamičkog inventara.
- **Kao menadžer tajni vaše organizacije.** Tajne su šifrovane u mirovanju i osmišljene su
  tako da ih koriste zadaci, a ne da ih ljudi čitaju. Ako već koristite HashiCorp
  Vault ili neko drugo skladište, [povežite ga](/user-guide/key-store) umesto da kopirate tajne unutra.
- **Za pokretanje servisa na jednom čvoru kada nikakav prekid nije prihvatljiv.** Za više aktivnih
  čvorova potrebna je [visoka dostupnost](/admin-guide/ha), što je Enterprise funkcionalnost i
  zahteva PostgreSQL ili MySQL uz Redis.

## Šta sledi {#whats-next}

- [Arhitektura](/introduction/architecture) — procesi, baza podataka i mesto gde se zadaci izvršavaju.
- [Osnovni pojmovi](/introduction/concepts) — deset reči za koje interfejs očekuje da ih znate.
- [Prvi koraci](/getting-started) — instalirajte ga i pokrenite nešto.
