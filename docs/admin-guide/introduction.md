# Introduction

Welcome to the Semaphore UI Administration Guide. This guide provides comprehensive information for installing, configuring, and maintaining your Semaphore instance.

## What is Semaphore UI?

Semaphore UI is a modern, open-source web interface for running automation tasks. It is designed to be a lightweight, fast, and easy-to-use alternative to more complex automation platforms.

It allows you to securely manage and execute tasks for:
*   **Ansible** playbooks
*   **Terraform/OpenTofu** infrastructure-as-code
*   **PowerShell** and **Shell** scripts
*   **Python** scripts

## Core Features & Philosophy

Understanding Semaphore's design principles can help you get the most out of it:

*   **Lightweight and Performant**: Semaphore is written in **Go** and distributed as a **single binary file**. It has minimal resource requirements (CPU/RAM) and does not require external dependencies like Kubernetes, Docker, or a JVM. This makes it fast, efficient, and easy to deploy.
*   **Simple to Install and Maintain**: You can get Semaphore running in minutes. Installation can be as simple as downloading the binary and running it. The simple architecture makes upgrades and maintenance straightforward.
*   **Flexible Deployment**: Run it as a binary, as a systemd service, or in a Docker container. It's suitable for everything from a personal homelab to enterprise environments.
*   **Self-Hosted and Secure**: Semaphore is a self-hosted solution. All your data, credentials, and logs remain on your own infrastructure, giving you full control. Credentials are always encrypted in the database.
*   **Powerful Integrations**: While simple, Semaphore supports powerful features like LDAP/OpenID authentication, detailed role-based access control (RBAC) per project, remote runners for scaling out task execution, and a full REST API for programmatic access.

This guide will walk you through setting up and managing these features for your specific needs.
