# Установка

Установить Semaphore можно несколькими способами в зависимости от вашей операционной системы, окружения и предпочтений:

* **Менеджер пакетов**<br />
  Установите Semaphore из нативного пакета для вашего дистрибутива (например, apt для Debian/Ubuntu или dnf для систем на базе RHEL). Это самый простой способ начать работу на Linux-серверах, хорошо интегрирующийся с системными службами.<br />
  [Подробнее »](/admin-guide/installation/package-manager)

* **Docker**<br />
  Запускайте Semaphore в контейнере с помощью Docker или Docker Compose. Идеально для быстрой настройки, изолированных окружений и CI/CD-pipeline'ов. Рекомендуется пользователям, предпочитающим подход «инфраструктура как код».<br />
  [Подробнее »](/admin-guide/installation/docker)

* **Облако**<br />
  Рекомендации по развёртыванию Semaphore на облачных платформах с использованием виртуальных машин, контейнеров или Kubernetes с управляемыми сервисами.<br />
  [Подробнее »](/admin-guide/installation/cloud)

* **Бинарный файл**<br />
  Скачайте предварительно скомпилированный бинарный файл со страницы релизов. Отлично подходит для ручной установки или встраивания в собственные рабочие процессы. Работает на Linux, macOS и Windows (через WSL).<br />
  [Подробнее »](/admin-guide/installation/binary-file)

* **Kubernetes (Helm chart)**<br />
  Разверните Semaphore в кластере Kubernetes с помощью Helm. Лучше всего подходит для масштабируемой инфраструктуры промышленного уровня. Поддерживает удобную настройку и обновление через значения Helm.<br />
  [Подробнее »](/admin-guide/installation/k8s)

См. также:
* [Запуск в качестве службы](/admin-guide/installation/binary-file#run-as-a-service)
* [Ручная установка](/admin-guide/installation_manually)

----


### Установка дополнительных пакетов Python {#installing-additional-python-packages}

Некоторым модулям и ролям Ansible для работы требуются дополнительные пакеты Python. Чтобы установить дополнительные пакеты Python, создайте файл `requirements.txt` и смонтируйте его в каталог `/etc/semaphore` контейнера. Например, можно добавить следующие строки в файл `docker-compose.yml`:

```yaml
volumes:
  - /path/to/requirements.txt:/etc/semaphore/requirements.txt
```

Пакеты, указанные в файле requirements, будут устанавливаться во встроенное виртуальное окружение Ansible при каждом запуске контейнера. То же монтирование работает и для образа `semaphoreui/runner`. Подробности и альтернативный вариант с собственным образом см. в разделе [Установка дополнительных зависимостей Python](/admin-guide/installation/docker#installing-additional-python-dependencies).

Подробнее о файлах requirements для Python см. в [справочнике по формату файла requirements для pip](https://pip.pypa.io/en/stable/reference/requirements-file-format/)
