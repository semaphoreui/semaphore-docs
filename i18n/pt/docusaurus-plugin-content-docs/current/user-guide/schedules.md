# Agendamentos

A função de agendamento do Semaphore permite automatizar a execução de templates (por exemplo, execuções de playbooks) em intervalos predefinidos. Esse recurso possibilita implementar tarefas de automação rotineiras, como backups regulares, verificações de conformidade, atualizações de sistema e muito mais.

Certifique-se de reiniciar o serviço do Semaphore após fazer alterações para que elas entrem em vigor.

[//]: # (## Setup and configuration)

## Configuração de fuso horário {#timezone-configuration}

Por padrão, o recurso de agendamento opera no fuso horário UTC. No entanto, isso pode ser personalizado para corresponder ao seu fuso horário local ou a requisitos específicos.

Você pode alterar o fuso horário atualizando o arquivo de configuração ou definindo uma variável de ambiente:

1. **Usando o arquivo de configuração**:  
    Adicione ou atualize o campo `timezone` no seu arquivo de configuração do Semaphore:
    ```json
    {
      "schedule": {
        "timezone": "America/New_York"
      }
    }
    ```

2. **Usando uma variável de ambiente**:  
    Defina a variável de ambiente `SEMAPHORE_SCHEDULE_TIMEZONE`:
    ```bash
    export SEMAPHORE_SCHEDULE_TIMEZONE="America/New_York"
    ```

Para obter a lista de valores válidos de fuso horário, consulte o [IANA Time Zone Database](https://www.iana.org/time-zones).

### Acessando o recurso de agendamento {#accessing-the-schedule-feature}

1. Faça login na interface web do Semaphore
2. Navegue até a aba "Schedule" no menu de navegação principal
3. Clique no botão "New Schedule" no canto superior direito para criar um novo agendamento

![](/assets/schedule01.png)

### Criando um novo agendamento {#creating-a-new-schedule}

Ao criar um novo agendamento, você precisará configurar as seguintes opções:

| Campo | Descrição |
|-------|-------------|
| Name | Um nome descritivo para a tarefa agendada |
| Template | O Template de Tarefa específico a ser executado |
| Timing | No formato cron, para maior flexibilidade, ou usando as opções integradas para intervalos comuns |

![](/assets/schedule02.png) ![](/assets/schedule03.png)

### Sintaxe do formato cron {#cron-format-syntax}

O agendamento usa a sintaxe cron padrão com cinco campos:

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

Exemplos:
- `*/15 * * * *` - Executa a cada 15 minutos
- `0 2 * * *` - Executa às 2:00 todos os dias
- `0 0 * * 0` - Executa à meia-noite aos domingos
- `0 9 1 * *` - Executa às 9:00 no primeiro dia de cada mês

Gerador de expressões cron muito útil: [https://crontab.guru/](https://crontab.guru/)

## Casos de uso {#use-cases}

### Manutenção de sistemas {#system-maintenance}

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

Agende este playbook para ser executado semanalmente fora do horário de pico para garantir que os sistemas permaneçam atualizados.

### Operações de backup {#backup-operations}

Crie agendamentos para backups de banco de dados com frequências diferentes:
- Backups diários com retenção de uma semana
- Backups semanais com retenção de um mês
- Backups mensais com retenção de um ano

### Verificações de conformidade {#compliance-checks}

Agende varreduras regulares de conformidade para garantir que os sistemas atendam aos requisitos de segurança:

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

### Provisionamento e limpeza de ambientes {#environment-provisioning-and-cleanup}

Para ambientes de desenvolvimento ou teste. Agende a criação de ambientes em nuvem pela manhã e a desmontagem à noite para otimizar custos.

## Boas práticas {#best-practices}

* Use nomes descritivos para os agendamentos que indiquem tanto a função quanto o horário (por exemplo, "Weekly-Backup-Sunday-2AM")
* Evite agendar muitas tarefas que consomem muitos recursos ao mesmo tempo
* Considere o efeito de tarefas agendadas de longa duração sobre outros agendamentos
* Teste os agendamentos com intervalos curtos antes de configurar agendamentos de produção com intervalos mais longos
* Documente a finalidade e os resultados esperados das tarefas agendadas

---

## Parâmetros de tarefa {#task-parameters}

Os agendamentos podem passar parâmetros para as tarefas. Ative os prompts para os campos necessários no template e, em seguida, defina os valores dos parâmetros na configuração do agendamento para que cada execução forneça as substituições desejadas (por exemplo, branch, variáveis, flags).
