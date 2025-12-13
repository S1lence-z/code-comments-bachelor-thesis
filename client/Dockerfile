FROM node:20-alpine AS builder
WORKDIR /app

# Accept build arguments
ARG VITE_MANAGER_URL
ARG VITE_CLIENT_BASE_PATHNAME

# Copy source
COPY base/ ./base/
COPY client/ ./client/

# Install deps
WORKDIR /app/client
RUN npm ci

# Set environment variables for build
ENV VITE_MANAGER_URL=${VITE_MANAGER_URL}
ENV VITE_CLIENT_BASE_PATHNAME=${VITE_CLIENT_BASE_PATHNAME}

RUN npm run build

# Production stage: Use serve to host static files
FROM node:20-alpine AS runner
WORKDIR /app/client

# Install serve globally
RUN npm install -g serve

# Copy build artifacts
COPY --from=builder /app/client/.output/public ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]