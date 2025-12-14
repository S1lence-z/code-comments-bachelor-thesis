FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments
ARG VITE_SERVER_URL
ARG VITE_CLIENT_URL

# Copy source
COPY base/ ./base/
COPY manager/ ./manager/

# Install deps
WORKDIR /app/manager
RUN npm ci

# Set environment variables for build
ENV VITE_SERVER_URL=${VITE_SERVER_URL}
ENV VITE_CLIENT_URL=${VITE_CLIENT_URL}

RUN npm run build

# Production stage: Use serve to host static files
FROM node:20-alpine AS runner
WORKDIR /app/manager

# Install serve globally
RUN npm install -g serve

# Copy build artifacts
COPY --from=builder /app/manager/.output/public ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]