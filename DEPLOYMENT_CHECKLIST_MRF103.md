# 📋 Deployment Checklist for mrf103.com

Use this checklist to ensure a successful deployment of Shadow Seven to app.mrf103.com.

---

## Pre-Deployment Checklist

### Local Environment
- [ ] Node.js 18+ installed
- [ ] npm 9+ installed
- [ ] Git repository cloned
- [ ] SSH access to server configured
- [ ] SSH key added to server (recommended)

### Server Access
- [ ] Can SSH to server: `ssh root@45.224.225.96`
- [ ] Server is running Ubuntu/Debian Linux
- [ ] Server has at least 1GB RAM (2GB recommended)
- [ ] Ports 22, 80, 443 are accessible

### Required API Keys
- [ ] Supabase URL obtained
- [ ] Supabase Anon Key obtained
- [ ] Google Gemini API Key obtained
- [ ] All keys are valid and working

### Cloudflare Account
- [ ] Cloudflare account created
- [ ] Domain mrf103.com added to Cloudflare
- [ ] Nameservers updated to Cloudflare
- [ ] DNS is active (can take 24-48 hours initially)

---

## Phase 1: Server Setup

### Step 1: Initial Server Configuration
- [ ] Copy server setup script: `scp scripts/server-setup.sh root@45.224.225.96:/tmp/`
- [ ] Run server setup: `ssh root@45.224.225.96 'bash /tmp/server-setup.sh'`
- [ ] Verify Node.js installed: `ssh root@45.224.225.96 'node --version'`
- [ ] Verify PM2 installed: `ssh root@45.224.225.96 'pm2 --version'`
- [ ] Verify Nginx installed: `ssh root@45.224.225.96 'nginx -v'`

### Step 2: Firewall Configuration
- [ ] UFW enabled: `ssh root@45.224.225.96 'ufw status'`
- [ ] Port 22 allowed (SSH)
- [ ] Port 80 allowed (HTTP)
- [ ] Port 443 allowed (HTTPS)

### Step 3: Application Directory
- [ ] Directory created: `ssh root@45.224.225.96 'ls -la /var/www/shadow-seven'`
- [ ] Correct permissions set

---

## Phase 2: Environment Configuration

### Step 1: Create .env File
- [ ] SSH to server: `ssh root@45.224.225.96`
- [ ] Create directory: `mkdir -p /var/www/shadow-seven`
- [ ] Create .env file: `nano /var/www/shadow-seven/.env`
- [ ] Add Supabase URL
- [ ] Add Supabase Anon Key
- [ ] Add Google Gemini API Key
- [ ] Set PORT=3000
- [ ] Set NODE_ENV=production
- [ ] Save and exit

### Step 2: Verify Environment
- [ ] .env file exists: `ssh root@45.224.225.96 'cat /var/www/shadow-seven/.env'`
- [ ] All required keys are present
- [ ] No syntax errors in .env file

---

## Phase 3: Application Deployment

### Step 1: Build Application
- [ ] Local build successful: `npm run build`
- [ ] dist/ directory created
- [ ] No build errors
- [ ] Build size is reasonable (~1-2 MB)

### Step 2: Run Deployment Script
- [ ] Execute: `./scripts/deploy-to-server.sh app.mrf103.com`
- [ ] SSH connection successful
- [ ] Package uploaded successfully
- [ ] Package extracted on server
- [ ] Dependencies installed
- [ ] PM2 configured
- [ ] Nginx configured
- [ ] Application started

### Step 3: Verify Deployment
- [ ] Application running: `ssh root@45.224.225.96 'pm2 status'`
- [ ] Status shows "online"
- [ ] No error logs: `ssh root@45.224.225.96 'pm2 logs shadow-seven --lines 20'`
- [ ] Nginx running: `ssh root@45.224.225.96 'systemctl status nginx'`

---

## Phase 4: Cloudflare Configuration

### Step 1: DNS Configuration
- [ ] Login to Cloudflare Dashboard
- [ ] Select mrf103.com domain
- [ ] Go to DNS → Records
- [ ] Add A record:
  - Type: A
  - Name: app
  - IPv4: 45.224.225.96
  - Proxy: Proxied (🟠 Orange cloud)
  - TTL: Auto
- [ ] Record saved successfully
- [ ] DNS propagation check: `nslookup app.mrf103.com`

### Step 2: SSL/TLS Configuration
- [ ] Go to SSL/TLS → Overview
- [ ] Set encryption mode: Full
- [ ] Go to Edge Certificates
- [ ] Enable "Always Use HTTPS"
- [ ] Enable "Automatic HTTPS Rewrites"
- [ ] Set Minimum TLS Version: 1.2

### Step 3: Security Settings
- [ ] Go to Security → Settings
- [ ] Set Security Level: Medium
- [ ] Enable Bot Fight Mode
- [ ] Enable Browser Integrity Check

### Step 4: Performance Settings
- [ ] Go to Speed → Optimization
- [ ] Enable Auto Minify (JavaScript, CSS, HTML)
- [ ] Enable Brotli compression
- [ ] Disable Rocket Loader (can break React apps)

### Step 5: Caching Settings
- [ ] Go to Caching → Configuration
- [ ] Caching Level: Standard
- [ ] Browser Cache TTL: 4 hours
- [ ] Enable Always Online

---

## Phase 5: SSL Certificate Installation

### Step 1: Install Certbot Certificate
- [ ] SSH to server: `ssh root@45.224.225.96`
- [ ] Run certbot: `certbot --nginx -d app.mrf103.com`
- [ ] Enter email address
- [ ] Agree to Terms of Service
- [ ] Choose to redirect HTTP to HTTPS: Yes
- [ ] Certificate installed successfully
- [ ] Nginx reloaded automatically

### Step 2: Update Cloudflare SSL Mode
- [ ] Return to Cloudflare Dashboard
- [ ] Go to SSL/TLS → Overview
- [ ] Change encryption mode to: Full (strict)
- [ ] Save changes

### Step 3: Verify SSL
- [ ] Visit: https://app.mrf103.com
- [ ] Browser shows secure (green padlock)
- [ ] No certificate warnings
- [ ] Check SSL Labs: https://www.ssllabs.com/ssltest/
- [ ] Target grade: A or A+

---

## Phase 6: Testing & Verification

### Accessibility Tests
- [ ] Visit: http://app.mrf103.com (should redirect to HTTPS)
- [ ] Visit: https://app.mrf103.com (should load)
- [ ] Visit: http://45.224.225.96 (should show app or Nginx default)
- [ ] Application loads without errors

### Functionality Tests
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] Upload manuscript feature works
- [ ] AI features are accessible
- [ ] Export functionality works
- [ ] No console errors in browser DevTools

### Performance Tests
- [ ] Page load time < 3 seconds
- [ ] No 404 errors for assets
- [ ] Images and fonts load correctly
- [ ] Smooth navigation between pages

### Mobile Tests
- [ ] Site responsive on mobile
- [ ] Touch interactions work
- [ ] Text is readable
- [ ] No horizontal scrolling

---

## Phase 7: Monitoring Setup

### PM2 Monitoring
- [ ] PM2 startup configured: `ssh root@45.224.225.96 'pm2 startup'`
- [ ] PM2 configuration saved: `ssh root@45.224.225.96 'pm2 save'`
- [ ] Test restart: `ssh root@45.224.225.96 'pm2 restart shadow-seven'`
- [ ] Monitor logs: `ssh root@45.224.225.96 'pm2 logs shadow-seven'`

### Log Files
- [ ] Application logs exist: `/var/www/shadow-seven/logs/`
- [ ] Nginx access log: `/var/log/nginx/access.log`
- [ ] Nginx error log: `/var/log/nginx/error.log`
- [ ] Logs are being written
- [ ] No critical errors in logs

### Health Checks
- [ ] Create health check script (optional)
- [ ] Setup monitoring service (optional - Uptime Robot, etc.)
- [ ] Configure Cloudflare notifications

---

## Phase 8: Security Hardening

### SSH Security
- [ ] SSH key authentication working
- [ ] Test key-based login
- [ ] (Optional) Disable password authentication
- [ ] (Optional) Disable root login
- [ ] SSH port is 22 (or custom port if changed)

### Firewall
- [ ] UFW status: active
- [ ] Only necessary ports open
- [ ] Test from external network

### Application Security
- [ ] Environment variables not exposed
- [ ] .env file not accessible via web
- [ ] Security headers configured in Nginx
- [ ] HTTPS enforced (no HTTP access)
- [ ] Cloudflare security features enabled

### Backups
- [ ] Backup script created (optional)
- [ ] Test backup/restore process
- [ ] Schedule automated backups (optional)

---

## Phase 9: Documentation

### Update Documentation
- [ ] Document custom configurations
- [ ] Note any deviations from standard setup
- [ ] Document API keys used (without exposing them)
- [ ] Record deployment date and version

### Share Access (if team deployment)
- [ ] Share server access credentials securely
- [ ] Share Cloudflare access
- [ ] Share API keys securely
- [ ] Document who has access

---

## Phase 10: Post-Deployment

### Immediate Actions
- [ ] Announce deployment
- [ ] Share URL: https://app.mrf103.com
- [ ] Test with real users
- [ ] Monitor for issues

### Within 24 Hours
- [ ] Check error logs
- [ ] Review Cloudflare analytics
- [ ] Check for any 4xx/5xx errors
- [ ] Verify SSL certificate auto-renewal configured

### Within 1 Week
- [ ] Review performance metrics
- [ ] Check server resources (CPU, RAM, disk)
- [ ] Optimize if needed
- [ ] Update documentation with lessons learned

---

## Troubleshooting Checklist

If issues arise, check:

### Site Not Loading
- [ ] DNS propagation complete
- [ ] Cloudflare proxy enabled
- [ ] Server firewall allows traffic
- [ ] Nginx is running
- [ ] PM2 shows app as online
- [ ] Check Cloudflare status page

### SSL Issues
- [ ] Certificate installed correctly
- [ ] Certificate not expired
- [ ] Cloudflare SSL mode correct
- [ ] Nginx SSL configuration correct

### Application Errors
- [ ] Environment variables correct
- [ ] API keys are valid
- [ ] No build errors
- [ ] Dependencies installed
- [ ] Check application logs

### Performance Issues
- [ ] Cloudflare caching enabled
- [ ] Compression enabled
- [ ] No large unoptimized assets
- [ ] Server has sufficient resources

---

## Rollback Plan

If deployment fails:

### Quick Rollback
- [ ] Previous backup exists: `ssh root@45.224.225.96 'ls /var/www/shadow-seven/backup_*.tar.gz'`
- [ ] Restore backup:
  ```bash
  ssh root@45.224.225.96
  cd /var/www/shadow-seven
  tar -xzf backup_YYYYMMDD_HHMMSS.tar.gz
  pm2 restart shadow-seven
  ```

### Nuclear Option
- [ ] Stop application: `pm2 stop shadow-seven`
- [ ] Remove Cloudflare DNS record
- [ ] Investigate and fix issue
- [ ] Redeploy when ready

---

## Success Criteria

Deployment is successful when ALL are true:

- ✅ https://app.mrf103.com loads without errors
- ✅ SSL certificate shows as valid (green padlock)
- ✅ All features work correctly
- ✅ No JavaScript errors in console
- ✅ PM2 shows app as "online"
- ✅ Nginx is running and configured correctly
- ✅ Cloudflare proxy is enabled
- ✅ Security features are enabled
- ✅ Performance is acceptable (< 3s load time)
- ✅ Mobile responsive
- ✅ Monitoring is configured
- ✅ Logs are accessible
- ✅ Backup strategy in place

---

## Quick Commands Reference

```bash
# Check status
ssh root@45.224.225.96 'pm2 status && systemctl status nginx'

# View logs
ssh root@45.224.225.96 'pm2 logs shadow-seven --lines 50'

# Restart app
ssh root@45.224.225.96 'pm2 restart shadow-seven'

# Edit environment
ssh root@45.224.225.96 'nano /var/www/shadow-seven/.env'

# Test deployment
curl -I https://app.mrf103.com

# Redeploy
./scripts/deploy-to-server.sh app.mrf103.com
```

---

## Support Resources

- **Quick Start:** [QUICKSTART.md](./QUICKSTART.md)
- **Deployment Guide:** [DEPLOYMENT_MRF103.md](./DEPLOYMENT_MRF103.md)
- **SSH Guide:** [SSH_DEPLOYMENT_GUIDE.md](./SSH_DEPLOYMENT_GUIDE.md)
- **Cloudflare Guide:** [CLOUDFLARE_GUIDE.md](./CLOUDFLARE_GUIDE.md)

---

**Print this checklist and check off items as you complete them!**

*Last updated: 2026-02-03*
