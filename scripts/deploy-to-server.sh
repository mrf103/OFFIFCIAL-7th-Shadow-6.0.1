#!/bin/bash

# ============================================
# Shadow Seven - SSH Server Deployment Script
# ============================================
# This script deploys the application to a remote server via SSH
# Usage: ./scripts/deploy-to-server.sh [subdomain]
# Example: ./scripts/deploy-to-server.sh app.mrf103.com
# Default subdomain: app.mrf103.com

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="${SERVER_IP:-45.224.225.96}"
SERVER_USER="${SERVER_USER:-root}"
SERVER_PORT="${SERVER_PORT:-22}"
APP_NAME="shadow-seven"
REMOTE_DIR="/var/www/${APP_NAME}"
SUBDOMAIN="${1:-app.mrf103.com}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Shadow Seven - SSH Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Build the application
echo -e "${YELLOW}Step 1: Building application...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}Error: Build failed - dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed successfully${NC}"
echo ""

# Step 2: Create deployment package
echo -e "${YELLOW}Step 2: Creating deployment package...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOY_PACKAGE="deploy_${TIMESTAMP}.tar.gz"

tar -czf "$DEPLOY_PACKAGE" \
    dist/ \
    package.json \
    package-lock.json \
    .env.example

echo -e "${GREEN}✓ Package created: ${DEPLOY_PACKAGE}${NC}"
echo ""

# Step 3: Test SSH connection
echo -e "${YELLOW}Step 3: Testing SSH connection to ${SERVER_USER}@${SERVER_IP}...${NC}"
if ! ssh -o ConnectTimeout=10 -p "$SERVER_PORT" "${SERVER_USER}@${SERVER_IP}" "echo 'SSH connection successful'" 2>/dev/null; then
    echo -e "${RED}Error: Cannot connect to server via SSH${NC}"
    echo -e "${YELLOW}Please ensure:${NC}"
    echo "  1. SSH access is configured"
    echo "  2. Server IP is correct: ${SERVER_IP}"
    echo "  3. SSH key is added to the server"
    echo "  4. Port ${SERVER_PORT} is open"
    rm "$DEPLOY_PACKAGE"
    exit 1
fi

echo -e "${GREEN}✓ SSH connection successful${NC}"
echo ""

# Step 4: Upload deployment package
echo -e "${YELLOW}Step 4: Uploading package to server...${NC}"
scp -P "$SERVER_PORT" "$DEPLOY_PACKAGE" "${SERVER_USER}@${SERVER_IP}:/tmp/"

echo -e "${GREEN}✓ Package uploaded${NC}"
echo ""

# Step 5: Deploy on server
echo -e "${YELLOW}Step 5: Deploying on server...${NC}"

ssh -p "$SERVER_PORT" "${SERVER_USER}@${SERVER_IP}" bash <<EOF
set -e

# Create app directory if it doesn't exist
echo "Creating application directory..."
mkdir -p ${REMOTE_DIR}
cd ${REMOTE_DIR}

# Backup existing deployment if it exists
if [ -d "dist" ]; then
    echo "Backing up existing deployment..."
    tar -czf backup_\$(date +%Y%m%d_%H%M%S).tar.gz dist/ || true
    # Keep only last 5 backups
    ls -t backup_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
fi

# Extract new deployment
echo "Extracting new deployment..."
tar -xzf /tmp/${DEPLOY_PACKAGE} -C ${REMOTE_DIR}
rm /tmp/${DEPLOY_PACKAGE}

# Install/update dependencies if package.json changed
if [ -f "package.json" ]; then
    echo "Installing dependencies..."
    npm install --production
fi

# Setup environment file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  WARNING: Please edit ${REMOTE_DIR}/.env with your actual values"
fi

echo "✓ Deployment extracted successfully"
EOF

echo -e "${GREEN}✓ Deployed to server${NC}"
echo ""

# Step 6: Setup PM2 process manager
echo -e "${YELLOW}Step 6: Setting up PM2 process manager...${NC}"

ssh -p "$SERVER_PORT" "${SERVER_USER}@${SERVER_IP}" bash <<'EOF'
set -e

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Create PM2 ecosystem file
cat > /var/www/shadow-seven/ecosystem.config.js <<'EOFPM2'
module.exports = {
  apps: [{
    name: 'shadow-seven',
    cwd: '/var/www/shadow-seven',
    script: 'npx',
    args: 'serve -s dist -l ${PORT:-3000}',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOFPM2

# Create logs directory
mkdir -p /var/www/shadow-seven/logs

# Restart or start the application
cd /var/www/shadow-seven
if pm2 describe shadow-seven > /dev/null 2>&1; then
    echo "Restarting application..."
    pm2 restart shadow-seven
else
    echo "Starting application..."
    pm2 start ecosystem.config.js
fi

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup | tail -n 1 | bash || true

echo "✓ PM2 configured successfully"
EOF

echo -e "${GREEN}✓ PM2 setup completed${NC}"
echo ""

# Step 7: Setup Nginx (if not already configured)
echo -e "${YELLOW}Step 7: Setting up Nginx configuration...${NC}"

ssh -p "$SERVER_PORT" "${SERVER_USER}@${SERVER_IP}" bash <<EOF
set -e

# Install Nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt-get update
    apt-get install -y nginx
fi

# Create Nginx configuration
cat > /etc/nginx/sites-available/${APP_NAME} <<'EOFNGINX'
server {
    listen 80;
    listen [::]:80;
    
    server_name ${SUBDOMAIN};
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        proxy_pass http://127.0.0.1:3000;
    }
}
EOFNGINX

# Enable site
ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
systemctl enable nginx

echo "✓ Nginx configured successfully"
EOF

echo -e "${GREEN}✓ Nginx setup completed${NC}"
echo ""

# Cleanup
rm "$DEPLOY_PACKAGE"

# Final summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Deployment Completed Successfully!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure environment variables:"
echo -e "   ${BLUE}ssh ${SERVER_USER}@${SERVER_IP} 'nano ${REMOTE_DIR}/.env'${NC}"
echo ""
echo "2. Setup Cloudflare DNS for mrf103.com:"
echo "   - Go to Cloudflare Dashboard → DNS"
echo "   - Add A record: ${SUBDOMAIN} -> ${SERVER_IP}"
echo "   - Enable Cloudflare proxy (orange cloud)"
echo "   - SSL/TLS mode: Full (or Full Strict with SSL certificate)"
echo ""
echo "3. Setup SSL certificate (recommended):"
echo -e "   ${BLUE}ssh ${SERVER_USER}@${SERVER_IP}${NC}"
echo "   apt-get install certbot python3-certbot-nginx"
echo "   certbot --nginx -d ${SUBDOMAIN}"
echo ""
echo "4. Check application status:"
echo -e "   ${BLUE}ssh ${SERVER_USER}@${SERVER_IP} 'pm2 status'${NC}"
echo ""
echo "5. View application logs:"
echo -e "   ${BLUE}ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs shadow-seven'${NC}"
echo ""
echo -e "${GREEN}Your application should be accessible at:${NC}"
echo -e "   ${BLUE}http://${SUBDOMAIN}${NC}"
echo -e "   ${BLUE}http://${SERVER_IP}${NC}"
echo ""
