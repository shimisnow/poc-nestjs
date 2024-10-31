FROM pocnestjs-base-dev:latest as base

WORKDIR /home/node/app
COPY . .
RUN npx nx build user-service

##########
FROM pocnestjs-base-prod:latest

WORKDIR /home/node/app
COPY --from=base /home/node/app/dist/apps/user-service/main.js ./
RUN rm -f package.json package-lock.json
ENV NODE_ENV="production"

CMD ["node", "main.js"]
