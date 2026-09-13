---
title: "Aktivacija licence"
---

# Aktivacija licence <Pro />

Funkcije Semaphore Pro i Enterprise izdanja uključuju se licencnim ključem. Licencu možete aktivirati iz veb interfejsa ili navesti ključ u konfiguraciji servera za automatizovane instalacije.

## Pre nego što počnete {#before-you-start}

- Ne morate ponovo da instalirate Semaphore UI niti da prelazite na drugi build da biste aktivirali Pro ili Enterprise. Vaša trenutna verzija Semaphore UI može se aktivirati licencnim ključem. Ažurirajte na najnoviju verziju ako želite pristup najnovijim Pro ili Enterprise funkcijama.
- Prijavite se administratorskim nalogom.
- Pripremite licencni ključ. Možete ga naći u e-poruci o kupovini ili na [Semaphore UI portalu](https://portal.semaphoreui.com/auth/login).

## Aktivacija iz veb interfejsa {#activate-from-the-web-ui}

1. Prijavite se u Semaphore UI kao administrator.

![Ekran za prijavu u Semaphore UI](/assets/subscription-login-screen.png)

2. Otvorite meni Admin iz korisničkog dela u donjem levom uglu.

![Dugme za otvaranje menija Admin u donjem levom uglu](/assets/subscription-admin-menu-trigger.png)

3. Izaberite **Nadogradi na PRO ili EE** (Upgrade to PRO or EE).

![Meni Admin sa stavkom Upgrade to PRO or EE](/assets/subscription-upgrade-menu-item.png)

4. Nalepite licencni ključ u dijalog za aktivaciju i kliknite **AKTIVIRAJ NOVI KLJUČ** (ACTIVATE NEW KEY).

![Dijalog za aktivaciju Semaphore Pro](/assets/subscription-activation-dialog.png)

Nakon uspešne aktivacije Semaphore UI prikazuje podatke o vašoj trenutnoj licenci u dijalogu **Pretplata i naplata** (Subscription & Billing).

![Dijalog Subscription and Billing nakon uspešne aktivacije](/assets/subscription-activation-success.png)

## Aktivacija iz konfiguracije {#activate-from-configuration}

Za Docker, Kubernetes, systemd ili druge automatizovane instalacije navedite licencni ključ u konfiguraciji servera umesto da ga unosite u interfejs. Nazivi konfiguracionih opcija koriste `subscription.*`.

U `config.json`:

```json
{
  "subscription": {
    "key": "YOUR_LICENSE_KEY"
  }
}
```

Ili kao promenljivu okruženja:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY=YOUR_LICENSE_KEY
```

Ključ možete čuvati i u fajlu:

```json
{
  "subscription": {
    "key_file": "/run/secrets/semaphore-license-key"
  }
}
```

ili:

```bash
export SEMAPHORE_SUBSCRIPTION_KEY_FILE=/run/secrets/semaphore-license-key
```

Kada se licencnim ključem upravlja kroz konfiguraciju, Semaphore UI onemogućava kontrole za izmenu i aktivaciju u dijalogu **Pretplata i naplata** (Subscription & Billing). Ovo važi i za `subscription.key` i za `subscription.key_file`, jer server pri pokretanju učitava fajl sa ključem u licencni ključ koji se koristi tokom rada.

## Upravljanje licencnim ključem ili njegova zamena {#manage-or-replace-a-license-key}

Da biste obnovili, zamenili ili pregledali licencu, otvorite meni Admin i izaberite **Pretplata i naplata** (Subscription & Billing).

![Meni Admin sa stavkom Subscription and Billing](/assets/subscription-billing-menu-item.png)

Za licencni ključ kojim se upravlja iz veb interfejsa otvorite meni radnji u dijalogu **Pretplata i naplata** (Subscription & Billing) da biste ponovo učitali, otpremili ili resetovali ključ.

![Dijalog Subscription and Billing sa radnjama nad ključem](/assets/subscription-key-actions-menu.png)

Ako je ključ podešen na serveru:

1. Zamenite vrednost `subscription.key` ili ažurirajte sadržaj fajla na koji ukazuje `subscription.key_file`.
2. Ponovo pokrenite Semaphore UI da bi server ponovo učitao licencni ključ.
3. Proverite da li su očekivane Pro ili Enterprise opcije dostupne u Semaphore UI.
