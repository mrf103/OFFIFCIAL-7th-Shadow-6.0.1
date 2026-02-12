#!/bin/bash
# ════════════════════════════════════════════════════════════════
# Shadow Seven v4.0.0 - Complete Deployment Script
# ════════════════════════════════════════════════════════════════
# Target: root@46.224.225.96
# ════════════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

SERVER="root@46.224.225.96"
REMOTE_PATH="/root/nexus/planets/SHADOW-7/shadow-seven"

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Shadow Seven v4.0.0 - Complete Deployment${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

# Install sshpass if needed
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}Installing sshpass...${NC}"
    sudo apt-get update -qq && sudo apt-get install -y sshpass
fi

# Get password once
echo -e "\n${YELLOW}Enter SSH password for $SERVER:${NC}"
read -s PASSWORD
export SSHPASS=$PASSWORD

# Test connection
echo -e "\n${YELLOW}[1/7] Testing connection...${NC}"
if sshpass -e ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $SERVER "echo 'OK'" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${RED}✗ Connection failed${NC}"
    exit 1
fi

# Create archive
echo -e "\n${YELLOW}[2/7] Compressing files...${NC}"
tar -czf /tmp/shadow-deploy.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='*.md' \
    --exclude='*.log' \
    --exclude='shadow-seven-deploy.tar.gz' \
    -C /workspaces/OFFIFCIAL-7th-Shadow-6.0.1 .
echo -e "${GREEN}✓ Archive created ($(du -h /tmp/shadow-deploy.tar.gz | cut -f1))${NC}"

# Transfer
echo -e "\n${YELLOW}[3/7] Transferring to server...${NC}"
sshpass -e scp -o StrictHostKeyChecking=no /tmp/shadow-deploy.tar.gz $SERVER:/tmp/
echo -e "${GREEN}✓ Transfer complete${NC}"

# Extract on server
echo -e "\n${YELLOW}[4/7] Setting up on server...${NC}"
sshpass -e ssh $SERVER << 'ENDSSH'
mkdir -p /root/nexus/planets/SHADOW-7/shadow-seven
cd /root/nexus/planets/SHADOW-7/shadow-seven
tar -xzf /tmp/shadow-deploy.tar.gz
rm /tmp/shadow-deploy.tar.gz

# Create .env if not exists
if [ ! -f .env ]; then
    cat > .env << 'EOF'
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GEMINI_API_KEY=your-gemini-api-key-here
VITE_APP_NAME=Shadow Seven
VITE_APP_VERSION=4.0.0
VITE_API_URL=http://localhost:3001
NODE_ENV=production
EOF
    echo "✓ Created .env file"
fi

echo "✓ Files extracted"
ENDSSH

echo -e "${GREEN}✓ Setup complete${NC}"

# Install dependencies
echo -e "\n${YELLOW}[5/7] Installing dependencies (this may take 2-3 minutes)...${NC}"
sshpass -e ssh $SERVER << 'ENDSSH'
cd /root/nexus/planets/SHADOW-7/shadow-seven

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

echo "Node: $(node --version), NPM: $(npm --version)"

# Install PM2 globally if needed
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo "✓ PM2 installed"
fi

# Install project dependencies
npm install --legacy-peer-deps
echo "✓ Dependencies installed"
ENDSSH

echo -e "${GREEN}✓ Dependencies installed${NC}"

# Build
echo -e "\n${YELLOW}[6/7] Building application...${NC}"
sshpass -e ssh $SERVER << 'ENDSSH'
cd /root/nexus/planets/SHADOW-7/shadow-seven
npm run build
echo "✓ Build complete"
ENDSSH

echo -e "${GREEN}✓ Build successful${NC}"

# Start with PM2
echo -e "\n${YELLOW}[7/7] Starting application with PM2...${NC}"
sshpass -e ssh $SERVER << 'ENDSSH'
cd /root/nexus/planets/SHADOW-7/shadow-seven

# Stop if already running
pm2 delete shadow-seven 2>/dev/null || true

# Start the application
pm2 start npm --name "shadow-seven" -- run preview -- --host 0.0.0.0 --port 3002

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo ""
echo "✓ Application started"
pm2 status
ENDSSH

echo -e "${GREEN}✓ Application running${NC}"

# Cleanup
rm -f /tmp/shadow-deploy.tar.gz

# Final summary
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✓✓✓ DEPLOYMENT SUCCESSFUL ✓✓✓${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Server:${NC}     $SERVER"
echo -e "${YELLOW}Path:${NC}       $REMOTE_PATH"
echo -e "${YELLOW}Port:${NC}       3002"
echo -e "${YELLOW}URL:${NC}        http://46.224.225.96:3002"
echo -e "\n${YELLOW}Useful Commands:${NC}"
echo -e "  View logs:    ssh $SERVER 'pm2 logs shadow-seven'"
echo -e "  Restart:      ssh $SERVER 'pm2 restart shadow-seven'"
echo -e "  Stop:         ssh $SERVER 'pm2 stop shadow-seven'"
echo -e "  Status:       ssh $SERVER 'pm2 status'"
echo -e "  Edit .env:    ssh $SERVER 'nano $REMOTE_PATH/.env'"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
