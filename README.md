# Semaphore Docs

Semaphore Docs is the official documentation site for [Semaphore UI](https://github.com/semaphoreui/semaphore), a modern UI and API for Ansible, Terraform, OpenTofu, PowerShell, and other DevOps tools. This documentation is built using [mdBook](https://github.com/rust-lang/mdBook) and includes guides for both administrators and users.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact & Community](#contact--community)

---

## Features

- **Comprehensive Admin & User Guides**: Covers installation, configuration, security, API, pipelines, and more.
- **Custom Theming**: Uses custom CSS and JS for tabs, search, and content styling.
- **Mermaid Diagrams**: Integrated support for [Mermaid](https://mermaid-js.github.io/) diagrams.
- **Search**: Built-in search with result limiting.
- **Edit Links**: Direct links to edit pages on GitHub.
- **Responsive Design**: Usable on desktop and mobile devices.

---

## Getting Started

### Prerequisites

- [mdBook](https://github.com/rust-lang/mdBook) (install via `cargo install mdbook`)
- [mdbook-mermaid](https://github.com/badboy/mdbook-mermaid) (for diagram support)
- [Ansible](https://docs.ansible.com/) (for build/deploy scripts)
- Python 3 (for some deploy scripts)
- (Optional) Access to the deployment environment and Ansible vault password for full deployment

---

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/semaphoreui/semaphore-docs.git
   cd semaphore-docs
   ```

2. **Install mdBook and plugins:**
   ```sh
   cargo install mdbook
   cargo install mdbook-mermaid
   ```

3. **(Optional) Set up Python virtual environment for deployment:**
   ```sh
   cd deploy
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt  # if requirements.txt exists
   ```

4. **Install Ansible collections:**
   ```sh
   ansible-galaxy collection install -r requirements.yml
   ```

---

## Usage

### Build the Documentation

To build the documentation locally:

```sh
mdbook build
```

Or use the provided script (requires Ansible and Python venv):

```sh
./build.sh
```

### Serve Locally

To preview the documentation with live reload:

```sh
mdbook serve
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy

Deployment is managed via Ansible playbooks. To deploy (requires access and vault password):

```sh
./run.sh
```

---

## Project Structure

- `src/` – Main documentation source (Markdown files, SUMMARY.md for navigation)
- `theme/` – Custom CSS, JS, and theme assets
- `deploy/` – Ansible playbooks, scripts, and deployment configuration
- `book.toml` – mdBook configuration (plugins, theme, analytics, etc.)
- `build.sh` / `run.sh` – Helper scripts for building and deploying
- `book/` – Built static site (output)
- `user-guide/`, `administration-guide/`, `faq/` – Main documentation sections

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository and create your branch.
2. Make your changes in the `src/` directory.
3. Update `src/SUMMARY.md` to add new pages to the navigation.
4. Build and preview your changes locally.
5. Submit a pull request.

For major changes, please open an issue first to discuss your proposal.