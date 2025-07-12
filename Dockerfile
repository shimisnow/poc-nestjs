FROM node:22.17.0-alpine3.21

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /home/node/app

COPY package*.json ./

COPY .husky/install.mjs ./.husky/install.mjs

RUN npm install --prefer-offline --no-audit --no-fund
