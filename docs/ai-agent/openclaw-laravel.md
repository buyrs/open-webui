# OpenClaw — Laravel / Boutikio Implementation Guide

> **Repo:** Boutikio Laravel app (this repo)
> **Companion doc:** `docs/ai-agent/openclaw-openwebui.md` (Open WebUI repo)
> **Architecture doc:** `docs/ai-agent/openclaw.md` (full brainstorming)

This document covers everything that needs to be built or modified in the Laravel codebase to support the Claw ecosystem. Open WebUI work lives in a separate repo and separate doc.

---

## Overview — What Laravel Needs to Do

1. **OAuth Provider** — Boutikio becomes an OAuth 2.0 authorization server so Open WebUI can authenticate partners
2. **OpenClaw Tool Server** — A new API layer that exposes existing services as OpenAI-compatible tool endpoints
3. **Embedded Pages** — Lightweight Blade views (no header/footer) that render inside Open WebUI's iframe
4. **Subscription Gate** — Enforce free tier limits on marketing tools

---

## 1. OAuth Provider (Boutikio as Authorization Server)

### Why

Open WebUI needs to authenticate partners using Boutikio's existing user database. No new auth system — partners log in with their existing credentials, and Open WebUI receives a token.

### Install Laravel Passport

```bash
composer require laravel/passport
php artisan passport:install
php artisan migrate
```

### Create OAuth Client for Open WebUI

```bash
php artisan passport:client --public \
  --name="Open WebUI" \
  --redirect_uri="https://chat.boutikio.com/oauth/callback"
```

### Endpoints to Expose

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/.well-known/openid-configuration` | GET | OIDC discovery document |
| `/oauth/authorize` | GET | Authorization screen (reuse existing login) |
| `/oauth/token` | POST | Token exchange (authorization code → access token) |
| `/oauth/userinfo` | GET | Partner profile (`sub`, `name`, `email`, `partner_id`, `role`) |
| `/oauth/jwks` | GET | JSON Web Key Set for token verification |

### OIDC Discovery Document

```php
// routes/api.php
Route::get('/.well-known/openid-configuration', function () {
    return response()->json([
        'issuer' => config('app.url'),
        'authorization_endpoint' => config('app.url') . '/oauth/authorize',
        'token_endpoint' => config('app.url') . '/oauth/token',
        'userinfo_endpoint' => config('app.url') . '/oauth/userinfo',
        'jwks_uri' => config('app.url') . '/oauth/jwks',
        'response_types_supported' => ['code'],
        'grant_types_supported' => ['authorization_code', 'refresh_token'],
        'scopes_supported' => ['openid', 'profile', 'email', 'partner'],
        'subject_types_supported' => ['public'],
        'id_token_signing_alg_values_supported' => ['RS256'],
    ]);
});
```

### UserInfo Endpoint

```php
// app/Http/Controllers/OAuth/UserInfoController.php
class UserInfoController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $partner = $user->partner;

        return response()->json([
            'sub' => (string) $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'partner_id' => $partner?->id,
            'role' => $user->role,
            'locale' => $user->preferred_language ?? 'fr',
        ]);
    }
}
```

### Files to Create/Modify

```
app/Http/Controllers/OAuth/
  UserInfoController.php          → /oauth/userinfo endpoint
  OidcDiscoveryController.php     → /.well-known/openid-configuration
  JwksController.php              → /oauth/jwks

config/passport.php               → Passport configuration
routes/api.php                     → Add OAuth routes

database/migrations/
  xxxx_create_oauth_tables.php     → Passport migration (auto-generated)
```

### Environment Variables

```env
# .env
PASSPORT_PRIVATE_KEY_PATH=storage/oauth-private.key
PASSPORT_PUBLIC_KEY_PATH=storage/oauth-public.key
OPENWEBUI_CLIENT_ID=open-webui
OPENWEBUI_REDIRECT_URI=https://chat.boutikio.com/oauth/callback
```

---

## 2. OpenClaw Tool Server (API Layer)

### Why

Open WebUI calls Maya (Qwen3.5-Plus). When Maya decides to use a tool, it calls OpenClaw. OpenClaw is a thin API layer that validates the request, checks permissions, and delegates to existing Boutikio services.

### Architecture

```
Open WebUI → Qwen3.5-Plus → tool_call → OpenClaw API → Boutikio Service → Response
```

### Route Structure

```php
// routes/openclaw.php
Route::prefix('openclaw')->middleware(['auth:api'])->group(function () {
    // OpenAPI spec for tool discovery
    Route::get('/openapi.json', [OpenApiSpecController::class, 'index']);

    // Tool execution
    Route::post('/tools/{toolName}', [ToolController::class, 'execute']);
});
```

### Key Classes to Build

```
app/Http/Controllers/OpenClaw/
  ToolController.php              → Routes tool calls to services
  OpenApiSpecController.php       → Generates OpenAPI spec for Open WebUI

app/Services/OpenClaw/
  ToolRegistry.php                → Maps tool names → service methods
  ToolExecutor.php                → Validates, executes, logs, returns
  SubscriptionGate.php            → Checks free tier limits
  OpenApiGenerator.php            → Builds OpenAPI spec from registry

app/Http/Middleware/
  OpenClawAuthenticate.php        → Validates OAuth token from Open WebUI
  OpenClawRateLimit.php           → Per-partner rate limiting
  OpenClawAuditLog.php            → Logs every tool call
```

### ToolRegistry — Mapping Tools to Services

```php
// app/Services/OpenClaw/ToolRegistry.php
class ToolRegistry
{
    private array $tools = [
        // Onboarding
        'create_partner_profile' => [
            'service' => PartnerService::class,
            'method' => 'createProfile',
            'description' => 'Create a new partner profile with store details',
            'parameters' => ['name' => 'string', 'address' => 'string', 'phone?' => 'string'],
            'gated' => false,
        ],
        // Vouchers
        'create_voucher' => [
            'service' => VoucherBatchService::class,
            'method' => 'create',
            'description' => 'Create a new voucher',
            'parameters' => ['name' => 'string', 'type' => 'string', 'value' => 'number'],
            'gated' => true, // Marketing tool — subscription required after 100 members
        ],
        // Analytics
        'get_dashboard_stats' => [
            'service' => AnalyticsService::class,
            'method' => 'getDashboardStats',
            'description' => 'Get dashboard statistics for the partner',
            'parameters' => ['period?' => 'string'],
            'gated' => false,
        ],
        // ... all other tools from openclaw.md
    ];
}
```

### SubscriptionGate

```php
// app/Services/OpenClaw/SubscriptionGate.php
class SubscriptionGate
{
    private const FREE_MEMBER_LIMIT = 100;

    public function check(Partner $partner, string $toolName): bool
    {
        $tool = $this->registry->get($toolName);

        if (!$tool['gated']) {
            return true; // Always allowed
        }

        if ($partner->active_members_count <= self::FREE_MEMBER_LIMIT) {
            return true; // Under free limit
        }

        return $partner->hasActiveSubscription();
    }

    public function getBlockedMessage(): string
    {
        return "You've grown past 100 active members — congrats! "
             . "To keep using marketing features, head to the Billing page "
             . "in your sidebar to pick a plan.";
    }
}
```

### Audit Logging

Every tool call gets logged to `agent_audit_logs`:

```php
// Migration
Schema::create('agent_audit_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('partner_id')->constrained();
    $table->string('tool_name');
    $table->json('parameters')->nullable();
    $table->string('status'); // ok, blocked, error
    $table->json('result_summary')->nullable();
    $table->integer('execution_time_ms');
    $table->timestamps();
    $table->index(['partner_id', 'created_at']);
});
```

---

## 3. Embedded Pages (iframe Layouts)

### Why

Billing, settings, card preview, audit log, etc. are rendered by Laravel but displayed inside Open WebUI's iframe. They need a stripped-down layout (no header, no sidebar, no footer) and theme sync.

### Embedded Layout

```php
// resources/views/layouts/embedded.blade.php
<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}" class="light">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        :root {
            --owui-bg: #ffffff;
            --owui-text: #1a1a1a;
            --owui-accent: #3b82f6;
            --owui-border: #e5e7eb;
        }
        .dark {
            --owui-bg: #1e1e1e;
            --owui-text: #e5e5e5;
            --owui-accent: #60a5fa;
            --owui-border: #374151;
        }
        body {
            background: var(--owui-bg);
            color: var(--owui-text);
        }
    </style>
</head>
<body class="antialiased">
    @yield('content')

    <script>
        // Listen for theme sync from Open WebUI parent
        window.addEventListener('message', (e) => {
            if (e.data?.type === 'theme-sync') {
                const vars = e.data.vars;
                Object.entries(vars).forEach(([key, val]) => {
                    document.documentElement.style.setProperty(key, val);
                });
                if (vars['--mode'] === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                }
            }
        });
        // Tell parent we're ready
        window.parent.postMessage({ type: 'embedded-ready' }, '*');
    </script>
</body>
</html>
```

### Routes

```php
// routes/embedded.php
Route::prefix('embedded')->middleware(['auth:api'])->group(function () {
    Route::get('/billing', [EmbeddedBillingController::class, 'index']);
    Route::get('/settings', [EmbeddedSettingsController::class, 'index']);
    Route::get('/card-preview', [EmbeddedCardPreviewController::class, 'index']);
    Route::get('/audit-log', [EmbeddedAuditLogController::class, 'index']);
    Route::get('/receipt-settings', [EmbeddedReceiptSettingsController::class, 'index']);
    Route::get('/members', [EmbeddedMemberDirectoryController::class, 'index']);
});
```

### Files to Create

```
app/Http/Controllers/Embedded/
  EmbeddedBillingController.php
  EmbeddedSettingsController.php
  EmbeddedCardPreviewController.php
  EmbeddedAuditLogController.php
  EmbeddedReceiptSettingsController.php
  EmbeddedMemberDirectoryController.php

resources/views/layouts/
  embedded.blade.php              → Stripped layout (no header/footer)

resources/views/embedded/
  billing.blade.php
  settings.blade.php
  card-preview.blade.php
  audit-log.blade.php
  receipt-settings.blade.php
  member-directory.blade.php
```

---

## 4. Configuration

### New Config File

```php
// config/openclaw.php
return [
    'free_member_limit' => env('OPENCLAW_FREE_MEMBER_LIMIT', 100),
    'rate_limit_per_minute' => env('OPENCLAW_RATE_LIMIT', 60),
    'audit_log_retention_days' => env('OPENCLAW_AUDIT_RETENTION', 90),
    'openwebui_url' => env('OPENWEBUI_URL', 'https://chat.boutikio.com'),
    'dashscope_api_key' => env('DASHSCOPE_API_KEY'),
];
```

### .env Additions

```env
# OpenClaw
OPENCLAW_FREE_MEMBER_LIMIT=100
OPENCLAW_RATE_LIMIT=60
OPENCLAW_AUDIT_RETENTION=90

# Open WebUI
OPENWEBUI_URL=https://chat.boutikio.com
OPENWEBUI_CLIENT_ID=open-webui

# Alibaba Cloud DashScope
DASHSCOPE_API_KEY=sk-xxxxx

# OAuth (Passport)
PASSPORT_PRIVATE_KEY_PATH=storage/oauth-private.key
PASSPORT_PUBLIC_KEY_PATH=storage/oauth-public.key
```

---

## Implementation Order

### Phase 1: OAuth Provider (Week 1)
1. Install Laravel Passport
2. Create OIDC discovery endpoint
3. Create UserInfo endpoint
4. Create JWKS endpoint
5. Register Open WebUI as OAuth client
6. Test: Open WebUI login → Boutikio auth → redirect back

### Phase 2: OpenClaw Tool Server (Week 2-3)
1. Create ToolRegistry with first 5 tools (get_dashboard_stats, create_voucher, get_members, update_card, create_reward)
2. Create ToolExecutor with validation and error handling
3. Create OpenAPI spec generator
4. Create audit logging middleware
5. Create SubscriptionGate
6. Register as OpenAPI tool server in Open WebUI
7. Test: Chat → tool call → OpenClaw → service → response

### Phase 3: Embedded Pages (Week 3-4)
1. Create embedded layout (no header/footer, theme sync)
2. Build billing page (Stripe integration, plan selector)
3. Build card preview page (QR code, wallet mockup)
4. Build audit log page (filterable table)
5. Build settings page (profile form)
6. Build receipt settings page
7. Build member directory page
8. Test: Open WebUI sidebar → iframe → embedded page → theme sync

### Phase 4: Polish (Week 4)
1. Rate limiting on OpenClaw endpoints
2. Error handling and graceful degradation
3. Subscription enforcement edge cases
4. CORS configuration for embedded pages
5. Security audit (token validation, partner scoping)

---

## Testing Strategy

```bash
# OAuth tests
./vendor/bin/pest tests/Feature/OAuth/

# OpenClaw tool tests
./vendor/bin/pest tests/Feature/OpenClaw/

# Embedded page tests
./vendor/bin/pest tests/Feature/Embedded/

# Subscription gate tests
./vendor/bin/pest tests/Unit/Services/OpenClaw/SubscriptionGateTest.php
```

Key test scenarios:
- OAuth flow: authorize → token → userinfo
- Tool execution: valid call → service delegation → response
- Subscription gate: under limit → allowed, over limit + no sub → blocked
- Audit logging: every tool call logged with correct data
- Embedded pages: render without header/footer, accept theme sync
- Partner scoping: partner A cannot access partner B's data via tools

---

*This document covers the Laravel/Boutikio side only. For Open WebUI customization, see `docs/ai-agent/openclaw-openwebui.md`.*
