
# Project runners (Pro)

:::info Pro feature
This feature is available in Semaphore UI Pro.
:::

Project runners execute tasks on separate servers from your Semaphore UI instance. A runner is deployed on a separate server, connects to your Semaphore instance using a secure token, and executes the tasks that Semaphore delegates to it, reporting results back.

![](/assets/project_runners.webp)

For how runners work in general and how to install, register, and start one, see [Runners](/admin-guide/runners).

## Prerequisites

To use project runners, you need:

1. A Semaphore Pro license.
2. A separate server for running the runner.
3. Network connectivity between the runner and Semaphore UI.
4. Proper configuration on both the Semaphore UI and runner servers — see [Runners](/admin-guide/runners) for setup instructions.

## Managing runners

You can manage runners through the Semaphore UI:

1. In your project, open the **Runners** section.
2. View all registered runners and their status.
3. Add or remove runners as needed.
4. Monitor runner health and performance.

## Security considerations

- Always use HTTPS for communication between runners and Semaphore UI.
- Consider using isolated environments for sensitive operations.
