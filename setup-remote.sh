#!/bin/bash
################################################################################
# SHADOW SEVEN — REMOTE SETUP SCRIPT v4.0.0
# 
# This script is meant to be executed ON the remote server after files are 
# transferred. It will complete the deployment.
#
# Usage: bash /root/nexus/planets/SHADOW-7/shadow-seven/setup-remote.sh
# 
# Date: 2026-02-12
################################################################################

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ─────────────────────────────────────────────────────────────────────────────
# SETUP DIRECTORY
# ─────────────────────────────────────────────────────────────────────────────

SETUP_DIR="/root/nexus/planets/SHADOW-7/shadow-seven"
cd "$SETUP_DIR" || { echo "Cannot access $SETUP_DIR"; exit 1; }

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       REMOTE SETUP: SHADOW SEVEN FRONTEND${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

# ─────────────────────────────────────────────────────────────────────────────
# CHECK PREREQUISITES
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}[1/6]${NC} Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠ Node.js not found. Installing Node.js 18+...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓${NC} npm: $NPM_VERSION"

# Check PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠ PM2 not found. Installing PM2...${NC}"
    npm install -g pm2
    pm2 startup
fi

PM2_VERSION=$(pm2 --version)
echo -e "${GREEN}✓${NC} PM2: $PM2_VERSION"

# Check serve
if ! command -v serve &> /dev/null; then
    echo -e "${YELLOW}⚠ Serve not found. Installing...${NC}"
    npm install -g serve
fi

echo -e "${GREEN}✓${NC} All prerequisites checked\n"

# ─────────────────────────────────────────────────────────────────────────────
# INSTALL DEPENDENCIES
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}[2/6]${NC} Installing npm dependencies..."

if [ ! -d "$SETUP_DIR/node_modules" ]; then
    npm install --production=false
    echo -e "${GREEN}✓${NC} Dependencies installed\n"
else
    echo -e "${GREEN}✓${NC} node_modules already exists\n"
fi

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURE ENVIRONMENT
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}[3/6]${NC} Configuring environment..."

if [ ! -f "$SETUP_DIR/.env.production" ]; then
    cat > "$SETUP_DIR/.env.production" << 'ENVEOF'
# Shadow Seven Frontend Configuration
VITE_APP_NAME=Shadow Seven
VITE_ENVIRONMENT=production

# API Configuration - Adjust these based on your setup
VITE_API_BASE=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/realtime

# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# Optional: Gemini AI
VITE_GEMINI_API_KEY=

# Application Settings
VITE_MAX_UPLOAD_SIZE=52428800
VITE_SUPPORTED_FORMATS=pdf,docx,txt,md
ENVEOF
    
    echo -e "${YELLOW}⚠ .env.production created with defaults.${NC}"
    echo -e "${YELLOW}⚠ Please update VITE_SUPABASE_ANON_KEY with your actual key!${NC}"
else
    echo -e "${GREEN}✓${NC} .env.production exists"
fi

echo ""

# ─────────────────────────────────────────────────────────────────────────────
# BUILD APPLICATION
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}[4/6]${NC} Building application..."

npm run build

if [ ! -d "$SETUP_DIR/dist" ]; then
    echo -e "${RED}✗${NC} Build failed - dist/ not created"
    exit 1
fi

DIST_SIZE=$(du -sh "$SETUP_DIR/dist" | cut -f1)
echo -e "${GREEN}✓${NC} Build successful - dist size: $DIST_SIZE\n"

# ─────────────────────────────────────────────────────────────────────────────
# SETUP PM2
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}[5/6]${NC} Setting up PM2 process manager..."

# Kill existing app if running
pm2 delete shadow-seven-ui 2>/dev/null || true

# Create ecosystem config
cat > "$SETUP_DIR/ecosystem.config.js" << 'PMEOF'
module.exports = {
  apps: [
    {
      name: 'shadow-seven-ui',
      script: 'serve',
      args: '-s dist -l 3002',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'dist']
    }
  ]
};
PMEOF

# Create logs directory
mkdir -p "$SETUP_DIR/logs"

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 state
pm2 save

sleep 2

echo -e "${GREEN}✓${NC} PM2 configured and app started\n"

# ─────────────────────────────────────────────────────────────────────────────
# VERIFY DEPLOYMENT
# ─────────────────────────────────────────────────────────────────────────────

echo -e "${BLUE}[6/6]${NC} Verifying deployment...\n"

echo -e "${BLUE}PM2 Status:${NC}"
pm2 status

echo ""
echo -e "${BLUE}Recent Logs:${NC}"
pm2 logs shadow-seven-ui --lines 5 --nostream

# ─────────────────────────────────────────────────────────────────────────────
# FINAL STATUS
# ─────────────────────────────────────────────────────────────────────────────

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}          ✓ REMOTE SETUP COMPLETE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${GREEN}Summary:${NC}"
echo -e "  Setup Directory:    $SETUP_DIR"
echo -e "  Frontend Port:      3002"
echo -e "  Build Status:       ✓ Complete"
echo -e "  PM2 Status:         ✓ Running"
echo -e "  Node Version:       $NODE_VERSION"
echo -e "  NPM Version:        $NPM_VERSION\n"

echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Verify app running: curl -s http://localhost:3002 | head"
echo -e "  2. Check PM2 logs: pm2 logs shadow-seven-ui"
echo -e "  3. Update .env.production with real Supabase credentials"
echo -e "  4. Set up Nginx reverse proxy (port 3002 → domain)"
echo -e "  5. Configure SSL/TLS certificates\n"

echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  View all logs:       pm2 logs shadow-seven-ui"
echo -e "  Restart app:         pm2 restart shadow-seven-ui"
echo -e "  Stop app:            pm2 stop shadow-seven-ui"
echo -e "  Rebuild frontend:    cd $SETUP_DIR && npm run build && pm2 restart shadow-seven-ui"
echo -e "  View full PM2 logs:  pm2 logs"
echo -e "  Monitor in real-time: pm2 monit\n"

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"
