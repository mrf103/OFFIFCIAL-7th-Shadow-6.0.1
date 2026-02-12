#!/bin/bash
set -e

SERVER="root@46.224.225.96"
REMOTE="/root/nexus/planets/SHADOW-7/shadow-seven"
LOCAL="/workspaces/OFFIFCIAL-7th-Shadow-6.0.1"

echo "════════════════════════════════════════════════════════════════"
echo "   Shadow Seven v4.0.0 - Simple SSH Deployment"
echo "════════════════════════════════════════════════════════════════"
echo ""

# 1. Compress
echo "[1/5] Compressing files..."
cd $LOCAL
tar -czf /tmp/shadow.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='build' \
    --exclude='*.md' \
    .
echo "✓ Compressed ($(du -h /tmp/shadow.tar.gz | cut -f1))"

# 2. Transfer
echo "[2/5] Transferring..."
scp -o ConnectTimeout=10 /tmp/shadow.tar.gz $SERVER:/tmp/ && echo "✓ Transferred"

# 3. Extract
echo "[3/5] Extracting..."
ssh $SERVER "mkdir -p $REMOTE && cd $REMOTE && tar -xzf /tmp/shadow.tar.gz && rm /tmp/shadow.tar.gz" && echo "✓ Extracted"

# 4. Build
echo "[4/5] Building..."
ssh $SERVER << 'BUILD'
cd /root/nexus/planets/SHADOW-7/shadow-seven

if [ ! -f .env ]; then
cat > .env << 'EOF'
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=token
VITE_GEMINI_API_KEY=key
VITE_APP_NAME=Shadow Seven
VITE_APP_VERSION=4.0.0
VITE_API_URL=http://localhost:3001
NODE_ENV=production
EOF
fi

npm install --legacy-peer-deps
npm run build
BUILD
echo "✓ Built"

# 5. Start
echo "[5/5] Starting..."
ssh $SERVER << 'START'
cd /root/nexus/planets/SHADOW-7/shadow-seven
pm2 delete shadow-seven 2>/dev/null || true
pm2 start npm --name "shadow-seven" -- run preview -- --host 0.0.0.0 --port 3002
pm2 save
pm2 status
START
echo "✓ Started"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   ✓✓✓ DEPLOYMENT COMPLETE ✓✓✓"
echo "════════════════════════════════════════════════════════════════"
echo "🌐 Open: http://46.224.225.96:3002"
echo "════════════════════════════════════════════════════════════════"
