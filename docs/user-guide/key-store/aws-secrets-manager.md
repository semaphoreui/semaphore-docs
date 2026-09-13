---
title: AWS Secrets Manager secret storage
description: Enterprise option for keeping Key Store secrets in AWS Secrets Manager, with IAM role or access key authentication.
---

# AWS Secrets Manager secret storage

<Enterprise />

Semaphore UI Enterprise can use **AWS Secrets Manager** as an external storage for Key Store secrets instead of the database.

## Configuration options {#configuration-options}

When you create an **AWS Secrets Manager** storage under **Key Store → Storages**, configure:

| Field | Description |
|-------|-------------|
| **Region** | AWS region where secrets live (for example `us-east-1`). Required. |
| **Endpoint URL** | Optional custom endpoint. Leave empty for the standard AWS API endpoint. Useful for LocalStack or VPC endpoints. |
| **Use IAM Role / Instance Profile** | When enabled, Semaphore uses the ambient AWS credentials chain (EC2 instance profile, ECS task role, EKS IRSA, etc.) and does not require static access keys. |
| **Access Key ID** | Required when IAM role mode is off. |
| **Secret Access Key** | Required when IAM role mode is off. Can be stored in the database, read from an environment variable, or loaded from a file. |

### IAM role vs access keys {#iam-role-vs-access-keys}

- **IAM role / instance profile** (recommended on AWS): enable **Use IAM Role / Instance Profile** and grant the Semaphore server or runner host permission to read the secrets you reference. No long-lived keys are stored in Semaphore.
- **Access keys**: leave the checkbox off and provide an IAM user or role access key pair with `secretsmanager:GetSecretValue` (and related list/describe permissions for sync).

When editing an existing storage, Semaphore infers IAM-role mode if no access key ID was saved.

## How to use {#how-to-use}

1. In your project, open **Key Store → Storages** and create an **AWS Secrets Manager** storage.
2. When creating or editing a key, select that storage and provide the secret name or ARN in AWS Secrets Manager.
3. Optionally configure [sync paths](/user-guide/key-store/secret-sync) to import secrets automatically on a schedule.

The storage can work in read-only mode.

## Syncing secrets {#syncing-secrets}

Secrets in AWS Secrets Manager can be imported into the Key Store and kept in sync like other external storages. The default path separator is `/`. See [Syncing secrets from remote storages](/user-guide/key-store/secret-sync).
