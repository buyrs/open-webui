# Requirements: OpenClaw Open WebUI Integration

## Glossary

| Term | Definition |
|------|-----------|
| Open WebUI | Self-hosted AI chat platform, forked and customized for Boutikio |
| Maya | AI personality / system prompt running on Qwen3.5-Plus |
| OpenClaw | MCP/tool server built in Laravel that exposes Boutikio services to the LLM |
| Boutikio | Laravel 11 loyalty program backend with 289+ services |
| DashScope | Alibaba Cloud Model Studio API (OpenAI-compatible) |
| Partner | A business owner who uses Boutikio to manage their loyalty program |
| Embedded Page | A Boutikio-served page rendered inside Open WebUI via iframe |
| Theme Sync | postMessage-based mechanism to synchronize dark/light mode and CSS variables between Open WebUI and embedded iframes |

## References

- #[[file:docs/ai-agent/openclaw-openwebui.md]]
- #[[file:docs/ai-agent/openclaw.md]]
- #[[file:docs/ai-agent/openclaw-laravel.md]]
- #[[file:docs/ai-agent/openclaw-mcp-architecture.md]]
- #[[file:.kiro/specs/openclaw-openwebui-integration/palette.md]] — Boutikio color palette
- #[[file:.kiro/specs/openclaw-openwebui-integration/tools.md]] — OpenClaw tool registry

---

## Requirement 1: Docker Deployment

### User Stories
- As a DevOps engineer, I want to deploy the Open WebUI fork as a Docker container on `chat.boutikio.com` so that partners can access the chat interface.

### Acceptance Criteria
1. WHEN the docker-compose file is executed, THEN the Open WebUI container SHALL start on port 3000 (mapped to internal 8080) with a named volume `open-webui-data` mounted at `/app/backend/data`.
2. The docker-compose file SHALL set `WEBUI_URL` to `https://chat.boutikio.com` and `WEBUI_NAME` to `Boutikio`.
3. The docker-compose file SHALL set `WEBUI_SECRET_KEY` from an environment variable.
4. The container SHALL use `restart: unless-stopped` policy.
5. The nginx reverse proxy configuration SHALL proxy `chat.boutikio.com` to `localhost:3000` with WebSocket upgrade headers for Socket.IO support.
6. The nginx configuration SHALL use the wildcard SSL certificate for `*.boutikio.com`.

---

## Requirement 2: LLM Connection (Alibaba Cloud DashScope)

### User Stories
- As a partner, I want to chat with Maya powered by Qwen3.5-Plus so that I can manage my loyalty program through natural language.

### Acceptance Criteria
1. The Open WebUI instance SHALL be configured with `OPENAI_API_BASE_URL` set to `https://dashscope-intl.aliyuncs.com/compatible-mode/v1`.
2. The Open WebUI instance SHALL be configured with `OPENAI_API_KEY` set from the `DASHSCOPE_API_KEY` environment variable.
3. The Open WebUI instance SHALL set `DEFAULT_MODELS` to `qwen3.5-plus`.

4. WHEN a partner sends a chat message, THEN Open WebUI SHALL route the request to the Qwen3.5-Plus model via the DashScope OpenAI-compatible API.
5. The Qwen3.5-Plus model SHALL support function calling (tool_use) so that Maya can invoke OpenClaw tools.

---

## Requirement 3: OAuth Authentication via Boutikio

### User Stories
- As a partner, I want to log in to Open WebUI using my existing Boutikio credentials so that I don't need a separate account.
- As an admin, I want the email/password login form hidden so that all partners authenticate through Boutikio OAuth.

### Acceptance Criteria
1. The Open WebUI instance SHALL set `ENABLE_OAUTH_SIGNUP` to `true`.
2. The Open WebUI instance SHALL set `ENABLE_LOGIN_FORM` to `false` so that the email/password form is hidden.
3. The Open WebUI instance SHALL set `OAUTH_MERGE_ACCOUNTS_BY_EMAIL` to `true`.
4. The `OAUTH_PROVIDERS` environment variable SHALL configure a `boutikio` provider with `client_id: open-webui`, `server_url: https://app.boutikio.com`, `scope: openid profile email partner`, `redirect_uri: https://chat.boutikio.com/oauth/callback`, `provider_name: Boutikio`, `icon_url: /static/boutikio-logo.svg`.
5. WHEN a partner clicks "Login with Boutikio", THEN Open WebUI SHALL redirect to `https://app.boutikio.com/oauth/authorize`, and upon successful authentication, SHALL redirect back and create/update a local user from the ID token claims.
6. The Open WebUI instance SHALL set `ENABLE_OAUTH_TOKEN_EXCHANGE` to `true` so that the partner's Boutikio access token is passed to tool servers on every tool call.

---

## Requirement 4: OpenClaw Tool Server Registration

### User Stories
- As a partner, I want Maya to execute actions on my behalf (create vouchers, check analytics, etc.) so that I can manage my loyalty program through chat.

### Acceptance Criteria
1. The OpenClaw tool server SHALL be registered in Open WebUI's admin panel with Name: `OpenClaw`, URL: `https://app.boutikio.com/openclaw/openapi.json`, Auth type: `system_oauth`.
2. Open WebUI SHALL auto-discover all available tools from the OpenClaw OpenAPI specification.
3. WHEN Qwen3.5-Plus returns a tool_call response, THEN Open WebUI SHALL execute a POST request to `https://app.boutikio.com/openclaw/tools/{toolName}` with the partner's Boutikio OAuth token in the `Authorization: Bearer` header.
4. WHEN OpenClaw returns a tool result, THEN Open WebUI SHALL send the result back to Qwen3.5-Plus for the model to format a natural language response.
5. IF OpenClaw returns an error or a subscription-gated response, THEN Open WebUI SHALL pass that response to Qwen3.5-Plus so Maya can communicate it to the partner gracefully.

### Reference
- See [tools.md](tools.md) for the complete tool registry with 42 tools across 10 categories and subscription gating rules.

---

## Requirement 5: Custom Sidebar Navigation

### User Stories
- As a partner, I want to see navigation links for Billing, Settings, Receipt Settings, Card Preview, Audit Log, and Members in the sidebar so that I can access structured pages without leaving the Open WebUI shell.

### Acceptance Criteria
1. The `Sidebar.svelte` component SHALL include a new navigation section below the chat history list with: 💳 Billing → `/billing`, ⚙️ Settings → `/partner-settings`, 🧾 Receipt Settings → `/receipt-settings`, 🎴 Card Preview → `/card-preview`, 📋 Audit Log → `/audit-log`, 👥 Members → `/members`.
2. WHEN a partner clicks a sidebar navigation item, THEN the corresponding embedded page route SHALL load in the main content area.
3. The currently active sidebar item SHALL be visually highlighted to indicate the active page.
4. The sidebar navigation items SHALL be visible at all times when the sidebar is open, regardless of chat history scroll position.


---

## Requirement 6: Embedded Pages (iframe Routes)

### User Stories
- As a partner, I want to view billing, settings, card preview, audit log, receipt settings, and member directory pages inside the Open WebUI shell so that the experience feels like one unified product.

### Acceptance Criteria
1. The Open WebUI fork SHALL include SvelteKit routes rendering iframes: `/billing` → `embedded/billing`, `/partner-settings` → `embedded/settings`, `/receipt-settings` → `embedded/receipt-settings`, `/card-preview` → `embedded/card-preview`, `/audit-log` → `embedded/audit-log`, `/members` → `embedded/members`.
2. Each iframe SHALL occupy the full width and height of the main content area with no visible border.
3. Each iframe SHALL have a descriptive `title` attribute for accessibility.
4. The billing iframe SHALL include `allow="payment"` to support Stripe payment forms.
5. WHEN the embedded page sends a `postMessage` with `type: 'embedded-ready'`, THEN the parent page SHALL send a `theme-sync` message containing the current CSS variable values and dark/light mode state.
6. WHEN the partner toggles dark/light mode in Open WebUI, THEN a `MutationObserver` on `document.documentElement` class changes SHALL trigger a new `theme-sync` message to all active embedded iframes.
7. IF an embedded page fails to load, THEN the iframe container SHALL display a user-friendly fallback message with a link to open the page directly.

---

## Requirement 7: Branding Customization

### User Stories
- As a partner, I want the interface to look and feel like Boutikio so that the experience is consistent with the brand.

### Acceptance Criteria
1. The Open WebUI fork SHALL replace the default logo with `static/boutikio-logo.svg` displayed in the sidebar.
2. The Open WebUI fork SHALL replace the default favicon with `static/boutikio-favicon.ico`.
3. The `static/manifest.json` SHALL be updated with `name: Boutikio`, `short_name: Boutikio`, `description: Manage your loyalty program with AI`, `theme_color: #3b82f6` (secondary-500), and PWA icons at 192x192 and 512x512 sizes.
4. The Open WebUI instance SHALL set `SHOW_ADMIN_DETAILS` to `false`.
5. The Open WebUI instance SHALL set `ENABLE_COMMUNITY_SHARING` to `false`.
6. The Open WebUI instance SHALL set `ENABLE_MESSAGE_RATING` to `false`.
7. The model selector dropdown SHALL be hidden for non-admin users so that partners only interact with the default Maya model.
8. Any "Powered by Open WebUI" branding SHALL be removed or hidden in the fork.

### Reference
- See [palette.md](palette.md) for the complete Boutikio color palette with primary (orange), secondary (blue), and semantic colors.

---

## Requirement 8: Maya System Prompt

### User Stories
- As a partner, I want Maya to behave as a friendly, bilingual AI assistant that understands my loyalty program so that I can manage everything through natural conversation.

### Acceptance Criteria
1. The Qwen3.5-Plus model in Open WebUI SHALL be configured with a system prompt that defines Maya's identity as the Boutikio loyalty program AI assistant.
2. The system prompt SHALL instruct Maya to match the partner's language (French or English).
3. The system prompt SHALL instruct Maya to never mention technical details such as API calls, tool names, or database operations.
4. The system prompt SHALL instruct Maya to always confirm destructive actions before executing them.
5. The system prompt SHALL instruct Maya to ask for clarification when a request is ambiguous.
6. The system prompt SHALL instruct Maya to keep responses short (2-3 sentences max unless explaining something complex).
7. The system prompt SHALL include onboarding behavior: IF no loyalty card is set up, THEN Maya SHALL initiate a guided onboarding flow (store name → address → logo → banner → rewards → welcome voucher), one step at a time.
8. The system prompt SHALL include subscription handling: IF a partner hits the free tier limit, THEN Maya SHALL explain kindly and point to the Billing page in the sidebar, while confirming that scan and reward functionality continues working.
9. The system prompt SHALL instruct Maya to evaluate uploaded images for quality (resolution, blur, lighting) before using them as logos or banners.
10. The system prompt SHALL define Maya's limitations: cannot process payments, cannot access member personal data beyond system data, cannot send messages to external platforms.

---

## Requirement 9: Fork Maintenance Strategy

### User Stories
- As a developer, I want the fork changes to be minimal and additive so that rebasing on upstream Open WebUI releases is straightforward.

### Acceptance Criteria
1. All fork changes SHALL be additive — new files and small modifications to existing components — rather than rewrites of upstream code.
2. Custom SvelteKit routes SHALL live in dedicated paths that do not conflict with upstream routes.
3. The fork SHALL maintain an `upstream` git remote pointing to `https://github.com/open-webui/open-webui.git` for rebasing.
4. The only upstream file modified SHALL be `src/lib/components/layout/Sidebar.svelte` (to add navigation items), minimizing merge conflicts during rebase.
5. Static branding assets SHALL be placed in the `static/` directory with `boutikio-` prefixed filenames to avoid conflicts with upstream assets.

---

## Correctness Properties

| ID | Property | Description |
|----|----------|-------------|
| CP-1 | OAuth-only access | No partner SHALL be able to access the chat interface without completing the Boutikio OAuth flow. The login form SHALL never be visible. |
| CP-2 | Token passthrough | Every tool call from Open WebUI to OpenClaw SHALL include the partner's valid Boutikio OAuth token in the Authorization header. |
| CP-3 | Theme consistency | WHEN a partner toggles dark/light mode, THEN all visible embedded iframes SHALL receive a theme-sync message within the same event loop tick. |
| CP-4 | Sidebar navigation completeness | All 6 embedded page routes SHALL be reachable from the sidebar, and each SHALL load the correct Boutikio embedded URL. |
| CP-5 | Model isolation | Non-admin partners SHALL NOT see the model selector and SHALL only interact with the qwen3.5-plus model. |
| CP-6 | Fork minimality | The fork SHALL modify at most 1 upstream file (Sidebar.svelte). All other changes SHALL be new files only. |
