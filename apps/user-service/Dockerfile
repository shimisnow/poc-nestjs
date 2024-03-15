FROM pocnestjs-base:latest as base

WORKDIR /home/node/app
COPY . .
RUN npx nx build user-service

##########
FROM pocnestjs-base:latest

WORKDIR /home/node/app
COPY --from=base /home/node/app/dist/apps/user-service/main.js ./
ENV NODE_ENV="production"

CMD ["node", "main.js"]
