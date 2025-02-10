# Environment
The Environment section of Semaphore is a place to store additional variables for an inventory and must be stored in JSON format. 
All task templates require an environment to be defined even if it is empty. 

## Create an Environment
1. Click on the Environment tab.
2. Click on the New Environment button.
3. Name the Environment and type or paste in valid JSON variables. If you just need an empty Environment type in ```{}```.
## Updating an Environment
1. Click on the Environment tab.
2. Click the pencil icon.
3. Make changes and click save.

## Deleting the Environment
Before you remove an Environment, you must remove all resources tied to it.
If you are not sure which resources are being used in an environment, follow steps 1 and 2 below. It will show you which resources are being used, with links to those resources.

1. Click on the Environment.
2. Click the trash can icon next to the Environment.
3. Click Yes if you are sure you want to remove the environment.

# Variable Groups 

## Using Variable Groups - Terraform
When you want utilize a stored environment variable or secret in your terraform template you must prefix the name with `TF_VAR_` for the terraform script to use it. 

**Example**
Passing Hetzner Cloud API key to OpenTofu/Terraform playbook. 

1. Click on Variable Group
2. Click `New Group`
3. Click on `Secrets` tab
4. Add `TV_VAR_hcloud_token` and add you `secret` in the hidden field
5. Click Save

We will call our secret `TV_VAR_hcloud_token` as `var.hcloud_token` in 
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
