#!/bin/bash
################################################################################
# SHADOW SEVEN — DEPLOYMENT ORCHESTRATOR v4.0.0
# 
# This script:
# 1. Transfers project files to remote server
# 2. Executes the setup script on the remote server
#
# Usage: bash deploy.sh
#
################################################################################

set -e

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ─────────────────────────────────────────────────────────────────────────────

REMOTE_USER="root"
REMOTE_HOST="46.224.225.96"
REMOTE_PORT="22"
REMOTE_PATH="/root/nexus/planets/SHADOW-7/shadow-seven"
LOCAL_PATH="/workspaces/OFFIFCIAL-7th-Shadow-6.0.1"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

log_step() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}\n"
}

# ─────────────────────────────────────────────────────────────────────────────
# MAIN DEPLOYMENT
# ─────────────────────────────────────────────────────────────────────────────

log_step "STEP 1: PRE-DEPLOYMENT CHECKS"

log_info "Verifying local files..."
[ -f "$LOCAL_PATH/package.json" ] && log_success "package.json found" || { log_error "package.json not found"; exit 1; }
[ -f "$LOCAL_PATH/vite.config.js" ] && log_success "vite.config.js found" || { log_error "vite.config.js not found"; exit 1; }
[ -f "$LOCAL_PATH/setup-remote.sh" ] && log_success "setup-remote.sh found" || { log_error "setup-remote.sh not found"; exit 1; }

log_step "STEP 2: CREATE REMOTE DIRECTORIES"

log_info "Creating remote directories..."
ssh -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST "
    mkdir -p $REMOTE_PATH
    echo 'Remote directory created'
" || { log_error "Failed to create remote directory"; exit 1; }

log_success "Remote directories ready"

log_step "STEP 3: TRANSFER FILES"

log_info "Transferring files to remote server..."
log_info "This may take 2-5 minutes depending on file size..."

# Use rsync with SSH for efficient transfer
rsync -e "ssh -p $REMOTE_PORT" -avz \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='build-output.txt' \
    --exclude='*.zip' \
    --exclude='.env.local' \
    --exclude='coverage' \
    --exclude='.DS_Store' \
    --progress \
    "$LOCAL_PATH/" \
    "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/" \
    || { log_error "File transfer failed"; exit 1; }

log_success "Files transferred successfully"

log_step "STEP 4: EXECUTE REMOTE SETUP"

log_info "Executing setup script on remote server..."
log_info "This will install dependencies and build the application..."

ssh -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST "
    cd $REMOTE_PATH
    chmod +x setup-remote.sh
    bash setup-remote.sh
" || { log_error "Remote setup failed"; exit 1; }

log_step "DEPLOYMENT COMPLETE"

log_info "✓ Deployment successful!\n"

echo -e "${GREEN}Summary:${NC}"
echo -e "  Server:             $REMOTE_USER@$REMOTE_HOST"
echo -e "  Project Path:       $REMOTE_PATH"
echo -e "  Frontend Port:      3002"
echo -e "  Status:             ✓ Running\n"

echo -e "${YELLOW}What to do next:${NC}"
echo -e "  1. SSH to server: ssh $REMOTE_USER@$REMOTE_HOST"
echo -e "  2. Navigate to project: cd $REMOTE_PATH"
echo -e "  3. Check status: pm2 status"
echo -e "  4. View logs: pm2 logs shadow-seven-ui"
echo -e "  5. Test: curl http://localhost:3002\n"

echo -e "${BLUE}Note:${NC}"
echo -e "  • Application is running on port 3002"
echo -e "  • Update .env.production with Supabase credentials"
echo -e "  • Set up Nginx reverse proxy for domain access"
echo -e "  • Configure SSL/TLS certificates\n"

log_success "All done!"
