# API

## API referenca {#api-reference}

Semaphore UI nudi dva formata API dokumentacije, pa možete izabrati onaj koji najbolje odgovara vašem načinu rada:

* [Swagger/OpenAPI](https://semaphoreui.com/api-docs) &mdash; idealno ako više volite interaktivno iskustvo u pregledaču.
* [Zvanična Postman kolekcija](https://www.postman.com/semaphoreui) &mdash; istražite i testirajte sve krajnje tačke u Postman-u.
* **Ugrađena Swagger API dokumentacija** &mdash; interaktivna API dokumentacija zasnovana na Swagger UI. Možete joj pristupiti na svojoj instanci.

![](/assets/swagger-link.webp)

Sve opcije sadrže kompletnu dokumentaciju dostupnih krajnjih tačaka, parametara i primera odgovora.

## Prvi koraci sa API-jem {#getting-started-with-the-api}

Da biste počeli da koristite Semaphore API, potrebno je da generišete API token.
Ovaj token mora biti uključen u zaglavlje zahteva na sledeći način:

```http
Authorization: Bearer YOUR_API_TOKEN
```

### Kreiranje API tokena {#creating-an-api-token}

Postoje dva načina za kreiranje API tokena:
- Preko veb interfejsa
- Pomoću HTTP zahteva

#### Preko veb interfejsa (od verzije 2.14) {#through-the-web-interface-since-214}

Otvorite meni naloga na dnu bočne trake i izaberite **API tokeni** (API Tokens). Stranica prikazuje vaše tokene; link **API referenca** (API Reference) na njoj otvara Swagger UI ugrađen u vašu instancu.

![API tokeni](/assets/api-tokens.webp)

Kliknite **Novi token** (New Token), unesite naziv, izaberite kada token ističe i kopirajte vrednost prikazanu nakon kreiranja. Pogledajte [Vaš nalog](/user-guide/account#api-tokens).

<div style={{maxWidth: 420}}>

![Dijalog za novi token](/assets/api-token-new.webp)

</div>

#### Pomoću HTTP zahteva {#using-http-request}

Takođe se možete autentifikovati i generisati token sesije direktnim HTTP zahtevom.

Prijavite se u Semaphore (lozinka mora biti eskejpovana, npr. `slashy\\pass` umesto `slashy\pass`):

```bash
curl -v -c /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-d '{"auth": "YOUR_LOGIN", "password": "YOUR_PASSWORD"}' \
http://localhost:3000/api/auth/login
```

Generišite novi token i preuzmite ga:

```bash
curl -v -b /tmp/semaphore-cookie -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
http://localhost:3000/api/user/tokens
```

Komanda bi trebalo da vrati nešto slično ovome:

```json
{
    "id": "YOUR_ACCESS_TOKEN",
    "created": "2025-05-21T02:35:12Z",
    "expired": false,
    "user_id": 3
}
```
---

## Korišćenje tokena za API zahteve {#using-token-to-make-api-requests}

Kada imate svoj API token, uključite ga u zaglavlje **Authorization** da biste autentifikovali zahteve.

### Pokretanje zadatka {#launch-a-task}

Koristite ovaj token za pokretanje zadatka (Task) ili bilo koju drugu operaciju:

```bash
curl -v -XPOST \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
-d '{"template_id": 1}' \
http://localhost:3000/api/project/1/tasks
```

---

## Opoziv API tokena {#expiring-an-api-token}

Ako vam token više nije potreban, trebalo bi da ga opozovete (označite kao istekao) da bi vaš nalog ostao bezbedan.

Da biste ručno opozvali API token, pošaljite DELETE zahtev na krajnju tačku tokena:

```bash
curl -v -XDELETE \
-H 'Content-Type: application/json' \
-H 'Accept: application/json' \
-H 'Authorization: Bearer YOUR_ACCESS_TOKEN' \
http://localhost:3000/api/user/tokens/YOUR_ACCESS_TOKEN
```
