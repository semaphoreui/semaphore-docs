# JWTs de tarefa

Quando a [emissão de JWT está habilitada no servidor](/admin-guide/security/jwt),
um template pode gerar um token assinado e de curta duração para cada tarefa que ele inicia.
O token é exposto ao playbook ou script em execução como a
variável de ambiente `SEMAPHORE_JWT` e pode ser trocado por credenciais
em qualquer sistema que suporte autenticação JWT –
como o OpenBao ou o HashiCorp Vault.

A vantagem em relação a um segredo de longa duração armazenado no
[Key Store](/user-guide/key-store) é que cada tarefa recebe um **token novo
que identifica exatamente aquela execução da tarefa** (projeto, template, id do usuário) e
expira pouco depois que a tarefa termina.

## Habilitando JWTs em um template {#enabling-jwts-on-a-template}

No formulário do template, role até a seção **JWT** (ela só aparece quando o
administrador [habilitou a emissão de JWT](/admin-guide/security/jwt)) e
marque **JWT enabled**.

Você pode configurar as seguintes opções por template:

| Campo | Descrição |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Audience | Uma ou mais strings emitidas na claim `aud`. Defina com o(s) identificador(es) que o seu sistema de destino espera (por exemplo, a URL do servidor OpenBao). Até 32 entradas são suportadas. |
| TTL | Tempo de vida do token como uma duração (`30s`, `10m`, `1h`, ...). Quando deixado vazio, o valor global `jwt.default_ttl` é usado. O TTL não pode exceder o valor global `jwt.max_ttl`. |

## Claims do token {#token-claims}

Cada token carrega as seguintes claims, nas quais você pode confiar ao conceder
acesso no sistema de destino:

| Claim | Exemplo | Observações |
| ------------- | ----------------------------- | -------------------------------------------------- |
| `iss` | `https://semaphore.example.com` | Configurado pelo administrador. |
| `aud` | `https://bao.example.com` | Da lista de audiências do template. |
| `sub` | `task:1234` | Único por execução de tarefa. |
| `iat` / `nbf` / `exp` | | Claims padrão de tempo. |
| `jti` | | Identificador único do token. |
| `project_id` | `7` | Projeto ao qual o template pertence. |
| `template_id` | `42` | O template que gerou a tarefa. |
| `user_id` | `67` | Usuário que iniciou a tarefa (omitido em execuções agendadas / por integração) |

Use essas claims para **restringir o escopo** do acesso no lado consumidor. Por exemplo, uma
role do OpenBao que aceita apenas tokens com `project_id = 7` e um
`template_id` específico.

## Usando o token dentro de uma tarefa {#using-the-token-inside-a-task}

O Semaphore exporta o token como `SEMAPHORE_JWT` no ambiente do
processo da tarefa.

```bash
#!/usr/bin/env bash

# Bash example
echo "Look at my fancy token: $SEMAPHORE_JWT"
```

```yaml
# Ansible example
- name: Read secret from OpenBao KVv2 via JWT auth
  ansible.builtin.set_fact:
    openbao_secret_value: >-
      {{ lookup(
        'community.hashi_vault.hashi_vault',
        secret='kv/data/semaphore/demo:value',
        auth_method='jwt',
        url='https://bao.example.com',
        role_id=bao_role,
        jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
      ) }}
```

______________________________________________________________________

## Exemplo: OpenBao {#example-openbao}

O passo a passo a seguir configura o OpenBao para confiar nos JWTs do Semaphore e
os troca por uma senha de demonstração.
Substitua `semaphore.example.com` e `bao.example.com` pelos seus próprios hostnames.

### 1. Configure o método de autenticação JWT {#1-configure-the-jwt-auth-method}

Habilite o método de autenticação JWT e aponte-o para o endpoint JWKS da sua
instância do Semaphore. O OpenBao usa a chave pública obtida ali para verificar
cada token.

```shell
bao auth enable jwt

bao write auth/jwt/config \
    jwks_url="https://semaphore.example.com/.well-known/jwks.json" \
    bound_issuer="https://semaphore.example.com"
```

### 2. Defina uma política {#2-define-a-policy}

Conceda as permissões de que uma tarefa precisa. O exemplo abaixo permite ler a
credencial de demonstração localizada em `kv/data/semaphore/demo`:

```shell
bao policy write semaphore-demo-policy - <<EOF
path "kv/data/semaphore/demo" {
  capabilities = ["read"]
}
EOF
```

### 3. Defina uma role do OpenBao vinculada a um template {#3-define-an-openbao-role-bound-to-a-template}

Uma role do OpenBao decide **quais tarefas do Semaphore** têm permissão para assumir qual
política. Use as claims específicas do Semaphore (`project_id`, `template_id`, ...)
como `bound_claims`, de modo que apenas o template pretendido possa usar a role:

```shell
bao write auth/jwt/role/semaphore-demo-role - <<EOF
{
  "role_type": "jwt",
  "user_claim": "sub",
  "bound_audiences": "https://bao.example.com",
  "bound_claims": {
    "project_id": "7",
    "template_id": "42"
  },
  "policies": ["semaphore-demo-policy"],
}
EOF
```

Sempre restrinja cada role com pelo menos uma claim `project_id` ou `template_id`.
Sem uma vinculação, **qualquer** JWT emitido pela sua instância do Semaphore
poderia assumir a role.

A lista completa de parâmetros de configuração suportados pode ser encontrada [aqui](https://openbao.org/api-docs/auth/jwt/#createupdate-role)

### 4. Configure o template {#4-configure-the-template}

No template do Semaphore que executa o playbook de deploy:

- Marque **JWT enabled**.
- Defina **Audience** como `https://bao.example.com` – isso corresponde a
  `bound_audiences` na role do OpenBao.
- Opcionalmente, defina **TTL** como `15m` para que o token expire pouco depois que a
  tarefa termine.

### 5. Use o token na tarefa {#5-use-the-token-in-the-task}

```yaml
- hosts: localhost
  gather_facts: false
  tasks:
    - name: Read secret from OpenBao KVv2 via JWT auth
      ansible.builtin.set_fact:
        openbao_secret_value: >-
        {{ lookup(
          'community.hashi_vault.hashi_vault',
          secret='kv/data/semaphore/demo:value',
          auth_method='jwt',
          url='https://bao.example.com',
          role_id='semaphore-demo-role',
          jwt=lookup('ansible.builtin.env', 'SEMAPHORE_JWT')
        ) }}
```

A tarefa agora se autentica no OpenBao sem nenhum segredo pré-compartilhado :tada:
