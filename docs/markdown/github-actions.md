# GitHub Actions

This project does some cool things with Github Actions:

1. Performs lint and tests for each service inside the monorepo when open pull request to development branches.
2. When a pull request is open, generates code coverage for each service and adds the report to comments at the pull request.
3. When a pull request is open for stageing and production branch, performs E2E tests using Docker and [Testcontainers](https://testcontainers.com/) with parallel jobs.
4. When a pull request for the production branch is closed and merged, compiles the code, generates a Docker image and publish it to Docker Hub.

## Workflows

### Unit and Integration testing (Jest)

- See the [workflow file](../../.github/workflows/lint-test.yml) for details.

This workflow creates the `node_modules` folder at the `setup` step and uses it to test the code for the services (`auth-service`, `financial-service`, and `user-service` steps) and for the shared code(`shared-code` step). At the end, generates a coverage report and adds it to a pull request comment (`coverage-report` step).

![](./images//github-actions-workflow-01.png)

### E2E Testing (Supertest and Testcontainers)

- See the [workflow file](../../.github/workflows/lint-test-e2e.yml) for details.

This workflow creates the `node_modules` folder at the `setup` step and uses it to test the code for the services (`auth-service`, `financial-service`, and `user-service` steps) and for the shared code(`shared-code` step). At the end, generates a coverage report and adds it to a pull request comment (`coverage-report` step).

After all lint and testing process, executes e2e tests for each service (`auth-service-e2e`, `financial-service-e2e`, and `user-service-e2e` steps)

![](./images//github-actions-workflow-02.png)

### Build Docker images and publish to Docker Hub

- See the [workflow file](../../.github/workflows/deploy.yml) for details.

This workflow builds two Docker images to be used at the multi-stage build process. One at the `build-base-image-dev` step that creates an image with all npm packages (prod and dev) that are necessary to build the code. The second image is created at the `build-base-image-prod` step and has only the production dependencies.

After the creation of the base images, the final images are build at the `auth-service`, `financial-service` and `user-service` step and each image is uploaded to Docker Hub.

![](./images//github-actions-workflow-03.png)
