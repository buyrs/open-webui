# Deployment Checklist: Open WebUI (Boutikio) on Plesk Panel

## Overview

This checklist covers deploying the Boutikio-customized Open WebUI fork to a Plesk-managed server at `chat.boutikio.com`.

---

## Prerequisites

### Server Requirements
- [ ] Plesk Obsidian 18.0.50 or later
- [ ] Node.js 20.x support enabled in Plesk
- [ ] Docker support enabled (if using containerized deployment)
- [ ] At least 2GB RAM available
- [ ] 10GB+ disk space for data persistence

### Domain & SSL
- [ ] Domain `boutikio.com` added to Plesk
- [ ] Subdomain `chat.boutikio.com` created
- [ ] SSL certificate installed (choose one option below)

#### SSL Certificate Options

**Option A: Separate Let's Encrypt for `chat.boutikio.com` (Recommended - Simpler)**
- [ ] In Plesk, go to **SSL/TLS Certificates** for `chat.boutikio.com`
- [ ] Click **Install Let's Encrypt certificate**
- [ ] Enter email for expiration notifications
- [ ] Enable **Redirect HTTP to HTTPS**
- [ ] Enable **HSTS** for security
- [ ] Certificate auto-renews every 90 days

**Option B: Wildcard Certificate for `*.boutikio.com` (Covers all subdomains)**
- [ ] Requires DNS validation (not HTTP)
- [ ] In Plesk, go to **SSL/TLS Certificates** for `boutikio.com`
- [ ] Select **Let's Encrypt** with wildcard option
- [ ] Add DNS TXT record for validation
- [ ] Covers: `chat.boutikio.com`, `app.boutikio.com`, and future subdomains
- [ ] More complex setup but centralized management

> **Note**: Each subdomain can have its own Let's Encrypt certificate. There's no requirement to share certificates between `boutikio.com` and `chat.boutikio.com`.

### External Services
- [ ] Boutikio OAuth provider configured at `app.boutikio.com`
- [ ] Alibaba Cloud DashScope API key obtained
- [ ] OpenClaw API accessible at `app.boutikio.com/openclaw`

---

## Plesk Configuration

### 1. Enable Node.js Support

- [ ] Go to **Tools & Settings** → **Updates and Upgrades**
- [ ] Install **Node.js** component
- [ ] Verify Node.js version: `node -v` (should be 20.x)

### 2. Create Website/Subdomain

```
Domain: boutikio.com
Subdomain: chat
Document Root: /var/www/vhosts/boutikio.com/chat.boutikio.com
```

- [ ] Create subdomain `chat.boutikio.com`
- [ ] Set document root to the build output directory
- [ ] Enable HTTPS with SSL certificate

### 3. Configure SSL Certificate

**For `chat.boutikio.com` (Let's Encrypt):**
- [ ] Go to **Websites & Domains** → `chat.boutikio.com` → **SSL/TLS Certificates**
- [ ] Click **Let's Encrypt**
- [ ] Enter your email address
- [ ] Check "Include www.chat.boutikio.com" if needed
- [ ] Click **Get it free**
- [ ] Enable **Redirect HTTP to HTTPS**
- [ ] Enable **HSTS** for enhanced security

The certificate will auto-renew 30 days before expiration.

---

## Deployment Methods

### Option A: Docker Deployment (Recommended)

#### 1. Enable Docker in Plesk
- [ ] Install **Docker** extension from Extensions menu
- [ ] Verify Docker is running

#### 2. Build and Deploy Container

```bash
# SSH into server
cd /var/www/vhosts/boutikio.com/open-webui

# Build image
docker build -t boutikio-open-webui .

# Create data volume
docker volume create open-webui-data

# Run container
docker run -d \
  --name boutikio-open-webui \
  --restart unless-stopped \
  -p 127.0.0.1:3000:8080 \
  -v open-webui-data:/app/backend/data \
  --env-file .env \
  boutikio-open-webui
```

- [ ] Build Docker image from source
- [ ] Create persistent data volume
- [ ] Run container with environment variables
- [ ] Verify container is running: `docker ps`

#### 3. Configure Nginx Proxy

In Plesk, go to **Apache & Nginx Settings** for the subdomain:

```nginx
# Additional Nginx directives
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 86400;
}
```

- [ ] Add Nginx reverse proxy configuration
- [ ] Enable WebSocket support (for real-time features)
- [ ] Disable Apache proxy mode

---

### Option B: Node.js Deployment (Direct)

#### 1. Install Dependencies

```bash
cd /var/www/vhosts/boutikio.com/chat.boutikio.com
npm ci
```

- [ ] Install Node.js dependencies
- [ ] Verify no vulnerabilities: `npm audit`

#### 2. Build Application

```bash
npm run build
```

- [ ] Build SvelteKit application
- [ ] Verify build output exists

#### 3. Configure Plesk Node.js App

- [ ] Go to **Websites & Domains** → `chat.boutikio.com`
- [ ] Click **Node.js**
- [ ] Set **Document Root** to `build`
- [ ] Set **Application Root** to project directory
- [ ] Set **Application Mode** to `production`
- [ ] Set **Application URL** to `/`
- [ ] Enable **Run Node.js app in cluster mode**

#### 4. Set Environment Variables

In Plesk Node.js settings, add environment variables:

- [ ] `WEBUI_URL=https://chat.boutikio.com`
- [ ] `WEBUI_NAME=Boutikio`
- [ ] `WEBUI_SECRET_KEY=<secret-key>`
- [ ] `ENABLE_OAUTH_SIGNUP=true`
- [ ] `ENABLE_LOGIN_FORM=false`
- [ ] `OAUTH_MERGE_ACCOUNTS_BY_EMAIL=true`
- [ ] `ENABLE_OAUTH_TOKEN_EXCHANGE=true`
- [ ] `OAUTH_PROVIDERS=<json-config>`
- [ ] `OPENAI_API_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
- [ ] `OPENAI_API_KEY=<dashscope-key>`
- [ ] `DEFAULT_MODELS=qwen3.5-plus`

---

## Environment Configuration

### Create `.env` File

```bash
# .env - Copy from .env.boutikio template
WEBUI_SECRET_KEY=<generate-secure-random-string>
BOUTIKIO_OAUTH_SECRET=<oauth-client-secret>
DASHSCOPE_API_KEY=<alibaba-cloud-api-key>

OAUTH_PROVIDERS_JSON={"boutikio":{"client_id":"open-webui","client_secret":"${BOUTIKIO_OAUTH_SECRET}","server_url":"https://app.boutikio.com","scope":"openid profile email partner","redirect_uri":"https://chat.boutikio.com/oauth/callback","provider_name":"Boutikio","icon_url":"/static/boutikio-logo.svg"}}
```

- [ ] Create `.env` file from template
- [ ] Generate secure `WEBUI_SECRET_KEY` (32+ random characters)
- [ ] Add Boutikio OAuth client secret
- [ ] Add DashScope API key
- [ ] Set correct OAuth redirect URI
- [ ] **SECURITY**: Set file permissions to 600: `chmod 600 .env`

---

## OAuth Configuration

### Boutikio OAuth Provider Setup

On the Boutikio Laravel application (`app.boutikio.com`):

- [ ] Create OAuth client with:
  - **Client ID**: `open-webui`
  - **Client Secret**: (match `BOUTIKIO_OAUTH_SECRET`)
  - **Redirect URI**: `https://chat.boutikio.com/oauth/callback`
  - **Scopes**: `openid profile email partner`

### Verify OAuth Flow

- [ ] Test login redirect to `app.boutikio.com/oauth/authorize`
- [ ] Verify callback URL receives authorization code
- [ ] Confirm user is created in Open WebUI
- [ ] Test token exchange for tool server calls

---

## Database Setup

### SQLite (Default)
- [ ] No additional setup required
- [ ] Data stored in `/app/backend/data` (Docker) or `./data` (direct)

### PostgreSQL (Recommended for Production)

- [ ] Install PostgreSQL in Plesk
- [ ] Create database: `openwebui_boutikio`
- [ ] Create database user with strong password
- [ ] Add to environment variables:
  ```
  DATABASE_URL=postgresql://user:password@localhost:5432/openwebui_boutikio
  ```

---

## OpenClaw Tool Server Setup

### Admin Panel Configuration

1. Login as admin to `chat.boutikio.com`
2. Go to **Admin Settings** → **Tools**
3. Add OpenAPI tool server:

- [ ] **Name**: OpenClaw
- [ ] **URL**: `https://app.boutikio.com/openclaw/openapi.json`
- [ ] **Auth Type**: System OAuth (uses partner's token)
- [ ] Enable tool server

### Verify Tool Discovery

- [ ] Check tools are auto-discovered (42 tools expected)
- [ ] Test a tool call through chat

---

## NemoClaw System Prompt

### Configure in Admin Panel

1. Go to **Admin Settings** → **Models**
2. Select `qwen3.5-plus`
3. Set system prompt:

```
You are NemoClaw, an AI assistant for Boutikio partners. You help manage loyalty programs, create vouchers, manage members, and analyze business performance.

Key capabilities:
- Member management (search, details, reactivation)
- Voucher creation and campaigns
- Analytics and reporting
- Wallet pass management
- Gamification features

Always be helpful, concise, and actionable. Use available tools to perform operations.
```

- [ ] System prompt configured
- [ ] Test chat with NemoClaw persona

---

## Security Hardening

### File Permissions
- [ ] `.env` file: `chmod 600`
- [ ] Data directory: `chown -R www-data:www-data`
- [ ] Static files: readable by web server

### Headers (Nginx)
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

- [ ] Security headers added to Nginx config

### Rate Limiting
- [ ] Enable Nginx rate limiting for API endpoints
- [ ] Configure fail2ban for brute-force protection

---

## Monitoring & Logging

### Enable Logging
- [ ] Application logs: `/var/log/open-webui/app.log`
- [ ] Nginx access logs: Plesk default location
- [ ] Docker logs: `docker logs boutikio-open-webui`

### Health Checks
- [ ] Create health check endpoint monitoring
- [ ] Set up Uptime monitoring (UptimeRobot, Pingdom, etc.)

### Backup Strategy
- [ ] Database backups enabled in Plesk
- [ ] Data volume backups (Docker)
- [ ] Configuration backups

---

## Post-Deployment Verification

### Smoke Tests

#### 1. SSL & Domain
- [ ] `https://chat.boutikio.com` loads without certificate warnings
- [ ] HTTP redirects to HTTPS
- [ ] PWA manifest loads: `/static/manifest.json`

#### 2. Authentication
- [ ] OAuth login with Boutikio works
- [ ] User profile displays correctly
- [ ] Logout works

#### 3. Chat Functionality
- [ ] New chat creates successfully
- [ ] Messages send and receive
- [ ] Model `qwen3.5-plus` responds

#### 4. Embedded Pages
- [ ] `/billing` - Billing page loads
- [ ] `/partner-settings` - Settings page loads
- [ ] `/receipt-settings` - Receipt settings loads
- [ ] `/card-preview` - Card preview loads
- [ ] `/audit-log` - Audit log loads
- [ ] `/members` - Members page loads

#### 5. Sidebar Navigation
- [ ] Boutikio section visible in sidebar
- [ ] All 6 navigation items clickable
- [ ] Active state shows correctly
- [ ] Mobile sidebar works

#### 6. Theme Sync
- [ ] Dark mode toggle works
- [ ] Theme syncs to embedded pages
- [ ] Theme persists across sessions

#### 7. Tool Calls
- [ ] Ask "Show my dashboard stats" - tool call succeeds
- [ ] Ask "List my members" - tool call succeeds

---

## Rollback Procedure

### Docker Rollback
```bash
# Stop current container
docker stop boutikio-open-webui

# Tag old image
docker tag boutikio-open-webui boutikio-open-webui:backup

# Deploy previous version
docker run -d --name boutikio-open-webui-rollback \
  -p 127.0.0.1:3000:8080 \
  -v open-webui-data:/app/backend/data \
  --env-file .env \
  boutikio-open-webui:previous-version
```

- [ ] Document rollback steps
- [ ] Test rollback procedure

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| OAuth redirect fails | Check callback URL matches exactly |
| Tools not discovered | Verify OpenClaw URL accessible, check auth |
| Database locked | Switch to PostgreSQL for production |
| WebSocket disconnects | Check Nginx proxy timeout settings |
| Theme not syncing | Check MutationObserver in browser console |

### Useful Commands

```bash
# Check container logs
docker logs -f boutikio-open-webui

# Restart container
docker restart boutikio-open-webui

# Check Node.js app status
pm2 status

# View Nginx error log
tail -f /var/log/nginx/error.log

# Test OAuth manually
curl -I https://app.boutikio.com/oauth/authorize?client_id=open-webui
```

---

## Deployment Checklist Summary

### Pre-Deployment
- [ ] Plesk configured with Node.js/Docker
- [ ] SSL certificate installed
- [ ] Environment variables prepared
- [ ] OAuth client created in Boutikio

### Deployment
- [ ] Code deployed to server
- [ ] Dependencies installed
- [ ] Application built
- [ ] Container/service running
- [ ] Nginx proxy configured

### Post-Deployment
- [ ] SSL working
- [ ] OAuth login functional
- [ ] Chat working with Qwen3.5-Plus
- [ ] All 6 embedded pages load
- [ ] Tool calls succeed
- [ ] Monitoring enabled

---

## Support Contacts

| Resource | Contact |
|----------|---------|
| Open WebUI Docs | https://docs.openwebui.com |
| Boutikio Dev Team | dev@boutikio.com |
| Plesk Support | https://support.plesk.com |
| Alibaba Cloud | https://www.alibabacloud.com/support |