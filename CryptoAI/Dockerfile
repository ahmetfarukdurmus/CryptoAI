# Stage 1: Build Expo Web bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install project dependencies
RUN npm install --legacy-peer-deps

# Copy application source code
COPY . ./

# Build optimized production web bundle
RUN npx expo export -p web

# Stage 2: Serve production bundle with lightweight Nginx
FROM nginx:alpine

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose web port
EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]
