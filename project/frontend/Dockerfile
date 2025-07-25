FROM node:20-alpine AS builder

WORKDIR /app/frontend

# Copy package.json from the frontend directory
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source code
COPY frontend/src/ ./src/
COPY frontend/index.html ./
COPY frontend/vite.config.ts ./
COPY frontend/tsconfig*.json ./
COPY frontend/css/ ./css/
COPY frontend/public/ ./public/

# Copy shared folder
COPY shared/ ../shared/

RUN npm run build

# Debug: Check if assets are built correctly
RUN ls -la ./dist/
RUN ls -la ./dist/assets/ || echo "No assets folder in dist"

FROM nginx:alpine

# Copy the built frontend files
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]