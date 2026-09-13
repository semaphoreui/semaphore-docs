---
title: "OpenBao skladište tajni"
---

# OpenBao skladište tajni <Pro />

Semaphore UI podržava [OpenBao](https://openbao.org) kao skladište za tajne.

OpenBao je fork HashiCorp Vault-a otvorenog koda i API-kompatibilan je sa njim, tako da skladište radi potpuno isto kao [HashiCorp Vault skladište](/user-guide/key-store/hashicorp-vault).

Možete navesti sledeće opcije:
- **Server URL** — adresa vašeg OpenBao servera.
- **Mount** — putanja montiranja KV v2 secrets engine-a (podrazumevano `secret`).
- **Namespace** — OpenBao namespace (v2.3+), opciono.
- **Token** — token za autentifikaciju. Token može biti:
    - Sačuvan u bazi podataka.
    - Obezbeđen preko promenljive okruženja.
    - Obezbeđen preko datoteke.
      :::warning
      Kada token dolazi iz **datoteke**, ta datoteka mora biti **unutar** direktorijuma za tajne koji Semaphore koristi. Konfigurišite taj direktorijum pomoću `dirs.secrets` ili promenljive okruženja `SEMAPHORE_SECRETS_PATH`. Nasleđena opcija `secrets_path` najvišeg nivoa se i dalje prihvata za starije konfiguracije. Ako ništa nije podešeno, podrazumevana vrednost je `/tmp/semaphore`. Pogledajte [Direktorijum za tajne](/admin-guide/configuration/config-file#secrets-directory) za detalje o prioritetu.
      :::

Skladište može da radi u režimu samo za čitanje.

## Kako koristiti {#how-to-use}

1. U svom projektu (Project) otvorite **Key Store** → **Storages** i kreirajte novo **OpenBao** skladište (URL, putanja montiranja i token).
2. Kada kreirate ili menjate ključ u skladištu ključeva (Key Store), izaberite svoje OpenBao skladište kao tip skladišta.
3. Navedite putanju tajne u OpenBao-u na kojoj kredencijal treba da bude sačuvan.

## Sinhronizacija tajni {#syncing-secrets}

Tajne sačuvane u OpenBao-u mogu se automatski uvoziti u skladište ključeva i održavati sinhronizovanim, na isti način kao i sa drugim eksternim skladištima. Pogledajte [Sinhronizacija tajni iz udaljenih skladišta](/user-guide/key-store/secret-sync).

## Grupe promenljivih {#variable-groups}

OpenBao se takođe može koristiti kao skladište za [grupe promenljivih](/user-guide/environment) (Variable Groups). Kada menjate grupu promenljivih, izaberite svoje OpenBao skladište kao tip skladišta i navedite putanju foldera u kome će tajne biti sačuvane.
