# Build: compile server (dist-server) + Vite client (dist)
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Run: production deps + built assets + seed + optional SQLite
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
COPY --from=build /app/server/seed-vehicles.json ./server/seed-vehicles.json
COPY --from=build /app/data ./data
CMD ["node", "dist-server/index.js"]
