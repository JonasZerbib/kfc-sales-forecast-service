# Stage 1: build backend
FROM node:22-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package.json ./
RUN npm install

COPY backend/ ./
RUN npm run build

# Stage 2: build frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 3: runtime — combine both build outputs
FROM node:22-alpine AS runtime
WORKDIR /app/backend

COPY --from=backend-builder  /app/backend/dist         ./dist
COPY --from=backend-builder  /app/backend/node_modules ./node_modules
# Place frontend/dist where index.ts expects it: ../../frontend/dist relative to dist/
COPY --from=frontend-builder /app/frontend/dist        ../frontend/dist

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
