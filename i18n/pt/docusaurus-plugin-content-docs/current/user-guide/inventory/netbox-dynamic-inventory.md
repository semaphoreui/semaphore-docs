# Integração de Inventário Dinâmico do Netbox com o Semaphore

![Badge do Ansible](https://img.shields.io/badge/ansible-%23000.svg?style=for-the-badge&logo=ansible&logoColor=white)
![Badge do Netbox](https://img.shields.io/badge/Netbox-%23F00.svg?style=for-the-badge&logo=netbox&logoColor=white)
<!-- ![Semaphore Badge](https://img.shields.io/badge/Semaphore-%23187EBB.svg?style=for-the-badge&logo=semaphore&logoColor=white) -->

## 🛠 Principais Recursos {#-key-features}

Este repositório demonstra o uso do plugin `netbox.netbox.nb_inventory` para criar um inventário dinâmico no Semaphore. Ele permite a sincronização automática de dados do Netbox, simplificando o gerenciamento da sua infraestrutura e a execução de playbooks do Ansible.

## 🔧 Configuração {#-setup}

### Requisitos {#requirements}

- Acesso ao Semaphore
- Acesso ao Netbox com a API configurada

### 🔑 Configuração do Netbox {#-netbox-setup}

Certifique-se de que o seu Netbox esteja configurado e acessível para interação via API. Obtenha um token de API que será usado para autenticar as requisições.

### 📡 Configuração no Semaphore {#-configuration-in-semaphore}

1. No Semaphore, vá para a seção de inventário.
2. Crie um novo inventário.
3. Insira as seguintes configurações para o plugin:

   ```yaml
   plugin: netbox.netbox.nb_inventory
   api_endpoint: http://your_netbox_url_here
   token: YOUR_NETBOX_API_TOKEN
   validate_certs: False
   config_context: False
   ```

   Substitua `http://your_netbox_url_here` e `YOUR_NETBOX_API_TOKEN` pelos dados reais do seu Netbox.

## 🚀 Uso {#-usage}

Depois de configurado, você pode executar playbooks do Ansible no Semaphore usando o inventário dinâmico, que atualiza automaticamente os dados dos hosts a partir do seu Netbox.

## 📚 Documentação Adicional {#-further-documentation}

Saiba mais sobre o plugin `netbox.netbox.nb_inventory` e seus recursos na [documentação oficial do Ansible](https://docs.ansible.com/ansible/latest/collections/netbox/netbox/nb_inventory_inventory.html).
