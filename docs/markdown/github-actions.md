# GitHub Actions

See the [contributing guide](../../CONTRIBUTING.md) to get a diagram for the project gitflow.

### Unit and Integration testing (Jest)

Will be executed for pull request to the branches `milestone-**`, `develop`, `staging`.

- See the [workflow file](../../.github/workflows/lint-test.yml) for details.

This workflow creates the `node_modules` folder at the `project setup` step and uses it to lint and test the code for the services and shared code. At the end, generates a coverage report and adds it to a pull request comment.

```mermaid
stateDiagram-v2
direction LR
state "project setup" as setup
state "lint apps" as lint
state "unit and integration tests" as test

[*] --> setup
setup --> lint
lint --> test
test --> [*]
```

### E2E Testing (Supertest and Testcontainers)

Will be executed for pull request to the branches `staging` and `main`.

- See the [workflow file](../../.github/workflows/e2e-test.yml) for details.

This workflow builds two Docker images to be used at the multi-stage build process. One at the `build-base-image-dev` step that creates an image with all npm packages (prod and dev) that are necessary to build the code. The second image is created at the `build-base-image-prod` step and has only the production dependencies. Creates the `node_modules` folder at the `setup` step and uses it to execute e2e tests for each service (`auth-service-e2e` and `financial-service-e2e` steps).

```mermaid
stateDiagram-v2
direction LR

state "build-base-image-dev" as dev
state "build-base-image-prod" as prod
[*] --> dev
[*] --> prod
state build <<fork>>
dev --> build
prod --> build

build --> setup
state wait <<fork>>
setup --> wait

state "auth-service-e2e" as auth
state "financial-service-e2e" as financial

wait --> auth
wait --> financial
auth --> [*]
financial --> [*]
```

### Build Docker images and publish to Docker Hub

Will be executed when a pull request to the branch `main` is accepted.

- See the [workflow file](../../.github/workflows/deploy.yml) for details.

This workflow builds two Docker images to be used at the multi-stage build process. One at the `build-base-image-dev` step that creates an image with all npm packages (prod and dev) that are necessary to build the code. The second image is created at the `build-base-image-prod` step and has only the production dependencies.

After the creation of the base images, the final images are build at the `auth-service` and `financial-service` steps and each image is uploaded to Docker Hub.

```mermaid
stateDiagram-v2
direction LR
state "build-base-image-dev" as dev
state "build-base-image-prod" as prod
state build <<fork>>
state "auth-service" as auth
state "financial-service" as financial

[*] --> dev
[*] --> prod
dev --> build
prod --> build
build --> auth
build --> financial
auth --> [*]
financial --> [*]
```
