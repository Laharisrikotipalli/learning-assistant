FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git curl bash

# Install OpenClaw globally
RUN npm install -g openclaw

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Create OpenClaw config directory and copy config
RUN mkdir -p /root/.openclaw
COPY config/openclaw.json /root/.openclaw/openclaw.json

# Create persistent memory directory
RUN mkdir -p /data/memory

EXPOSE 3000

# Run OpenClaw gateway (not plain node index.js)
CMD ["node", "index.js"]