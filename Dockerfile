FROM node:20-slim AS build

WORKDIR /app

COPY services/api/package.json services/api/package-lock.json ./
RUN npm ci

COPY services/api/tsconfig.json ./
COPY services/api/src ./src
RUN npm run build

FROM node:20-slim

WORKDIR /app
ENV NODE_ENV=production

COPY services/api/package.json services/api/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 8080

CMD ["npm", "start"]
