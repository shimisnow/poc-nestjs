# GitHub Actions

This project has three files for GitHub Actions:

1. [Unit and Integration testing (Jest)](../../.github/workflows/unit-testing.yml): Executes when push or pull request to development branches.
2. [E2E Testing (Supertest and Testcontainers)](../../.github/workflows/e2e-testing.yml): Executes E2E testing when push or pull request to staging or main.
3. [Build Docker images and publish to Docker Hub](../../.github/workflows/deploy.yml): Publish the compiled code to Docker Hub.