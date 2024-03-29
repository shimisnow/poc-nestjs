# GitHub Actions

This project does some cool things with Github Actions:

1. Performs lint and tests for each service inside the monorepo when open pull request to development branches.
2. When a pull request is open, generates code coverage for each service and adds the report to comments at the pull request.
3. When a pull request is open for the production branch (and staging), performs E2E tests using Docker and [Testcontainers](https://testcontainers.com/) with parallel jobs.
4. When a pull request for the production branch is closed and merged, compiles the code, generates a Docker image and publish it to Docker Hub.

See the GitHub Actions here:

- [Unit and Integration testing (Jest)](../../.github/workflows/lint-test.yml): Executes when pull request to development branches.
- [E2E Testing (Supertest and Testcontainers)](../../.github/workflows/lint-test-e2e.yml): Executes E2E testing when pull request to staging or main.
- [Build Docker images and publish to Docker Hub](../../.github/workflows/deploy.yml): Publish the compiled code to Docker Hub.
