# 🚀 Shadow Seven - Server Deployment Guide

**Version:** 4.0.0  
**Target Server:** `root@46.224.225.96`  
**Destination Path:** `/root/nexus/planets/SHADOW-7/shadow-seven`  
**Frontend Port:** 3002  
**Date:** 2026-02-12

---

## 📋 Quick Start

### Option 1: Automated Deployment (Recommended)

```bash
# Navigate to project directory
cd /workspaces/OFFIFCIAL-7th-Shadow-6.0.1

# Run deployment script
bash deploy.sh
```

This will:
- ✓ Verify local files
- ✓ Create remote directories
- ✓ Transfer all project files
- ✓ Install dependencies
- ✓ Build the application
- ✓ Configure PM2 process manager
- ✓ Start the application on port 3002

---

## 🔧 Deployment Scripts

### 1. **deploy.sh** (Main Orchestrator)
- Two-step deployment: Transfer files → Run setup
- Uses SSH without requiring password setup
- **Use this by default**

```bash
bash deploy.sh
```

### 2. **setup-remote.sh** (Remote Setup)
- Runs on the remote server
- Installs dependencies
- Builds the frontend
- Configures PM2
- **Automatically called by deploy.sh**

### 3. **deploy-with-sshpass.sh** (For sshpass users)
- Alternative if you prefer password-based auth
- Requires `sshpass` installed

```bash
bash deploy-with-sshpass.sh mrfiras1Q@@@
```

### 4. **deploy-to-server.sh** (Legacy)
- Full deployment with detailed logging
- Requires interactive SSH setup

---

## 🔐 Authentication Setup

### SSH Key-Based Authentication (Recommended)

```bash
# Generate SSH keys if you don't have them
ssh-keygen -t ed25519 -C "deploy@localhost"

# Copy your public key to the server
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@46.224.225.96

# Test connection
ssh root@46.224.225.96 "echo 'Connected!'"
```

### Password-Based Authentication

If you don't have SSH keys, the script will prompt for password during transfer.

---

## 📦 What Gets Deployed

```
/root/nexus/planets/SHADOW-7/shadow-seven/
├── src/
├── Components/
├── Pages/
├── Entities/
├── api/
├── utils/
├── hooks/
├── styles/
├── public/
├── dist/                  (Built React app)
├── node_modules/          (npm dependencies)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── .env.production        (Configuration)
├── ecosystem.config.js    (PM2 configuration)
├── setup-remote.sh        (Setup script)
├── logs/                  (PM2 logs)
└── ...and more
```

---

## ⚙️ Configuration

### Environment Variables (.env.production)

The deployment script creates `.env.production` on the remote server with default values:

```env
VITE_APP_NAME=Shadow Seven
VITE_ENVIRONMENT=production

# API endpoints (adjust as needed)
VITE_API_BASE=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/realtime

# Supabase configuration (UPDATE WITH REAL VALUES)
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE

# Optional settings
VITE_GEMINI_API_KEY=
VITE_MAX_UPLOAD_SIZE=52428800
VITE_SUPPORTED_FORMATS=pdf,docx,txt,md
```

**⚠️ Important:** Update `VITE_SUPABASE_ANON_KEY` with your actual Supabase anon key!

---

## 📊 Verification

### After Deployment

1. **Check PM2 status:**
   ```bash
   ssh root@46.224.225.96 "pm2 status"
   ```

2. **View application logs:**
   ```bash
   ssh root@46.224.225.96 "pm2 logs shadow-seven-ui --lines 20"
   ```

3. **Test the application:**
   ```bash
   curl -s http://localhost:3002 | head
   ```

4. **Full system health check:**
   ```bash
   ssh root@46.224.225.96 "
       echo '=== PM2 Status ==='
       pm2 status
       echo ''
       echo '=== Latest Logs ==='
       pm2 logs shadow-seven-ui --lines 5 --nostream
   "
   ```

---

## 🔗 Integration with Nexus Ecosystem

According to BOOTSTRAP_FINAL.md, this project is deployed as part of the larger Nexus ecosystem:

```
/root/nexus/
├── arc-core/                          (Nexus Core API - Port 3001)
├── planets/
│   ├── SHADOW-7/
│   │   └── shadow-seven/              (This project - Port 3002)
│   ├── CLONE-HUB/
│   │   └── supabase-master/           (Database - Port 5432, 8000)
│   └── ... (other planet projects)
└── ... (other components)
```

**Architecture Overview:**
- **Nexus Core** (Port 3001) - Backend API
- **Shadow Seven** (Port 3002) - Frontend UI (this project)
- **Supabase** (Port 8000) - Database API Gateway
- **Nginx** (Port 80/443) - Reverse Proxy & SSL

---

## 🛠️ Useful Commands

### SSH to Server
```bash
ssh root@46.224.225.96
```

### Navigate to Project
```bash
cd /root/nexus/planets/SHADOW-7/shadow-seven
```

### PM2 Management
```bash
# View status
pm2 status

# View logs
pm2 logs shadow-seven-ui

# Monitor in real-time
pm2 monit

# Restart application
pm2 restart shadow-seven-ui

# Stop application
pm2 stop shadow-seven-ui

# Start application
pm2 start ecosystem.config.js

# View detailed process info
pm2 show shadow-seven-ui
```

### Rebuild Frontend
```bash
cd /root/nexus/planets/SHADOW-7/shadow-seven
npm run build
pm2 restart shadow-seven-ui
```

### View Build Artifacts
```bash
ls -lah /root/nexus/planets/SHADOW-7/shadow-seven/dist/
```

---

## 🔄 Updating the Application

When you make changes to the frontend:

```bash
# Option 1: From local dev machine (deploy.sh includes latest code)
bash deploy.sh

# Option 2: SSH to server and rebuild
ssh root@46.224.225.96 "
    cd /root/nexus/planets/SHADOW-7/shadow-seven
    git pull origin main  # if using git
    npm run build
    pm2 restart shadow-seven-ui
"
```

---

## 🚨 Troubleshooting

### Application won't start
```bash
# Check logs for errors
pm2 logs shadow-seven-ui --lines 50

# Verify Node.js and npm
node --version
npm --version

# Try rebuilding
npm run build
```

### Permission denied
```bash
# SSH connection fails due to permissions
ssh -i ~/.ssh/id_ed25519 root@46.224.225.96

# Or use password-based auth
ssh root@46.224.225.96
```

### Port already in use
```bash
# Port 3002 might be in use
lsof -i :3002

# Kill existing process or use PM2
pm2 restart shadow-seven-ui
```

### Build fails
```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install --production=false
npm run build
```

### Supabase connection issues
```bash
# Verify API endpoint in .env.production
cat /root/nexus/planets/SHADOW-7/shadow-seven/.env.production

# Test Supabase connectivity
curl -s http://localhost:8000/rest/v1/ -H "apikey: YOUR_ANON_KEY"
```

---

## 📋 Pre-Deployment Checklist

- [ ] SSH access configured to `root@46.224.225.96`
- [ ] Local project files updated
- [ ] `deploy.sh` script executable
- [ ] Sufficient disk space on remote server (2GB minimum)
- [ ] Node.js 18+ available on remote (auto-installed if needed)
- [ ] Network connectivity tested

---

## 🔒 Security Notes

1. **Never commit `.env.production` to git** - It contains secrets
2. **Rotate API keys regularly** - Update VITE_SUPABASE_ANON_KEY
3. **Use SSH keys** - Avoid password-based auth
4. **Enable firewall** - Restrict access to ports 3002, 3001, 8000
5. **Monitor logs** - Check PM2 logs regularly for warnings

---

## 📞 Support

If deployment fails:

1. Check the deployment logs:
   ```bash
   bash deploy.sh 2>&1 | tee deployment.log
   ```

2. Verify remote server status:
   ```bash
   ssh root@46.224.225.96 "
       echo 'Node:' $(node --version)
       echo 'npm:' $(npm --version)
       echo 'PM2:' $(pm2 --version)
       echo 'Disk:' $(df -h / | tail -1)
   "
   ```

3. Check application logs:
   ```bash
   ssh root@46.224.225.96 "pm2 logs shadow-seven-ui --lines 50"
   ```

---

## 📝 Version History

- **v4.0.0** (2026-02-12) - Current deployment setup
- **v3.0.0** - Previous stable version
- **v2.0.0** - Initial production build

---

**Last Updated:** 2026-02-12  
**Status:** ✓ Ready for Deployment
