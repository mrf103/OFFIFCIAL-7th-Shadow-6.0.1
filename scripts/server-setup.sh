#!/bin/bash

# ============================================
# Shadow Seven - Server Initial Setup Script
# ============================================
# Run this script ON THE SERVER to prepare it for deployment
# Usage: bash <(curl -s https://raw.githubusercontent.com/.../server-setup.sh)
# Or: scp server-setup.sh root@45.224.225.96:/tmp/ && ssh root@45.224.225.96 'bash /tmp/server-setup.sh'

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Shadow Seven - Server Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}Error: This script must be run as root${NC}"
    echo "Please run: sudo bash $0"
    exit 1
fi

# Step 1: Update system
echo -e "${YELLOW}Step 1: Updating system packages...${NC}"
apt-get update
apt-get upgrade -y
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# Step 2: Install Node.js
echo -e "${YELLOW}Step 2: Installing Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js is already installed"
fi

node --version
npm --version
echo -e "${GREEN}✓ Node.js installed${NC}"
echo ""

# Step 3: Install PM2
echo -e "${YELLOW}Step 3: Installing PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
else
    echo "PM2 is already installed"
fi

pm2 --version
echo -e "${GREEN}✓ PM2 installed${NC}"
echo ""

# Step 4: Install Nginx
echo -e "${YELLOW}Step 4: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
else
    echo "Nginx is already installed"
fi

nginx -v
echo -e "${GREEN}✓ Nginx installed${NC}"
echo ""

# Step 5: Setup firewall
echo -e "${YELLOW}Step 5: Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    ufw --force enable
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw status
else
    echo -e "${YELLOW}⚠ UFW not available, skipping firewall configuration${NC}"
fi
echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""

# Step 6: Create application directory
echo -e "${YELLOW}Step 6: Creating application directory...${NC}"
mkdir -p /var/www/shadow-seven
chown -R $USER:$USER /var/www/shadow-seven
echo -e "${GREEN}✓ Application directory created${NC}"
echo ""

# Step 7: Install additional utilities
echo -e "${YELLOW}Step 7: Installing additional utilities...${NC}"
apt-get install -y \
    git \
    curl \
    wget \
    htop \
    ufw \
    certbot \
    python3-certbot-nginx

echo -e "${GREEN}✓ Utilities installed${NC}"
echo ""

# Step 8: Configure swap (if less than 2GB RAM)
echo -e "${YELLOW}Step 8: Checking swap configuration...${NC}"
TOTAL_RAM=$(free -m | awk '/^Mem:/{print $2}')
if [ "$TOTAL_RAM" -lt 2048 ]; then
    if [ ! -f /swapfile ]; then
        echo "Creating 2GB swap file..."
        fallocate -l 2G /swapfile
        chmod 600 /swapfile
        mkswap /swapfile
        swapon /swapfile
        echo '/swapfile none swap sw 0 0' >> /etc/fstab
        echo -e "${GREEN}✓ Swap created${NC}"
    else
        echo "Swap already exists"
    fi
else
    echo "Sufficient RAM available, skip swap creation"
fi
echo ""

# Step 9: Setup PM2 startup
echo -e "${YELLOW}Step 9: Configuring PM2 startup...${NC}"
pm2 startup systemd -u root --hp /root
echo -e "${GREEN}✓ PM2 startup configured${NC}"
echo ""

# Step 10: Security hardening
echo -e "${YELLOW}Step 10: Basic security hardening...${NC}"

# Disable root login (optional - commented out for safety)
# sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# Disable password authentication (optional - commented out for safety)
# sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# Set up automatic security updates
apt-get install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades

echo -e "${GREEN}✓ Basic security configured${NC}"
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Server Setup Completed!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Installed Components:${NC}"
echo "  - Node.js $(node --version)"
echo "  - npm $(npm --version)"
echo "  - PM2 $(pm2 --version)"
echo "  - Nginx $(nginx -v 2>&1 | cut -d'/' -f2)"
echo "  - Certbot (for SSL)"
echo ""
echo -e "${YELLOW}Server Information:${NC}"
echo "  - Application Directory: /var/www/shadow-seven"
echo "  - Nginx Config: /etc/nginx/sites-available/"
echo "  - PM2 Logs: /var/www/shadow-seven/logs/"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Configure SSH key authentication (if not already done)"
echo "2. Run the deployment script from your local machine:"
echo -e "   ${BLUE}./scripts/deploy-to-server.sh your-subdomain.com${NC}"
echo ""
echo "3. After deployment, configure SSL certificate:"
echo -e "   ${BLUE}certbot --nginx -d your-subdomain.com${NC}"
echo ""
echo -e "${GREEN}Your server is now ready for deployment!${NC}"
echo ""
