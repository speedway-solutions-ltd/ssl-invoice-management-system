# Stage 1 — builder
ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app

# Install build deps
RUN apk add --no-cache python3 make g++ git

# Copy package files first for caching
COPY package*.json pnpm-lock.yaml* ./

# If you use npm or yarn, replace with corresponding install.
# Using npm here:
RUN npm ci --ignore-scripts

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2 — runtime
FROM node:${NODE_VERSION}-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup -S app && adduser -S -G app app
USER app

# Copy built files and production deps
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# If you have prisma or migrations, copy them too:
# COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=4001

EXPOSE 4001

CMD ["node", "dist/main.js"]
