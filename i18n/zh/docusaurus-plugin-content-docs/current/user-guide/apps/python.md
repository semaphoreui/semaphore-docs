
# Python

Semaphore 可以直接运行 Python 脚本。为此，请创建一个 **Python** 任务模板（Task Template）。

## 创建 Python 模板 {#creating-a-python-template}

1. 进入**任务模板**（Task Templates）部分，点击**新建模板**（New Template）按钮。
2. 选择 **Python** 作为应用类型。
3. 配置模板：

| 字段 | 说明 |
|---|---|
| **名称（Name）** | 模板的描述性名称 |
| **仓库（Repository）** | 包含 `.py` 脚本的仓库 |
| **Playbook / 脚本（Playbook / Script）** | 脚本的相对路径，例如 `scripts/deploy.py` |
| **变量组（Variable Groups）** | 其值将作为环境变量注入的变量组 |

4. 点击**创建**（Create）。
5. 点击**运行**（Run）执行模板。

## 向脚本传递变量 {#passing-variables-to-scripts}

所选**变量组**中的变量会作为环境变量注入。在 Python 中通过 `os.environ` 访问它们：

```python
import os

target = os.environ.get("TARGET_HOST")
print(f"Deploying to {target}")
```

## Python 版本与依赖 {#python-version-and-dependencies}

Semaphore 使用执行环境 `PATH` 中的 `python3` 二进制文件。

- **二进制/软件包安装**：确保主机上安装了正确的 `python3`。
- **Docker**：使用包含所需 Python 版本的自定义镜像。
- **Docker（额外软件包）**：将 `requirements.txt` 挂载到服务器或运行器容器的 `/etc/semaphore/requirements.txt`。Semaphore 会在每次容器启动时将其安装到内置的 Python 虚拟环境中。参见[安装额外的 Python 依赖](/admin-guide/installation/docker#installing-additional-python-dependencies)。

## 注意事项 {#notes}

- 脚本以非交互方式运行。
- 退出码 `0` 表示成功；任何非零退出码都会将任务标记为失败。
