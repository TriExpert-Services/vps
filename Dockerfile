# Multi-stage build for React application
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments from EasyPanel
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_PROXMOX_HOST
ARG VITE_PROXMOX_USERNAME
ARG VITE_PROXMOX_PASSWORD
ARG VITE_N8N_WEBHOOK_URL
ARG VITE_N8N_API_KEY
ARG VITE_STRIPE_PUBLISHABLE_KEY

# Set them as environment variables for the build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_PROXMOX_HOST=$VITE_PROXMOX_HOST
ENV VITE_PROXMOX_USERNAME=$VITE_PROXMOX_USERNAME
ENV VITE_PROXMOX_PASSWORD=$VITE_PROXMOX_PASSWORD
ENV VITE_N8N_WEBHOOK_URL=$VITE_N8N_WEBHOOK_URL
ENV VITE_N8N_API_KEY=$VITE_N8N_API_KEY
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

# Copy package files
COPY package*.json ./

# Install dependencies and clear npm cache
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]