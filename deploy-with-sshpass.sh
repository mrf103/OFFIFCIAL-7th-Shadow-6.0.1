#!/bin/bash
################################################################################
# SHADOW SEVEN — FULLSTACK DEPLOYMENT SCRIPT v4.0.0 (sshpass version)
# Target: root@46.224.225.96  
# Destination: /root/nexus/planets/SHADOW-7/shadow-seven
# Date: 2026-02-12
################################################################################

set -e  # Exit on any error

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

REMOTE_USER="root"
REMOTE_HOST="46.224.225.96"
REMOTE_PASS="${1:-mrfiras1Q@@@}"  # Password passed as argument or use default
REMOTE_PATH="/root/nexus/planets/SHADOW-7/shadow-seven"
LOCAL_PATH="/workspaces/OFFIFCIAL-7th-Shadow-6.0.1"

# Export for sshpass and rsync
export SSHPASS="$REMOTE_PASS"

# SSH command with sshpass
SSH_CMD="sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ${REMOTE_USER}@${REMOTE_HOST}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ─────────────────────────────────────────────────────────────────────────────
# FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 1: PRE-DEPLOYMENT CHECKS
# ─────────────────────────────────────────────────────────────────────────────

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}          PHASE 1: PRE-DEPLOYMENT CHECKS${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

log_info "Checking local environment..."

if [ ! -f "$LOCAL_PATH/package.json" ]; then
    log_error "package.json not found at $LOCAL_PATH"
    exit 1
fi
log_success "package.json found"

if [ ! -f "$LOCAL_PATH/vite.config.js" ]; then
    log_error "vite.config.js not found"
    exit 1
fi
log_success "vite.config.js found"

log_info "Testing SSH connection to $REMOTE_HOST..."
if $SSH_CMD "echo 'SSH connection successful'" > /dev/null 2>&1; then
    log_success "SSH connection established"
else
    log_error "Cannot connect to $REMOTE_HOST via SSH"
    exit 1
fi

log_info "Checking remote Node.js version..."
NODE_VERSION=$($SSH_CMD "node --version 2>/dev/null" || echo "NOT_FOUND")
if [ "$NODE_VERSION" = "NOT_FOUND" ]; then
    log_warning "Node.js not found on remote server. Will need to install."
else
    log_success "Node.js version: $NODE_VERSION"
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2: PREPARE REMOTE ENVIRONMENT
# ─────────────────────────────────────────────────────────────────────────────

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        PHASE 2: PREPARE REMOTE ENVIRONMENT${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

log_info "Creating remote directory structure..."
$SSH_CMD "mkdir -p $REMOTE_PATH"
log_success "Remote directory created"

log_info "Cleaning up any existing deployment..."
$SSH_CMD "rm -rf ${REMOTE_PATH:?}/* 2>/dev/null || true" || true
log_success "Cleaned up previous deployment"

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 3: TRANSFER FILES
# ─────────────────────────────────────────────────────────────────────────────

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}           PHASE 3: TRANSFER FILES${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

log_info "Transferring project files to $REMOTE_HOST..."
log_warning "This may take a few minutes..."

# Use sshpass with rsync for password-based authentication
sshpass -e rsync -avz \
    -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='build-output.txt' \
    --exclude='*.zip' \
    --exclude='.env.local' \
    --exclude='coverage' \
    "${LOCAL_PATH}/" \
    "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"

log_success "Files transferred successfully"

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 4: INSTALL DEPENDENCIES
# ─────────────────────────────────────────────────────────────────────────────

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       PHASE 4: INSTALL DEPENDENCIES${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

log_info "Installing npm dependencies on remote server..."

$SSH_CMD "cd $REMOTE_PATH && npm install --production=false"

log_success "Dependencies installed"

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 5: CONFIGURE ENVIRONMENT
# ─────────────────────────────────────────────────────────────────────────────

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       PHASE 5: CONFIGURE ENVIRONMENT${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

log_info "Creating environment files..."

# Create production environment file with proper escaping
$SSH_CMD "cat > $REMOTE_PATH/.env.production << 'ENVEOF'
# Shadow Seven Frontend Configuration
VITE_APP_NAME=Shadow Seven
VITE_ENVIRONMENT=production

# API Configuration - Update these based on your Nexus Core setup
VITE_API_BASE=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/realtime

# Supabase Configuration
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9

# Optional: Gemini AI
VITE_GEMINI_API_KEY=

# Application Settings
VITE_MAX_UPLOAD_SIZE=52428800
VITE_SUPPORTED_FORMATS=pdf,docx,txt,md
ENVEOF"

log_success "Environment file created"

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 6: BUILD APPLICATION
# ─────────────────────────────────────────────────────────────────────────────

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        PHASE 6: BUILD APPLICATION${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

log_info "Building Shadow Seven frontend..."

$SSH_CMD "cd $REMOTE_PATH && npm run build"

if $SSH_CMD "test -d $REMOTE_PATH/dist"; then
    log_success "Build successful - dist/ created"
else
    log_error "Build failed - dist/ not found"
    exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 7: SETUP PM2 PROCESS MANAGER
# ─────────────────────────────────────────────────────────────────────────────

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}      PHASE 7: SETUP PM2 PROCESS MANAGER${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

log_info "Configuring PM2 on remote server..."

$SSH_CMD "
    # Install PM2 if not already installed
    npm install -g pm2 2>/dev/null || true
    
    # Kill any existing shadow-seven process
    pm2 delete shadow-seven-ui 2>/dev/null || true
    
    # Create ecosystem config
    cat > $REMOTE_PATH/ecosystem.config.js << 'PMEOF'
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
    mkdir -p $REMOTE_PATH/logs
    
    # Install serve globally
    npm install -g serve 2>/dev/null || true
    
    # Start the application
    cd $REMOTE_PATH
    pm2 start ecosystem.config.js
    pm2 save
"

sleep 3
log_success "PM2 configured and application started"

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 8: VERIFY DEPLOYMENT
# ─────────────────────────────────────────────────────────────────────────────

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}       PHASE 8: VERIFY DEPLOYMENT${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

log_info "Checking PM2 status..."
$SSH_CMD "pm2 status"

log_info "\nChecking application logs..."
$SSH_CMD "pm2 logs shadow-seven-ui --lines 10 --nostream"

# ─────────────────────────────────────────────────────────────────────────────
# FINAL SUMMARY
# ─────────────────────────────────────────────────────────────────────────────

echo -e "\n${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}          ✓ DEPLOYMENT COMPLETE${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"

echo -e "${GREEN}✓ Deployment Summary:${NC}"
echo -e "  Remote Server:    ${REMOTE_USER}@${REMOTE_HOST}"
echo -e "  Project Path:     ${REMOTE_PATH}"
echo -e "  Frontend Port:    3002"
echo -e "  Build Status:     ✓ Complete"
echo -e "  PM2 Status:       ✓ Running\n"

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "  1. Connect to the server: ssh ${REMOTE_USER}@${REMOTE_HOST}"
echo -e "  2. Verify PM2 status: pm2 status"
echo -e "  3. Check logs: pm2 logs shadow-seven-ui"
echo -e "  4. Test the application: curl -I http://localhost:3002\n"

echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}\n"
