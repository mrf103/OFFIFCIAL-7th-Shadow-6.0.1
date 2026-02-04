# 🚀 Deployment Instructions for mrf103.com

This document provides step-by-step instructions for deploying Shadow Seven to server 45.224.225.96 with subdomain on mrf103.com using Cloudflare.

---

## 📋 Overview

**Deployment Details:**
- **Domain:** mrf103.com
- **Server IP:** 45.224.225.96
- **Server User:** root
- **Subdomain:** app.mrf103.com (configurable)
- **Application:** Shadow Seven - Agency in a Box
- **Port:** 3000 (internal)
- **Web Server:** Nginx (reverse proxy)
- **Process Manager:** PM2
- **CDN/Security:** Cloudflare

---

## 🎯 Three Deployment Methods

Choose the method that works best for you:

### Method 1: Automated Deployment (Recommended) ⭐

**Prerequisites:**
- SSH access configured to server
- Node.js and npm installed locally
- Repository cloned

**Steps:**

```bash
# 1. Run server setup (first time only)
scp scripts/server-setup.sh root@45.224.225.96:/tmp/
ssh root@45.224.225.96 'bash /tmp/server-setup.sh'

# 2. Configure environment on server
ssh root@45.224.225.96
nano /var/www/shadow-seven/.env
# Add your Supabase and Gemini API keys, then exit

# 3. Deploy application
./scripts/deploy-to-server.sh app.mrf103.com

# 4. Configure Cloudflare (see Cloudflare section below)

# 5. Install SSL certificate
ssh root@45.224.225.96
certbot --nginx -d app.mrf103.com
```

**✅ Done! Your site is live at https://app.mrf103.com**

---

### Method 2: Manual Deployment

If you prefer manual control:

```bash
# 1. Build locally
npm run build

# 2. Create deployment package
tar -czf deploy.tar.gz dist/ package.json package-lock.json

# 3. Upload to server
scp deploy.tar.gz root@45.224.225.96:/var/www/shadow-seven/

# 4. SSH and extract
ssh root@45.224.225.96
cd /var/www/shadow-seven
tar -xzf deploy.tar.gz
npm install --production

# 5. Start with PM2
pm2 start ecosystem.config.js
pm2 save

# 6. Configure Nginx manually (see Nginx config below)
# 7. Configure Cloudflare (see Cloudflare section below)
```

---

### Method 3: Direct Build on Server

Build directly on the server (requires more server resources):

```bash
# 1. SSH to server
ssh root@45.224.225.96

# 2. Clone repository
cd /var/www
git clone <your-repo-url> shadow-seven
cd shadow-seven

# 3. Install dependencies
npm install

# 4. Build application
npm run build

# 5. Configure environment
cp .env.production .env
nano .env  # Add your API keys

# 6. Start application
pm2 start ecosystem.config.js
pm2 save

# 7. Configure Nginx (already done by setup script)
# 8. Configure Cloudflare (see Cloudflare section below)
```

---

## ☁️ Cloudflare Configuration for mrf103.com

### Step 1: Add DNS Record

1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **mrf103.com** domain
3. Go to **DNS** → **Records**
4. Click **Add record**

**Configuration:**
```
Type: A
Name: app
IPv4 address: 45.224.225.96
Proxy status: Proxied (🟠 Orange cloud) ← IMPORTANT
TTL: Auto
```

5. Click **Save**

**Result:** DNS will point app.mrf103.com → 45.224.225.96 (via Cloudflare)

### Step 2: Configure SSL/TLS

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode: **Full**
3. Go to **Edge Certificates**
4. Enable these settings:
   - ✅ Always Use HTTPS
   - ✅ Automatic HTTPS Rewrites
   - ✅ Minimum TLS Version: 1.2

### Step 3: Security Settings

1. Go to **Security** → **Settings**
2. Set **Security Level:** Medium
3. Enable:
   - ✅ Bot Fight Mode
   - ✅ Browser Integrity Check

### Step 4: Performance Settings

1. Go to **Speed** → **Optimization**
2. Enable:
   - ✅ Auto Minify (JavaScript, CSS, HTML)
   - ✅ Brotli compression

### Step 5: Install SSL Certificate on Server

After Cloudflare is configured:

```bash
ssh root@45.224.225.96
certbot --nginx -d app.mrf103.com
```

Follow the prompts and choose to redirect HTTP to HTTPS.

Then return to Cloudflare:
1. Go to **SSL/TLS** → **Overview**
2. Change encryption mode to: **Full (strict)**

**✅ SSL is now fully configured!**

---

## 🔧 Environment Configuration

Your `.env` file on the server should contain:

```bash
# Location: /var/www/shadow-seven/.env

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini AI
VITE_GOOGLE_AI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3000
NODE_ENV=production

# Feature Flags
VITE_ENABLE_DARK_MODE=true
VITE_ENABLE_AI_SUGGESTIONS=true
VITE_ENABLE_NLP_CACHING=true
```

**To edit:**
```bash
ssh root@45.224.225.96 'nano /var/www/shadow-seven/.env'
# After editing, restart app:
ssh root@45.224.225.96 'pm2 restart shadow-seven'
```

---

## 📝 Nginx Configuration Reference

If you need to manually configure or modify Nginx:

```nginx
# Location: /etc/nginx/sites-available/shadow-seven

server {
    listen 80;
    listen [::]:80;
    server_name app.mrf103.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Proxy to application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**After editing Nginx config:**
```bash
nginx -t                    # Test configuration
systemctl reload nginx      # Reload if test passes
```

---

## 🔄 Deployment Workflow

### Initial Deployment (First Time)

1. ✅ Setup server (run `server-setup.sh`)
2. ✅ Configure environment variables
3. ✅ Deploy application (`deploy-to-server.sh`)
4. ✅ Configure Cloudflare DNS
5. ✅ Install SSL certificate
6. ✅ Test application

### Regular Updates (After Initial Deployment)

```bash
# One command to deploy updates:
./scripts/deploy-to-server.sh app.mrf103.com
```

This will:
- Build latest version
- Backup current deployment
- Upload and extract new version
- Restart application
- Zero downtime deployment

---

## 📊 Monitoring & Maintenance

### Check Application Status

```bash
# Quick status check
ssh root@45.224.225.96 'pm2 status'

# Detailed application info
ssh root@45.224.225.96 'pm2 info shadow-seven'

# View logs (last 50 lines)
ssh root@45.224.225.96 'pm2 logs shadow-seven --lines 50'

# Monitor in real-time
ssh root@45.224.225.96 'pm2 monit'
```

### Application Management

```bash
# Restart application
ssh root@45.224.225.96 'pm2 restart shadow-seven'

# Stop application
ssh root@45.224.225.96 'pm2 stop shadow-seven'

# Start application
ssh root@45.224.225.96 'pm2 start shadow-seven'

# View environment variables
ssh root@45.224.225.96 'pm2 env shadow-seven'
```

### Server Health Checks

```bash
# Check all services
ssh root@45.224.225.96 'pm2 status && systemctl status nginx && df -h'

# Check system resources
ssh root@45.224.225.96 'htop'

# Check disk space
ssh root@45.224.225.96 'df -h'

# Check memory
ssh root@45.224.225.96 'free -h'
```

### View Logs

```bash
# Application logs
ssh root@45.224.225.96 'tail -f /var/www/shadow-seven/logs/out.log'
ssh root@45.224.225.96 'tail -f /var/www/shadow-seven/logs/error.log'

# Nginx logs
ssh root@45.224.225.96 'tail -f /var/log/nginx/access.log'
ssh root@45.224.225.96 'tail -f /var/log/nginx/error.log'

# PM2 logs
ssh root@45.224.225.96 'pm2 logs shadow-seven'
```

---

## 🐛 Troubleshooting

### Issue 1: Cannot access app.mrf103.com

**Check DNS propagation:**
```bash
nslookup app.mrf103.com
# Should show Cloudflare IPs
```

**Check Cloudflare settings:**
- Verify A record exists
- Verify Proxy status is enabled (orange cloud)
- Check SSL/TLS mode is "Full" or "Full (strict)"

**Check server:**
```bash
ssh root@45.224.225.96 'pm2 status && systemctl status nginx'
```

### Issue 2: Cloudflare Error 521

**Meaning:** Web server is down

**Solution:**
```bash
ssh root@45.224.225.96
pm2 restart shadow-seven
systemctl restart nginx
```

### Issue 3: Cloudflare Error 522

**Meaning:** Connection timed out

**Check firewall:**
```bash
ssh root@45.224.225.96
ufw status
ufw allow 80/tcp
ufw allow 443/tcp
```

### Issue 4: Application not starting

**Check logs:**
```bash
ssh root@45.224.225.96 'pm2 logs shadow-seven --err'
```

**Common issues:**
- Missing environment variables
- Port 3000 already in use
- Build artifacts missing

**Solution:**
```bash
ssh root@45.224.225.96
cd /var/www/shadow-seven
# Verify .env exists with correct values
cat .env
# Verify dist directory exists
ls -la dist/
# Restart
pm2 restart shadow-seven
```

### Issue 5: SSL Certificate issues

**Re-run certbot:**
```bash
ssh root@45.224.225.96
certbot --nginx -d app.mrf103.com --force-renewal
```

### Issue 6: Changes not reflecting

**Clear Cloudflare cache:**
1. Go to Cloudflare Dashboard
2. Click **Caching** → **Configuration**
3. Click **Purge Everything**

**Or use development mode temporarily:**
- Enable Development Mode in Cloudflare
- Test changes
- Disable Development Mode

---

## 🔐 Security Checklist

After deployment, verify:

- [ ] SSH key authentication configured
- [ ] Firewall (UFW) enabled and configured
- [ ] Only necessary ports open (22, 80, 443)
- [ ] SSL certificate installed and valid
- [ ] Cloudflare proxy enabled (orange cloud)
- [ ] Security headers configured in Nginx
- [ ] Environment variables not exposed
- [ ] Regular security updates enabled
- [ ] PM2 startup script configured
- [ ] Backups configured

---

## 📈 Performance Checklist

After deployment, verify:

- [ ] Cloudflare caching enabled
- [ ] Gzip/Brotli compression enabled
- [ ] Static assets cached properly
- [ ] No console errors in browser
- [ ] Page load time < 3 seconds
- [ ] SSL Labs grade A or A+
- [ ] All resources loading via HTTPS

---

## 🌐 Multiple Subdomains (Optional)

You can deploy to multiple subdomains:

```bash
# Deploy to different subdomains
./scripts/deploy-to-server.sh app.mrf103.com
./scripts/deploy-to-server.sh demo.mrf103.com
./scripts/deploy-to-server.sh test.mrf103.com
```

For each subdomain:
1. Add DNS A record in Cloudflare
2. Run certbot for the subdomain:
   ```bash
   certbot --nginx -d subdomain.mrf103.com
   ```

---

## 📚 Additional Resources

- [QUICKSTART.md](./QUICKSTART.md) - Quick deployment guide
- [SSH_DEPLOYMENT_GUIDE.md](./SSH_DEPLOYMENT_GUIDE.md) - Detailed deployment guide
- [CLOUDFLARE_GUIDE.md](./CLOUDFLARE_GUIDE.md) - Cloudflare configuration
- [README.md](./README.md) - Project documentation

---

## ✅ Deployment Verification

After deployment, test these:

1. **Access the site:**
   - Visit: https://app.mrf103.com
   - Should load without errors

2. **Check SSL:**
   - Browser shows secure (green padlock)
   - Certificate is valid

3. **Test functionality:**
   - Upload a manuscript
   - Use AI features
   - Export functionality

4. **Check performance:**
   - Page loads quickly
   - No JavaScript errors in console

5. **Verify monitoring:**
   - PM2 shows app as "online"
   - Nginx is running
   - Logs are being written

---

## 🎉 Success!

If all checks pass, your Shadow Seven platform is successfully deployed!

**Your live URL:** https://app.mrf103.com

---

## 📞 Support

If you need help:
- Check troubleshooting section above
- Review logs on server
- Verify Cloudflare configuration
- Contact server administrator

---

*Deployment guide for mrf103.com - Last updated: 2026-02-03*
