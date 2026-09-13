# Grupe promenljivih

![Lista grupa promenljivih](/assets/variable-groups-list.webp)

Odeljak Grupe promenljivih (Variable Groups) u Semaphore-u je mesto za čuvanje dodatnih promenljivih za inventar (Inventory) i one moraju biti sačuvane u JSON formatu.

Svi šabloni zadataka (Task Templates) zahtevaju da grupa promenljivih bude definisana, čak i ako je prazna. 

## Kreiranje grupe promenljivih {#create-a-variable-group}
1. Kliknite na karticu Grupe promenljivih (Variable Groups).
2. Kliknite na dugme Nova grupa promenljivih (New Variable Group).
3. Dajte naziv grupi promenljivih i unesite ili nalepite važeće JSON promenljive. Ako vam je potrebna samo prazna grupa promenljivih, unesite ```{}```.

## Ažuriranje grupe promenljivih {#updating-a-variable-group}
1. Kliknite na karticu Grupe promenljivih (Variable Groups).
2. Kliknite na ikonu olovke.
3. Unesite izmene i kliknite Sačuvaj (Save).

## Brisanje grupe promenljivih {#deleting-the-variable-group}
Pre nego što uklonite grupu promenljivih, morate ukloniti sve resurse koji su vezani za nju.
Ako niste sigurni koji resursi koriste grupu promenljivih, pratite korake 1 i 2 ispod. Prikazaće vam se koji resursi se koriste, sa linkovima ka tim resursima.

1. Kliknite na grupu promenljivih.
2. Kliknite na ikonu kante za otpatke pored grupe promenljivih.
3. Kliknite Da (Yes) ako ste sigurni da želite da uklonite grupu promenljivih.

## Korišćenje grupa promenljivih - Terraform/OpenTofu {#using-variable-groups---terraformopentofu}
Kada želite da iskoristite sačuvanu promenljivu ili tajnu iz grupe promenljivih u svom Terraform šablonu, morate dodati prefiks `TF_VAR_` nazivu da bi je Terraform skripta koristila. 

**Primer**
Prosleđivanje Hetzner Cloud API ključa OpenTofu/Terraform playbook-u. 

1. Kliknite na Grupe promenljivih (Variable Groups)
2. Kliknite `New Group`
3. Kliknite na karticu `Secrets`
4. Dodajte `TF_VAR_hcloud_token` i unesite svoju tajnu (`secret`) u skriveno polje
5. Kliknite Sačuvaj (Save)

Našu tajnu `TF_VAR_hcloud_token` pozivaćemo kao `var.hcloud_token` u fajlu 
hetzner.tf
```
terraform {
  required_providers {
    hcloud = {
      source  = "hetznercloud/hcloud"
      version = "~> 1.45"
    }
  }
}

# Declare the variable
variable "hcloud_token" {
  type        = string
  description = "Hetzner Cloud API token"
  sensitive   = true  # This prevents the token from being displayed in logs
}

provider "hcloud" {
  token = var.hcloud_token
}

# Create a new server running debian
resource "hcloud_server" "webserver" {
  name        = "webserver"
  image       = "ubuntu-24.04"
  server_type = "cpx11" 
  location    = "ash"
  ssh_keys = [ "mysshkey" ]
  public_net {
    ipv4_enabled = true
    ipv6_enabled = true
  }
}
``` 
