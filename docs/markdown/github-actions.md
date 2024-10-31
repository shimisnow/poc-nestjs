# GitHub Actions

See the [contributing guide](../../CONTRIBUTING.md) to get a diagram for the project gitflow.

### Unit and Integration testing (Jest)

Will be executed for pull request to the branches `milestone-**`, `develop`, `staging`.

- See the [workflow file](../../.github/workflows/lint-test.yml) for details.

This workflow creates the `node_modules` folder at the `setup` step and uses it to test the code for the services (`auth-service`, `financial-service`, and `user-service` steps) and for the shared code (`shared-code` step). At the end, generates a coverage report and adds it to a pull request comment (`coverage-report` step).

![](./images//github-actions-workflow-01.png)

### E2E Testing (Supertest and Testcontainers)

Will be executed for pull request to the branches `staging` and `main`.

- See the [workflow file](../../.github/workflows/e2e-test.yml) for details.

This workflow creates the `node_modules` folder at the `setup` step and uses it to execute e2e tests for each service (`auth-service-e2e`, `financial-service-e2e`, and `user-service-e2e` steps).

![](./images//github-actions-workflow-02.png)

### Build Docker images and publish to Docker Hub

Will be executed when a pull request to the branch `main` is accepted.

- See the [workflow file](../../.github/workflows/deploy.yml) for details.

This workflow builds two Docker images to be used at the multi-stage build process. One at the `build-base-image-dev` step that creates an image with all npm packages (prod and dev) that are necessary to build the code. The second image is created at the `build-base-image-prod` step and has only the production dependencies.

After the creation of the base images, the final images are build at the `auth-service`, `financial-service` and `user-service` step and each image is uploaded to Docker Hub.

![](./images//github-actions-workflow-03.png)
