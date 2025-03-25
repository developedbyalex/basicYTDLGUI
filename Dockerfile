FROM node:18

# Add standard Docker labels
LABEL org.opencontainers.image.title="BasicYTDLGUI"
LABEL org.opencontainers.image.description="A simple GUI for yt-dlp with playlist support and quality presets"
LABEL org.opencontainers.image.source="https://github.com/developedbyalex/basicYTDLGUI"
LABEL org.opencontainers.image.licenses="MIT"

# Install yt-dlp and its dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    yt-dlp \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Create downloads directory
RUN mkdir -p downloads && \
    chown -R node:node /usr/src/app

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["node", "server.js"]
