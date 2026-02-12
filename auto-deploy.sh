#!/bin/bash
# ════════════════════════════════════════════════════════════════
# Shadow Seven v4.0.0 - All-in-One Deployment Script
# ════════════════════════════════════════════════════════════════
# This script does EVERYTHING: compress, transfer, setup, build, start
# ════════════════════════════════════════════════════════════════

set -e

SERVER="root@46.224.225.96"
REMOTE="/root/nexus/planets/SHADOW-7/shadow-seven"
LOCAL="/workspaces/OFFIFCIAL-7th-Shadow-6.0.1"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        Shadow Seven v4.0.0 - Complete Deployment${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

# Test connection
echo -e "\n${YELLOW}Testing connection to $SERVER...${NC}"
if ! ssh -o ConnectTimeout=5 $SERVER "echo OK" &>/dev/null; then
    echo -e "${RED}✗ Cannot connect to server${NC}"
    echo "Make sure:"
    echo "  1. Server is running: 46.224.225.96"
    echo "  2. Port 22 is open"
    echo "  3. SSH keys are configured (run: ssh-copy-id $SERVER)"
    exit 1
fi
echo -e "${GREEN}✓ Connection OK${NC}"

# Step 1: Compress
echo -e "\n${YELLOW}[1/5] Compressing files...${NC}"
cd $LOCAL
tar -czf /tmp/shadow.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='*.md' \
    --exclude='*.log' \
    .
SIZE=$(du -h /tmp/shadow.tar.gz | cut -f1)
echo -e "${GREEN}✓ Archive created ($SIZE)${NC}"

# Step 2: Transfer
echo -e "\n${YELLOW}[2/5] Transferring to server...${NC}"
scp /tmp/shadow.tar.gz $SERVER:/tmp/
echo -e "${GREEN}✓ Transfer complete${NC}"

# Step 3-4: Extract, Install, Build on server
echo -e "\n${YELLOW}[3/5] Setting up on server...${NC}"
ssh $SERVER << 'SETUP'
mkdir -p /root/nexus/planets/SHADOW-7/shadow-seven
cd /root/nexus/planets/SHADOW-7/shadow-seven
tar -xzf /tmp/shadow.tar.gz
rm /tmp/shadow.tar.gz
echo "✓ Files extracted"
SETUP

echo -e "${GREEN}✓ Setup complete${NC}"

# Step 4: Install and Build
echo -e "\n${YELLOW}[4/5] Installing dependencies and building...${NC}"
ssh $SERVER << 'BUILD'
cd /root/nexus/planets/SHADOW-7/shadow-seven

# Create .env
if [ ! -f .env ]; then
    cat > .env << 'EOF'
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
VITE_GEMINI_API_KEY=AIzaSyABC123...
VITE_APP_NAME=Shadow Seven
VITE_APP_VERSION=4.0.0
VITE_API_URL=http://localhost:3001
NODE_ENV=production
EOF
    echo "✓ .env created"
fi

# Install
npm install --legacy-peer-deps
echo "✓ Dependencies installed"

# Build
npm run build
echo "✓ Build complete"
BUILD

echo -e "${GREEN}✓ Build successful${NC}"

# Step 5: Start with PM2
echo -e "\n${YELLOW}[5/5] Starting application...${NC}"
ssh $SERVER << 'START'
cd /root/nexus/planets/SHADOW-7/shadow-seven

pm2 delete shadow-seven 2>/dev/null || true
pm2 start npm --name "shadow-seven" -- run preview -- --host 0.0.0.0 --port 3002
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

sleep 2
pm2 status
START

echo -e "${GREEN}✓ Application started${NC}"

# Cleanup
rm -f /tmp/shadow.tar.gz

# Summary
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✓✓✓ DEPLOYMENT SUCCESSFUL ✓✓✓${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}URL:${NC}       ${GREEN}http://46.224.225.96:3002${NC}"
echo -e "${YELLOW}Server:${NC}     $SERVER"
echo -e "${YELLOW}Path:${NC}       $REMOTE"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo -e "  View logs:    ${GREEN}ssh $SERVER 'pm2 logs shadow-seven'${NC}"
echo -e "  Restart:      ${GREEN}ssh $SERVER 'pm2 restart shadow-seven'${NC}"
echo -e "  Stop:         ${GREEN}ssh $SERVER 'pm2 stop shadow-seven'${NC}"
echo -e "  Status:       ${GREEN}ssh $SERVER 'pm2 status'${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
