# 🚀 Quick Start Deployment Guide - mrf103.com

**Domain:** mrf103.com  
**Server IP:** 45.224.225.96  
**Subdomain:** app.mrf103.com (or your choice)

---

## 🎯 Complete Deployment in 15 Minutes

Follow these steps to deploy Shadow Seven to your server with Cloudflare subdomain.

---

## Step 1: Server Setup (5 minutes)

Run from your **local machine**:

```bash
# Copy and run server setup script
scp scripts/server-setup.sh root@45.224.225.96:/tmp/
ssh root@45.224.225.96 'bash /tmp/server-setup.sh'
```

This installs Node.js, PM2, Nginx, and required tools.

**✅ Server is now ready for deployment**

---

## Step 2: Configure Environment (2 minutes)

SSH into your server and create environment file:

```bash
ssh root@45.224.225.96
mkdir -p /var/www/shadow-seven
nano /var/www/shadow-seven/.env
```

Paste this configuration (update with your actual keys):

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI
VITE_GOOGLE_AI_API_KEY=your_gemini_api_key

# Production
PORT=3000
NODE_ENV=production
```

Save (Ctrl+X, Y, Enter) and exit.

**✅ Environment configured**

---

## Step 3: Deploy Application (3 minutes)

From your **local machine**:

```bash
# Deploy to server
./scripts/deploy-to-server.sh app.mrf103.com
```

The script will:
- Build the application
- Upload to server
- Configure PM2 and Nginx
- Start the application

**✅ Application deployed and running**

---

## Step 4: Configure Cloudflare DNS (2 minutes)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **mrf103.com**
3. Go to **DNS** → **Add record**

Add this DNS record:

```
Type: A
Name: app
IPv4 address: 45.224.225.96
Proxy status: Proxied (🟠 Orange cloud)
TTL: Auto
```

**Save the record.**

**✅ DNS configured** → Your site: `https://app.mrf103.com`

---

## Step 5: Configure Cloudflare SSL (2 minutes)

1. In Cloudflare, go to **SSL/TLS** → **Overview**
2. Set encryption mode to **Full**
3. Go to **SSL/TLS** → **Edge Certificates**
4. Enable **Always Use HTTPS**

**✅ SSL configured**

---

## Step 6: Install SSL Certificate (1 minute)

```bash
ssh root@45.224.225.96
certbot --nginx -d app.mrf103.com
```

Follow prompts:
- Enter your email
- Agree to terms
- Choose to redirect HTTP to HTTPS: **Yes**

Then in Cloudflare:
- Change SSL/TLS mode to **Full (Strict)**

**✅ SSL certificate installed**

---

## 🎉 Done! Your site is live at:

### https://app.mrf103.com

---

## 📋 Verification Checklist

Verify everything is working:

```bash
# Check application status
ssh root@45.224.225.96 'pm2 status'

# Check Nginx status
ssh root@45.224.225.96 'systemctl status nginx'

# View application logs
ssh root@45.224.225.96 'pm2 logs shadow-seven --lines 20'

# Test the site
curl -I https://app.mrf103.com
```

---

## 🔄 Future Deployments (Updates)

When you need to deploy updates:

```bash
# Simple one-line command
./scripts/deploy-to-server.sh app.mrf103.com
```

---

## 📊 Monitoring Commands

```bash
# Check status
ssh root@45.224.225.96 'pm2 status'

# View logs
ssh root@45.224.225.96 'pm2 logs shadow-seven'

# Restart app
ssh root@45.224.225.96 'pm2 restart shadow-seven'

# Server resources
ssh root@45.224.225.96 'htop'
```

---

## 🐛 Quick Troubleshooting

### Site not loading?

```bash
# Check everything
ssh root@45.224.225.96 'pm2 status && systemctl status nginx'

# Restart everything
ssh root@45.224.225.96 'pm2 restart shadow-seven && systemctl restart nginx'
```

### Need to update environment variables?

```bash
ssh root@45.224.225.96 'nano /var/www/shadow-seven/.env'
# After editing, restart:
ssh root@45.224.225.96 'pm2 restart shadow-seven'
```

---

## 🌐 Alternative Subdomain Options

You can use any subdomain you like:

```bash
# Examples:
./scripts/deploy-to-server.sh shadow.mrf103.com
./scripts/deploy-to-server.sh platform.mrf103.com
./scripts/deploy-to-server.sh demo.mrf103.com
./scripts/deploy-to-server.sh www.mrf103.com
```

Just remember to:
1. Add the DNS record in Cloudflare for each subdomain
2. Run certbot for each subdomain

---

## 📚 Detailed Documentation

For more details, see:
- [SSH_DEPLOYMENT_GUIDE.md](./SSH_DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [CLOUDFLARE_GUIDE.md](./CLOUDFLARE_GUIDE.md) - Cloudflare configuration
- [README.md](./README.md) - Project documentation

---

## 🆘 Need Help?

**Common Issues:**

1. **Cannot SSH to server**
   - Verify: `ssh root@45.224.225.96`
   - Ensure SSH key is configured

2. **Build fails**
   - Run locally: `npm install && npm run build`
   - Check for errors

3. **Cloudflare Error 521**
   - Application not running: `ssh root@45.224.225.96 'pm2 restart shadow-seven'`
   - Nginx not running: `ssh root@45.224.225.96 'systemctl restart nginx'`

4. **SSL Certificate issues**
   - Re-run: `ssh root@45.224.225.96 'certbot --nginx -d app.mrf103.com'`

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ `https://app.mrf103.com` loads without errors
- ✅ SSL certificate shows as valid (green padlock)
- ✅ Application is fully functional
- ✅ No console errors in browser
- ✅ PM2 shows app as "online"
- ✅ Nginx is running

---

## 📞 Support Resources

- **Server Logs:** `/var/www/shadow-seven/logs/`
- **Nginx Logs:** `/var/log/nginx/`
- **PM2 Logs:** `pm2 logs shadow-seven`
- **Documentation:** See guides in repository

---

**Your Shadow Seven platform is now live at https://app.mrf103.com! 🎉**

*Last updated: 2026-02-03*
