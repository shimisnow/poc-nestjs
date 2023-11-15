FROM poc-nestjs-base:latest as base

WORKDIR /app
COPY . .
RUN npx nx build auth-service

##########
FROM poc-nestjs-base:latest

WORKDIR /app
COPY --from=base /app/dist/apps/auth-service/main.js ./
ENV NODE_ENV="production"

CMD ["node", "main.js"]
