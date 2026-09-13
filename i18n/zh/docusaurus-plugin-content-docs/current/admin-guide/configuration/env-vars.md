# 环境变量

通过使用环境变量，你可以覆盖任何可用的配置选项。

你可以使用交互式环境变量生成器（适用于 Docker）：
* 用于[服务器](https://semaphoreui.com/install/docker/2_12/)
* 用于[运行器（Runner）](https://semaphoreui.com/install/docker/2_12/runner)。

---

## 应用（Ansible、Terraform 等）的应用环境 {#application-environment-for-apps-ansible-terraform-etc}

Semaphore 可以将环境变量传递给应用（App）进程（Ansible、Terraform/OpenTofu、Python、PowerShell 等）。有两个相关的选项：

- `env_vars` / `SEMAPHORE_ENV_VARS`：将为应用进程设置的静态键值对。
- `forwarded_env_vars` / `SEMAPHORE_FORWARDED_ENV_VARS`：服务器将从自身进程环境中转发的变量名列表。

配置文件示例：

```json
{
  "env_vars": {
    "HTTP_PROXY": "http://proxy.internal:3128",
    "ANSIBLE_STDOUT_CALLBACK": "yaml"
  },
  "forwarded_env_vars": [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "GOOGLE_APPLICATION_CREDENTIALS"
  ]
}
```

使用环境变量的等效写法：

```bash
export SEMAPHORE_ENV_VARS='{"HTTP_PROXY":"http://proxy.internal:3128","ANSIBLE_STDOUT_CALLBACK":"yaml"}'
export SEMAPHORE_FORWARDED_ENV_VARS='["AWS_ACCESS_KEY_ID","AWS_SECRET_ACCESS_KEY","GOOGLE_APPLICATION_CREDENTIALS"]'
```

注意事项：
- 转发是显式的：只有在 `forwarded_env_vars` 中列出的变量才会被应用进程继承。
- 密钥应以安全的方式提供（例如通过 Docker/Kubernetes secrets），然后使用 `forwarded_env_vars` 进行转发。

---

## 运行器执行器配置 {#runner-executor-configuration}

对于运行器部署，可以用单个 JSON 环境变量设置整个执行器块，而无需逐个设置各项键：

```bash
export SEMAPHORE_RUNNER_EXECUTOR='{"type":"docker","docker":{"image":"semaphoreui/job:latest"}}'
```

这等效于在配置文件中设置 `runner.executor.type` 以及嵌套的 `runner.executor.docker.*` 字段。有关所有运行器执行器设置，请参阅[配置选项](/admin-guide/configuration)。

---

## 变量组中的密钥环境变量 {#secret-environment-variables-in-variable-groups}

除了全局环境变量之外，你还可以在变量组（Variable Groups）中定义按项目划分的密钥。密钥类型的键会在 UI 和日志中被遮蔽。有关用法以及通过 `TF_VAR_*` 变量与 Terraform 集成的说明，请参阅`用户指南 → 变量组`。
