## REST API

OpenAPI/Swagger documentation can be found at `apps/$SERVICE_NAME/docs/openapi/openapi-docs.json`

### How to visualize the documentation

```sh
docker compose up -d auth-service-openapi
docker compose up -d financial-service-openapi
```

The documentation can be viewed at `http://localhost:$PORT/`. The port will be different to each service, see the table for reference.

| service name      | port |
| :---------------- | :--: |
| auth-service      | 8081 |
| financial-service | 8082 |

### How to generate/update the json file

To generate the json file with OpenAPI specifications, it is necessary to set the variable `${SERVICE_NAME}_BUILD_OPENAPI=true` at the file `.env` at the project root

Then start the desired service to generate the json file.

### Postman

A Postman collection can be found at [poc-nest.postman_collection.json](../postman/poc-nest.postman_collection.json)

## Compodoc (code documentation)

| service name      | port |
| :---------------- | :--: |
| auth-service      | 8091 |
| financial-service | 8092 |

To generate the code documentation, use:

```sh
npx nx compodoc SERVICE_NAME
```

The documentation will be available at `apps/SERVICE_NAME/docs/compodoc`.

If you want to see the documentation in a browser, at the service folder, use:

```sh
docker compose up -d compodoc
```

And then got to `http://localhost:PORT`.
