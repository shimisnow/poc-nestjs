FROM poc-nestjs-base:latest as base

WORKDIR /app
COPY . .
RUN npx nx build financial-service

##########
FROM poc-nestjs-base:latest

WORKDIR /app
COPY --from=base /app/dist/apps/financial-service/main.js ./
ENV NODE_ENV="production"

CMD ["node", "main.js"]
