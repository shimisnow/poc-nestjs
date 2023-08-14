## OpenAPI

**Obs:** change `$SERVICE_NAME` to the desired service name

OpenAPI/Swagger documentation can be found at `apps/$SERVICE_NAME/docs/openapi/openapi-docs.json`

### How to visualize the documentation

```sh
docker compose -f .\apps\$SERVICE_NAME\docker-compose.yml up -d openapi
```

The documentation can be viewed at `http://localhost:8081/`. The port will be different to each service, see the `docker-compose.yml` file to details.

### How to generate/update the json file

To generate the json file with OpenAPI specifications, it is necessary to set the variable `AUTH_SERVICE_BUILD_OPENAPI=true` at the file `.env` at the project root

Then
