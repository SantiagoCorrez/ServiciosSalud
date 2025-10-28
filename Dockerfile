# Stage 1: Build the Angular frontend
FROM node:18-slim as frontend-builder
WORKDIR /usr/src/app

# Copy frontend package files and install dependencies
COPY mapa-frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY mapa-frontend/ ./

# Build the frontend for production
# The output will be in /usr/src/app/dist/mapa-frontend/browser
RUN npm run build -- --configuration production

# Stage 2: Setup the Node.js backend
FROM node:18-slim
WORKDIR /usr/src/app

# Copy backend package files and install dependencies
COPY mapa-backend/package*.json ./
RUN npm install

# Copy the rest of the backend source code
COPY mapa-backend/ ./

# Copy the built frontend from the builder stage into the backend's public folder
COPY --from=frontend-builder /usr/src/app/dist/mapa-frontend/browser ./public

# Copy the SQL script and the entrypoint
COPY servicios_salud.sql ./
COPY entrypoint.sh ./

# Install PostgreSQL client and make entrypoint executable
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/* && chmod +x ./entrypoint.sh

# Expose the port the app runs on
EXPOSE 3000

# Set the entrypoint
ENTRYPOINT [ "./entrypoint.sh" ]

# Command to run the application
CMD [ "node", "index.js" ]