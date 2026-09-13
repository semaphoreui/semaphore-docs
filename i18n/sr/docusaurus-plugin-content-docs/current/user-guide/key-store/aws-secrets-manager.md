# AWS Secrets Manager skladište tajni

![Statički bedž](https://img.shields.io/badge/enterprise-yellow)

Semaphore UI Enterprise može koristiti **AWS Secrets Manager** kao spoljno skladište za tajne iz skladišta ključeva (Key Store) umesto baze podataka.

## Opcije konfiguracije {#configuration-options}

Kada kreirate **AWS Secrets Manager** skladište pod **Skladište ključeva → Skladišta** (Key Store → Storages), podesite:

| Polje | Opis |
|-------|-------------|
| **Region** | AWS region u kom se nalaze tajne (na primer `us-east-1`). Obavezno. |
| **Endpoint URL** | Opciona prilagođena krajnja tačka. Ostavite prazno za standardnu AWS API krajnju tačku. Korisno za LocalStack ili VPC krajnje tačke. |
| **Use IAM Role / Instance Profile** | Kada je uključeno, Semaphore koristi lanac AWS pristupnih podataka iz okruženja (EC2 profil instance, ECS uloga zadatka, EKS IRSA itd.) i ne zahteva statičke pristupne ključeve. |
| **Access Key ID** | Obavezno kada je režim IAM uloge isključen. |
| **Secret Access Key** | Obavezno kada je režim IAM uloge isključen. Može se čuvati u bazi podataka, čitati iz promenljive okruženja ili učitati iz fajla. |

### IAM uloga ili pristupni ključevi {#iam-role-vs-access-keys}

- **IAM uloga / profil instance** (preporučeno na AWS-u): uključite **Use IAM Role / Instance Profile** i dodelite Semaphore serveru ili runner hostu dozvolu za čitanje tajni na koje se pozivate. U Semaphore-u se ne čuvaju dugotrajni ključevi.
- **Pristupni ključevi**: ostavite polje za potvrdu isključeno i unesite par pristupnih ključeva IAM korisnika ili uloge sa dozvolom `secretsmanager:GetSecretValue` (i povezanim list/describe dozvolama za sinhronizaciju).

Pri izmeni postojećeg skladišta, Semaphore zaključuje da je u pitanju režim IAM uloge ako nije sačuvan ID pristupnog ključa.

## Kako se koristi {#how-to-use}

1. U svom projektu (Project) otvorite **Skladište ključeva → Skladišta** (Key Store → Storages) i kreirajte **AWS Secrets Manager** skladište.
2. Pri kreiranju ili izmeni ključa izaberite to skladište i unesite naziv tajne ili ARN u AWS Secrets Manager-u.
3. Opciono podesite [putanje za sinhronizaciju](/user-guide/key-store/secret-sync) za automatski uvoz tajni po rasporedu.

Skladište može raditi u režimu samo za čitanje.

## Sinhronizacija tajni {#syncing-secrets}

Tajne iz AWS Secrets Manager-a mogu se uvesti u skladište ključeva i održavati sinhronizovanim kao i kod drugih spoljnih skladišta. Podrazumevani separator putanje je `/`. Pogledajte [Sinhronizacija tajni iz udaljenih skladišta](/user-guide/key-store/secret-sync).
