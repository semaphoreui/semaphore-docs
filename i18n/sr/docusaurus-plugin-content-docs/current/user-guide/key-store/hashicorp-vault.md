---
title: "HashiCorp Vault skladište tajni"
---

# HashiCorp Vault skladište tajni <Pro />

Semaphore UI podržava HashiCorp Vault kao skladište za tajne.

![](/assets/vault1.webp)

Možete navesti sledeće opcije:
- **HashiCorp Vault URL** — adresa vašeg Vault servera.
- **Mount** — putanja montiranja secrets engine-a.
- **Token** — token za autentifikaciju. Token može biti:
    - Sačuvan u bazi podataka.
    - Obezbeđen preko promenljive okruženja.
    - Obezbeđen preko datoteke (korisno za Vault Agent).
      :::warning
      Kada token dolazi iz **datoteke**, ta datoteka mora biti **unutar** direktorijuma za tajne koji Semaphore koristi. Konfigurišite taj direktorijum pomoću `dirs.secrets` ili promenljive okruženja `SEMAPHORE_SECRETS_PATH`. Nasleđena opcija `secrets_path` najvišeg nivoa se i dalje prihvata za starije konfiguracije. Ako ništa nije podešeno, podrazumevana vrednost je `/tmp/semaphore`. Pogledajte [Direktorijum za tajne](/admin-guide/configuration/config-file#secrets-directory) za detalje o prioritetu.

      Primer fragmenta `config.json`:

      ```json
      {
        "dirs": {
          "secrets": "/root/path/for/secrets"
        }
      }
      ```
      :::

Skladište može da radi u režimu samo za čitanje.

## Kako koristiti {#how-to-use}

1. Konfigurišite HashiCorp Vault vezu u podešavanjima Semaphore-a (URL, putanja montiranja i token).
2. Kada kreirate ili menjate ključ u skladištu ključeva (Key Store), izaberite **HashiCorp Vault** kao tip skladišta.
3. Navedite putanju tajne u Vault-u na kojoj kredencijal treba da bude sačuvan.

![](/assets/vault2.webp)

## HashiCorp Vault Agent {#hashicorp-vault-agent}

Umesto da Vault token čuvate direktno, možete koristiti [HashiCorp Vault Agent](https://developer.hashicorp.com/vault/docs/agent-and-proxy/agent) koji automatski preuzima i obnavlja token.

Vault Agent radi kao sidecar proces uz Semaphore i upisuje važeći token u datoteku na disku. Semaphore zatim čita token iz te datoteke.

Da biste ovo podesili:

1. Konfigurišite i pokrenite Vault Agent sa odgovarajućom [auto-auth metodom](https://developer.hashicorp.com/vault/docs/agent-and-proxy/autoauth) (npr. AppRole, Kubernetes, AWS IAM).
2. Podesite Vault Agent da upisuje token u datoteku pomoću bloka `sink`, na primer:

    ```hcl
    auto_auth {
    method {
        type = "approle"
        config = {
        role_id_file_path   = "/etc/vault/role-id"
        secret_id_file_path = "/etc/vault/secret-id"
        }
    }

    sink {
        type = "file"
        config = {
        path = "/etc/vault/token"
        }
    }
    }
    ```

3. U Semaphore-u, kada konfigurišete HashiCorp Vault vezu, izaberite **File** kao izvor tokena i navedite putanju do datoteke sa tokenom (npr. `/etc/vault/token`).

Ovaj pristup izbegava dugotrajne statičke tokene i omogućava Vault Agent-u da automatski upravlja autentifikacijom i obnavljanjem tokena.


## Grupe promenljivih {#variable-groups}

HashiCorp Vault se takođe može koristiti kao skladište za [grupe promenljivih](/user-guide/environment) (Variable Groups). Kada menjate grupu promenljivih, izaberite **HashiCorp Vault** kao tip skladišta i navedite putanju foldera u kome će tajne biti sačuvane.

![](/assets/vault3.webp)
