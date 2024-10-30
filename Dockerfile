FROM node:21.6.1-alpine3.18

ARG NODE_ENV=production

WORKDIR /home/node/app

COPY package*.json ./

ENV NODE_ENV=${NODE_ENV}

RUN npm install ci --no-audit
