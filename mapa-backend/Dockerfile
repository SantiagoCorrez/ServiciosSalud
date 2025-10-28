# Backend Dockerfile
FROM node:18-slim
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

# Expose port and start
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
