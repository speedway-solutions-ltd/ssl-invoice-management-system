# Stage 1 — builder
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app

# Install build tools
RUN apk add --no-cache python3 make g++ git

# Copy package manifests
COPY package*.json pnpm-lock.yaml* ./

RUN npm ci --ignore-scripts

# Copy source
COPY . .

# Build Next.js app
# For apps using next@13+ with app dir, ensure proper build config
RUN npm run build

# Stage 2 — runner
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -S app && adduser -S -G app app
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
