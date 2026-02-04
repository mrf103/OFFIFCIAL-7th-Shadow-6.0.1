# 🚀 SSH Server Deployment Guide with Cloudflare

This guide explains how to deploy Shadow Seven application to your VPS server (45.224.225.96) and configure it with a Cloudflare subdomain.

## 📋 Overview

This deployment will:
- Deploy the application to your server at `45.224.225.96`
- Set up Nginx as a reverse proxy
- Use PM2 for process management
- Configure Cloudflare for subdomain with SSL/TLS

---

## 🔧 Prerequisites

### On Your Local Machine:
- Node.js 18+ and npm 9+
- SSH access to the server
- Git repository cloned

### On Your Server:
- Ubuntu/Debian Linux
- Root access via SSH: `ssh root@45.224.225.96`
- At least 1GB RAM (2GB recommended)
- Open ports: 22 (SSH), 80 (HTTP), 443 (HTTPS)

### Cloudflare Account:
- Active Cloudflare account
- Domain added to Cloudflare
- Subdomain name decided (e.g., `app.yourdomain.com`)

---

## 📝 Quick Start (3 Steps)

### Step 1: Setup Server (One-Time)

Run this command from your **local machine**:

```bash
# Copy server setup script to your server
scp scripts/server-setup.sh root@45.224.225.96:/tmp/

# SSH into your server and run setup
ssh root@45.224.225.96 'bash /tmp/server-setup.sh'
```

This will install:
- Node.js 20.x
- PM2 process manager
- Nginx web server
- SSL certificate tool (Certbot)
- Required utilities

**⏱️ Estimated time: 5-10 minutes**

---

### Step 2: Configure Environment Variables

Before deploying, you need to set up environment variables on the server:

```bash
# SSH into your server
ssh root@45.224.225.96

# Create the app directory if it doesn't exist
mkdir -p /var/www/shadow-seven

# Create environment file
nano /var/www/shadow-seven/.env
```

Add your production environment variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini AI
VITE_GOOGLE_AI_API_KEY=your_gemini_api_key_here

# API Configuration (optional)
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000

# Feature Flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_AI_SUGGESTIONS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NLP_CACHING=true

# Production Port
PORT=3000
```

Save and exit (Ctrl+X, then Y, then Enter)

---

### Step 3: Deploy Application

From your **local machine**, run:

```bash
# Set environment variables (optional - defaults to values in script)
export SERVER_IP="45.224.225.96"
export SERVER_USER="root"

# Deploy to your subdomain
./scripts/deploy-to-server.sh app.yourdomain.com
```

**What this does:**
1. ✅ Builds your application (`npm run build`)
2. ✅ Creates deployment package
3. ✅ Tests SSH connection
4. ✅ Uploads package to server
5. ✅ Extracts and installs on server
6. ✅ Configures PM2 for process management
7. ✅ Sets up Nginx reverse proxy
8. ✅ Starts the application

**⏱️ Estimated time: 2-5 minutes**

---

## 🌐 Cloudflare Configuration

After deployment, configure Cloudflare DNS:

### Step 1: Add DNS Record

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain
3. Go to **DNS** → **Records**
4. Click **Add record**

**DNS Record Settings:**
```
Type: A
Name: app (or your subdomain)
IPv4 address: 45.224.225.96
Proxy status: Proxied (🟠 Orange cloud)
TTL: Auto
```

5. Click **Save**

### Step 2: Configure SSL/TLS

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to **Full** (or **Full (strict)** if you have a valid SSL certificate)

### Step 3: Enable Security Features (Optional but Recommended)

**Go to Security → Settings:**
- Enable **Bot Fight Mode**
- Set **Security Level** to Medium
- Enable **Browser Integrity Check**

**Go to Speed → Optimization:**
- Enable **Auto Minify** (JavaScript, CSS, HTML)
- Enable **Brotli** compression

---

## 🔒 Setup SSL Certificate (Recommended)

After Cloudflare is configured, add SSL certificate to your server:

```bash
# SSH into your server
ssh root@45.224.225.96

# Install SSL certificate with Let's Encrypt
certbot --nginx -d app.yourdomain.com

# Follow the prompts:
# - Enter your email
# - Agree to terms of service
# - Choose whether to redirect HTTP to HTTPS (recommended: Yes)
```

Certbot will:
- ✅ Obtain SSL certificate
- ✅ Configure Nginx automatically
- ✅ Set up auto-renewal (certificates renew every 90 days)

**Verify auto-renewal:**
```bash
certbot renew --dry-run
```

---

## 🔄 Redeployment (Updates)

When you need to deploy updates:

```bash
# From your local machine
./scripts/deploy-to-server.sh app.yourdomain.com
```

The script will:
- Build the latest version
- Backup the current deployment
- Deploy new version
- Restart the application with zero downtime

---

## 📊 Monitoring & Management

### Check Application Status

```bash
# SSH into server
ssh root@45.224.225.96

# Check PM2 status
pm2 status

# View application logs
pm2 logs shadow-seven

# View last 100 lines
pm2 logs shadow-seven --lines 100

# Monitor in real-time
pm2 monit
```

### Manage Application

```bash
# Restart application
pm2 restart shadow-seven

# Stop application
pm2 stop shadow-seven

# Start application
pm2 start shadow-seven

# View detailed info
pm2 info shadow-seven
```

### Check Nginx Status

```bash
# Check Nginx status
systemctl status nginx

# Test Nginx configuration
nginx -t

# Reload Nginx (after config changes)
systemctl reload nginx

# Restart Nginx
systemctl restart nginx
```

### View System Resources

```bash
# CPU and memory usage
htop

# Disk space
df -h

# Memory usage
free -h

# Network connections
netstat -tulpn | grep :80
netstat -tulpn | grep :3000
```

---

## 🐛 Troubleshooting

### Issue: Cannot connect to server

**Solution:**
```bash
# Test SSH connection
ssh -v root@45.224.225.96

# If connection refused, check:
# 1. Server is running
# 2. Firewall allows port 22
# 3. SSH key is added to server
```

### Issue: Application not starting

**Solution:**
```bash
ssh root@45.224.225.96

# Check PM2 logs
pm2 logs shadow-seven --err

# Check if port 3000 is in use
lsof -i :3000

# Restart application
pm2 restart shadow-seven
```

### Issue: 502 Bad Gateway

**Solution:**
```bash
# Check if application is running
pm2 status

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Restart both services
pm2 restart shadow-seven
systemctl restart nginx
```

### Issue: Cloudflare shows "Error 521"

**Solution:**
- Application is down on server
- Nginx is not running
- Port 80/443 blocked by firewall

```bash
# Check and fix:
systemctl status nginx
pm2 status shadow-seven
ufw status
```

### Issue: Environment variables not working

**Solution:**
```bash
# Verify .env file exists
ssh root@45.224.225.96 'cat /var/www/shadow-seven/.env'

# Edit if needed
ssh root@45.224.225.96 'nano /var/www/shadow-seven/.env'

# Restart application after changes
ssh root@45.224.225.96 'pm2 restart shadow-seven'
```

---

## 🔐 Security Best Practices

### 1. SSH Key Authentication (Highly Recommended)

```bash
# On your local machine, generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your_email@example.com"

# Copy public key to server
ssh-copy-id root@45.224.225.96

# Test key-based login
ssh root@45.224.225.96
```

### 2. Disable Password Authentication

After SSH key is working:

```bash
ssh root@45.224.225.96

# Edit SSH config
nano /etc/ssh/sshd_config

# Set these values:
PermitRootLogin prohibit-password
PasswordAuthentication no
PubkeyAuthentication yes

# Restart SSH
systemctl restart sshd
```

### 3. Setup Firewall

```bash
# Enable UFW
ufw --force enable

# Allow only necessary ports
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS

# Check status
ufw status verbose
```

### 4. Regular Updates

```bash
# Setup automatic security updates
ssh root@45.224.225.96

apt-get install unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

### 5. Backup Strategy

```bash
# Create backup script
ssh root@45.224.225.96

cat > /root/backup-app.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/shadow-seven-$(date +%Y%m%d_%H%M%S).tar.gz \
    -C /var/www/shadow-seven .
# Keep only last 7 backups
ls -t $BACKUP_DIR/*.tar.gz | tail -n +8 | xargs rm -f
EOF

chmod +x /root/backup-app.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line: 0 2 * * * /root/backup-app.sh
```

---

## 📈 Performance Optimization

### 1. Enable Gzip Compression (Already configured in Nginx)

The deployment script already adds gzip configuration to Nginx.

### 2. Cloudflare Caching

In Cloudflare Dashboard:
- Go to **Caching** → **Configuration**
- Set **Caching Level** to "Standard"
- Enable **Always Online**

### 3. PM2 Clustering (for high traffic)

```bash
ssh root@45.224.225.96

# Edit ecosystem.config.js
nano /var/www/shadow-seven/ecosystem.config.js

# Change instances to use all CPU cores:
instances: 'max',  # or specific number like 2, 4

# Restart with new config
pm2 restart ecosystem.config.js
```

---

## 📋 Deployment Checklist

Before going live, ensure:

- [ ] Server setup completed successfully
- [ ] Environment variables configured
- [ ] Application deployed and running
- [ ] Cloudflare DNS configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] PM2 startup script enabled
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Application tested on subdomain
- [ ] Error logs checked
- [ ] Performance verified

---

## 🆘 Support & Resources

### Logs Location
- **Application Logs:** `/var/www/shadow-seven/logs/`
- **Nginx Access:** `/var/log/nginx/access.log`
- **Nginx Error:** `/var/log/nginx/error.log`
- **PM2 Logs:** `~/.pm2/logs/`

### Useful Commands
```bash
# Full system status
ssh root@45.224.225.96 'pm2 status && systemctl status nginx && df -h && free -h'

# Restart everything
ssh root@45.224.225.96 'pm2 restart all && systemctl restart nginx'

# View all logs
ssh root@45.224.225.96 'pm2 logs --lines 50'
```

### Documentation Links
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Cloudflare Docs](https://developers.cloudflare.com/)
- [Let's Encrypt](https://letsencrypt.org/docs/)

---

## ✅ Success!

If everything is working correctly, you should be able to access your application at:

- **🌐 Your Subdomain:** `https://app.yourdomain.com`
- **🔒 Secured with SSL/TLS**
- **☁️ Protected by Cloudflare**
- **⚡ Optimized and cached**

**Congratulations on your successful deployment!** 🎉

---

## 📞 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review server logs
3. Verify Cloudflare configuration
4. Open an issue on GitHub

---

*Last updated: 2026-02-03*
