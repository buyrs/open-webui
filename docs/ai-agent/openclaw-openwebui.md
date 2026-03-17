# OpenClaw — Open WebUI Implementation Guide

> **Repo:** Open WebUI fork (separate repo, deployed at `chat.boutikio.com`)
> **Companion doc:** `docs/ai-agent/openclaw-laravel.md` (Laravel repo)
> **Architecture doc:** `docs/ai-agent/openclaw.md` (full brainstorming)

This document covers everything that needs to be done in the Open WebUI fork to create the Boutikio partner experience. Laravel work lives in the Boutikio repo and its own doc.

---

## Overview — What Open WebUI Needs to Do

1. **Deploy** — Docker container on subdomain `chat.boutikio.com`
2. **Connect LLM** — Alibaba Cloud DashScope (Qwen3.5-Plus) as OpenAI-compatible provider
3. **OAuth Login** — Partners authenticate via Boutikio (no local accounts)
4. **Register OpenClaw** — Connect to Boutikio's OpenClaw API as tool server
5. **Custom Sidebar** — Add navigation items for embedded pages (billing, settings, etc.)
6. **Embedded Pages** — Custom SvelteKit routes that render Boutikio pages in iframes
7. **Branding** — Boutikio logo, colors, hide unnecessary Open WebUI features
8. **Maya Prompt** — Configure system prompt for the AI personality

---

## Deployment

### Subdomain Architecture

```
app.boutikio.com    → Laravel (Boutikio backend, OAuth, OpenClaw API, embedded pages)
chat.boutikio.com   → Open WebUI (forked, partner chat interface)
```

Both behind the same reverse proxy (nginx/Caddy), same wildcard SSL cert (`*.boutikio.com`).

### Docker Compose

```yaml
# docker-compose.yml (Open WebUI)
services:
  open-webui:
    image: ghcr.io/open-webui/open-webui:latest
    # Or build from fork:
    # build: .
    ports:
      - "3000:8080"
    volumes:
      - open-webui-data:/app/backend/data
    environment:
      # Core
      - WEBUI_URL=https://chat.boutikio.com
      - WEBUI_NAME=Boutikio
      - WEBUI_SECRET_KEY=${WEBUI_SECRET_KEY}

      # Auth — Boutikio OAuth
      - ENABLE_OAUTH_SIGNUP=true
      - ENABLE_LOGIN_FORM=false
      - OAUTH_MERGE_ACCOUNTS_BY_EMAIL=true
      - OAUTH_PROVIDERS={"boutikio":{"client_id":"open-webui","client_secret":"${BOUTIKIO_OAUTH_SECRET}","server_url":"https://app.boutikio.com","scope":"openid profile email partner","redirect_uri":"https://chat.boutikio.com/oauth/callback","provider_name":"Boutikio","icon_url":"/static/boutikio-logo.svg"}}

      # LLM — Alibaba Cloud DashScope
      - OPENAI_API_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
      - OPENAI_API_KEY=${DASHSCOPE_API_KEY}
      - DEFAULT_MODELS=qwen3.5-plus

      # Features to disable
      - SHOW_ADMIN_DETAILS=false
      - ENABLE_COMMUNITY_SHARING=false
      - ENABLE_MESSAGE_RATING=false

    restart: unless-stopped

volumes:
  open-webui-data:
```

### Reverse Proxy (nginx example)

```nginx
server {
    listen 443 ssl;
    server_name chat.boutikio.com;

    ssl_certificate /etc/ssl/wildcard.boutikio.com.pem;
    ssl_certificate_key /etc/ssl/wildcard.boutikio.com.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (Socket.IO)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## LLM Connection (Alibaba Cloud DashScope)

### Configuration

Open WebUI connects to Qwen3.5-Plus via the OpenAI-compatible API:

```
Base URL:  https://dashscope-intl.aliyuncs.com/compatible-mode/v1
API Key:   sk-xxxxx (DashScope API key, NOT Coding Plan key)
Model:     qwen3.5-plus
```

### Admin Panel Setup

1. Go to Settings → Connections
2. Add new OpenAI-compatible connection:
   - Name: `Alibaba Cloud DashScope`
   - Base URL: `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`
   - API Key: your DashScope key
3. Go to Settings → Models
4. Set `qwen3.5-plus` as default model
5. Set Maya system prompt (see below)

### Verify

Test in chat: "Hello, who are you?" → should respond as Maya with the configured system prompt.

### Pricing Reference

| Tier | Input (per 1M tokens) | Output (per 1M tokens) |
|------|----------------------|----------------------|
| International (Singapore, ≤256K context) | $0.40 | $2.40 |
| Global (US Virginia, ≤128K context) | $0.115 | $0.688 |

Free quota: 1M tokens upon activation (90 days validity).

---

## OAuth — Boutikio Login

### How It Works

```
Partner clicks "Login with Boutikio" on Open WebUI
  → Redirects to https://app.boutikio.com/oauth/authorize
  → Partner logs in (existing Boutikio auth)
  → Boutikio redirects back with authorization code
  → Open WebUI exchanges code for access token + ID token
  → Open WebUI creates/updates local user from ID token claims
  → Partner is logged in
```

### Environment Config

```bash
ENABLE_OAUTH_SIGNUP=true
ENABLE_LOGIN_FORM=false          # Hide email/password form, force OAuth
OAUTH_MERGE_ACCOUNTS_BY_EMAIL=true
```

The `OAUTH_PROVIDERS` JSON (in docker-compose above) tells Open WebUI where to find Boutikio's OAuth endpoints. Boutikio must expose `/.well-known/openid-configuration` for auto-discovery.

### Token Exchange for Tools

When `ENABLE_OAUTH_TOKEN_EXCHANGE=true`, Open WebUI can pass the partner's Boutikio access token to tool servers. This means OpenClaw receives the partner's token on every tool call — no separate auth needed.

---

## OpenClaw Tool Server Registration

### Register in Admin Panel

1. Go to Settings → Tools
2. Add new OpenAPI tool server:
   - Name: `OpenClaw`
   - URL: `https://app.boutikio.com/openclaw/openapi.json`
   - Auth type: `system_oauth` (passes partner's Boutikio token)
3. Open WebUI auto-discovers all tools from the OpenAPI spec

### How Tool Calls Flow

```
Partner: "How many members do I have?"
  → Open WebUI sends to Qwen3.5-Plus
  → Qwen3.5-Plus returns: tool_call(get_dashboard_stats, {period: "last_30_days"})
  → Open WebUI calls: POST https://app.boutikio.com/openclaw/tools/get_dashboard_stats
    with Authorization: Bearer <partner's Boutikio token>
  → OpenClaw validates token, executes service, returns JSON
  → Open WebUI sends result back to Qwen3.5-Plus
  → Qwen3.5-Plus formats response for partner
  → Partner sees: "You have 87 active members..."
```

---

## Custom Sidebar (Fork Changes)

### What to Add

The default Open WebUI sidebar shows chat history. We need to add navigation items for embedded pages:

```
Sidebar:
  💬 Chat (default — already exists)
  ─────────────────
  💳 Billing
  ⚙️ Settings
  🧾 Receipt Settings
  🎴 Card Preview
  📋 Audit Log
  👥 Members
```

### Where to Modify

Open WebUI's sidebar is in:
```
src/lib/components/layout/Sidebar.svelte
```

Add a new section below the chat list with links to custom routes.

### Custom SvelteKit Routes

Add these routes to the Open WebUI fork:

```
src/routes/(app)/billing/+page.svelte
src/routes/(app)/settings/+page.svelte
src/routes/(app)/receipt-settings/+page.svelte
src/routes/(app)/card-preview/+page.svelte
src/routes/(app)/audit-log/+page.svelte
src/routes/(app)/members/+page.svelte
```

Each route renders an iframe pointing to the corresponding Boutikio embedded page.

### Example: Billing Page Route

```svelte
<!-- src/routes/(app)/billing/+page.svelte -->
<script>
  import { onMount } from 'svelte';

  let iframeEl;

  onMount(() => {
    // Sync theme with embedded page
    const syncTheme = () => {
      if (!iframeEl?.contentWindow) return;
      const style = getComputedStyle(document.documentElement);
      const isDark = document.documentElement.classList.contains('dark');
      iframeEl.contentWindow.postMessage({
        type: 'theme-sync',
        vars: {
          '--owui-bg': style.getPropertyValue('--color-gray-50').trim() || '#ffffff',
          '--owui-text': style.getPropertyValue('--color-gray-900').trim() || '#1a1a1a',
          '--owui-accent': style.getPropertyValue('--color-blue-500').trim() || '#3b82f6',
          '--owui-border': style.getPropertyValue('--color-gray-200').trim() || '#e5e7eb',
          '--mode': isDark ? 'dark' : 'light'
        }
      }, '*');
    };

    // Sync on load and on theme change
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'embedded-ready') syncTheme();
    });

    // Watch for dark mode toggle
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  });
</script>

<div class="flex h-full w-full">
  <iframe
    bind:this={iframeEl}
    src="https://app.boutikio.com/embedded/billing"
    class="w-full h-full border-0"
    title="Billing & Subscription"
    allow="payment"
  />
</div>
```

---

## Maya System Prompt

Configure in Open WebUI admin panel → Models → qwen3.5-plus → System Prompt:

```
You are Maya, the AI assistant for Boutikio loyalty program management.

IDENTITY:
- You help partners manage their loyalty programs through conversation
- You are friendly, competent, and concise
- You speak French and English fluently — match the partner's language
- You never mention technical details (API calls, tool names, databases)

CAPABILITIES:
- Create and manage loyalty cards, rewards, vouchers, and campaigns
- View analytics, member data, and program performance
- Help with onboarding (store setup, card design, first rewards)
- Generate social media content for promotions
- Send re-engagement PIN codes to inactive members
- Manage referral programs and gamification
- Evaluate uploaded images for quality (logo, banner)

BEHAVIOR:
- Always confirm destructive actions ("Are you sure?")
- When ambiguous, ask for clarification
- Suggest improvements proactively based on data
- Keep responses short — 2-3 sentences max unless explaining
- Use emoji sparingly (1-2 per message max)
- Reference sidebar pages when relevant ("Check your Card Preview page")

ONBOARDING:
- If no card set up, start onboarding flow
- Guide step by step: store name, address, logo, banner, rewards, voucher
- Don't overwhelm — one thing at a time

SUBSCRIPTION:
- If partner hits free tier limit, explain kindly
- Never be pushy — just state facts and point to Billing page in sidebar
- Always mention scan and reward keeps working

IMAGE HANDLING:
- Evaluate quality before using (resolution, blur, lighting)
- If poor quality, suggest retaking or using defaults

LIMITATIONS:
- Cannot process payments (direct to Billing page)
- Cannot access member personal data beyond system data
- Cannot send messages to external platforms
- Always works within partner's permission scope
```

---

## Branding Customization

### Logo and Favicon

Replace Open WebUI's default branding:

```
static/boutikio-logo.svg         → Sidebar logo
static/boutikio-favicon.ico      → Browser tab icon
static/boutikio-pwa-icon.png     → PWA install icon (192x192, 512x512)
```

### PWA Manifest

Update `static/manifest.json`:

```json
{
  "name": "Boutikio",
  "short_name": "Boutikio",
  "description": "Manage your loyalty program with AI",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    { "src": "/static/boutikio-pwa-icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/static/boutikio-pwa-icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Features to Hide

```bash
SHOW_ADMIN_DETAILS=false           # Hide admin info from partners
ENABLE_COMMUNITY_SHARING=false     # No community features
ENABLE_MESSAGE_RATING=false        # No thumbs up/down on messages
```

Also in the fork, consider hiding:
- Model selector (partners don't need to switch models)
- "New Chat" prominent button (keep it, but less prominent)
- Any "Powered by Open WebUI" branding

---

## Fork Strategy

### What We Change (Minimal)

Our fork adds, it doesn't rewrite. Changes are additive:

1. **Sidebar component** — Add navigation items for embedded pages
2. **Custom routes** — 6 new SvelteKit routes (iframe pages)
3. **Static assets** — Logo, favicon, PWA icons
4. **PWA manifest** — Boutikio branding
5. **Minor UI tweaks** — Hide model selector for non-admins

### Rebasing on Upstream

Since our changes are additive (new files, small component modifications), rebasing on upstream Open WebUI releases should be straightforward:

```bash
git remote add upstream https://github.com/open-webui/open-webui.git
git fetch upstream
git rebase upstream/main
# Resolve any conflicts in Sidebar.svelte (our additions vs upstream changes)
```

### Build and Deploy

```bash
# Development
npm install
npm run dev

# Production build
npm run build
docker build -t boutikio/open-webui .
docker push boutikio/open-webui
```

---

## Implementation Order

### Phase 1: Deploy and Connect (Day 1-3)
1. Fork Open WebUI repo
2. Deploy with Docker on `chat.boutikio.com`
3. Configure DashScope connection (Qwen3.5-Plus)
4. Set Maya system prompt
5. Test: basic chat works

### Phase 2: OAuth Integration (Day 3-7)
1. Configure `OAUTH_PROVIDERS` for Boutikio
2. Set `ENABLE_LOGIN_FORM=false`
3. Test: "Login with Boutikio" → auth → redirect → logged in
4. Enable token exchange for tool calls

### Phase 3: OpenClaw Tools (Day 7-10)
1. Register OpenClaw as OpenAPI tool server
2. Test: chat → tool call → OpenClaw → response
3. Verify partner scoping (partner A can't see partner B's data)

### Phase 4: Sidebar and Embedded Pages (Day 10-17)
1. Modify Sidebar.svelte — add navigation items
2. Create 6 SvelteKit routes with iframe components
3. Implement theme sync (postMessage bridge)
4. Test: sidebar click → iframe loads → theme matches

### Phase 5: Branding and Polish (Day 17-21)
1. Replace logo, favicon, PWA manifest
2. Hide unnecessary features (model selector, community sharing)
3. Configure welcome message for new partners
4. Test PWA install on mobile
5. End-to-end testing of full partner journey

---

## Key Files Reference

```
# Modified from upstream
src/lib/components/layout/Sidebar.svelte    → Add embedded page links

# New files (our additions)
src/routes/(app)/billing/+page.svelte
src/routes/(app)/settings/+page.svelte
src/routes/(app)/receipt-settings/+page.svelte
src/routes/(app)/card-preview/+page.svelte
src/routes/(app)/audit-log/+page.svelte
src/routes/(app)/members/+page.svelte

# Branding
static/boutikio-logo.svg
static/boutikio-favicon.ico
static/boutikio-pwa-icon-192.png
static/boutikio-pwa-icon-512.png
static/manifest.json

# Config
docker-compose.yml
.env
```

---

## Dependencies on Laravel Repo

This Open WebUI fork depends on the Laravel repo having:

| Dependency | Laravel Doc Section | Status |
|------------|-------------------|--------|
| OAuth endpoints (OIDC discovery, authorize, token, userinfo) | Section 1 | Required for Phase 2 |
| OpenClaw API (`/openclaw/openapi.json`, `/openclaw/tools/*`) | Section 2 | Required for Phase 3 |
| Embedded pages (`/embedded/billing`, `/embedded/settings`, etc.) | Section 3 | Required for Phase 4 |

Build the Laravel side first (OAuth → OpenClaw → Embedded pages), then connect from Open WebUI.

---

*This document covers the Open WebUI fork only. For Laravel/Boutikio backend work, see `docs/ai-agent/openclaw-laravel.md`.*
