# Terragrunt

[Terragrunt](https://terragrunt.gruntwork.io/) — обёртка над Terraform и OpenTofu, которая помогает не дублировать конфигурации и управляет зависимостями между модулями. Semaphore запускает его так же, как [Terraform/OpenTofu](./terraform), с несколькими отличиями, описанными ниже.

## Предварительные требования {#prerequisites}

1. Установите бинарный файл `terragrunt`, а также `terraform` или `tofu` на сервере Semaphore либо на [раннере](/admin-guide/runners), который выполняет задачи.
2. Включите приложение **Terragrunt Code**: по умолчанию оно отключено. Откройте **Applications** из меню учётной записи и включите переключатель, см. [Приложения](/user-guide/apps).

## Создание шаблона Terragrunt {#creating-a-terragrunt-template}

1. Перейдите в **Task Templates** и нажмите **New Template**.
2. Выберите приложение **Terragrunt Code**.
3. Укажите **Repository** и подкаталог с вашим файлом `terragrunt.hcl`.
4. Выберите или создайте **рабочее пространство** в поле Inventory. Шаблоны Terragrunt используют инвентари типа `terragrunt-workspace`, см. [Рабочие пространства](./terraform/workspaces).
5. Нажмите **Create**, затем **Run**.

![Шаблон Terragrunt](/assets/templates-list.webp)

## Запуск задач {#running-tasks}

Диалог New Task предлагает те же опции, что и для Terraform: **Plan**, **Destroy**, **Auto Approve**, **Upgrade** и **Reconfigure**.

Semaphore вызывает `terragrunt run -- <аргументы terraform>` и передаёт путь к бинарному файлу Terraform или OpenTofu через `--tf-path`, если вы не задали `--tf-path` в аргументах CLI шаблона. Выбор рабочего пространства выполняется командой `terragrunt run -- workspace select -or-create=true <name>`.

Переменные из выбранных **групп переменных** передаются как переменные окружения, поэтому для входных переменных используйте префикс `TF_VAR_`. Дополнительные переменные и переменные опроса передаются в виде аргументов `-var name=value`.

## Примечания {#notes}

- `terragrunt` автоматически выполняет `init` перед каждой командой.
- HTTP-backend для состояния и список состояний на вкладке **Workspaces** работают так же, как для Terraform, см. [HTTP backend](./terraform/states).
- Чтобы использовать `run-all` для нескольких модулей, добавьте соответствующие аргументы в поле **CLI args** шаблона.
