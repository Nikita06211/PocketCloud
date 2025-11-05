# Use Node 20 LTS
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3002

# Run app
CMD ["node", "dist/server.js"]
