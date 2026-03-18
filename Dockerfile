# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for TypeScript)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Install tsx for TypeScript execution
RUN npm install -g tsx

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["tsx", "server.ts"]
