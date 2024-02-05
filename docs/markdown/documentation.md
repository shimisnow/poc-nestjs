## REST API

| service name      | port |
| :---------------- | :--: |
| auth-service      | 8081 |
| financial-service | 8082 |

OpenAPI/Swagger documentation can be found at `apps/$SERVICE_NAME/docs/openapi/openapi-docs.json`

### How to visualize the documentation

```sh
docker compose -f .\apps\$SERVICE_NAME\docker-compose.yml up -d openapi
```

The documentation can be viewed at `http://localhost:$PORT/`. The port will be different to each service, see the table for reference.

### How to generate/update the json file

To generate the json file with OpenAPI specifications, it is necessary to set the variable `${SERVICE_NAME}_BUILD_OPENAPI=true` at the file `.env` at the project root

Then start the desired service to generate the json file.

### Postman

A Postman collection can be found at [poc-nest.postman_collection.json](../postman/poc-nest.postman_collection.json)

