# POC NestJS

This project explores the power of NestJS and serves as a demonstration of how to architect and develop a scalable backend API application. The PoC showcases best practices for creating modules, controllers, services, and integrating with database and cache manager.

Key Features:

- Demonstrates NestJS architecture and patterns.
- Provides a strong foundation for building scalable APIs.
- Integrates with postgres for data storage.
- Integrates with redis for cache.
- Shows how to use OpenAPI documentation.
- Shows how to test with Jest, Supertest and Testcontainers.

## Solved problems

1. [How to retrieve the account balance in a financial application](docs/markdown/resolved-problems/account-balance.md)

## Technologies

- Code organization: monorepo with [Nx](https://nx.dev/)
- Workflow automation: [GitHub Actions](https://github.com/features/actions)
- Backend: REST API, Node.js, [NestJS Framework](https://docs.nestjs.com/), TypeScript
- Database: Postgres (SQL), [TypeORM](https://typeorm.io/)
- Cache: Redis
- Tests: Unit testing ([Jest](https://jestjs.io/)), E2E Testing ([SuperTest](https://github.com/ladjs/supertest) and [Testcontainers](https://testcontainers.com/))
- Documentation: [OpenAPI/Swagger](https://www.openapis.org/)
- Others: Docker, Docker Compose, Shell, Linux

## Details about

- [How to run](docs/markdown/how-to-run.md)
- [How to deploy](docs/markdown/how-to-deploy.md)
- TO-DO [Repository organization](docs/markdown/repository-organization.md)
- [Database structure and TypeORM entities](docs/markdown/database-structure.md)
- [GitHub Actions](docs/markdown/github-actions.md)
- [Documentation](docs/markdown/documentation.md)
- [Testing](docs/markdown/testing.md)
