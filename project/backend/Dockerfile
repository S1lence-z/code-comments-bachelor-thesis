FROM node:20-alpine

WORKDIR /app/backend

# Install Python and build tools needed for native modules
RUN apk add --no-cache python3 make g++

# Copy package.json from the backend directory
COPY backend/package*.json ./

RUN npm install

# Copy backend source code (use ./* to copy contents, not the folder itself)
COPY backend/src/ ./src/
COPY backend/tsconfig.json ./
COPY backend/nodemon.json ./

# Copy shared folder
COPY shared/ ../shared/

# Create the db directory if it doesn't exist
RUN mkdir -p db
RUN touch db/main.db

EXPOSE 3500

# Start the application in development mode
CMD ["npm", "run", "dev"]