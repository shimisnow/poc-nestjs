FROM node:23.1.0-alpine3.20

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /home/node/app

COPY package*.json ./

# this is here because without it, it will not generate the image
# something is wrong with the Docker Hub image
# see: https://github.com/nodejs/docker-node/issues/2153
RUN npm config set loglevel verbose

RUN npm ci --no-audit
