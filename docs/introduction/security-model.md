---
title: Security model
description: What Semaphore protects, the trust boundaries in a deployment, who can cause code to run, and which decisions are left to you.
---

# Security model

Semaphore holds the credentials to your infrastructure and runs code against it. Two
properties follow from that, and both shape every other decision on this page:
**secrets must never travel back to a browser**, and **anyone who can start a task
can run code on the machines that task reaches**.

This page explains the model. For the settings that implement it, see
[Security](/admin-guide/security).

## Trust boundaries {#trust-boundaries}

| Boundary | Crossed by | Protected by |
|---|---|---|
| Browser ↔ server | Sessions, API tokens | TLS, secure cookies, [reverse proxy](/admin-guide/reverse-proxy) |
| Server ↔ database | All persistent state | Network restriction; secrets encrypted before they are written |
| Server ↔ runner | Job payloads, including secrets | HTTPS and a per-runner bearer token |
| Task ↔ managed hosts | Your automation | The keys you gave the template |

A task is on the far side of every one of those boundaries. It receives the secrets
it needs in its environment, and from that moment the code in your repository decides
what happens to them.

## Identity {#identity}

Users authenticate in one of three ways, and all three end in the same session:

- **Local accounts.** Passwords are hashed with Argon2id (bcrypt before 2.20, upgraded
  on first login). TOTP two-factor authentication can be required.
- **[LDAP or Active Directory](/admin-guide/authentication/ldap).** The directory verifies the password;
  Semaphore keeps only the account.
- **[OpenID Connect](/admin-guide/authentication/openid).** The provider authenticates and Semaphore
  maps claims onto users.

Non-interactive access uses **API tokens** created by a user, carrying that user's
permissions. Runners do not use user identity at all: they authenticate with their own
registration-issued token.

Tasks can carry identity too. With [task JWTs](/user-guide/task-templates/jwt) a run
receives a short-lived signed token naming the project, template, and user, which an
external secret store can verify instead of you storing a long-lived credential.

## Authorization {#authorization}

Two levels exist and they are independent.

**Server level.** An administrator manages users, global runners, and server settings.
Being a server administrator does not by itself grant membership in a project.

**Project level.** Each member holds one role in each project:

| Role | May |
|---|---|
| **Owner** | Everything in the project, including members and deletion. |
| **Manager** | Run tasks and manage resources and templates. |
| **Task Runner** | Run tasks. Nothing else. |
| **Guest** | Read. |

Enterprise adds [custom roles](/user-guide/team) <FeatureState feature="extended-rbac" />
when those four are too coarse.

The line that matters for security runs between **Task Runner** and **Manager**.
A Manager can change what a template executes, and therefore can run arbitrary code
with that project's credentials. A Task Runner can only start what already exists —
unless the template exposes prompts or survey variables that reach the command line,
in which case the template author has widened that boundary deliberately.

## Secrets {#secrets}

Secret values — SSH private keys, passwords, tokens, secret variables — are encrypted
with the key in `access_key_encryption` before being stored, so a database dump alone
does not disclose them. The API never returns a secret value; the UI shows that a
secret is set, not what it is.

Secrets reach a task through its environment at the moment it starts. This is why
task output is worth treating as sensitive: a playbook that prints a variable prints
it into a log that other project members can read.

If you would rather not hold the secrets at all,
[external secret storages](/user-guide/key-store) keep values in HashiCorp Vault,
OpenBao, AWS Secrets Manager, or Devolutions Server and fetch them per run.

## Executing untrusted code {#executing-untrusted-code}

With the default setup, a task is a process on the Semaphore server with the server's
file system and network access. That is appropriate when everyone who can edit a
template is already trusted with the server.

When they are not, move execution away from the server:

- A [runner](/admin-guide/runners) puts tasks on a different machine, so compromising a
  task does not compromise the web service or the database.
- The **Docker** or **Kubernetes** executor gives each job a fresh container or Pod,
  so one run cannot read another run's files or the host's.
- Separate projects with separate keys mean a task can only reach what its own project's
  credentials allow.

:::warning
A repository that a project member can change is code that will run with that
project's credentials. Protect the branch a template builds from, or point templates
at a branch only reviewers can write to.
:::

## What is left to you {#what-is-left-to-you}

Semaphore is self-hosted, so parts of the model are yours to supply:

- TLS in front of the service, whether built in or from a [reverse proxy](/admin-guide/reverse-proxy).
- Network restriction of the database and of the server's admin surface.
- Backups of the database and of `access_key_encryption` — the second is useless
  without the first, and the first is unreadable without the second.
- Keeping the version current. Report vulnerabilities to `security@semaphoreui.com`.

## What's next {#whats-next}

- [Security](/admin-guide/security) — the concrete settings, hashing parameters, and hardening steps.
- [Architecture](/introduction/architecture) — the components these boundaries separate.
- [Teams](/user-guide/team) — assigning roles in a project.
