# Rasporedi

Funkcija rasporeda (Schedule) u Semaphore-u omogućava automatsko izvršavanje šablona (na primer pokretanja playbook-ova) u unapred definisanim intervalima. Ova funkcija omogućava da implementirate rutinske zadatke automatizacije, kao što su redovne rezervne kopije, provere usaglašenosti, ažuriranja sistema i drugo.

Obavezno ponovo pokrenite Semaphore servis nakon izmena da bi one stupile na snagu.

[//]: # (## Setup and configuration)

## Podešavanje vremenske zone {#timezone-configuration}

Funkcija rasporeda podrazumevano radi u vremenskoj zoni UTC. Međutim, to se može prilagoditi vašoj lokalnoj vremenskoj zoni ili posebnim zahtevima.

Vremensku zonu možete promeniti izmenom konfiguracionog fajla ili postavljanjem promenljive okruženja:

1. **Pomoću konfiguracionog fajla**:  
    Dodajte ili izmenite polje `timezone` u konfiguracionom fajlu Semaphore-a:
    ```json
    {
      "schedule": {
        "timezone": "America/New_York"
      }
    }
    ```

2. **Pomoću promenljive okruženja**:  
    Postavite promenljivu okruženja `SEMAPHORE_SCHEDULE_TIMEZONE`:
    ```bash
    export SEMAPHORE_SCHEDULE_TIMEZONE="America/New_York"
    ```

Listu važećih vrednosti vremenskih zona potražite u [IANA bazi vremenskih zona](https://www.iana.org/time-zones).

### Pristup funkciji rasporeda {#accessing-the-schedule-feature}

1. Prijavite se u veb interfejs Semaphore-a
2. Otvorite karticu „Raspored" (Schedule) u glavnom navigacionom meniju
3. Kliknite na dugme „Novi raspored" (New Schedule) u gornjem desnom uglu da biste kreirali novi raspored

![](/assets/schedule01.png)

### Kreiranje novog rasporeda {#creating-a-new-schedule}

Prilikom kreiranja novog rasporeda potrebno je da podesite sledeće opcije:

| Polje | Opis |
|-------|-------------|
| Naziv | Opisni naziv zakazanog zadatka |
| Šablon | Konkretan šablon zadatka (Task Template) koji se izvršava |
| Vreme | U cron formatu radi veće fleksibilnosti ili pomoću ugrađenih opcija za uobičajene intervale |

![](/assets/schedule02.png) ![](/assets/schedule03.png)

### Obaveštenja {#alerts}

Raspored može da koristi obaveštenja svog šablona ili drugačiji skup obaveštenja projekta, tako
da zadaci pokrenuti rasporedom prijavljuju na drugo mesto nego ručna pokretanja. Pogledajte
[Obaveštenja rasporeda](./projects/alerts#schedule-alerts).

### Sintaksa cron formata {#cron-format-syntax}

Raspored koristi standardnu cron sintaksu sa pet polja:

```
┌─────── minute (0-59)
│ ┌────── hour (0-23)
│ │ ┌───── day of month (1-31)
│ │ │ ┌───── month (1-12)
│ │ │ │ ┌───── day of week (0-6) (Sunday=0)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

Primeri:
- `*/15 * * * *` - Pokretanje svakih 15 minuta
- `0 2 * * *` - Pokretanje svakog dana u 2:00
- `0 0 * * 0` - Pokretanje nedeljom u ponoć
- `0 9 1 * *` - Pokretanje u 9:00 prvog dana svakog meseca

Veoma koristan generator cron izraza: [https://crontab.guru/](https://crontab.guru/)

## Primeri upotrebe {#use-cases}

### Održavanje sistema {#system-maintenance}

```yaml
# Example playbook for system updates
---
- hosts: all
  become: yes
  tasks:
    - name: Update apt cache
      apt:
        update_cache: yes

    - name: Upgrade all packages
      apt:
        upgrade: yes

    - name: Remove dependencies that are no longer required
      apt:
        autoremove: yes
```

Zakažite ovaj playbook da se izvršava jednom nedeljno van radnog vremena kako bi sistemi ostali ažurni.

### Rezervne kopije {#backup-operations}

Kreirajte rasporede za rezervne kopije baza podataka sa različitom učestalošću:
- Dnevne rezervne kopije koje se čuvaju nedelju dana
- Nedeljne rezervne kopije koje se čuvaju mesec dana
- Mesečne rezervne kopije koje se čuvaju godinu dana

### Provere usaglašenosti {#compliance-checks}

Zakažite redovna skeniranja usaglašenosti da biste obezbedili da sistemi ispunjavaju bezbednosne zahteve:

```yaml
# Example compliance check playbook
---
- hosts: all
  tasks:
    - name: Run compliance checks
      script: /path/to/compliance_script.sh

    - name: Collect compliance reports
      fetch:
        src: /var/log/compliance-report.log
        dest: reports/{{ inventory_hostname }}/
        flat: yes
```

### Priprema i čišćenje okruženja {#environment-provisioning-and-cleanup}

Za razvojna ili testna okruženja. Zakažite kreiranje cloud okruženja ujutru i njegovo gašenje uveče radi optimizacije troškova.

## Dobre prakse {#best-practices}

* Koristite opisne nazive rasporeda koji ukazuju i na funkciju i na vreme izvršavanja (na primer „Weekly-Backup-Sunday-2AM")
* Izbegavajte istovremeno zakazivanje previše zadataka koji intenzivno koriste resurse
* Uzmite u obzir uticaj dugotrajnih zakazanih zadataka na druge rasporede
* Testirajte rasporede sa kratkim intervalima pre nego što podesite produkcione rasporede sa dužim intervalima
* Dokumentujte svrhu i očekivane rezultate zakazanih zadataka

---

## Parametri zadatka {#task-parameters}

Rasporedi mogu prosleđivati parametre zadacima. Uključite upite (prompts) za potrebna polja u šablonu, a zatim definišite vrednosti parametara u podešavanjima rasporeda, tako da svako pokretanje dobije željene zamene (na primer granu, promenljive, zastavice).
