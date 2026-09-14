# Установка

Установить Semaphore можно несколькими способами в зависимости от вашей операционной системы, окружения и предпочтений.

## В этом разделе {#in-this-section}

| Способ | Когда использовать |
|---|---|
| [Менеджер пакетов](/admin-guide/installation/package-manager) | Вам нужен нативный пакет для вашего дистрибутива Linux. |
| [Docker](/admin-guide/installation/docker) | Вы хотите запускать Semaphore в контейнере с помощью Docker или Docker Compose. |
| [Облако](/admin-guide/installation/cloud) | Вы развёртываете Semaphore на облачной платформе и ищете рекомендации по управляемым сервисам и инфраструктуре. |
| [Бинарный файл](/admin-guide/installation/binary-file) | Вы хотите установить готовый бинарный файл и самостоятельно управлять процессом. |
| [Kubernetes (Helm chart)](/admin-guide/installation/k8s) | Вы уже используете Kubernetes и хотите управлять развёртыванием через Helm. |

## Установка дополнительных пакетов Python {#installing-additional-python-packages}

Некоторым модулям и ролям Ansible для работы требуются дополнительные пакеты Python. Чтобы установить дополнительные пакеты Python, создайте файл `requirements.txt` и смонтируйте его в каталог `/etc/semaphore` контейнера. Например, можно добавить следующие строки в файл `docker-compose.yml`:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

Пакеты, указанные в файле requirements, будут устанавливаться во встроенное виртуальное окружение Ansible при каждом запуске контейнера. То же монтирование работает и для образа `semaphoreui/runner`. Подробности и альтернативный вариант с собственным образом см. в разделе [Установка дополнительных зависимостей Python](/admin-guide/installation/docker#installing-additional-python-dependencies).

Подробнее о файлах requirements для Python см. в [справочнике по формату файла requirements для pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/)

## С чего начать {#where-to-start}

Начните с руководства для вашего окружения. При установке из бинарного файла настройте запуск в качестве службы, чтобы Semaphore продолжал работать. Настройка служебного пользователя, Python-зависимостей и systemd описана в руководстве по ручной установке.

* [Запуск в качестве службы](/admin-guide/installation/binary-file#run-as-a-service)
* [Ручная установка](/admin-guide/installation_manually)
