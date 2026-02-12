#!/bin/bash
# Shadow Seven - Deployment Alternative Method
# Uses expect instead of sshpass

set -e

SERVER="root@46.224.225.96"
REMOTE="/root/nexus/planets/SHADOW-7/shadow-seven"
LOCAL="/workspaces/OFFIFCIAL-7th-Shadow-6.0.1"
PASSWORD="$1"

if [ -z "$PASSWORD" ]; then
    echo "❌ Usage: $0 <password>"
    exit 1
fi

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        Shadow Seven v4.0.0 - Deployment (Alternative)${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

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

# Step 2: Transfer using expect
echo -e "\n${YELLOW}[2/5] Transferring to server...${NC}"

expect << EOF
set timeout 30
spawn scp /tmp/shadow.tar.gz $SERVER:/tmp/
expect "password:"
send "$PASSWORD\r"
expect eof
EOF

echo -e "${GREEN}✓ Transfer complete${NC}"

# Step 3-4: Setup on server
echo -e "\n${YELLOW}[3/5] Setting up on server...${NC}"

expect << EOF
set timeout 60
spawn ssh $SERVER

expect "password:"
send "$PASSWORD\r"
expect "~#"

send "mkdir -p $REMOTE && cd $REMOTE && tar -xzf /tmp/shadow.tar.gz && rm /tmp/shadow.tar.gz\r"
expect "~#"

send "[ -f .env ] || cat > .env << 'EOE'\r"
send "VITE_SUPABASE_URL=http://localhost:8000\r"
send "VITE_SUPABASE_ANON_KEY=token\r"
send "VITE_GEMINI_API_KEY=key\r"
send "VITE_APP_NAME=Shadow Seven\r"
send "VITE_APP_VERSION=4.0.0\r"
send "VITE_API_URL=http://localhost:3001\r"
send "NODE_ENV=production\r"
send "EOE\r"
expect "~#"

send "exit\r"
expect eof
EOF

echo -e "${GREEN}✓ Setup complete${NC}"

# Step 5: Install and Build
echo -e "\n${YELLOW}[4/5] Installing & building...${NC}"

expect << EOF
set timeout 300
spawn ssh $SERVER
expect "password:"
send "$PASSWORD\r"
expect "~#"

send "cd $REMOTE && npm install --legacy-peer-deps\r"
expect "~#"

send "npm run build\r"
expect "~#"

send "exit\r"
expect eof
EOF

echo -e "${GREEN}✓ Build complete${NC}"

# Step 6: Start with PM2
echo -e "\n${YELLOW}[5/5] Starting application...${NC}"

expect << EOF
set timeout 60
spawn ssh $SERVER
expect "password:"
send "$PASSWORD\r"
expect "~#"

send "cd $REMOTE && pm2 delete shadow-seven 2>/dev/null || true\r"
expect "~#"

send "pm2 start npm --name shadow-seven -- run preview -- --host 0.0.0.0 --port 3002\r"
expect "~#"

send "pm2 save && pm2 status\r"
expect "~#"

send "exit\r"
expect eof
EOF

echo -e "${GREEN}✓ Application started${NC}"

rm -f /tmp/shadow.tar.gz

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✓✓✓ DEPLOYMENT SUCCESSFUL ✓✓✓${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🌐 Open: http://46.224.225.96:3002${NC}"
echo -e "\n${YELLOW}Useful Commands:${NC}"
echo -e "  Logs:    ssh $SERVER 'pm2 logs shadow-seven'"
echo -e "  Restart: ssh $SERVER 'pm2 restart shadow-seven'"
echo -e "  Stop:    ssh $SERVER 'pm2 stop shadow-seven'"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
