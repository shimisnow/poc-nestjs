FROM node:22.11.0-alpine3.20

ARG NODE_ENV="production"

WORKDIR /home/node/app
COPY package.json package-lock.json ./
ENV NODE_ENV=${NODE_ENV}
RUN npm install
