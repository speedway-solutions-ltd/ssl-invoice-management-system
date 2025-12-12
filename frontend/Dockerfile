# Stage 1 — builder
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++ git

# Install dependencies (copy package files first for caching)
COPY package*.json pnpm-lock.yaml* ./
RUN npm ci --ignore-scripts

# Copy source and build
COPY . .
RUN npm run build

# Stage 2 — runtime
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

# Copy entire app directory from builder (this includes .next, public, node_modules, package.json, etc.)
COPY --from=builder /app ./ 

# create non-root user and set ownership, then switch
RUN addgroup -S app && adduser -S -G app app \
    && chown -R app:app /app

USER app

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

CMD ["npm", "run", "start"]
