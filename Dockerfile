# Install dependencies and pnpm in the first stage
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Final stage: build the production image
FROM node:20-alpine
WORKDIR /app

# Copy the entire app directory
COPY . .

# Copy the node_modules from the base stage
COPY --from=base /app/node_modules ./node_modules

# Ensure pnpm is available in the final stage
RUN npm install -g pnpm

# Expose the appropriate port
EXPOSE 3000

# Start the application using pnpm
CMD ["pnpm", "dev"]
