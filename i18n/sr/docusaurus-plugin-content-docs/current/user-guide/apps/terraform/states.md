---
title: "HTTP backend"
sidebar_custom_props:
  edition: pro
---

# HTTP backend <Pro />

Semaphore UI HTTP backend za Terraform bezbedno čuva Terraform fajlove stanja i upravlja njima direktno unutar Semaphore-a. Dostupan je u Pro planu i nudi nekoliko ključnih prednosti.

## Funkcionalnosti {#features}

- **Bezbedno čuvanje stanja**: fajlovi stanja se <!-- encrypted and--> bezbedno čuvaju unutar Semaphore-a.
- **Zaključavanje stanja**: sprečava istovremene izmene istog fajla stanja.
- **Istorija verzija**: pratite promene stanja svoje infrastrukture kroz vreme.
- **Integracija sa korisničkim interfejsom**: upravljajte fajlovima stanja direktno iz Semaphore interfejsa.

## Konfiguracija {#configuration}

Da biste počeli da koristite ugrađeni HTTP backend, prvo je potrebno da kreirate radni prostor za svoj Terraform šablon zadatka (Task Template).

Da biste dodali radni prostor, otvorite karticu **Radni prostori** (Workspaces) svog Terraform/OpenTofu šablona.

Prilikom kreiranja radnog prostora biće vam ponuđeno da izaberete SSH ključ za kloniranje privatnih modula koje koristi vaš Terraform kod. Ako ne koristite privatne module, jednostavno izaberite opciju `None`.

![](https://github.com/user-attachments/assets/0a6a0b4d-8b10-41df-8500-e3084d5b6c64)

### Korišćenje HTTP backend-a u zadacima {#using-the-http-backend-in-tasks}

Da biste ugrađeni HTTP backend koristili za čuvanje stanja svojih Terraform zadataka (Task), ne morate ručno konfigurisati backend u Terraform kodu. Semaphore može automatski da kreira konfiguracioni fajl tokom izvršavanja. Da biste to omogućili, jednostavno označite opciju **Zameni podešavanja backend-a** (Override backend settings) u podešavanjima šablona zadatka, kao što je prikazano na snimku ekrana ispod.


Opciono možete navesti naziv konfiguracionog fajla koji će se dinamički kreirati tokom izvršavanja. Ovo je korisno ako vaš kod već sadrži konfiguracioni fajl backend-a i potrebno je da ga dinamički zamenite da bi radio sa ugrađenim Semaphore backend-om.

### Korišćenje HTTP backend-a van Semaphore-a {#using-the-http-backend-outside-semaphore}

Ugrađeni HTTP backend možete koristiti ne samo prilikom izvršavanja zadataka unutar Semaphore-a, već i prilikom izvršavanja Terraform koda van Semaphore-a, na primer iz lokalnog terminala.

Da bi to bilo moguće, Semaphore omogućava kreiranje alijasa (jedinstvenih HTTP krajnjih tačaka) za vaše skladište stanja. Ovi alijasi olakšavaju referenciranje fajlova stanja iz eksternih okruženja.

Da biste to podesili, otvorite karticu **Radni prostori** (Workspaces), izaberite željeni radni prostor i dodajte alijas. Takođe je potrebno da izaberete ključ sa korisničkim imenom i lozinkom, koji će se koristiti za autentifikaciju pristupa backend-u.

<video controls>
  <source src="https://www.semaphoreui.com/uploads/v2.11/video2.mp4" type="video/mp4" />
</video>

Nakon toga dodajte podešavanja backend-a u svoj Terraform kod:

```
terraform {
  backend "http" {
    address = "http://localhost:3000/api/terraform/***"
    username = "***"
    password = "***"
  }
}
```

Sada će Terraform koristiti ugrađeni Semaphore HTTP backend čak i kada se pokreće iz vašeg terminala:

```
terraform apply
```
