---
title: AI agents
description: Creating a Claude Code or Codex agent template, its prompt and prompt expressions, the API key, MCP servers, CLI arguments, and the task log.
---

# AI agents

Using Semaphore UI you can run AI coding agents: [Claude Code](https://docs.claude.com/en/docs/claude-code/overview) and [Codex](https://developers.openai.com/codex/cli). An agent template starts the agent's command line tool in a directory of a repository and gives it a prompt. The agent works on its own, without anyone to answer its questions, and reports what it does to the task log.

:::note

AI agent templates are available since **Semaphore 2.21**.

:::

Use an agent template for work you would otherwise describe to a colleague: review the last commit, find and fix a failing test, update a dependency and open a pull request. Like any other template, it can be started by hand, by a [schedule](/user-guide/schedules), an [integration](/user-guide/integrations), or a [workflow](/user-guide/workflows).

## Before you begin {#before-you-begin}

- **The agent's command line tool is installed** on the machine that executes tasks: the Semaphore server or the [runner](/admin-guide/runners).

  | Application | ID | Command | Install |
  |---|---|---|---|
  | Claude Code Agent | `claude` | `claude` | `npm install -g @anthropic-ai/claude-code` |
  | Codex Agent | `codex` | `codex` | `npm install -g @openai/codex` |

  Semaphore enables an application when it finds its command in `PATH` at startup. An administrator can also enable it and set the path to the executable on the [Applications](/user-guide/apps#managing-applications) page.
- **An API key** of the model provider, see [API key](#api-key).
- **A repository** the agent works in, added to [Repositories](/user-guide/repositories).

## Create a template {#create-a-template}

1. Go to **Task Templates** section, click on **New Template** and then **Claude Code Agent** or **Codex Agent**.

![The New Template menu with the Claude Code Agent and Codex Agent items](/assets/agent-template-new.webp)

2. Set up the template.

![The editor of a Claude Code Agent template](/assets/agent-template-editor.webp)

The template allows you to specify the following parameters:

| Field | Description |
|---|---|
| **Repository** | The repository the agent works in. Semaphore clones or updates it before the task, like for any other template. |
| **Subdirectory path** | Optional. The directory of the repository the agent is started in. If omitted, the agent starts in the repository root. |
| **MCP servers** | Optional. An MCP inventory with the servers whose tools the agent can call, see [MCP servers](#mcp-servers). |
| **Variable Groups** | Variables and secrets for the agent: the API key, values for the [prompt expressions](#prompt-expressions), environment variables of the agent's process. |
| **Prompt** | The instruction the agent runs with, see [Prompt](#prompt). |
| **CLI args** | Extra arguments for the agent's command, see [CLI arguments](#cli-arguments). |
| **Survey Variables** | Questions asked when the task is started. The answers can be put into the prompt. |
| **Prompt** checkbox | Under **Claude Code prompts** or **Codex prompts**. Lets whoever starts a task replace the prompt, see [Prompt of a task](#prompt-of-a-task). |

3. Click **Save**, then run the template with the **Run** button.

## API key {#api-key}

The agent takes its API key from an environment variable. Add the key to a [Variable Group](/user-guide/environment) of the template as a **secret environment variable**:

| Application | Variable | Also accepted |
|---|---|---|
| Claude Code Agent | `ANTHROPIC_API_KEY` | `CLAUDE_CODE_OAUTH_TOKEN` |
| Codex Agent | `OPENAI_API_KEY` | `CODEX_API_KEY` |

The login of the user that runs Semaphore is not used: every task gets its own, empty configuration directory of the agent, so a key from a Variable Group is the only way to authenticate.

If none of the variables is set, the task log says which one to add, and the agent itself then fails with its own error:

```
No API key for claude: add ANTHROPIC_API_KEY or CLAUDE_CODE_OAUTH_TOKEN as a secret of the template's Variable Group
```

## Prompt {#prompt}

The prompt is what you would type into the agent: plain text, as long as needed. It is passed to the agent on its standard input, so it does not appear in the process list.

The prompt is required unless the **Prompt** checkbox lets a task bring its own.

### Prompt expressions {#prompt-expressions}

The prompt of a template can take values from the Variable Groups of the template. Write an expression in double braces, as in GitHub Actions, and Semaphore replaces it when the task starts:

| Expression | Value |
|---|---|
| `${{ vars.extra.NAME }}` | An extra variable of a Variable Group. |
| `${{ vars.env.NAME }}` | An environment variable of a Variable Group. |
| `${{ secrets.extra.NAME }}` | A secret extra variable of a Variable Group. |
| `${{ secrets.env.NAME }}` | A secret environment variable of a Variable Group. |

```text
Find the flaky tests in services/api and fix them.
Open a pull request against ${{ vars.extra.base_branch }} and post its link
to ${{ vars.env.TRACKER_URL }} with the token ${{ secrets.env.TRACKER_TOKEN }}.
```

The rules:

- **Survey variables** are extra variables: the answer to the survey variable `version` is `${{ vars.extra.version }}`, and a secret one is `${{ secrets.extra.NAME }}`. A survey variable that is delivered as an environment variable is under `env` instead. A survey variable left unanswered gives an empty string.
- **A variable that does not exist fails the task** before the agent starts, with a message that names the expression. Semaphore does not run an agent with a hole in its prompt.
- **A misspelled expression is refused when the template is saved**: `${{ secrets.TOKEN }}` has no `extra` or `env`.
- **Other expressions are left as they are.** Only `vars.…` and `secrets.…` belong to Semaphore, so a prompt can ask the agent to write a workflow with `${{ github.sha }}` in it. To keep a `vars` or `secrets` expression as text, put one more dollar sign before it: `$${{ secrets.env.NAME }}`.
- **A value is put in as it is.** A string is used as written, a list or an object as JSON. A value is not looked through for expressions again.
- **A secret that was put into the prompt is masked** in the task log, wherever the agent repeats it.

:::warning

A secret in the prompt is sent to the model provider together with the rest of the prompt, and the agent can use it in any way the prompt allows. Prefer giving a secret to the agent's tools: as a secret environment variable of a Variable Group, or as the token of an [MCP server](#mcp-servers).

:::

### Prompt of a task {#prompt-of-a-task}

With the **Prompt** checkbox enabled, the task form shows the prompt of the template and lets you change it for one run. A schedule, an integration, or a workflow step can keep a prompt of its own in the same way. Through the API, send it in the task parameters:

```json
{
  "template_id": 12,
  "params": {
    "prompt": "Review the changes of the last release and list the risky ones."
  }
}
```

A prompt given by a task is used exactly as it is written: **prompt expressions are replaced only in the prompt stored in the template**. This keeps the variables and secrets of the project away from anyone who may only run tasks. If the template does not allow it, a task that brings a prompt is refused.

## MCP servers {#mcp-servers}

An agent can call the tools of remote [MCP](https://modelcontextprotocol.io) servers: an issue tracker, a documentation search, your own service. The servers are kept in an inventory of the **MCP Inventory** type, and one inventory serves both Claude Code and Codex templates.

1. Go to **Inventory** section, click on **New Inventory** and then **MCP Inventory**.
2. Add the servers and click **Save**.
3. Select the inventory in the **MCP servers** field of the template.

![The form of an MCP inventory with three servers](/assets/agent-mcp-inventory.webp)

| Field | Description |
|---|---|
| Switch | A server that is switched off stays in the list and is not given to the agent. |
| **Name** | The name the agent knows the server by: up to 64 letters, digits, `-` and `_`. It is shown in the task log before the name of a tool. |
| **URL** | An `http` or `https` address of a server that speaks MCP over HTTP or SSE. A user name or password in the URL is not accepted. |
| **Token** | Optional. The agent sends it in the `Authorization` header as a bearer token. |

A saved token is stored encrypted and never shown again: type a new one to replace it, or remove it with the cross. The token reaches the agent as an environment variable of its process; it is not written to the agent's configuration file, to the command line, or to the task log.

The tools of the selected servers are approved in advance, since nobody is there to confirm a call. The agent gets exactly these servers: MCP servers configured for the user that runs Semaphore are not used.

## CLI arguments {#cli-arguments}

**CLI args** are added to the agent's command after the arguments Semaphore sets itself. Enter each token as a separate argument:

```json
["--model", "claude-sonnet-5-5"]
```

Use them for what the agent's own command line offers: the model, the limits, the permissions. The agent runs unattended, so a tool that would ask for a confirmation is refused instead; which tools an agent may use without asking is set with its arguments. See the [Claude Code CLI reference](https://docs.claude.com/en/docs/claude-code/cli-reference) and the [Codex CLI reference](https://developers.openai.com/codex/cli/reference) for the options of your version.

With **CLI args** enabled under **Prompts**, a task can add arguments of its own.

Variables and secrets of the Variable Groups are not added to the command line of an agent, where the process list would show them. Environment variables and secret environment variables are passed to the agent's process.

## How the agent runs {#how-the-agent-runs}

Semaphore starts the agent in the repository directory, or in the **Subdirectory path** of it, with the prompt on the standard input:

| Application | Command |
|---|---|
| Claude Code Agent | `claude -p --output-format=stream-json --verbose --include-partial-messages --mcp-config=<file> --strict-mcp-config --no-session-persistence [--allowedTools=mcp__<server>__*,…] <CLI args>` |
| Codex Agent | `codex exec --json --skip-git-repo-check <CLI args> -` |

- **Every task has its own configuration directory** of the agent (`CLAUDE_CONFIG_DIR`, `CODEX_HOME`), created for the task and removed after it. Settings, logins, and MCP servers of the user that runs Semaphore do not reach the agent, and a variable of a Variable Group cannot redirect the directory.
- **Nothing is kept between tasks**: each run is a new session of the agent. What should survive a run belongs in the repository: a commit, a pull request, a file.
- **The agent reads the instruction files of the repository** that its command line tool reads by itself in the working directory, such as `CLAUDE.md` or `AGENTS.md`.
- **On Docker and Kubernetes runners** the agent runs in a container, so the [executor image](/user-guide/task-templates#executor-image-docker-and-kubernetes-runners) must contain the `claude` or `codex` command.

## Task log {#task-log}

The task log shows the agent's work as it happens:

![The log of a Claude Code task: the model, tool calls, a subagent, the summary](/assets/agent-task-log.webp)

- **Text** of the agent, line by line. Codex prints a message when it is complete.
- **Tool calls**, each in one row: the state, the MCP server and the tool, the arguments. Click a row to see the arguments and the result. A failed call is open from the start.
- **Subagents**: the rows of a subagent are marked with its name.
- **The first row** of a Claude Code run names the model and the MCP servers, with the ones that did not connect in red.
- **The summary** at the end: the number of turns, the duration, the tokens, and the cost, as far as the agent reports them.

**Raw log** shows the same log as plain text.

## Security {#security}

- **An agent executes commands.** Within the permissions its command line tool gives it, the agent can read and change the repository directory, run programs as the user that executes tasks, and call the tools of its MCP servers. Give an agent template the access you would give to a script written by someone else: a repository and tokens with the narrowest rights that do the job, and a separate [runner](/admin-guide/runners) for work you want to keep apart from the server.
- **The prompt and what the agent reads go to the model provider**: the files of the repository, the output of commands, the results of tools.
- **A repository can instruct the agent.** Text in the files the agent reads, in an issue, or in the result of a tool can change what the agent does. Do not point an agent with powerful tokens at content you do not control.
- **Tokens and secrets are masked in the task log**: the tokens of the MCP servers and the secrets put into the prompt are replaced with `********`.
- **Only the prompt stored in the template can use variables and secrets**, see [Prompt of a task](#prompt-of-a-task).
