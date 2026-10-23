FROM node:22-alpine AS build
WORKDIR /app
COPY activity/package*.json ./
RUN npm install
COPY activity/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY activity/package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY activity/server ./server
ENV PORT=3001
EXPOSE 3001
CMD ["node", "server/index.js"]
