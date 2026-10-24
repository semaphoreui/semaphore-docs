---
title: Task environment variables
description: Every environment variable Semaphore sets in the process of a task (Ansible, Terraform, Bash, Python, PowerShell), with the condition under which it is present.
---

# Task environment variables

This page lists the variables Semaphore puts into the environment of the process it starts
for a task: `ansible-playbook`, `terraform` / `tofu` / `terragrunt`, or the Bash, Python or
PowerShell interpreter. It applies to tasks that run on the server and on a remote runner
alike: a remote runner builds the same environment from its own process and its own
configuration file. The Docker and Kubernetes executors of a runner differ and are listed
[separately](#container-executors).

## How the environment is built {#how-the-environment-is-built}

The task process does **not** inherit the environment of the Semaphore server or runner.
Semaphore assembles the environment in this order; when a name repeats, the last value wins:

1. `PATH` of the server or runner process, the variables named in
   [`forwarded_env_vars`](/reference/configuration#tasks) copied from that process, and the
   values of [`env_vars`](/reference/configuration#tasks). See
   [Application environment for apps](/admin-guide/configuration/env-vars#application-environment-for-apps-ansible-terraform-etc).
2. `HOME`, `PWD` and, for Ansible, the [Ansible defaults](#ansible).
3. The variables of the task: the **Environment** of the template's [Variable Group](/user-guide/environment),
   its secrets of type *environment variable*, `SEMAPHORE_JWT`,
   [survey variables](/user-guide/task-templates/survey-vars#pass-variable-as-target) whose
   target is *environment variable*, then the app-specific and credential variables below.
4. The `SEMAPHORE_*` variables that identify the task, the workflow and the template type.

A Variable Group entry therefore overrides `env_vars`, `HOME`, `PWD` and the Ansible defaults
(set `ANSIBLE_HOST_KEY_CHECKING=True` in a Variable Group to turn host key checking back on),
but not the variables Semaphore adds after it.

## Every task {#every-task}

| Variable | Value | Present |
| --- | --- | --- |
| `PATH` | `PATH` of the server or runner process. | Always |
| `HOME` | Depends on [`home_dir_mode`](/reference/configuration#paths-and-storage): with `template_dir` (default) and `user_home` the `HOME` of the server or runner process; with `project_home` the project directory `<tmp_path>/project_<project id>`. | Always |
| `PWD` | Working directory of the process: the repository checkout. For Terraform, OpenTofu and Terragrunt the directory the template points at inside the checkout; for Ansible the template's working directory when one is set. | Always |
| `SEMAPHORE_PROJECT_ID` | ID of the project. | Always |
| `SEMAPHORE_TASK_ID` | ID of the task. | Always |
| *Variable Group → Environment* | Every key of the **Environment** tab, with its value. | Template has a Variable Group |
| *Variable Group → Secrets* | Every secret of type *environment variable*, under its name. Secrets of type *variable* are passed as extra variables or arguments instead. | Template has a Variable Group |
| *Survey variable* | Under the name of the survey variable; a multi-select value is a JSON array. | Survey variable with target *environment variable* |
| `SEMAPHORE_JWT` | Token signed by the server; see [JWT](/user-guide/task-templates/jwt). | JWT issuance enabled in the template |
| `SSH_AUTH_SOCK` | Socket of the SSH agent that holds the SSH key of the inventory. | Inventory uses an access key of type SSH |
| `GIT_TERMINAL_PROMPT` | `0`: git fails instead of asking for credentials on a terminal. | Project has [host config](/user-guide/host-config) mappings |
| `GIT_SSH_COMMAND` | `ssh` with the host key options and `-F <generated config>`, so git reaches a mapped host with the mapped credential. | Project has host config mappings and a config was generated |
| `GIT_CONFIG_PARAMETERS` | `url.<with credential>.insteadOf=<url>` rewrites for the mapped HTTP hosts. | Project has host config mappings that rewrite URLs |

## Workflows <FeatureState feature="workflows" /> {#workflows}

A task started by a workflow run also receives:

| Variable | Value | Present |
| --- | --- | --- |
| `SEMAPHORE_WORKFLOW_RUN_ID` | ID of the workflow run. | Task belongs to a workflow run |
| `SEMAPHORE_WORKFLOW_ID` | ID of the workflow. | Task belongs to a workflow run |
| `SEMAPHORE_WORKFLOW_VERSION` | Version of the workflow run. | The run has a version |
| `SEMAPHORE_WORKFLOW_URL` | `<web_host>/project/<project id>/workflows/<workflow id>/runs/<run id>`. | `web_host` is set |
| `SEMAPHORE_OUTPUTS_FILE` | Path of the file the task writes its [outputs](/user-guide/workflows#producing-outputs) to. | Task belongs to a workflow run; not set by the Docker and Kubernetes executors |
| `ANSIBLE_CALLBACK_PLUGINS` | The value the task would have had (from a Variable Group or `env_vars`, else Ansible's default path, with the per-template `.ansible` in `template_dir` mode) plus the directory of the callback plugin that turns `set_stats` into outputs. | Ansible task that belongs to a workflow run |

## Build and deploy templates {#build-and-deploy-templates}

Set when the template type is **Build** or **Deploy**, for every app:

| Variable | Value | Present |
| --- | --- | --- |
| `SEMAPHORE_TASK_TYPE` | `build` or `deploy`. | Template type is not Task |
| `SEMAPHORE_TASK_INCOMING_VERSION` | Version produced by the build task that triggered this task. | The task has an incoming version |
| `SEMAPHORE_TASK_TARGET_VERSION` | Version this build produces. | Build template |

## Task details for Bash, Python and PowerShell {#task-details}

The shell apps receive the task details as `SEMAPHORE_TASK_DETAILS_*` variables. Ansible gets
the same values as the extra variable `semaphore_vars.task_details` instead (see
[Build and deploy templates](/user-guide/task-templates/build-deploy#the-semaphore_vars-variable));
Terraform, OpenTofu and Terragrunt get neither.

| Variable | Value | Present |
| --- | --- | --- |
| `SEMAPHORE_TASK_DETAILS_ID` | ID of the task. | Always |
| `SEMAPHORE_TASK_DETAILS_MESSAGE` | Message entered when the task was started. | The task has a message |
| `SEMAPHORE_TASK_DETAILS_USERNAME` | Login of the user who started the task. | The task was started by a user (not by a schedule or an integration) |
| `SEMAPHORE_TASK_DETAILS_URL` | `<web_host>/project/<project id>/history?t=<task id>`. | `web_host` is set |
| `SEMAPHORE_TASK_DETAILS_COMMIT_HASH` | Hash of the commit checked out for the task. | The repository checkout has a commit |
| `SEMAPHORE_TASK_DETAILS_COMMIT_MESSAGE` | Message of that commit. | The repository checkout has a commit |
| `SEMAPHORE_TASK_DETAILS_INVENTORY_ID` | ID of the inventory, `0` when the template has none. | Always |
| `SEMAPHORE_TASK_DETAILS_INVENTORY_NAME` | Name of the inventory. | Template has an inventory |
| `SEMAPHORE_TASK_DETAILS_REPOSITORY_ID` | ID of the repository. | Always |
| `SEMAPHORE_TASK_DETAILS_REPOSITORY_NAME` | Name of the repository. | Always |
| `SEMAPHORE_TASK_DETAILS_TYPE` | `build` or `deploy`. | Template type is not Task |
| `SEMAPHORE_TASK_DETAILS_INCOMING_VERSION` | Same as `SEMAPHORE_TASK_INCOMING_VERSION`. | The task has an incoming version |
| `SEMAPHORE_TASK_DETAILS_TARGET_VERSION` | Same as `SEMAPHORE_TASK_TARGET_VERSION`. | Build template |

Values are shell-quoted before they are set. A value made only of letters, digits and
`@ % + = : , . / -` arrives as is; any other value is wrapped in single quotes, so the message
`hello world` arrives as `'hello world'` and a URL with a `?` arrives quoted as well.
Non-printable characters are removed. Strip the quotes if your script compares the value
rather than echoing it.

`SEMAPHORE_TASK_TYPE`, `SEMAPHORE_TASK_INCOMING_VERSION` and `SEMAPHORE_TASK_TARGET_VERSION`
are present for every app; their `SEMAPHORE_TASK_DETAILS_*` copies only for the shell apps.

## Terraform, OpenTofu and Terragrunt {#terraform}

| Variable | Value | Present |
| --- | --- | --- |
| `TF_HTTP_ADDRESS` | `<web_host>/api/terraform/<alias>`: the address of the task's state in the Semaphore [HTTP backend](/user-guide/apps/terraform/states). The alias is generated for each task. | Always for these apps |

Variable Group secrets and survey variables that Terraform must read as input variables need
the `TF_VAR_` prefix in their name; see [Variable Groups](/user-guide/environment#using-variable-groups---terraformopentofu).

## Ansible {#ansible}

| Variable | Value | Present |
| --- | --- | --- |
| `PYTHONUNBUFFERED` | `1`, so the output reaches the task log as it is written. | Always |
| `ANSIBLE_FORCE_COLOR` | `True`, so the log keeps its colors without a terminal. | Always |
| `ANSIBLE_HOST_KEY_CHECKING` | `False`. Override it in a Variable Group to turn host key checking on. | Always |
| `ANSIBLE_HOME` | `<tmp_path>/project_<project id>/repository_<repository id>_template_<template id>_home/.ansible`, so parallel tasks do not share `.ansible/`. | `home_dir_mode` is `template_dir` (default) |
| `ANSIBLE_CALLBACK_PLUGINS` | See [Workflows](#workflows). | Ansible task in a workflow run |

The variables of the Variable Group are also exported to `ansible-galaxy` when it installs
the requirements of the repository.

## Container executors <FeatureState feature="docker-executor" /> {#container-executors}

The Docker and Kubernetes executors of a runner start the app inside a container, and
the container does not see the runner's `PATH`, `env_vars` or `forwarded_env_vars`. The
container receives:

| Variable | Value |
| --- | --- |
| `HOME` | The workspace mount of the container. |
| `ANSIBLE_FORCE_COLOR`, `PY_COLORS` | `True` and `1`: colored output without a terminal. |
| `ANSIBLE_LOCAL_TEMP` | `<workspace>/.ansible/tmp`, for Ansible tasks. |
| `ANSIBLE_HOST_KEY_CHECKING` | `False`, for Ansible tasks that install an SSH key. |
| `SEMAPHORE_PROJECT_ID`, `SEMAPHORE_TASK_ID`, `SEMAPHORE_WORKFLOW_*` | As for [every task](#every-task) and [workflows](#workflows). |
| `SEMAPHORE_TASK_TYPE`, `SEMAPHORE_TASK_INCOMING_VERSION`, `SEMAPHORE_TASK_TARGET_VERSION` | As for [build and deploy templates](#build-and-deploy-templates). |
| `SEMAPHORE_TASK_DETAILS_*` | As for the [shell apps](#task-details). |
| `SEMAPHORE_JWT` | As for every task. |
| `TF_HTTP_ADDRESS` | As for [Terraform](#terraform). |
| *Variable Group → Environment*, *Variable Group → Secrets* | As for every task. |

`SEMAPHORE_OUTPUTS_FILE` is not set: these executors do not produce workflow outputs yet.

## Related pages {#related-pages}

- [Tasks](/user-guide/tasks#environment-variables): the variables most scripts need, with an example.
- [Build and deploy templates](/user-guide/task-templates/build-deploy): versions and `semaphore_vars`.
- [Workflows](/user-guide/workflows#environment-variables): outputs and the workflow variables.
- [JWT](/user-guide/task-templates/jwt): exchanging `SEMAPHORE_JWT` for secrets.
- [Variable Groups](/user-guide/environment) and [Survey variables](/user-guide/task-templates/survey-vars): the variables you define yourself.
- [Environment variables](/admin-guide/configuration/env-vars#application-environment-for-apps-ansible-terraform-etc): `env_vars` and `forwarded_env_vars`.
