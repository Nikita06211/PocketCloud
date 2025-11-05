# Use the official Bun image as base
FROM oven/bun:1 AS base

# Set working directory
WORKDIR /app

# Copy package files and lock file
COPY package*.json bun.lock* ./
COPY tsconfig.json ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Expose the port the app runs on
EXPOSE 3002

# Set environment to production
ENV NODE_ENV=production

# Run the application directly (Bun can run TypeScript natively)
CMD ["bun", "run", "src/server.ts"]
