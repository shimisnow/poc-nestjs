![POC NestJS](docs/markdown/images/poc-nestjs-bar//export/poc-nestjs-bar.png)

# REST API with NestJS

[![Unit Integration](https://github.com/shimisnow/poc-nestjs/actions/workflows/lint-test.yml/badge.svg)](https://github.com/shimisnow/poc-nestjs/actions/workflows/lint-test.yml)
[![E2E Test](https://github.com/shimisnow/poc-nestjs/actions/workflows/e2e-test.yml/badge.svg)](https://github.com/shimisnow/poc-nestjs/actions/workflows/e2e-test.yml)
[![Build and publish Docker Images](https://github.com/shimisnow/poc-nestjs/actions/workflows/deploy.yml/badge.svg)](https://github.com/shimisnow/poc-nestjs/actions/workflows/deploy.yml)
[![Auth Service Docker image size](https://img.shields.io/docker/image-size/shimisnow/pocnestjs-auth-service/latest?logo=docker&label=Auth%20Service)](https://hub.docker.com/r/shimisnow/pocnestjs-auth-service)
[![Financial Service Docker image size](https://img.shields.io/docker/image-size/shimisnow/pocnestjs-financial-service/latest?logo=docker&label=Financial%20Service)](https://hub.docker.com/r/shimisnow/pocnestjs-financial-service)

## Project Overview

This project is a robust authentication REST API built using the NestJS framework, designed for scalability and maintainability. Key features include a modular, testable architecture; comprehensive unit and integration testing with Jest to ensure code quality; end-to-end testing using Supertest and Testcontainers for application stack testing; and an integrated CI/CD pipeline with GitHub Actions to automate testing and deployment processes

## Key features

- Shows [how to authenticate, issue and invalidate JWT tokens](docs/markdown//resolved-problems/authentication-flow.md) using Redis cache and without storing token in database
- Shows [how to retrieve the account balance in a financial application](docs/markdown/resolved-problems/account-balance.md)
- Shows how to e2e test using [Testcontainers](https://testcontainers.com/) to create isolated environments for testing the entire application flow from the user perspective
- Shows how to make automated deployment to [Docker Hub](https://hub.docker.com/) using [multi-stage builds](https://docs.docker.com/build/building/multi-stage/) and [Github Actions](https://github.com/features/actions)

## Technology Stack

- Code organization: monorepo with [Nx](https://nx.dev/)
- Backend: REST API, Node.js, [NestJS Framework](https://docs.nestjs.com/), TypeScript
- Database and cache: PostgreSQL, Redis, [TypeORM](https://typeorm.io/)
- Security: [JWT](https://jwt.io/) and [BCrypt](https://www.npmjs.com/package/bcrypt)
- Service-to-service communication with Axios
- Tests: Unit and integration testing ([Jest](https://jestjs.io/)), E2E Testing ([SuperTest](https://github.com/ladjs/supertest) and [Testcontainers](https://testcontainers.com/)), Code coverage ([IstanbulJS](https://istanbul.js.org/))
- CI/CD: [GitHub Actions](https://github.com/features/actions), [Docker Hub](https://hub.docker.com/u/shimisnow)
- Documentation: [OpenAPI/Swagger](https://www.openapis.org/), [Postman](https://www.postman.com/) collections, [Compodoc](https://compodoc.app/), [Mermaid (diagram-as-code)](https://mermaid.js.org/)
- Others: Docker ([with multi-stage build](https://docs.docker.com/build/building/multi-stage/)), Docker Compose, ESLint, Webpack, [winston](https://github.com/winstonjs/winston)

## General organization

The project has two individual services:

- Auth Service: implements the authentication process with JWT tokens
- Financial Service: process and store financial data (used to demonstrate the authentication)

```mermaid
stateDiagram-v2
direction LR

state "Auth Consumer" as auth_consumer_group {
    state "API request" as auth_consumer_api_call
    [*] --> auth_consumer_api_call
}

state "Financial Consumer" as financial_consumer_group {
    state "API request" as financial_consumer_api_call
    [*] --> financial_consumer_api_call
}

state "Services" as service {
    state "Auth Service REST API" as auth
    state "Financial Service REST API" as financial
}

auth_consumer_api_call --> auth: login or refresh token
auth --> auth_consumer_api_call: access token
financial_consumer_api_call --> financial: request + access token
financial --> financial_consumer_api_call: financial data

state "Infrastructure" as storage {
    state "Auth Database" as auth_db
    state "Cache" as cache
    state "Financial Database" as financial_db
}

auth --> auth_db
auth --> cache
financial --> cache
financial --> financial_db
```

## DevOps flow

1. Development: lint, unit and integration tests (Jest), adds a coverage report as github pull request comment
2. Staging: e2e test (Supertest) using [Testcontainers](https://testcontainers.com/) to replicate external dependencies
3. Production: build all services, create Docker images, and deploy to Docker Hub

```mermaid
stateDiagram-v2
direction LR

classDef dev_style fill:#7f51ce
classDef staging_style fill:#e3942a
classDef prod_style fill:green


state "Development" as development_stage {
    state "Code" as dev_code
    state "Commit" as dev_commit
    state "Pull Request" as dev_pr
    [*] --> dev_code
    dev_code --> dev_commit
    dev_commit --> dev_pr
    dev_pr --> [*]
}
development_stage:::dev_style

[*] --> development_stage

state "GitHub Actions • Development" as github_dev_stage {
    state "Lint code" as lint
    state "Unit test" as unit
    state "Integration test" as integration
    state "Coverage report" as coverage
    [*] --> lint
    lint --> unit
    unit --> integration
    integration --> coverage
    coverage --> [*]
}
github_dev_stage:::dev_style

development_stage --> github_dev_stage

state "Staging" as staging_stage {
    state "Pull Request" as staging_pr
    [*] --> staging_pr
    staging_pr --> [*]
}
staging_stage:::staging_style

github_dev_stage --> staging_stage

state "GitHub Actions • Staging" as github_staging_stage {
    state "Setup Testcontainers" as testcontainers
    state "e2e Tests" as e2e_tests
    [*] --> testcontainers
    testcontainers --> e2e_tests
    e2e_tests --> [*]
}
github_staging_stage:::staging_style

staging_stage --> github_staging_stage

state "Production" as prod_stage {
    state "Pull Request" as prod_pr
    [*] --> prod_pr
    prod_pr --> [*]
}
prod_stage:::prod_style

github_staging_stage --> prod_stage

state "GitHub Actions • Production" as github_prod_stage {
    state "Build code" as build_code
	state "Create Docker images" as docker_images
	state "Deploy do DockerHub" as docker_hub
	[*] --> build_code
	build_code --> docker_images
	docker_images --> docker_hub
	docker_hub --> [*]
}
github_prod_stage:::prod_style

prod_stage --> github_prod_stage
github_prod_stage --> [*]
```

## Documentation about

- [How to contribute](./CONTRIBUTING.md)
- [How to run from code](docs/markdown/how-to-run.md)
- [How to run with Docker](docs/markdown/how-to-deploy.md)
- [Database structure and TypeORM entities](docs/markdown/database-structure.md)
- [GitHub Actions](docs/markdown/github-actions.md)
- [Documentation](docs/markdown/documentation.md)
- [Testing](docs/markdown/testing.md)
