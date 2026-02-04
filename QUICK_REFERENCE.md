# 🚀 Quick Reference - Shadow Seven Deployment

**Server:** 45.224.225.96  
**Domain:** mrf103.com  
**Subdomain:** app.mrf103.com

---

## 📖 Documentation Quick Links

| Document | Purpose |
|----------|---------|
| [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) | Overview - start here |
| [QUICKSTART.md](./QUICKSTART.md) | ⭐ 15-min guide |
| [DEPLOYMENT_MRF103.md](./DEPLOYMENT_MRF103.md) | Complete guide |
| [CLOUDFLARE_GUIDE.md](./CLOUDFLARE_GUIDE.md) | Cloudflare setup |
| [DEPLOYMENT_CHECKLIST_MRF103.md](./DEPLOYMENT_CHECKLIST_MRF103.md) | Checklist |

---

## 🎯 Quick Deploy Commands

### First Time Setup
```bash
# 1. Server setup (once)
scp scripts/server-setup.sh root@45.224.225.96:/tmp/
ssh root@45.224.225.96 'bash /tmp/server-setup.sh'

# 2. Configure environment
ssh root@45.224.225.96 'nano /var/www/shadow-seven/.env'
# Add: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GOOGLE_AI_API_KEY

# 3. Deploy
./scripts/deploy-to-server.sh app.mrf103.com

# 4. Cloudflare: Add A record (app → 45.224.225.96, Proxied)

# 5. SSL certificate
ssh root@45.224.225.96 'certbot --nginx -d app.mrf103.com'
```

### Updates (After First Deploy)
```bash
# One command to redeploy
./scripts/deploy-to-server.sh app.mrf103.com
```

---

## 🔍 Monitoring Commands

```bash
# Check status
ssh root@45.224.225.96 'pm2 status'

# View logs
ssh root@45.224.225.96 'pm2 logs shadow-seven'

# Restart app
ssh root@45.224.225.96 'pm2 restart shadow-seven'

# Check all services
ssh root@45.224.225.96 'pm2 status && systemctl status nginx'

# Edit environment
ssh root@45.224.225.96 'nano /var/www/shadow-seven/.env'
# Then restart: pm2 restart shadow-seven
```

---

## 🌐 Cloudflare Quick Setup

1. **DNS**: Add A record
   - Type: A
   - Name: app
   - IP: 45.224.225.96
   - Proxy: ON (🟠)

2. **SSL/TLS**: 
   - Mode: Full (or Full Strict after SSL cert)
   - Always Use HTTPS: ON

3. **Speed**:
   - Auto Minify: ON (JS, CSS, HTML)
   - Brotli: ON

4. **Security**:
   - Level: Medium
   - Bot Fight Mode: ON
   - Browser Integrity: ON

---

## 🐛 Quick Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Site not loading | `ssh root@45.224.225.96 'pm2 restart shadow-seven && systemctl restart nginx'` |
| Error 521 | Application down - restart PM2 |
| Error 522 | Server timeout - check firewall |
| SSL issues | `certbot --nginx -d app.mrf103.com --force-renewal` |
| Cloudflare cache | Dashboard → Caching → Purge Everything |
| View errors | `ssh root@45.224.225.96 'pm2 logs shadow-seven --err'` |

---

## 📂 Important Paths

| Path | Description |
|------|-------------|
| `/var/www/shadow-seven/` | Application root |
| `/var/www/shadow-seven/.env` | Environment variables |
| `/var/www/shadow-seven/logs/` | Application logs |
| `/etc/nginx/sites-available/shadow-seven` | Nginx config |
| `/var/log/nginx/` | Nginx logs |

---

## 🔐 Environment Variables Template

```bash
# Required
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GOOGLE_AI_API_KEY=your_gemini_key

# Server
PORT=3000
NODE_ENV=production
```

---

## ✅ Quick Health Check

```bash
# All-in-one status check
ssh root@45.224.225.96 'pm2 status && systemctl status nginx && free -h && df -h'

# Test site
curl -I https://app.mrf103.com
```

---

## 🆘 Emergency Commands

```bash
# Restart everything
ssh root@45.224.225.96 'pm2 restart shadow-seven && systemctl restart nginx'

# Stop everything
ssh root@45.224.225.96 'pm2 stop shadow-seven && systemctl stop nginx'

# View all logs
ssh root@45.224.225.96 'pm2 logs shadow-seven --lines 100'

# Restore backup
ssh root@45.224.225.96 'cd /var/www/shadow-seven && ls backup_*.tar.gz'
# Then extract the latest backup
```

---

## 📞 Support Checklist

Before asking for help, check:
- [ ] PM2 status: `pm2 status`
- [ ] Nginx status: `systemctl status nginx`
- [ ] Application logs: `pm2 logs shadow-seven`
- [ ] Nginx error log: `tail -f /var/log/nginx/error.log`
- [ ] Cloudflare DNS settings
- [ ] SSL certificate status
- [ ] .env file exists and has correct values

---

## 🎯 URLs

- **Live Site**: https://app.mrf103.com
- **Server**: ssh root@45.224.225.96
- **Cloudflare**: https://dash.cloudflare.com

---

**Print this card for quick reference!**

*Last updated: 2026-02-03*
