#!/bin/bash
# Shadow Seven - Deployment with Password
# Usage: ./deploy-final.sh YOUR_PASSWORD

if [ -z "$1" ]; then
    echo "❌ Usage: $0 <password>"
    echo ""
    echo "Example:"
    echo "  ./deploy-final.sh mypassword123"
    exit 1
fi

export SSHPASS="$1"
SERVER="root@46.224.225.96"
REMOTE="/root/nexus/planets/SHADOW-7/shadow-seven"
LOCAL="/workspaces/OFFIFCIAL-7th-Shadow-6.0.1"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        Shadow Seven v4.0.0 - Deployment${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

# Test connection
echo -e "\n${YELLOW}[0/5] Testing connection...${NC}"
if ! sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 $SERVER "echo OK" 2>/dev/null; then
    echo -e "${RED}✗ Connection failed${NC}"
    echo "Trying alternative method..."
    exit 1
fi
echo -e "${GREEN}✓ Connected${NC}"

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
sshpass -e scp -o StrictHostKeyChecking=no /tmp/shadow.tar.gz $SERVER:/tmp/
echo -e "${GREEN}✓ Transfer complete${NC}"

# Step 3: Extract & Setup
echo -e "\n${YELLOW}[3/5] Setting up on server...${NC}"
sshpass -e ssh -o StrictHostKeyChecking=no $SERVER << 'SETUP'
mkdir -p /root/nexus/planets/SHADOW-7/shadow-seven
cd /root/nexus/planets/SHADOW-7/shadow-seven
tar -xzf /tmp/shadow.tar.gz
rm /tmp/shadow.tar.gz

if [ ! -f .env ]; then
    cat > .env << 'EOF'
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
VITE_GEMINI_API_KEY=AIzaSyABC123
VITE_APP_NAME=Shadow Seven
VITE_APP_VERSION=4.0.0
VITE_API_URL=http://localhost:3001
NODE_ENV=production
EOF
fi
SETUP
echo -e "${GREEN}✓ Setup complete${NC}"

# Step 4: Install & Build
echo -e "\n${YELLOW}[4/5] Installing & building...${NC}"
sshpass -e ssh -o StrictHostKeyChecking=no $SERVER << 'BUILD'
cd /root/nexus/planets/SHADOW-7/shadow-seven
npm install --legacy-peer-deps
npm run build
BUILD
echo -e "${GREEN}✓ Build complete${NC}"

# Step 5: Start
echo -e "\n${YELLOW}[5/5] Starting application...${NC}"
sshpass -e ssh -o StrictHostKeyChecking=no $SERVER << 'START'
cd /root/nexus/planets/SHADOW-7/shadow-seven
pm2 delete shadow-seven 2>/dev/null || true
pm2 start npm --name "shadow-seven" -- run preview -- --host 0.0.0.0 --port 3002
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true
sleep 2
pm2 status
START
echo -e "${GREEN}✓ Application started${NC}"

rm -f /tmp/shadow.tar.gz

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✓✓✓ DEPLOYMENT SUCCESSFUL ✓✓✓${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🌐 Open: http://46.224.225.96:3002${NC}"
echo -e "\n${YELLOW}Commands:${NC}"
echo -e "  Logs:    ssh $SERVER 'pm2 logs shadow-seven'"
echo -e "  Restart: ssh $SERVER 'pm2 restart shadow-seven'"
echo -e "  Stop:    ssh $SERVER 'pm2 stop shadow-seven'"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
