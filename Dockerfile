# Stage 1: Build the Angular frontend
FROM node:18-slim as frontend-builder
WORKDIR /usr/src/app

# Copy frontend package files and install dependencies
COPY mapa-frontend/package*.json ./
RUN npm install

# Copy the rest of the frontend source code
COPY mapa-frontend/ ./

# Build the frontend for production
RUN npm run build -- --configuration production

# Stage 2: Setup Nginx to serve the frontend
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy the built frontend from the builder stage
COPY --from=frontend-builder /usr/src/app/dist/mapa-frontend/browser .

# Copy the Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
