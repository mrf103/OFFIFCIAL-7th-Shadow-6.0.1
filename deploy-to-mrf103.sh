#!/bin/bash
# ════════════════════════════════════════════════════════════════
# Shadow Seven v4.0.0 - Deployment Script to MRF103 Server
# ════════════════════════════════════════════════════════════════
# Target: root@46.224.225.96
# Date: 2026-02-12
# ════════════════════════════════════════════════════════════════

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVER="root@46.224.225.96"
REMOTE_PATH="/root/nexus/planets/SHADOW-7/shadow-seven"
LOCAL_PATH="/workspaces/OFFIFCIAL-7th-Shadow-6.0.1"

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   Shadow Seven v4.0.0 - Deployment to MRF103 Server${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

# Step 1: Test SSH Connection
echo -e "\n${YELLOW}[1/6] Testing SSH connection to $SERVER...${NC}"
if ssh -o ConnectTimeout=10 -o BatchMode=yes $SERVER "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${GREEN}✓ SSH connection successful${NC}"
else
    echo -e "${RED}✗ Cannot connect to server. Please check:${NC}"
    echo -e "  1. Server is running"
    echo -e "  2. SSH keys are configured"
    echo -e "  3. Run: ssh-copy-id $SERVER"
    exit 1
fi

# Step 2: Create remote directory structure
echo -e "\n${YELLOW}[2/6] Creating directory structure on server...${NC}"
ssh $SERVER "mkdir -p $REMOTE_PATH/{api,Components,database,Entities,hooks,lib,Pages,scripts,styles,tests,utils,workers,e2e}"
echo -e "${GREEN}✓ Directory structure created${NC}"

# Step 3: Transfer files
echo -e "\n${YELLOW}[3/6] Transferring files to server...${NC}"
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude 'build' \
  --exclude '.vite' \
  --exclude 'coverage' \
  --exclude '*.log' \
  --exclude '.env.local' \
  $LOCAL_PATH/ $SERVER:$REMOTE_PATH/

echo -e "${GREEN}✓ Files transferred successfully${NC}"

# Step 4: Setup environment on server
echo -e "\n${YELLOW}[4/6] Setting up environment on server...${NC}"
ssh $SERVER << 'ENDSSH'
cd /root/nexus/planets/SHADOW-7/shadow-seven

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"

# Install PM2 if not exists
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cat > .env << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Gemini AI Configuration
VITE_GEMINI_API_KEY=your-gemini-api-key-here

# Application Settings
VITE_APP_NAME=Shadow Seven
VITE_APP_VERSION=4.0.0
VITE_API_URL=http://localhost:3001
NODE_ENV=production
EOF
    echo "⚠ Created default .env file - please update with your credentials"
fi
ENDSSH

echo -e "${GREEN}✓ Environment setup complete${NC}"

# Step 5: Install dependencies and build
echo -e "\n${YELLOW}[5/6] Installing dependencies and building...${NC}"
ssh $SERVER << 'ENDSSH'
cd /root/nexus/planets/SHADOW-7/shadow-seven

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Build complete!"
ENDSSH

echo -e "${GREEN}✓ Build successful${NC}"

# Step 6: Start with PM2
echo -e "\n${YELLOW}[6/6] Starting application with PM2...${NC}"
ssh $SERVER << 'ENDSSH'
cd /root/nexus/planets/SHADOW-7/shadow-seven

# Stop existing process if running
pm2 delete shadow-seven 2>/dev/null || true

# Start with PM2
pm2 start npm --name "shadow-seven" -- run preview -- --host 0.0.0.0 --port 3002

# Save PM2 configuration
pm2 save

# Show status
pm2 status

echo ""
echo "Application is running on port 3002"
echo "Access it at: http://46.224.225.96:3002"
ENDSSH

echo -e "${GREEN}✓ Application started successfully${NC}"

# Final Summary
echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✓ DEPLOYMENT SUCCESSFUL${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Server:${NC} $SERVER"
echo -e "${YELLOW}Path:${NC} $REMOTE_PATH"
echo -e "${YELLOW}Port:${NC} 3002"
echo -e "${YELLOW}URL:${NC} http://46.224.225.96:3002"
echo -e "\n${YELLOW}Next Steps:${NC}"
echo -e "  1. Update .env file: ssh $SERVER 'nano $REMOTE_PATH/.env'"
echo -e "  2. Restart app: ssh $SERVER 'pm2 restart shadow-seven'"
echo -e "  3. View logs: ssh $SERVER 'pm2 logs shadow-seven'"
echo -e "  4. Configure Nginx for domain: app.mrf103.com"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
