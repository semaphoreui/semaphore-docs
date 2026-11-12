---
title: Hosts
description: Administratorski pregled hostova svih projekata, broj Nodes iz licence i kako ukinuti host kojim više ne upravljate.
sidebar_custom_props:
  edition: pro
---

# Hosts <FeatureState feature="hosts" />

Administratorska stranica **Hosts** navodi hostove svih projekata na jednom mestu i prikazuje koji se
od njih računaju u **Nodes** vaše licence. Otvorite Admin meni u donjem levom uglu i izaberite
**Hosts**.

Način na koji hostovi dospevaju na listu, statusi, pretraga i kartica hosta isti su kao na stranici
projekta. Za više informacija pogledajte [Hosts](/user-guide/hosts). Ovde je host jedan red za sve
projekte, a njegova kartica navodi projekte i zadatke koji su stigli do njega.

## Broj iz licence {#license-count}

Vaša licenca uključuje određen broj hostova. Red **Nodes** u dijalogu **Pretplata i naplata**
prikazuje koliko ih je u upotrebi, na primer `42 / 50`. Host je u upotrebi kada je Ansible zadatak
stigao do njega u poslednjih mesec dana i niko ga nije ukinuo. Host koji je oduvek bio nedostupan nije
u upotrebi.

Hostovi koji nisu u upotrebi na listi prikazuju **Not counted**. U broj se vraćaju sami čim zadatak
sledeći put stigne do njih.

Kada je u upotrebi više hostova nego što licenca uključuje, red **Nodes** postaje crven sa
**(limit exceeded)** i ova stranica prikazuje upozorenje. Ukinite hostove kojima više ne upravljate ili
produžite licencu. Za više informacija pogledajte [License activation](/admin-guide/license).

## Ukinite host {#decommission}

Kada ste uklonili host iz svoje infrastrukture, kliknite **Decommission** na kraju njegovog reda i
potvrdite. Host odmah izlazi iz broja, prikazuje **Decommissioned** i zadržava svoju istoriju u svakom
projektu. Ako zadatak kasnije ponovo stigne do njega, Semaphore uklanja oznaku i host je ponovo u
upotrebi.

## Šta dalje {#whats-next}

- [Hosts](/user-guide/hosts) — stranica projekta, statusi i kartica hosta.
- [License activation](/admin-guide/license) — aktivirajte i zamenite licencni ključ.
