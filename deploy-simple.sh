#!/bin/bash
# ════════════════════════════════════════════════════════════════
# Shadow Seven - Simple Deployment Script
# ════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════"
echo "   Shadow Seven v4.0.0 - Simple Deployment"
echo "════════════════════════════════════════════════════════════════"

SERVER="root@46.224.225.96"
REMOTE_DIR="/root/nexus/planets/SHADOW-7/shadow-seven"

# Step 1: Compress
echo -e "\n[1/4] 📦 Compressing files..."
cd /workspaces/OFFIFCIAL-7th-Shadow-6.0.1
tar -czf /tmp/shadow.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='*.md' \
  --exclude='*.log' \
  .
SIZE=$(du -h /tmp/shadow.tar.gz | cut -f1)
echo "✓ Archive created ($SIZE)"

# Step 2: Transfer
echo -e "\n[2/4] 📤 Transferring to server..."
echo "Password required for: $SERVER"
scp /tmp/shadow.tar.gz $SERVER:/tmp/shadow.tar.gz
echo "✓ Transfer complete"

# Step 3: Extract and Build
echo -e "\n[3/4] 🔧 Setting up on server..."
echo "Password required again for setup..."
ssh $SERVER << 'REMOTE_SCRIPT'
set -e
echo "→ Creating directory..."
mkdir -p /root/nexus/planets/SHADOW-7/shadow-seven
cd /root/nexus/planets/SHADOW-7/shadow-seven

echo "→ Extracting files..."
tar -xzf /tmp/shadow.tar.gz
rm /tmp/shadow.tar.gz

echo "→ Creating .env file..."
if [ ! -f .env ]; then
  cat > .env << 'EOF'
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_APP_NAME=Shadow Seven
VITE_APP_VERSION=4.0.0
VITE_API_URL=http://localhost:3001
NODE_ENV=production
EOF
fi

echo "→ Installing dependencies..."
npm install --legacy-peer-deps 2>&1 | tail -5

echo "→ Building application..."
npm run build 2>&1 | tail -5

echo "✓ Build complete"
REMOTE_SCRIPT

echo "✓ Setup complete"

# Step 4: Start
echo -e "\n[4/4] 🚀 Starting application..."
ssh $SERVER << 'REMOTE_START'
cd /root/nexus/planets/SHADOW-7/shadow-seven

# Install PM2 if needed
if ! command -v pm2 &> /dev/null; then
  echo "Installing PM2..."
  npm install -g pm2
fi

# Stop old version
pm2 delete shadow-seven 2>/dev/null || echo "No previous instance"

# Start new version
pm2 start npm --name "shadow-seven" -- run preview -- --host 0.0.0.0 --port 3002

# Save and show status
pm2 save
echo ""
pm2 list
REMOTE_START

# Cleanup
rm -f /tmp/shadow.tar.gz

# Success
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   ✅ DEPLOYMENT SUCCESSFUL!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Application URL: http://46.224.225.96:3002"
echo ""
echo "📝 Useful commands:"
echo "   View logs:    ssh $SERVER 'pm2 logs shadow-seven'"
echo "   Restart app:  ssh $SERVER 'pm2 restart shadow-seven'"
echo "   Stop app:     ssh $SERVER 'pm2 stop shadow-seven'"
echo "   App status:   ssh $SERVER 'pm2 status'"
echo ""
echo "⚙️  Update .env:   ssh $SERVER 'nano $REMOTE_DIR/.env'"
echo ""
echo "════════════════════════════════════════════════════════════════"
