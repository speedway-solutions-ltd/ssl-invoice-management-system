# Stage 1 — builder
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++ git

COPY package*.json pnpm-lock.yaml* ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# Stage 2 — runtime
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

# Copy build artifacts as root (so COPY can write)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./

# Create non-root user and set ownership, then switch
RUN addgroup -S app && adduser -S -G app app \
    && chown -R app:app /app

USER app

# Copy output of build
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

CMD ["npm", "run", "start"]
