# Programaciones

La función de programación de Semaphore permite automatizar la ejecución de plantillas (por ejemplo, ejecuciones de playbooks) en intervalos predefinidos. Esta característica permite implementar tareas de automatización rutinarias, como copias de seguridad periódicas, comprobaciones de cumplimiento, actualizaciones del sistema y más.

Asegúrese de reiniciar el servicio de Semaphore después de realizar cambios para que surtan efecto.

[//]: # (## Setup and configuration)

## Configuración de la zona horaria {#timezone-configuration}

De forma predeterminada, la función de programación opera en la zona horaria UTC. Sin embargo, esto puede personalizarse para que coincida con su zona horaria local o con requisitos específicos.

Puede cambiar la zona horaria actualizando el archivo de configuración o definiendo una variable de entorno:

1. **Mediante el archivo de configuración**:  
    Agregue o actualice el campo `timezone` en su archivo de configuración de Semaphore:
    ```json
    {
      "schedule": {
        "timezone": "America/New_York"
      }
    }
    ```

2. **Mediante una variable de entorno**:  
    Defina la variable de entorno `SEMAPHORE_SCHEDULE_TIMEZONE`:
    ```bash
    export SEMAPHORE_SCHEDULE_TIMEZONE="America/New_York"
    ```

Para obtener una lista de valores de zona horaria válidos, consulte la [base de datos de zonas horarias de IANA](https://www.iana.org/time-zones).

### Acceso a la función de programación {#accessing-the-schedule-feature}

1. Inicie sesión en la interfaz web de Semaphore
2. Vaya a la pestaña "Schedule" en el menú de navegación principal
3. Haga clic en el botón "New Schedule" en la esquina superior derecha para crear una nueva programación

![](/assets/schedule01.png)

### Creación de una nueva programación {#creating-a-new-schedule}

Al crear una nueva programación, deberá configurar las siguientes opciones:

| Campo | Descripción |
|-------|-------------|
| Nombre | Un nombre descriptivo para la tarea programada |
| Plantilla | La plantilla de tarea específica que se ejecutará |
| Temporización | En formato cron para mayor flexibilidad o mediante las opciones integradas para intervalos comunes |

![](/assets/schedule02.png) ![](/assets/schedule03.png)

### Sintaxis del formato cron {#cron-format-syntax}

La programación utiliza la sintaxis cron estándar con cinco campos:

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

Ejemplos:
- `*/15 * * * *` - Ejecutar cada 15 minutos
- `0 2 * * *` - Ejecutar a las 2:00 todos los días
- `0 0 * * 0` - Ejecutar a medianoche los domingos
- `0 9 1 * *` - Ejecutar a las 9:00 el primer día de cada mes

Generador de expresiones cron muy útil: [https://crontab.guru/](https://crontab.guru/)

## Casos de uso {#use-cases}

### Mantenimiento del sistema {#system-maintenance}

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

Programe este playbook para que se ejecute semanalmente fuera del horario laboral y así garantizar que los sistemas se mantengan actualizados.

### Operaciones de copia de seguridad {#backup-operations}

Cree programaciones para copias de seguridad de bases de datos con distintas frecuencias:
- Copias diarias que se conservan durante una semana
- Copias semanales que se conservan durante un mes
- Copias mensuales que se conservan durante un año

### Comprobaciones de cumplimiento {#compliance-checks}

Programe análisis de cumplimiento periódicos para garantizar que los sistemas cumplan los requisitos de seguridad:

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

### Aprovisionamiento y limpieza de entornos {#environment-provisioning-and-cleanup}

Para entornos de desarrollo o pruebas. Programe la creación de entornos en la nube por la mañana y su desmantelamiento por la tarde para optimizar los costos.

## Buenas prácticas {#best-practices}

* Utilice nombres descriptivos para las programaciones que indiquen tanto la función como la temporización (por ejemplo, "Weekly-Backup-Sunday-2AM")
* Evite programar demasiadas tareas que consuman muchos recursos de forma simultánea
* Tenga en cuenta el efecto de las tareas programadas de larga duración sobre otras programaciones
* Pruebe las programaciones con intervalos cortos antes de configurar programaciones de producción con intervalos más largos
* Documente el propósito y los resultados esperados de las tareas programadas

---

## Parámetros de tarea {#task-parameters}

Las programaciones pueden pasar parámetros a las tareas. Habilite los prompts para los campos necesarios en la plantilla y, a continuación, defina los valores de los parámetros en la configuración de la programación para que cada ejecución proporcione las sobrescrituras deseadas (por ejemplo, rama, variables, indicadores).
