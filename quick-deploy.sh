#!/bin/bash
# Quick Deploy Script - Pass password as argument
# Usage: ./quick-deploy.sh YOUR_PASSWORD

if [ -z "$1" ]; then
    echo "Usage: $0 <password>"
    exit 1
fi

export SSHPASS="$1"
SERVER="root@46.224.225.96"
REMOTE="/root/nexus/planets/SHADOW-7/shadow-seven"

echo "🚀 Starting deployment..."

# 1. Compress
echo "[1/5] Compressing..."
tar -czf /tmp/sd.tar.gz --exclude='node_modules' --exclude='.git' --exclude='dist' --exclude='build' -C /workspaces/OFFIFCIAL-7th-Shadow-6.0.1 .

# 2. Transfer  
echo "[2/5] Transferring..."
sshpass -e scp -o StrictHostKeyChecking=no /tmp/sd.tar.gz $SERVER:/tmp/

# 3. Extract
echo "[3/5] Extracting..."
sshpass -e ssh $SERVER "mkdir -p $REMOTE && cd $REMOTE && tar -xzf /tmp/sd.tar.gz && rm /tmp/sd.tar.gz"

# 4. Install & Build
echo "[4/5] Building..."
sshpass -e ssh $SERVER "cd $REMOTE && npm install --legacy-peer-deps && npm run build"

# 5. Start
echo "[5/5] Starting..."
sshpass -e ssh $SERVER "cd $REMOTE && pm2 delete shadow-seven 2>/dev/null || true && pm2 start npm --name shadow-seven -- run preview -- --host 0.0.0.0 --port 3002 && pm2 save"

rm /tmp/sd.tar.gz
echo "✅ Deployed! → http://46.224.225.96:3002"
