# /mern/server/Dockerfile
# Use official Node.js image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching layers)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all backend files
COPY . .

# Default command: Run Jest/Mocha tests
CMD ["npm", "test"]
