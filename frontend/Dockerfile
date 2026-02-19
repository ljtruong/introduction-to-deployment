# syntax=docker/dockerfile:1
# Build stage
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install dependencies (cache layer when lockfile unchanged)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build (optional: pass VITE_API_BASE_URL for backend URL at build time)
ARG VITE_API_BACKEND_URL=
ENV VITE_API_BACKEND_URL=${VITE_API_BACKEND_URL}
COPY . .
RUN pnpm build

# Production stage: serve static files with nginx
FROM nginx:alpine

# Copy built assets and nginx config
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
