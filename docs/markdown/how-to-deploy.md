# How to deploy

## Build the Docker image locally

Build the Docker images for each service with the commands:

```sh
docker compose build base-image-development
docker compose build base-image-production
docker compose build auth-service
docker compose build financial-service
docker compose build user-service
```

`build base-image-development` and `base-image-production` are images with the node_modules folder. They are generated only one time to be used at Docker multi-stage builds.

## Deploy with Docker

The auxiliary services can be launched with:

```sh
docker compose up -d database-authentication database-financial database-info redis
```

The services can be started with:

```sh
docker compose --env-file docker.env up -d auth-service financial-service user-service
```

The `docker.env` has environment configs for deploy with docker compose.
