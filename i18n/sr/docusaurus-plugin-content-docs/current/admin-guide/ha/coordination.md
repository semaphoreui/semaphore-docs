---
title: Koordinacija klastera
description: Kako se HA čvorovi Semaphore-a koordinišu preko Redis-a, sa svakim ključem, bravom i Pub/Sub kanalom koje dele i koliko dugo svaki od njih živi.
---

# Koordinacija klastera <Enterprise />

Semaphore čvorovi nikada ne komuniciraju direktno jedan sa drugim. Sve oko čega treba da se usaglase prolazi kroz Redis: ko je živ, koji zadatak pripada kom čvoru, ko pokreće raspored i koje poruke korisničkog interfejsa treba proslediti. Svaki deo tog stanja je mali skup Redis ključeva sa rokom isteka, tako da srušeni čvor ne može dugo ostaviti ništa za sobom. Trajni podaci (zadaci, šabloni, logovi, runneri) uvek žive u bazi podataka; Redis čuva samo koordinaciono stanje.

Svi ključevi koriste fiksne prefikse `ha:` i `tasks:`. Oni se ne mogu konfigurisati, pa dva Semaphore klastera koja dele jedan Redis server moraju koristiti različite brojeve baza (`ha.redis.db`).

## Registar čvorova {#node-registry}

Svaki čvor se registruje pri pokretanju, a zatim osvežava svoj zapis svakih 10 sekundi. Zapis ističe posle 30 sekundi, tako da se čvor koji prestane da osvežava smatra mrtvim najkasnije posle pola minuta. Pri urednom gašenju čvor odmah uklanja svoj zapis.

| Ključ | Tip | Namena |
| --- | --- | --- |
| `ha:node:<node_id>` | string, JSON | Otkucaj (heartbeat) jednog čvora: `node_id`, `started_at`, `version`, `last_beat`. Ističe 30 s posle poslednjeg osvežavanja. |
| `ha:nodes` | set | ID-jevi svih registrovanih čvorova. Članove čiji je heartbeat ključ istekao uklanjaju ostali čvorovi. |

Registar čvorova je ono što prikazuje kontrolna tabla klastera (Cluster dashboard) i ono što čistač napuštenih zadataka (u nastavku) proverava da bi odlučio da li je vlasnik zadatka još uvek živ.

## Red zadataka i pokrenuti zadaci {#task-queue}

Red zadataka je deljen, pa zadatak pokrenut na jednom čvoru može biti raspoređen, praćen i završen na bilo kom drugom. Redis čuva samo ID-jeve zadataka i nekoliko prolaznih polja; sam zadatak iz baze podataka učitava onaj čvor kome je potreban.

| Ključ | Tip | Namena |
| --- | --- | --- |
| `tasks:queue` | list | ID-jevi zadataka koji čekaju na raspoređivanje, po redosledu. |
| `tasks:claim:<task_id>` | string | ID čvora koji je vlasnik zadatka. Upisuje se atomarno zajedno sa uklanjanjem iz reda, tako da zadatak preuzima tačno jedan čvor. Ističe posle 5 minuta; vlasnik ga osvežava svakog minuta. |
| `tasks:running` | set | ID-jevi zadataka koji se trenutno izvršavaju. |
| `tasks:active:<project_id>` | set | ID-jevi zadataka koji su aktivni (čekaju ili se izvršavaju) u projektu. Koristi se za ograničenja istovremenog izvršavanja po projektu. |
| `tasks:task_project` | hash | `task_id` → `project_id`, kako bi bilo koji čvor mogao da učita zadatak iz baze podataka. |
| `tasks:aliases` | hash | `alias` → `task_id` za zadatke kojima se pristupa preko alijasa. |
| `tasks:runtime:<task_id>` | hash | Polja koja se menjaju dok se zadatak izvršava, kao što su ID runnera i korisnik koji ga je pokrenuo. |
| `tasks:finalize:<task_id>` | string | Brava koju uzima čvor koji upisuje konačni rezultat zadatka izvršenog na udaljenom runneru. Ističe posle 5 minuta. |

Unosi u `tasks:task_project`, `tasks:aliases` i `tasks:runtime:*` uklanjaju se kada se zadatak završi, a dodatno ističu posle 7 dana kao sigurnosna mreža.

Čvor uzima zadatak iz reda jednom atomarnom operacijom: proverava da je zadatak još uvek u redu, upisuje preuzimanje, uklanja zadatak iz reda i dodaje ga u skup pokrenutih. Ako dva čvora pokušaju istovremeno, uspeva samo jedan.

**Čistač napuštenih zadataka.** Jednom u minutu svaki čvor pregleda pokrenute zadatke čiji je vlasnik mrtav, odnosno čije je preuzimanje isteklo ili je nestao heartbeat vlasnika. Zadatak koji baza podataka već prikazuje kao završen jednostavno se uklanja iz Redisa. Zadatak koji nikada nije predat runneru vraća se u red kako bi ga rasporedio živ čvor. Zadatak koji se već izvršava na runneru ostavlja se na miru: runner nastavlja da radi, a zadatak se čisti kada ga baza podataka prikaže kao završen.

## Brave {#locks}

Brave su pojedinačni ključevi koji se kreiraju pomoću `SET NX`: čvor koji uspe da kreira ključ drži bravu. Svaka brava ima rok isteka, a brave koje se drže duže vlasnik osvežava, pa srušeni čvor automatski oslobađa svoje brave.

| Ključ | Istek | Namena |
| --- | --- | --- |
| `ha:sched:lock:<schedule_id>:<minute>` | 55 s | Jedna brava po rasporedu po minutu. Čvor koji je kreira pokreće raspored; ostali ga preskaču. |
| `ha:wf:lock:<project_id>:<run_id>` | 30 s, osvežava se svakih 10 s | Samo jedan čvor u datom trenutku pomera dato izvršavanje toka rada (workflow). |
| `ha:wf:start:<project_id>:<template_id>` | 10 s | Kratka brava dok se kreira novo izvršavanje toka rada, kako dva čvora ne bi dvaput pokrenula isti tok rada. |
| `ha:audit:export:<destination_id>` | 30 s, osvežava se svakih 10 s | Samo jedan čvor izvozi događaje revizije na dato odredište. Ako Redis nije dostupan, nijedan čvor ne izvozi, pa se događaji nikada ne šalju dvaput. |

Brave rasporeda i tokova rada otkazuju otvoreno: ako Redis nije dostupan, čvor nastavlja umesto da preskoči posao, a uslovna ažuriranja u bazi podataka održavaju rezultat ispravnim. Zakup za izvoz revizije otkazuje zatvoreno, jer se dupliran izvoz ne može poništiti.

## Pub/Sub kanali {#pubsub-channels}

| Kanal | Namena |
| --- | --- |
| `ha:ws:broadcast` | WebSocket poruke za korisnički interfejs. Čvor isporučuje poruku sopstvenim povezanim pregledačima i objavljuje je ovde; ostali čvorovi je prosleđuju svojim. |
| `tasks:events` | Promene u redu zadataka i skupu pokrenutih, ažuriranja polja tokom izvršavanja i zahtevi za prinudno zaustavljanje. Čvorovi koriste ove događaje da održavaju ažurnim svoj prikaz reda u memoriji i da zaustave zadatak čije je zaustavljanje zatražio drugi čvor. |

Poruke nose ID čvora koji ih šalje, pa čvor ignoriše sopstvene poruke.

## Ključevi keša runnera {#runner-cache-keys}

Ključevi `ha:runner:*` pripadaju deljenom kešu zapisa runnera. Za više informacija pogledajte [Keš za autentifikaciju runnera](/admin-guide/ha/runner-cache).

## Povezane stranice {#related-pages}

- [Visoka dostupnost](/admin-guide/ha) — arhitektura, konfiguracija i podešavanje balansera opterećenja.
- [Keš za autentifikaciju runnera](/admin-guide/ha/runner-cache) — deljeni keš zapisa runnera.
