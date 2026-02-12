plan
# ════════════════════════════════════════════════════════════════
# NEXUS PRIME — FULL-STACK BOOTSTRAP v3.0 (FINAL)
# ════════════════════════════════════════════════════════════════
# Classification: EXECUTIVE DIRECTIVE
# Protocol: Solar System v15.1-ARC2.0
# Date: 2026-02-12
# ════════════════════════════════════════════════════════════════
#
# YOU ARE: An AI Build Engineer with full terminal access on an
# Ubuntu production server (24GB RAM).
#
# YOUR MISSION: Systematically build, verify, and activate the
# NEXUS sovereign digital ecosystem — one phase at a time.
#
# RULES:
# 1. Complete each phase FULLY before moving to the next
# 2. VERIFY every step — if verification fails, FIX before continuing
# 3. ALL processes MUST run under PM2 — NEVER use '&' to background
# 4. Never modify the 16 frozen API endpoints
# 5. All data access through API — never direct browser-to-Supabase
# 6. Report status after each phase completion
# 7. If a file path doesn't exist, search nearby directories first
# 8. Log all actions for audit trail
#
# START: Read this entire file, then begin with Phase 0.
# ════════════════════════════════════════════════════════════════


# ┌─────────────────────────────────────────────┐
# │          ARCHITECTURE REFERENCE              │
# └─────────────────────────────────────────────┘

## System Components

| Component          | Tech Stack               | Port   | Path                                                          |
|--------------------|--------------------------|--------|---------------------------------------------------------------|
| Nexus Core         | Node.js / Express        | 3001   | /root/nexus/arc-core/ (or search for server.js in /root/nexus)|
| Shadow Seven       | React 18 / Vite          | 3002   | /root/nexus/planets/SHADOW-7/shadow-seven/                    |
| X-Bio Gateway      | Python Flask              | 5000   | /root/xbio_gateway.py                                         |
| Supabase DB        | PostgreSQL 15 + pgvector | 5432   | /root/nexus/planets/CLONE-HUB/supabase-master/docker/         |
| Supabase API       | Kong API Gateway          | 8000   | (exposed by Supabase Docker stack)                            |
| Supabase Realtime  | Elixir                    | 4000   | (exposed by Supabase Docker stack)                            |
| Supabase Auth      | GoTrue                    | 9999   | (exposed by Supabase Docker stack)                            |
| Nginx Proxy        | Reverse Proxy + SSL      | 80/443 | /etc/nginx/sites-available/                                   |
| Ollama AI          | 9 local LLM models       | 11434  | Local (llama3, mistral, qwen2.5, deepseek-r1, etc.)          |
| Domain             | app.mrf103.com            | —      | DNS pre-configured                                            |

## Agent Hierarchy (Solar System Protocol)

The system has 31 entities split into two tiers:

### Sovereign Core — 13 entities (LLM-powered, have "Right to Think"):
- **Sun (1)**: Mr.F — Supreme Strategy. Model: gpt-4o. Permission: ABSOLUTE (10). Always active.
- **Moon (1)**: The Operator — Daily ops & interface. Model: gpt-4o-mini. Permission: APPROVE (4). Always active.
- **Planets (11)**: Sector Commanders. Lazy-loaded — only activate when needed:
  - ACTIVE at boot: Dev (Engineering), Scent (X-Bio), Cipher (Security), Ops (Infrastructure)
  - STANDBY: Vault (Finance), Lexis (Legal), Data (Analytics)
  - S0_NULL (placeholder, zero resources): Nova (R&D), Harmony (Wellness), Media (PR), Commerce (Sales)

### Silent Workforce — 18 entities (Deterministic scripts, NO LLM, zero hallucination):
1. LogRotator (cron, 0 2 * * *) — compresses old logs nightly
2. LinterBot (pre-commit hook) — checks syntax, rejects errors
3. PingGuard (systemd timer, 60s) — heartbeat every minute
4. SensorReader (MQTT listener, xbio/#) — reads BME688 raw data
5. BackupGuard (cron, 0 3 * * *) — incremental DB backup
6. CertWatcher (cron, weekly) — SSL cert expiry check
7. DiskSentinel (timer, 300s) — disk usage alert at 80%
8. DocBuilder (on-demand) — auto-generate PDF reports
9. MailRelay (queue worker) — queue and send notifications
10. SchemaValidator (boot phase 1) — validates DB schema integrity
11. EnvChecker (boot phase 0) — validates .env files
12. PortScanner (boot phase 0) — checks port availability
13. MetricsCollector (timer, 300s) — CPU/RAM/disk metrics
14. GitWatcher (webhook) — monitors repo for pushes
15. TokenRefresher (cron, 0 */6 * * *) — refreshes API tokens
16. QueueFlusher (worker, 30s) — flushes pending task queues
17. ImageOptimizer (event trigger) — compresses uploaded images
18. HealthProbe (HTTP endpoint /health) — full system health check

## Key Files Reference
- brain_manifest.json — agent definitions (update with Solar System schema below)
- arc_activate_all.js — cold boot sequence (seeds agents + history)
- deploy.sh — atomic deployment script
- ARC_FINAL_STATE.md — 7 architectural invariants
- server.js — Nexus Core entry point
- workflow-engine.js — task orchestration
- event-ledger.ts — event bus persistence
- comm.notify_telegram.js — critical notification nerve (Telegram)
- xbio_gateway.py — IoT telemetry server
- xbio_logs.jsonl — sensor data logs
- ProcessingEngine.tsx — Shadow Seven core rendering

## Database Tables (PostgreSQL + pgvector)
Core: arc_agents, arc_command_log, agent_events, team_tasks, executive_summaries, system_config, activity_feed
Shadow Seven: manuscripts, cover_designs, compliance_rules
X-Bio: sensor_readings, device_alerts, smell_profiles (pgvector, dim=1536)

## Frozen API Endpoints (16 + WebSocket — NEVER modify names/paths)
GET  /api/arc/status
GET  /api/arc/agents
POST /api/arc/agents/activate
GET  /api/arc/tasks
POST /api/arc/tasks
PUT  /api/arc/tasks/:id
GET  /api/arc/missions
POST /api/arc/mission
GET  /api/arc/commands
POST /api/arc/execute
GET  /api/arc/events
GET  /api/arc/summaries
GET  /api/arc/config
PUT  /api/arc/config
GET  /api/arc/modules
POST /api/arc/modules/initialize
WS   /realtime

## Architectural Invariants (from ARC_FINAL_STATE.md — NEVER violate)
1. Single Frontend Source: client/ directory only
2. Backend Data Proxy: No direct browser-to-Supabase, all via /api/arc/*
3. Session-Based Authority: Single operator, HttpOnly cookies, no multi-user/OAuth
4. Rate Limiting: 120 req/min default
5. Frozen API Contract: above endpoints are immutable
6. Immutable Baseline: v0.1-baseline tag (commit d3026b4)
7. Mandatory Governance: ADR required for fundamental changes


# ┌─────────────────────────────────────────────┐
# │          PHASE 0: PREREQUISITES              │
# └─────────────────────────────────────────────┘

## 0.1 — Verify Node.js 18+
```bash
node --version
# If not installed or < 18:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs
npm --version
```

## 0.2 — Install PM2 (Process Manager — MANDATORY)
```bash
npm install -g pm2
pm2 startup
# Copy and run the command it outputs (e.g., sudo env PATH=... pm2 startup systemd ...)
```

## 0.3 — Verify Docker
```bash
systemctl status docker
# If not running:
sudo systemctl start docker && sudo systemctl enable docker
docker --version
docker-compose --version
```

## 0.4 — Install Certbot for SSL
```bash
apt install -y certbot python3-certbot-nginx
```

## 0.5 — Verify Python 3
```bash
python3 --version
pip3 --version
```

## CHECKPOINT PHASE 0:
- [ ] node >= 18?
- [ ] pm2 installed and startup configured?
- [ ] docker running?
- [ ] certbot installed?
- [ ] python3 available?
→ ALL YES? Proceed to Phase 1.


# ┌─────────────────────────────────────────────┐
# │     PHASE 1: INFRASTRUCTURE (Supabase)       │
# └─────────────────────────────────────────────┘

## 1.1 — Navigate to Supabase Docker
```bash
cd /root/nexus/planets/CLONE-HUB/supabase-master/docker
# If this path doesn't exist, search:
find /root/nexus -name "docker-compose.yml" -path "*supabase*" 2>/dev/null
```

## 1.2 — Inspect docker-compose
```bash
cat docker-compose.yml | head -50
```

## 1.3 — Configure environment
```bash
ls -la .env || cp .env.example .env
# IMPORTANT: Edit .env and verify/set these values:
# POSTGRES_PASSWORD=<strong-password>
# JWT_SECRET=<your-jwt-secret>
# ANON_KEY=<your-anon-key>
# SERVICE_ROLE_KEY=<your-service-role-key>
# SITE_URL=https://app.mrf103.com
# Note down ANON_KEY and SERVICE_ROLE_KEY — you need them in Phase 2 and 3.
```

## 1.4 — Start all containers
```bash
docker-compose up -d
echo "Waiting 30 seconds for PostgreSQL to initialize..."
sleep 30
```

## 1.5 — Verify ALL containers running
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
# Expected containers: postgres, kong, gotrue, realtime, storage, rest, meta
# CRITICAL: Kong must expose port 8000 — this is the API gateway for the frontend
```

## 1.6 — Verify Kong API Gateway
```bash
curl -s http://localhost:8000/rest/v1/ -H "apikey: YOUR_ANON_KEY" | head -10
# Should return JSON (even empty), NOT "connection refused"
```

## 1.7 — Apply database migrations
```bash
for f in $(find ../supabase/migrations/ -name "*.sql" | sort); do
    echo "Applying migration: $f"
    docker exec -i supabase-db psql -U postgres -d postgres < "$f"
done
# If no migrations directory found, search:
find /root/nexus -path "*/migrations/*.sql" 2>/dev/null | head -20
```

## 1.8 — Seed data (if seed file exists)
```bash
SEED=$(find /root/nexus -name "seed.sql" 2>/dev/null | head -1)
if [ -n "$SEED" ]; then
    echo "Applying seed: $SEED"
    docker exec -i supabase-db psql -U postgres -d postgres < "$SEED"
fi
```

## 1.9 — Verify pgvector extension
```bash
docker exec supabase-db psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"
docker exec supabase-db psql -U postgres -c "SELECT extname FROM pg_extension WHERE extname='vector';"
```

## 1.10 — Verify critical tables
```bash
docker exec supabase-db psql -U postgres -c "\dt" | grep -E "arc_agents|manuscripts|sensor_readings|smell_profiles|system_config"
# If tables don't exist yet, they may be created by the application on first run.
```

## CHECKPOINT PHASE 1:
- [ ] All Docker containers running? (`docker ps` shows 7+ containers)
- [ ] Kong API accessible on port 8000?
- [ ] PostgreSQL accepting connections on port 5432?
- [ ] Migrations applied (or migration files located)?
- [ ] pgvector extension active?
→ ALL YES? Proceed to Phase 2.


# ┌─────────────────────────────────────────────┐
# │     PHASE 2: NEXUS CORE BACKEND (Port 3001)  │
# └─────────────────────────────────────────────┘

## 2.1 — Find and navigate to core
```bash
cd /root/nexus/arc-core
# If this path doesn't exist:
find /root/nexus -name "server.js" -path "*arc*" 2>/dev/null
# Or search for the package.json:
find /root/nexus -name "package.json" -exec grep -l "express" {} \; 2>/dev/null
```

## 2.2 — Install dependencies
```bash
npm install
# If errors:
rm -rf node_modules package-lock.json && npm install
```

## 2.3 — Configure environment variables
```bash
cat > .env << 'ENVEOF'
PORT=3001
NODE_ENV=production

# Supabase — use Kong API port 8000, NOT raw postgres 5432
SUPABASE_URL=http://localhost:8000
SUPABASE_ANON_KEY=PASTE_YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=PASTE_YOUR_SERVICE_ROLE_KEY_HERE

# AI — for cognitive agents (Sun/Moon/Planets)
OPENAI_API_KEY=sk-PASTE_YOUR_KEY_HERE

# Security
ARC_BACKEND_SECRET=GENERATE_A_STRONG_RANDOM_STRING_HERE
JWT_SECRET=SAME_AS_SUPABASE_JWT_SECRET
SESSION_SECRET=GENERATE_ANOTHER_STRONG_STRING_HERE

# Rate Limiting
RATE_LIMIT_MAX=120
RATE_LIMIT_WINDOW_MS=60000
ENVEOF

# IMPORTANT: Replace ALL placeholder values with real keys!
# Get ANON_KEY and SERVICE_ROLE_KEY from the Supabase .env file (Phase 1).
```

## 2.4 — Start with PM2
```bash
pm2 start server.js --name "nexus-core" --max-memory-restart 512M
pm2 save
```

## 2.5 — Verify startup
```bash
sleep 5
pm2 status
pm2 logs nexus-core --lines 20
# Look for: "Listening on port 3001" or similar
```

## 2.6 — Test health endpoint
```bash
curl -s http://localhost:3001/api/arc/status | python3 -m json.tool
```

## 2.7 — Test frozen endpoints
```bash
for ep in status agents tasks missions commands events summaries config modules; do
    CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/arc/$ep)
    echo "/api/arc/$ep → $CODE"
done
```

## 2.8 — Test WebSocket
```bash
curl -s -o /dev/null -w "%{http_code}" \
  -H "Connection: Upgrade" -H "Upgrade: websocket" \
  http://localhost:3001/realtime
# 101 = upgrade successful, 400 = endpoint exists but needs proper WS client
```

## CHECKPOINT PHASE 2:
- [ ] `pm2 status` shows nexus-core "online"?
- [ ] No crash loops in `pm2 logs`?
- [ ] `/api/arc/status` returns JSON?
- [ ] Most endpoints return 200 or 401 (not 404)?
→ ALL YES? Proceed to Phase 3.


# ┌─────────────────────────────────────────────┐
# │   PHASE 3: SHADOW SEVEN FRONTEND (Port 3002) │
# └─────────────────────────────────────────────┘

## 3.1 — Navigate to frontend
```bash
cd /root/nexus/planets/SHADOW-7/shadow-seven
# If not found:
find /root/nexus -name "package.json" -exec grep -l "vite\|react" {} \; 2>/dev/null
```

## 3.2 — Install dependencies
```bash
npm install
```

## 3.3 — Configure production environment
```bash
cat > .env.production << 'ENVEOF'
# For now, point directly to Kong. After Phase 5 (Nginx), we'll update to domain URLs.
VITE_SUPABASE_URL=http://localhost:8000
VITE_SUPABASE_ANON_KEY=PASTE_YOUR_ANON_KEY_HERE
ENVEOF
```

## 3.4 — Build for production
```bash
npm run build
# Should create a dist/ directory
ls -la dist/
```

## 3.5 — Serve with PM2
```bash
# Install serve globally if not present
npm install -g serve
pm2 start "serve -s dist -l 3002" --name "shadow-seven-ui"
pm2 save
```

## 3.6 — Verify
```bash
sleep 3
pm2 status
curl -s http://localhost:3002 | head -5
# Should return HTML with React app shell
```

## CHECKPOINT PHASE 3:
- [ ] `pm2 status` shows shadow-seven-ui "online"?
- [ ] Port 3002 returns HTML?
→ ALL YES? Proceed to Phase 4.


# ┌─────────────────────────────────────────────┐
# │   PHASE 4: AGENT ACTIVATION (Operation Spell)│
# └─────────────────────────────────────────────┘

## 4.1 — Find activation script
```bash
find /root/nexus -name "arc_activate_all.js" 2>/dev/null
```

## 4.2 — Find and backup brain manifest
```bash
MANIFEST=$(find /root/nexus -name "brain_manifest.json" 2>/dev/null | head -1)
echo "Found manifest at: $MANIFEST"
if [ -n "$MANIFEST" ]; then
    cp "$MANIFEST" "${MANIFEST}.backup.$(date +%s)"
    echo "Backup created"
fi
```

## 4.3 — Update brain_manifest.json with Solar System Protocol
If the manifest needs updating, replace its contents with the Solar System schema
(see APPENDIX A at the bottom of this file).

## 4.4 — Run activation
```bash
ACTIVATE=$(find /root/nexus -name "arc_activate_all.js" 2>/dev/null | head -1)
if [ -n "$ACTIVATE" ]; then
    cd $(dirname "$ACTIVATE")
    node "$ACTIVATE"
else
    echo "WARNING: arc_activate_all.js not found. Agent activation must be done manually."
fi
```

## 4.5 — Verify agents
```bash
curl -s http://localhost:3001/api/arc/agents | python3 -m json.tool
curl -s http://localhost:3001/api/arc/status | python3 -m json.tool
```

## CHECKPOINT PHASE 4:
- [ ] Sun (Mr.F) registered?
- [ ] Moon (Operator) registered?
- [ ] Active planets (Dev, Scent, Cipher, Ops) registered?
- [ ] Command log has boot entries?
→ ALL YES? Proceed to Phase 5.


# ┌─────────────────────────────────────────────┐
# │     PHASE 5: NGINX PROXY (Unified Gateway)   │
# └─────────────────────────────────────────────┘

## 5.1 — Create Nginx configuration
```bash
cat > /etc/nginx/sites-available/nexus.conf << 'NGINXEOF'
server {
    listen 80;
    server_name app.mrf103.com;

    # ── Nexus Core Backend API ──
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # ── WebSocket Real-time (persistent connection) ──
    location /realtime {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }

    # ── Supabase API Gateway (Kong on 8000) ──
    # The frontend needs this to query the database from the browser.
    # Without this, Shadow Seven cannot talk to Supabase.
    location /supabase/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # ── X-Bio Telemetry Gateway ──
    location /xbio/ {
        proxy_pass http://127.0.0.1:5000/xbio/;
        proxy_set_header Host $host;
    }

    # ── Shadow Seven Frontend (catch-all — MUST be last) ──
    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
NGINXEOF
```

## 5.2 — Enable and test
```bash
ln -sf /etc/nginx/sites-available/nexus.conf /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
# Must output: "test is successful"
systemctl reload nginx
```

## 5.3 — Verify all routes
```bash
echo "Frontend:  $(curl -s -o /dev/null -w '%{http_code}' http://app.mrf103.com/)"
echo "API:       $(curl -s -o /dev/null -w '%{http_code}' http://app.mrf103.com/api/arc/status)"
echo "Supabase:  $(curl -s -o /dev/null -w '%{http_code}' http://app.mrf103.com/supabase/rest/v1/)"
echo "X-Bio:     $(curl -s -o /dev/null -w '%{http_code}' -X POST http://app.mrf103.com/xbio/telemetry -H 'Content-Type: application/json' -d '{}')"
```

## CHECKPOINT PHASE 5:
- [ ] `nginx -t` passes?
- [ ] Frontend accessible via domain?
- [ ] /api/ routes work?
- [ ] /supabase/ proxy works?
→ ALL YES? Proceed to Phase 5.5.


# ┌─────────────────────────────────────────────┐
# │   PHASE 5.5: SSL/HTTPS (MANDATORY SECURITY)  │
# └─────────────────────────────────────────────┘

## 5.5.1 — Obtain SSL certificate
```bash
certbot --nginx -d app.mrf103.com
# When prompted, select: "Redirect HTTP to HTTPS"
```

## 5.5.2 — Verify HTTPS
```bash
curl -s -o /dev/null -w "%{http_code}" https://app.mrf103.com/
# Should return 200
```

## 5.5.3 — Verify auto-renewal
```bash
certbot renew --dry-run
```

## 5.5.4 — Rebuild frontend with HTTPS URLs
```bash
cd /root/nexus/planets/SHADOW-7/shadow-seven

cat > .env.production << 'ENVEOF'
VITE_SUPABASE_URL=https://app.mrf103.com/supabase
VITE_SUPABASE_ANON_KEY=PASTE_YOUR_ANON_KEY_HERE
VITE_API_BASE=https://app.mrf103.com/api
VITE_WS_URL=wss://app.mrf103.com/realtime
ENVEOF

npm run build
pm2 restart shadow-seven-ui
```

## CHECKPOINT PHASE 5.5:
- [ ] https://app.mrf103.com loads?
- [ ] Certificate valid (padlock in browser)?
- [ ] Auto-renewal configured?
- [ ] Frontend rebuilt with HTTPS URLs?
→ ALL YES? Proceed to Phase 6.


# ┌─────────────────────────────────────────────┐
# │     PHASE 6: X-BIO GATEWAY (Port 5000)       │
# └─────────────────────────────────────────────┘

## 6.1 — Start with PM2
```bash
cd /root
pm2 start xbio_gateway.py --name "xbio-gateway" --interpreter python3
pm2 save
```

## 6.2 — Test directly
```bash
curl -X POST http://localhost:5000/xbio/telemetry \
  -H "Content-Type: application/json" \
  -d '{"device":"ESP32-S3-TEST","temp":24.3,"humidity":58.2,"voc":145,"iaq":72}'
```

## 6.3 — Test through Nginx proxy
```bash
curl -X POST https://app.mrf103.com/xbio/telemetry \
  -H "Content-Type: application/json" \
  -d '{"device":"ESP32-S3-TEST","temp":24.3,"humidity":58.2,"voc":145,"iaq":72}'
```

## 6.4 — Verify logs
```bash
tail -3 /root/xbio_logs.jsonl
```

## CHECKPOINT PHASE 6:
- [ ] `pm2 status` shows xbio-gateway "online"?
- [ ] Direct POST to port 5000 works?
- [ ] Proxied POST through domain works?
- [ ] Logs written to xbio_logs.jsonl?
→ ALL YES? Proceed to Phase 7.


# ┌─────────────────────────────────────────────┐
# │   PHASE 7: FINAL VERIFICATION & LOCKDOWN     │
# └─────────────────────────────────────────────┘

## 7.1 — Full PM2 status
```bash
pm2 status
# Expected:
# ┌─────────────────┬────┬──────┐
# │ nexus-core      │ 0  │ online│
# │ shadow-seven-ui │ 1  │ online│
# │ xbio-gateway    │ 2  │ online│
# └─────────────────┴────┴──────┘
```

## 7.2 — Save PM2 state (survives reboot)
```bash
pm2 save
```

## 7.3 — Full system diagnostic
```bash
echo "═══════════════════════════════════════════"
echo " NEXUS PRIME — SYSTEM DIAGNOSTIC v15.1"
echo "═══════════════════════════════════════════"
echo ""
echo "[PM2 Processes]"
echo "  nexus-core:      $(pm2 show nexus-core 2>/dev/null | grep status | awk '{print $4}' || echo 'NOT FOUND')"
echo "  shadow-seven-ui: $(pm2 show shadow-seven-ui 2>/dev/null | grep status | awk '{print $4}' || echo 'NOT FOUND')"
echo "  xbio-gateway:    $(pm2 show xbio-gateway 2>/dev/null | grep status | awk '{print $4}' || echo 'NOT FOUND')"
echo ""
echo "[Docker Containers]"
echo "  Running: $(docker ps -q | wc -l) containers"
docker ps --format "  {{.Names}}: {{.Status}}" 2>/dev/null
echo ""
echo "[Network Endpoints]"
echo "  Core API:    $(curl -s -o /dev/null -w '%{http_code}' https://app.mrf103.com/api/arc/status 2>/dev/null || echo 'FAIL')"
echo "  Frontend:    $(curl -s -o /dev/null -w '%{http_code}' https://app.mrf103.com/ 2>/dev/null || echo 'FAIL')"
echo "  Supabase:    $(curl -s -o /dev/null -w '%{http_code}' https://app.mrf103.com/supabase/rest/v1/ 2>/dev/null || echo 'FAIL')"
echo "  X-Bio:       $(curl -s -o /dev/null -w '%{http_code}' -X POST https://app.mrf103.com/xbio/telemetry -H 'Content-Type: application/json' -d '{}' 2>/dev/null || echo 'FAIL')"
echo "  SSL Cert:    $(curl -s -o /dev/null -w '%{http_code}' https://app.mrf103.com/ 2>/dev/null || echo 'FAIL')"
echo ""
echo "[System Resources]"
echo "  CPU: $(top -bn1 | grep 'Cpu(s)' | awk '{print $2}')% user"
echo "  RAM: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
echo "  Disk: $(df -h / | tail -1 | awk '{print $3 "/" $2 " (" $5 ")"}')"
echo ""
echo "═══════════════════════════════════════════"
echo " STATUS: SYSTEM SOVEREIGN ✓"
echo " ACCESS: https://app.mrf103.com"
echo "═══════════════════════════════════════════"
```

## FINAL CHECKLIST:
- [ ] PM2: 3 processes online (nexus-core, shadow-seven-ui, xbio-gateway)
- [ ] Docker: 7+ Supabase containers running
- [ ] Agents: Sun + Moon + 4 active planets online
- [ ] SSL: Valid HTTPS certificate on app.mrf103.com
- [ ] API: /api/arc/status returns 200
- [ ] Supabase: /supabase/ proxy working
- [ ] WebSocket: /realtime accepting connections
- [ ] X-Bio: /xbio/telemetry accepting POST data
- [ ] Dashboard: https://app.mrf103.com loads and shows the system


# ┌─────────────────────────────────────────────┐
# │             TROUBLESHOOTING                   │
# └─────────────────────────────────────────────┘

# Docker won't start:
#   systemctl restart docker
#
# npm install fails:
#   rm -rf node_modules package-lock.json && npm install
#
# Port already in use:
#   lsof -i :PORT → then kill PID
#
# PM2 process keeps crashing:
#   pm2 logs process-name --lines 50
#
# PostgreSQL not ready:
#   docker logs supabase-db --tail 50
#
# Kong returns 502:
#   Kong needs PostgreSQL first. docker-compose restart kong
#
# SSL certificate fails:
#   Verify DNS A record points to server IP. Ensure port 80 is open.
#
# WebSocket won't connect:
#   Check Nginx has: proxy_http_version 1.1; proxy_set_header Upgrade ...
#
# Frontend shows blank page:
#   Check browser console (F12). Verify .env.production URLs are correct.
#
# "Connection refused" on any port:
#   Check if the process is running: pm2 status / docker ps
#
# Permission denied:
#   Use sudo or check file ownership: ls -la /path/to/file


# ┌─────────────────────────────────────────────┐
# │  APPENDIX A: brain_manifest.json (Solar System) │
# └─────────────────────────────────────────────┘

# If you need to update brain_manifest.json, use this schema:

```json
{
  "version": "v15.1-ARC2.0",
  "protocol": "solar-system",
  "timestamp": "2026-02-12T00:00:00Z",

  "sovereign_core": {
    "sun": {
      "id": "MRF-SUN-01",
      "name": "Mr.F",
      "role": "Supreme Strategy & Vision",
      "permission": "ABSOLUTE (10)",
      "model": "gpt-4o",
      "state": "ALWAYS_ACTIVE"
    },
    "moon": {
      "id": "OPS-MOON-01",
      "name": "The Operator",
      "role": "Daily Operations & Interface Management",
      "permission": "APPROVE (4)",
      "model": "gpt-4o-mini",
      "state": "ALWAYS_ACTIVE"
    },
    "planets": [
      { "id": "PLN-DEV",   "name": "Dev",      "sector": "Engineering",    "permission": "EXECUTE (3)", "state": "ACTIVE" },
      { "id": "PLN-BIO",   "name": "Scent",    "sector": "X-Bio Sensing",  "permission": "EXECUTE (3)", "state": "ACTIVE" },
      { "id": "PLN-SEC",   "name": "Cipher",   "sector": "Security",       "permission": "EXECUTE (3)", "state": "ACTIVE" },
      { "id": "PLN-OPS",   "name": "Ops",      "sector": "Infrastructure", "permission": "EXECUTE (3)", "state": "ACTIVE" },
      { "id": "PLN-FIN",   "name": "Vault",    "sector": "Finance",        "permission": "EXECUTE (3)", "state": "STANDBY" },
      { "id": "PLN-LAW",   "name": "Lexis",    "sector": "Legal",          "permission": "EXECUTE (3)", "state": "STANDBY" },
      { "id": "PLN-DATA",  "name": "Data",     "sector": "Analytics",      "permission": "EXECUTE (3)", "state": "STANDBY" },
      { "id": "PLN-RND",   "name": "Nova",     "sector": "R&D",            "permission": "EXECUTE (3)", "state": "S0_NULL" },
      { "id": "PLN-LIFE",  "name": "Harmony",  "sector": "Wellness",       "permission": "EXECUTE (3)", "state": "S0_NULL" },
      { "id": "PLN-MEDIA", "name": "Media",    "sector": "PR",             "permission": "EXECUTE (3)", "state": "S0_NULL" },
      { "id": "PLN-COMM",  "name": "Commerce", "sector": "Sales",          "permission": "EXECUTE (3)", "state": "S0_NULL" }
    ]
  },

  "silent_workforce": [
    { "id": "ST-01", "name": "LogRotator",      "type": "cron",     "schedule": "0 2 * * *",     "task": "Compress old logs" },
    { "id": "ST-02", "name": "LinterBot",       "type": "hook",     "trigger": "pre-commit",     "task": "Syntax check" },
    { "id": "ST-03", "name": "PingGuard",       "type": "timer",    "interval_sec": 60,          "task": "Heartbeat probe" },
    { "id": "ST-04", "name": "SensorReader",    "type": "mqtt",     "topic": "xbio/#",           "task": "BME688 data ingestion" },
    { "id": "ST-05", "name": "BackupGuard",     "type": "cron",     "schedule": "0 3 * * *",     "task": "Incremental DB backup" },
    { "id": "ST-06", "name": "CertWatcher",     "type": "cron",     "schedule": "0 6 * * 1",     "task": "SSL expiry check" },
    { "id": "ST-07", "name": "DiskSentinel",    "type": "timer",    "interval_sec": 300,         "task": "Disk usage alert at 80%" },
    { "id": "ST-08", "name": "DocBuilder",      "type": "trigger",  "event": "on-demand",        "task": "Generate PDF reports" },
    { "id": "ST-09", "name": "MailRelay",       "type": "worker",   "queue": "notifications",    "task": "Send Telegram/email" },
    { "id": "ST-10", "name": "SchemaValidator",  "type": "boot",    "phase": 1,                  "task": "Validate DB schema" },
    { "id": "ST-11", "name": "EnvChecker",      "type": "boot",     "phase": 0,                  "task": "Validate .env files" },
    { "id": "ST-12", "name": "PortScanner",     "type": "boot",     "phase": 0,                  "task": "Check port availability" },
    { "id": "ST-13", "name": "MetricsCollector", "type": "timer",   "interval_sec": 300,         "task": "System CPU/RAM/disk metrics" },
    { "id": "ST-14", "name": "GitWatcher",      "type": "webhook",  "event": "push",             "task": "Monitor repo changes" },
    { "id": "ST-15", "name": "TokenRefresher",  "type": "cron",     "schedule": "0 */6 * * *",   "task": "Refresh API tokens" },
    { "id": "ST-16", "name": "QueueFlusher",    "type": "worker",   "interval_sec": 30,          "task": "Flush pending task queues" },
    { "id": "ST-17", "name": "ImageOptimizer",  "type": "trigger",  "event": "upload",           "task": "Compress uploaded images" },
    { "id": "ST-18", "name": "HealthProbe",     "type": "endpoint", "path": "/health",           "task": "Full system health check" }
  ]
}
```


# ════════════════════════════════════════════════════════════════
# END OF BOOTSTRAP INSTRUCTIONS
# ════════════════════════════════════════════════════════════════
# To execute: cd /root/nexus && claude
# Then paste: "Read /root/nexus/BOOTSTRAP.md and execute Phase 0"
# ════════════════════════════════════════════════════════════════
