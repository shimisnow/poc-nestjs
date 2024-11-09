FROM node:21.6.1-alpine3.18

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /home/node/app

COPY package*.json ./

RUN npm ci --no-audit
