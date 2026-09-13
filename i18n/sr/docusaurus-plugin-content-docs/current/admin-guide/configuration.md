# Konfiguracija

Semaphore se može konfigurisati na nekoliko načina:

* [Onlajn konfigurator](https://semaphoreui.com/install) &mdash; veb interfejs za generisanje konfiguracije onlajn.
* [Konfiguraciona datoteka](/admin-guide/configuration/config-file) &mdash; primarni i najfleksibilniji način konfigurisanja Semaphore-a.
* [Promenljive okruženja](/admin-guide/configuration/env-vars) &mdash; korisne za kontejnerizovana ili cloud-native okruženja.


## Konfiguracione opcije {#configuration-options}

Sve opcije, zajedno sa svojom promenljivom okruženja, tipom i podrazumevanom vrednošću,
navedene su u [referenci konfiguracionih opcija](/reference/configuration). Ta stranica se
generiše iz Semaphore izvornog koda, pa uvek odgovara verziji koju pokrećete.

Vrednosti se razrešavaju jednim redosledom: promenljiva okruženja ima prednost nad
konfiguracionim fajlom, a ugrađena podrazumevana vrednost se primenjuje samo kada nijedno
od toga nije postavljeno.

## Često postavljana pitanja {#frequently-asked-questions}

### 1. Kako da podesim javni URL za Semaphore UI {#1-how-to-configure-a-public-url-for-semaphore-ui}

Ako ispred Semaphore-a koristite nginx ili drugi veb server, treba da navedete konfiguracionu opciju `web_host`.

Na primer, konfigurisali ste NGINX na serveru koji prosleđuje upite Semaphore-u.

Adresa servera je `https://example.com` i sve upite ka `https://example.com/semaphore` prosleđujete Semaphore-u.

Vaš `web_host` će biti `https://example.com/semaphore`.
