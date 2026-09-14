---
title: Konfiguracija
description: Semaphore čita podešavanja iz konfiguracione datoteke i promenljivih okruženja. Onlajn konfigurator pomaže da pripremite oba formata pomoću obrasca. Izaberite način koji odgovara vašem serveru.
---

# Konfiguracija

Semaphore čita podešavanja iz konfiguracione datoteke i promenljivih okruženja. Onlajn konfigurator pomaže da pripremite oba formata pomoću obrasca. Izaberite način koji odgovara vašem serveru.

## U ovom odeljku {#in-this-section}

| Metod | Kada ga koristiti |
|---|---|
| [Onlajn konfigurator](/admin-guide/configuration/online) | Želite obrazac koji generiše konfiguraciju i komande za pokretanje binarne ili Docker instalacije. |
| [Konfiguraciona datoteka](/admin-guide/configuration/config-file) | Želite da čuvate podešavanja servera u datoteci `config.json`. |
| [Promenljive okruženja](/admin-guide/configuration/env-vars) | Upravljate podešavanjima preko Docker-a, definicije servisa ili alata za postavljanje. |

## Konfiguracione opcije {#configuration-options}

Promenljiva okruženja ima prednost nad odgovarajućom vrednošću u datoteci. Podrazumevana vrednost se primenjuje kada nijedna nije postavljena. Ako izmena datoteke nema efekta, proverite okruženje Semaphore procesa.

[Referenca opcija konfiguracije](/reference/configuration) navodi nazive, promenljive okruženja, tipove i podrazumevane vrednosti. Generiše se iz Semaphore izvornog koda; za stariji server koristite dokumentaciju njegove verzije.

<span id="frequently-asked-questions" />

## Javni URL {#1-how-to-configure-a-public-url-for-semaphore-ui}

Postavite `web_host` (ili `SEMAPHORE_WEB_ROOT`) na adresu koju korisnici otvaraju u pregledaču. Ako obrnuti proksi izlaže Semaphore na `https://example.com/semaphore`, koristite celu adresu, uključujući `/semaphore`. To je javna adresa, a ne interna adresa na koju se proksi povezuje.

## Odakle početi {#where-to-start}

Za novi server otvorite vodič za onlajn konfigurator i pratite korake za binarnu ili Docker instalaciju. Za postojeći server izmenite datoteku ili promenljive okruženja njegovog servisa, pa ponovo pokrenite Semaphore.
