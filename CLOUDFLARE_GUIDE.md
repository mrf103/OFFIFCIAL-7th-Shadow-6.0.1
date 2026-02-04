# ☁️ Cloudflare Configuration Guide for Shadow Seven

This guide provides detailed instructions for configuring Cloudflare for your Shadow Seven deployment.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [DNS Configuration](#dns-configuration)
3. [SSL/TLS Configuration](#ssltls-configuration)
4. [Security Settings](#security-settings)
5. [Performance Optimization](#performance-optimization)
6. [Page Rules (Optional)](#page-rules-optional)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin:

- ✅ Cloudflare account created
- ✅ Domain added to Cloudflare
- ✅ Nameservers updated to Cloudflare's nameservers
- ✅ Application deployed to server (45.224.225.96)
- ✅ Server is accessible via HTTP

---

## 🌐 DNS Configuration

### Step 1: Access DNS Settings

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your domain from the list
3. Click on **DNS** in the left sidebar
4. Click **Add record** button

### Step 2: Add A Record for Subdomain

Configure the following:

| Setting | Value | Notes |
|---------|-------|-------|
| **Type** | `A` | IPv4 address |
| **Name** | `app` | Or your chosen subdomain (e.g., `shadow`, `platform`, `demo`) |
| **IPv4 address** | `45.224.225.96` | Your server IP |
| **Proxy status** | `Proxied` 🟠 | Orange cloud icon - **IMPORTANT** |
| **TTL** | `Auto` | Automatic TTL |

**Example configurations:**

```
# Main subdomain
Type: A
Name: app
IPv4: 45.224.225.96
Proxy: Proxied (🟠)
→ Results in: https://app.yourdomain.com

# Alternative subdomain names
Type: A
Name: shadow
IPv4: 45.224.225.96
Proxy: Proxied (🟠)
→ Results in: https://shadow.yourdomain.com

# Root domain (if desired)
Type: A
Name: @
IPv4: 45.224.225.96
Proxy: Proxied (🟠)
→ Results in: https://yourdomain.com
```

### Step 3: Add AAAA Record (IPv6) - Optional

If your server supports IPv6:

| Setting | Value |
|---------|-------|
| **Type** | `AAAA` |
| **Name** | `app` |
| **IPv6 address** | `Your IPv6 address` |
| **Proxy status** | `Proxied` 🟠 |

### Step 4: Verify DNS Propagation

```bash
# Check DNS from your local machine
nslookup app.yourdomain.com

# Or use dig
dig app.yourdomain.com

# Online tools
# Visit: https://dnschecker.org
# Enter: app.yourdomain.com
```

**Expected Result:**
- Should resolve to Cloudflare's IP addresses (when proxied)
- Propagation takes 1-5 minutes typically

---

## 🔒 SSL/TLS Configuration

### Step 1: Choose Encryption Mode

1. Go to **SSL/TLS** → **Overview**
2. Choose the appropriate mode:

| Mode | Description | Recommended For |
|------|-------------|-----------------|
| **Off** | ❌ Not recommended | Never use |
| **Flexible** | Cloudflare ↔️ Browser: HTTPS<br>Cloudflare ↔️ Server: HTTP | Quick setup (temporary) |
| **Full** | Cloudflare ↔️ Browser: HTTPS<br>Cloudflare ↔️ Server: HTTPS (self-signed OK) | ✅ **Recommended** - After SSL cert installed |
| **Full (Strict)** | Cloudflare ↔️ Browser: HTTPS<br>Cloudflare ↔️ Server: HTTPS (valid cert required) | Best security (after Let's Encrypt) |

**Recommended Setup Process:**

```
1. Initially: Set to "Flexible"
   → App accessible via HTTPS immediately
   
2. Install Let's Encrypt on server:
   ssh root@45.224.225.96
   certbot --nginx -d app.yourdomain.com
   
3. Change to "Full (Strict)"
   → Maximum security achieved
```

### Step 2: Enable Always Use HTTPS

1. Go to **SSL/TLS** → **Edge Certificates**
2. Enable **Always Use HTTPS**
3. This redirects all HTTP requests to HTTPS

### Step 3: Configure Minimum TLS Version

1. Under **Edge Certificates**
2. Set **Minimum TLS Version** to `TLS 1.2` or higher
3. Click **Save**

### Step 4: Enable Automatic HTTPS Rewrites

1. Under **Edge Certificates**
2. Enable **Automatic HTTPS Rewrites**
3. This fixes mixed content issues

### Step 5: Enable HTTP Strict Transport Security (HSTS)

⚠️ **Warning:** Only enable after testing HTTPS works properly!

1. Scroll to **HTTP Strict Transport Security (HSTS)**
2. Click **Enable HSTS**
3. Recommended settings:
   - Max Age: 6 months (15768000 seconds)
   - Include subdomains: Yes (if all subdomains use HTTPS)
   - Preload: No (initially)
   - No-Sniff Header: Yes

---

## 🛡️ Security Settings

### Step 1: Security Level

1. Go to **Security** → **Settings**
2. Set **Security Level** to:
   - `High` - For maximum protection
   - `Medium` - Balanced (recommended)
   - `Essentially Off` - Minimal protection

**Recommended:** `Medium`

### Step 2: Bot Fight Mode

1. Enable **Bot Fight Mode**
2. This blocks known malicious bots

### Step 3: Browser Integrity Check

1. Enable **Browser Integrity Check**
2. Blocks browsers with bad reputations

### Step 4: Firewall Rules (Optional)

Create custom rules for additional protection:

1. Go to **Security** → **WAF** → **Firewall rules**
2. Click **Create firewall rule**

**Example Rule - Block countries:**
```
Rule Name: Block suspicious countries
Expression: (ip.geoip.country in {"XX" "YY"})
Action: Block
```

**Example Rule - Rate limiting:**
```
Rule Name: Rate limit API
Expression: (http.request.uri.path contains "/api/")
Action: Challenge
```

### Step 5: Enable Cloudflare WAF

1. Go to **Security** → **WAF**
2. Enable **Cloudflare Managed Ruleset**
3. Enable **OWASP Core Ruleset** (if available in your plan)

---

## ⚡ Performance Optimization

### Step 1: Auto Minify

1. Go to **Speed** → **Optimization**
2. Enable **Auto Minify** for:
   - ✅ JavaScript
   - ✅ CSS
   - ✅ HTML

### Step 2: Brotli Compression

1. Under **Optimization**
2. Enable **Brotli** compression

### Step 3: Early Hints

1. Enable **Early Hints** (if available)
2. Speeds up page loads

### Step 4: Rocket Loader (Use with caution)

⚠️ **Warning:** May break React apps!

- **Recommended:** Leave **disabled** for React/SPA applications
- Enable only if tested and working

### Step 5: Caching Configuration

1. Go to **Caching** → **Configuration**
2. Set **Caching Level** to `Standard`
3. Set **Browser Cache TTL** to `4 hours` or `1 day`

### Step 6: Enable Always Online

1. Under **Caching**
2. Enable **Always Online**
3. Serves cached version if server is down

### Step 7: Development Mode (for testing)

When making changes and need to bypass cache:

1. Go to **Caching** → **Configuration**
2. Enable **Development Mode** (active for 3 hours)
3. Don't forget to disable after testing!

---

## 📜 Page Rules (Optional)

Page Rules allow fine-grained control. Examples:

### Rule 1: Cache Static Assets Aggressively

1. Go to **Rules** → **Page Rules**
2. Click **Create Page Rule**

```
URL: app.yourdomain.com/assets/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 1 month
```

### Rule 2: Bypass Cache for API

```
URL: app.yourdomain.com/api/*
Settings:
  - Cache Level: Bypass
```

### Rule 3: Force HTTPS

```
URL: http://app.yourdomain.com/*
Settings:
  - Always Use HTTPS: On
```

**Free Plan:** 3 page rules
**Pro Plan:** 20 page rules

---

## 🔍 Verify Configuration

### Test SSL/TLS

1. Visit: https://www.ssllabs.com/ssltest/
2. Enter: `app.yourdomain.com`
3. Target grade: A or A+

### Test Security Headers

1. Visit: https://securityheaders.com
2. Enter: `app.yourdomain.com`
3. Check for security issues

### Test Performance

1. Visit: https://www.webpagetest.org
2. Enter: `app.yourdomain.com`
3. Check load times and optimization

### Verify DNSSEC (Recommended)

1. Go to **DNS** → **Settings**
2. Enable **DNSSEC**
3. Adds cryptographic signatures to DNS records

---

## 🐛 Troubleshooting

### Issue: "Error 521 - Web server is down"

**Causes:**
- Application not running on server
- Nginx not running
- Server firewall blocking port 80/443

**Solutions:**
```bash
ssh root@45.224.225.96

# Check application
pm2 status
pm2 restart shadow-seven

# Check Nginx
systemctl status nginx
systemctl restart nginx

# Check firewall
ufw status
ufw allow 80/tcp
ufw allow 443/tcp
```

### Issue: "Error 522 - Connection timed out"

**Causes:**
- Server is down
- Firewall blocking Cloudflare IPs
- Application taking too long to respond

**Solutions:**
```bash
# Check server connectivity
ping 45.224.225.96

# Allow Cloudflare IPs
# Get IPs from: https://www.cloudflare.com/ips/
```

### Issue: "Error 525 - SSL handshake failed"

**Causes:**
- SSL/TLS mode set to "Full (Strict)" but no valid certificate on server
- Certificate expired
- Certificate mismatch

**Solutions:**
```bash
# Install/renew certificate
ssh root@45.224.225.96
certbot --nginx -d app.yourdomain.com

# Or change Cloudflare SSL mode to "Full" (not Strict)
```

### Issue: "Too many redirects"

**Causes:**
- SSL/TLS mode conflict
- Nginx redirecting HTTPS to HTTPS

**Solutions:**
1. Set Cloudflare SSL/TLS to "Full" or "Flexible"
2. Check Nginx configuration for redirect loops

### Issue: Mixed Content Warnings

**Causes:**
- Loading HTTP resources on HTTPS page

**Solutions:**
1. Enable **Automatic HTTPS Rewrites** in Cloudflare
2. Update code to use HTTPS or protocol-relative URLs

### Issue: Site not loading/502 Bad Gateway

**Solutions:**
```bash
# Check all services
ssh root@45.224.225.96 'pm2 status && systemctl status nginx'

# Check logs
ssh root@45.224.225.96 'pm2 logs shadow-seven --lines 50'
tail -f /var/log/nginx/error.log

# Restart everything
pm2 restart shadow-seven
systemctl restart nginx
```

---

## 📊 Monitoring & Analytics

### Cloudflare Analytics

1. Go to **Analytics & Logs** → **Traffic**
2. View:
   - Requests over time
   - Bandwidth usage
   - Threats blocked
   - Response codes

### Setup Notifications

1. Go to **Notifications**
2. Add notification for:
   - SSL/TLS certificate expiration
   - Rate limiting threshold
   - DDoS attack detection

---

## ✅ Configuration Checklist

After setup, verify:

- [ ] DNS A record created for subdomain
- [ ] Proxy status is "Proxied" (orange cloud)
- [ ] SSL/TLS mode is "Full" or "Full (Strict)"
- [ ] Always Use HTTPS enabled
- [ ] Minimum TLS 1.2 or higher
- [ ] Auto Minify enabled
- [ ] Brotli compression enabled
- [ ] Security level set appropriately
- [ ] Bot Fight Mode enabled
- [ ] Browser Integrity Check enabled
- [ ] Site accessible via HTTPS
- [ ] SSL Labs test shows A or A+
- [ ] No mixed content warnings
- [ ] Caching working properly

---

## 🎓 Best Practices

1. **Always use Proxy (orange cloud)**
   - Benefits: DDoS protection, caching, security
   - Your server IP is hidden

2. **Enable all security features**
   - WAF, Bot Fight Mode, Browser Integrity Check
   - Use firewall rules for additional protection

3. **Optimize caching**
   - Cache static assets aggressively
   - Use page rules for fine control

4. **Monitor your site**
   - Check analytics regularly
   - Set up notifications for issues

5. **Regular testing**
   - Test after any configuration changes
   - Use development mode during testing

6. **Keep certificates updated**
   - Let's Encrypt renews automatically
   - Monitor expiration dates

---

## 📚 Additional Resources

- [Cloudflare Learning Center](https://www.cloudflare.com/learning/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare API Docs](https://developers.cloudflare.com/api/)
- [Cloudflare Status](https://www.cloudflarestatus.com/)

---

## 🆘 Support

If you need help:

1. Check [Cloudflare Community](https://community.cloudflare.com/)
2. Review [Cloudflare Docs](https://developers.cloudflare.com/)
3. Contact Cloudflare Support (paid plans)
4. Check GitHub Issues for this project

---

*Last updated: 2026-02-03*
