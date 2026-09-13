# Solução de problemas

## 1. O Runner exibe o erro 404 {#1-runner-prints-error-404}

### Como corrigir {#how-to-fix}

[Recebendo o código de erro 401 do Runner](https://github.com/semaphoreui/semaphore/discussions/1873?converting=1)

---

## 2. Problema de Gathering Facts para localhost {#2-gathering-facts-issue-for-localhost}

O problema pode ocorrer no Semaphore UI instalado via [Snap](https://snapcraft.io/semaphore) ou [Docker](https://hub.docker.com/r/semaphoreui/semaphore).

```
4:10:16 PM
TASK [Gathering Facts] *********************************************************
4:10:17 PM
fatal: [localhost]: FAILED! => changed=false
```

### Por que isso acontece {#why-this-happens}

Para mais informações sobre o uso de localhost no Ansible, leia este artigo [Implicit 'localhost'](https://docs.ansible.com/ansible/latest/inventory/implicit_localhost.html).

O Ansible tenta coletar facts localmente, mas o Ansible está localizado em um contêiner isolado e limitado que não permite isso.

### Como corrigir isso {#how-to-fix-this}

Há duas formas:

1. Desativar a coleta de facts:

```yaml
- hosts: localhost
  gather_facts: False
  roles:
    - ...
```

2. Definir explicitamente o tipo de conexão como **ssh**:
```
[localhost]
127.0.0.1 ansible_connection=ssh ansible_ssh_user=your_localhost_user
```
---
## 3. panic: pq: SSL is not enabled on the server {#3-panic-pq-ssl-is-not-enabled-on-the-server}

Isso significa que o seu Postgres não funciona por SSL.

### Como corrigir isso {#how-to-fix-this-1}

Adicione a opção `sslmode=disable` ao arquivo de configuração:

```json
	"postgres": {
		"host": "localhost",
		"user": "postgres",
		"pass": "pwd",
		"name": "semaphore",
		"options": {
			"sslmode": "disable"
		}
	},
```


---


## 4. fatal: bad numeric config value '0' for 'GIT_TERMINAL_PROMPT': invalid unit {#4-fatal-bad-numeric-config-value-0-for-git_terminal_prompt-invalid-unit}

Isso significa que você está tentando acessar um repositório via HTTPS que exige autenticação.

### Como corrigir isso {#how-to-fix-this-2}

* Vá para a tela **Armazenamento de Chaves**.
* Crie uma nova chave do tipo `Login with password`.
* Informe o seu login do GitHub/BitBucket/etc.
* Informe a senha. Você não pode usar a senha da sua conta do GitHub/BitBucket; em vez disso, use um Personal Access Token (PAT). Leia mais [aqui](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token).
* Depois de criar a chave, vá para a tela **Repositórios**, localize o seu repositório e informe a chave.


---

## 5. O git clone ou pull falha de forma intermitente {#5-git-clone-or-pull-fails-intermittently}

Os logs da tarefa podem exibir mensagens como `Git pull failed (...), retrying in 2s`, seguidas de sucesso ou de uma falha definitiva após várias tentativas.

### Por que isso acontece {#why-this-happens-1}

O servidor git ficou temporariamente inacessível ou retornou um erro transitório. O Semaphore repete automaticamente as operações de clone e pull antes de marcar a tarefa como falha.

### Como corrigir isso {#how-to-fix-this-3}

1. **Interrupções transitórias**: geralmente se resolvem sozinhas. O Semaphore tenta novamente até `git_attempts` vezes (padrão 4) com backoff exponencial.
2. **Falhas frequentes**: aumente `git_attempts` na sua configuração ou defina `SEMAPHORE_GIT_ATTEMPTS`.
3. **Falhas imediatas e constantes**: verifique a URL do repositório, o branch, as chaves de acesso e a conectividade de rede.

Consulte [Operações Git](/admin-guide/configuration/config-file#git-operations) para detalhes de configuração.

---

## 6. unable to read LDAP response packet: unexpected EOF {#6-unable-to-read-ldap-response-packet-unexpected-eof}

Muito provavelmente, você está tentando se conectar ao servidor LDAP usando um método inseguro, embora ele espere uma conexão segura (via TLS).

### Como corrigir isso {#how-to-fix-this-4}

Habilite o TLS no seu arquivo `config.json`:

```json
...
"ldap_needtls": true
...
```

---

## 7. LDAP Result Code 49 "Invalid Credentials" {#7-ldap-result-code-49-invalid-credentials}

Você está com a senha ou o `binddn` errados.

### Como corrigir isso {#how-to-fix-this-5}

Use a ferramenta `ldapwhoami` e verifique se o seu binddn funciona:

```bash
ldapwhoami\
  -H ldap://ldap.com:389\
  -D "CN=/your/ldap_binddn/value/in/config/file"\
  -x\
  -W
```

Ela pedirá a senha de forma interativa e deve retornar o código **0** e exibir o **DN** conforme especificado.

Você também pode ler os seguintes artigos: 
* [ldapsearch: Invalid credentials (49)](https://serverfault.com/q/771549/443463)
* [https://github.com/semaphoreui/semaphore/issues/906](https://github.com/semaphoreui/semaphore/issues/906)

---

## 8. LDAP Result Code 32 "No Such Object" {#8-ldap-result-code-32-no-such-object}

Em breve.
