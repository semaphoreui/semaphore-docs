# Instalacija

Semaphore možete instalirati na više načina, u zavisnosti od operativnog sistema, okruženja i vaših preferencija:

* **Menadžer paketa**<br />
  Instalirajte Semaphore pomoću nativnog paketa za vašu distribuciju (npr. apt za Debian/Ubuntu ili dnf za sisteme zasnovane na RHEL-u). Ovo je najjednostavniji način da počnete na Linux serverima i dobro se integriše sa sistemskim servisima.<br />
  [Saznajte više »](/admin-guide/installation/package-manager)

* **Docker**<br />
  Pokrenite Semaphore kao kontejner pomoću alata Docker ili Docker Compose. Idealno za brzo podešavanje, izolovana okruženja i CI/CD pipeline-ove. Preporučuje se korisnicima koji preferiraju infrastrukturu kao kod.<br />
  [Saznajte više »](/admin-guide/installation/docker)

* **Oblak**<br />
  Uputstva za postavljanje Semaphore na cloud platforme pomoću virtuelnih mašina, kontejnera ili Kubernetes klastera sa upravljanim servisima.<br />
  [Saznajte više »](/admin-guide/installation/cloud)

* **Binarni fajl**<br />
  Preuzmite prekompajlirani binarni fajl sa stranice sa izdanjima. Odlično za ručnu instalaciju ili ugrađivanje u prilagođene tokove rada. Radi na sistemima Linux, macOS i Windows (preko WSL-a).<br />
  [Saznajte više »](/admin-guide/installation/binary-file)

* **Kubernetes (Helm chart)**<br />
  Postavite Semaphore u Kubernetes klaster pomoću alata Helm. Najpogodnije za produkcijsku, skalabilnu infrastrukturu. Podržava jednostavnu konfiguraciju i nadogradnje preko Helm vrednosti.<br />
  [Saznajte više »](/admin-guide/installation/k8s)

Pogledajte i:
* [Pokretanje kao servis](/admin-guide/installation/binary-file#run-as-a-service)
* [Ručna instalacija](/admin-guide/installation_manually)

----


### Instaliranje dodatnih Python paketa {#installing-additional-python-packages}

Neki Ansible moduli i uloge zahtevaju dodatne Python pakete za rad. Da biste instalirali dodatne Python pakete, kreirajte fajl `requirements.txt` i montirajte ga u direktorijum `/etc/semaphore` u kontejneru. Na primer, u fajl `docker-compose.yml` možete dodati sledeće linije:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

Paketi navedeni u fajlu sa zahtevima biće instalirani u priloženo Ansible virtuelno okruženje pri svakom pokretanju kontejnera. Isto montiranje radi i za imidž `semaphoreui/runner`. Pogledajte [Instaliranje dodatnih Python zavisnosti](/admin-guide/installation/docker#installing-additional-python-dependencies) za detalje i alternativu sa prilagođenim imidžom.

Više informacija o Python fajlovima sa zahtevima potražite u [referenci formata Pip requirements fajla](https://pip.pypa.io/en/stable/reference/requirements-file-format/)
