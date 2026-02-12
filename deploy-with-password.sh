#!/bin/bash
# ════════════════════════════════════════════════════════════════
# Shadow Seven v4.0.0 - Deployment with Password
# ════════════════════════════════════════════════════════════════

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

SERVER="root@46.224.225.96"
REMOTE_PATH="/root/nexus/planets/SHADOW-7/shadow-seven"
LOCAL_PATH="/workspaces/OFFIFCIAL-7th-Shadow-6.0.1"

# Check if sshpass is installed
if ! command -v sshpass &> /dev/null; then
    echo -e "${YELLOW}Installing sshpass...${NC}"
    apt-get update && apt-get install -y sshpass
fi

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Shadow Seven v4.0.0 - Deployment${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

# Prompt for password
echo -e "\n${YELLOW}Please enter the SSH password for $SERVER:${NC}"
read -s PASSWORD

# Test connection
echo -e "\n${YELLOW}[1/6] Testing connection...${NC}"
if sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "echo 'Connected'" 2>/dev/null; then
    echo -e "${GREEN}✓ Connection successful${NC}"
else
    echo -e "${RED}✗ Connection failed. Please check password and server.${NC}"
    exit 1
fi

# Create directory
echo -e "\n${YELLOW}[2/6] Creating directories...${NC}"
sshpass -p "$PASSWORD" ssh $SERVER "mkdir -p $REMOTE_PATH"
echo -e "${GREEN}✓ Directories created${NC}"

# Transfer files
echo -e "\n${YELLOW}[3/6] Transferring files (this may take a few minutes)...${NC}"
sshpass -p "$PASSWORD" rsync -avz --progress \
  -e "ssh -o StrictHostKeyChecking=no" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude 'build' \
  --exclude '*.md' \
  --exclude '*.log' \
  $LOCAL_PATH/ $SERVER:$REMOTE_PATH/

echo -e "${GREEN}✓ Files transferred${NC}"

# Setup and build
echo -e "\n${YELLOW}[4/6] Setting up environment...${NC}"
sshpass -p "$PASSWORD" ssh $SERVER << 'ENDSSH'
cd /root/nexus/planets/SHADOW-7/shadow-seven

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
fi
ENDSSH

echo -e "${GREEN}✓ Environment configured${NC}"

# Install and build
echo -e "\n${YELLOW}[5/6] Installing dependencies and building...${NC}"
sshpass -p "$PASSWORD" ssh $SERVER << 'ENDSSH'
cd /root/nexus/planets/SHADOW-7/shadow-seven
npm install --legacy-peer-deps
npm run build
ENDSSH

echo -e "${GREEN}✓ Build complete${NC}"

# Start with PM2
echo -e "\n${YELLOW}[6/6] Starting application...${NC}"
sshpass -p "$PASSWORD" ssh $SERVER << 'ENDSSH'
cd /root/nexus/planets/SHADOW-7/shadow-seven
pm2 delete shadow-seven 2>/dev/null || true
pm2 start npm --name "shadow-seven" -- run preview -- --host 0.0.0.0 --port 3002
pm2 save
pm2 status
ENDSSH

echo -e "\n${GREEN}✓ Deployment complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Access your app at:${NC} http://46.224.225.96:3002"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
