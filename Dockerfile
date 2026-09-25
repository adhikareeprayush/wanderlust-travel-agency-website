# Build the website, then serve it and the API from one Node process.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Public ImageKit URL endpoint baked into the front end (not a secret).
ARG VITE_IMAGEKIT_URL_ENDPOINT=""
ENV VITE_IMAGEKIT_URL_ENDPOINT=$VITE_IMAGEKIT_URL_ENDPOINT
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY server ./server
USER node
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://127.0.0.1:5000/api/health >/dev/null || exit 1
CMD ["node", "server/index.js"]
