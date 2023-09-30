# POC NestJS

This project explores the power of NestJS and serves as a demonstration of how to architect and develop a scalable backend application using NestJS. The PoC showcases best practices for creating modules, controllers, services, and integrating with database and cache manager. Additionally, it highlights the utilization of decorators and dependency injection to build a robust API foundation.

Key Features:

- Demonstrates NestJS architecture and patterns.
- Provides a strong foundation for building scalable APIs.
- Includes examples of modules, controllers, and services.
- Integrates with postgres for data storage.
- Integrates with redis for cache.
- Shows how to use OpenAPI documentation.

## Resolved problems

1. [How to retrieve the account balance in a financial application](docs/markdown/resolved-problems/account-balance.md)

## Technologies

- Code organization

  - Monorepo with [Nx](https://nx.dev/)

- Workflow automation

  - [GitHub Actions](https://github.com/features/actions)

- Backend

  - REST API
  - Node.js
  - [NestJS Framework](https://docs.nestjs.com/)

- Database

  - Postgres (SQL)
  - [TypeORM](https://typeorm.io/)
  - Redis

- Tests

  - Unit testing ([Jest](https://jestjs.io/))
  - e2e Testing ([SuperTest](https://github.com/ladjs/supertest))

- Documentation

  - [OpenAPI](https://www.openapis.org/)

- Others

  - Docker

## Details about

- [How to run](docs/markdown/how-to-run.md)
- TO-DO [Repository organization](docs/markdown/repository-organization.md)
- [Database structure and TypeORM entities](docs/markdown/database-structure.md)
- [GitHub Actions](docs/markdown/github-actions.md)
- [Documentation](docs/markdown/documentation.md)
- [Testing](docs/markdown/testing.md)
