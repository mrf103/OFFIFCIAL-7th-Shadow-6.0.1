#!/bin/bash
# Manual deployment steps - Run these commands one by one

echo "=== STEP 1: Compress files locally ==="
echo "tar -czf /tmp/shadow.tar.gz --exclude='node_modules' --exclude='.git' --exclude='dist' -C /workspaces/OFFIFCIAL-7th-Shadow-6.0.1 ."

echo -e "\n=== STEP 2: Transfer to server ==="
echo "scp /tmp/shadow.tar.gz root@46.224.225.96:/tmp/"

echo -e "\n=== STEP 3: Connect to server ==="
echo "ssh root@46.224.225.96"

echo -e "\n=== STEP 4: On the server, run: ==="
cat << 'EOF'
mkdir -p /root/nexus/planets/SHADOW-7/shadow-seven
cd /root/nexus/planets/SHADOW-7/shadow-seven
tar -xzf /tmp/shadow.tar.gz
npm install --legacy-peer-deps
npm run build
pm2 delete shadow-seven 2>/dev/null || true
pm2 start npm --name shadow-seven -- run preview -- --host 0.0.0.0 --port 3002
pm2 save
pm2 status
EOF

echo -e "\n=== DONE ==="
echo "App will be running at: http://46.224.225.96:3002"
