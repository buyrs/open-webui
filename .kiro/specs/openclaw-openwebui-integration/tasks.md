# Implementation Plan: OpenClaw Open WebUI Integration

## Overview

Customize the Open WebUI fork to serve as Boutikio's partner-facing AI chat interface. The implementation adds a reusable EmbeddedPage Svelte component, 6 SvelteKit routes for iframe-embedded Boutikio pages, sidebar navigation modifications, branding assets, Docker configuration, and an environment template. All changes are additive except one modification to Sidebar.svelte.

## Tasks

- [x] 1. Create the EmbeddedPage component and theme sync utilities
  - [x] 1.1 Create `src/lib/components/embedded/EmbeddedPage.svelte`
    - Implement a reusable Svelte component that accepts `src`, `title`, and optional `allow` props
    - Render a full-width/height iframe with no border
    - On mount, set up a `MutationObserver` on `document.documentElement` to watch `class` attribute changes (dark/light toggle)
    - Listen for `embedded-ready` postMessage from the iframe, then send a `theme-sync` message
    - Extract CSS variables from `getComputedStyle(document.documentElement)`: `--color-gray-50` → `--owui-bg`, `--color-gray-900` → `--owui-text`, `--color-blue-500` → `--owui-accent`, `--color-gray-200` → `--owui-border`, plus `--mode` from dark class check
    - On dark/light toggle (MutationObserver fires), re-send theme-sync to the iframe
    - On unmount, disconnect observer and remove message event listener
    - Include a fallback error state: if iframe fails to load, show a user-friendly message with a direct link to the Boutikio URL
    - _Requirements: 6.2, 6.3, 6.5, 6.6, 6.7_

  - [x] 1.2 Create `src/lib/utils/themeSyncBuilder.ts`
    - Export a pure function `buildThemeSyncMessage(vars: Record<string, string>, isDark: boolean): ThemeSyncMessage` that constructs the theme-sync postMessage payload
    - Export TypeScript interfaces `ThemeSyncMessage` and `EmbeddedReadyMessage`
    - This function will be used by EmbeddedPage.svelte and tested via property-based tests
    - _Requirements: 6.5, 6.6_

  - [x] 1.3 Write property test for theme sync message completeness
    - **Property 2: Theme sync message completeness**
    - **Validates: Requirements 6.5, 6.6**
    - Use vitest + fast-check to generate random CSS color strings and random boolean isDark values
    - Call `buildThemeSyncMessage` and verify the output always contains all 5 required keys (`--owui-bg`, `--owui-text`, `--owui-accent`, `--owui-border`, `--mode`)
    - Verify `--mode` is always either `"dark"` or `"light"`
    - Minimum 100 iterations

- [x] 2. Create embedded page routes
  - [x] 2.1 Create `src/routes/(app)/billing/+page.svelte`
    - Import and render `EmbeddedPage` with `src="https://app.boutikio.com/embedded/billing"`, `title="Billing & Subscription"`, `allow="payment"`
    - _Requirements: 6.1, 6.4_

  - [x] 2.2 Create `src/routes/(app)/partner-settings/+page.svelte`
    - Import and render `EmbeddedPage` with `src="https://app.boutikio.com/embedded/settings"`, `title="Account Settings"`
    - _Requirements: 6.1_

  - [x] 2.3 Create `src/routes/(app)/receipt-settings/+page.svelte`
    - Import and render `EmbeddedPage` with `src="https://app.boutikio.com/embedded/receipt-settings"`, `title="Receipt Settings"`
    - _Requirements: 6.1_

  - [x] 2.4 Create `src/routes/(app)/card-preview/+page.svelte`
    - Import and render `EmbeddedPage` with `src="https://app.boutikio.com/embedded/card-preview"`, `title="Card Preview"`
    - _Requirements: 6.1_

  - [x] 2.5 Create `src/routes/(app)/audit-log/+page.svelte`
    - Import and render `EmbeddedPage` with `src="https://app.boutikio.com/embedded/audit-log"`, `title="Audit Log"`
    - _Requirements: 6.1_

  - [x] 2.6 Create `src/routes/(app)/members/+page.svelte`
    - Import and render `EmbeddedPage` with `src="https://app.boutikio.com/embedded/members"`, `title="Members"`
    - _Requirements: 6.1_


  - [x] 2.7 Write property test for navigation-to-iframe mapping consistency
    - **Property 1: Navigation-to-iframe mapping consistency**
    - **Validates: Requirements 5.1, 6.1**
    - Use vitest + fast-check to generate random subsets of the navigation config array
    - For each item, verify the `href` maps to a valid route path and the corresponding iframe `src` follows the pattern `https://app.boutikio.com/embedded/{slug}`
    - Verify no two nav items share the same `href` or the same iframe `src`
    - Minimum 100 iterations

- [x] 3. Checkpoint - Verify component and routes
  - All files created and verified.

- [x] 4. Modify sidebar and add branding
  - [x] 4.1 Add Boutikio navigation section to `src/lib/components/layout/Sidebar.svelte`
    - Define a `boutikioNavItems` array with 6 items: Billing (`/billing`), Settings (`/partner-settings`), Receipt Settings (`/receipt-settings`), Card Preview (`/card-preview`), Audit Log (`/audit-log`), Members (`/members`)
    - Add a new navigation section after the existing sidebar items (Notes, Workspace) and before the user profile section
    - Use a visual separator (thin border line) to distinguish from chat history
    - Each item renders as an `<a>` tag with emoji icon + label text
    - Add active state styling when `$page.url.pathname` matches the item's `href`
    - Call `itemClickHandler()` on click for mobile sidebar close behavior
    - Items must be visible at all times when sidebar is open, regardless of chat history scroll position
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 4.2 Create placeholder branding assets
    - Create `static/boutikio-logo.svg` — a simple placeholder SVG with "Boutikio" text
    - Create `static/boutikio-favicon.svg` — placeholder SVG-based favicon
    - Create `static/boutikio-pwa-icon-192.svg` — placeholder SVG (192×192)
    - Create `static/boutikio-pwa-icon-512.svg` — placeholder SVG (512×512)
    - _Requirements: 7.1, 7.2, 7.3_
    - _Reference: See design.md → Theme & Color Palette for brand colors (primary-600: #C2420D, secondary-500: #3b82f6)_

  - [x] 4.3 Update `static/manifest.json` with Boutikio branding
    - Set `name` to `Boutikio`, `short_name` to `Boutikio`
    - Set `description` to `Manage your loyalty program with AI`
    - Set `theme_color` to `#3b82f6` (secondary-500), `background_color` to `#ffffff`
    - Reference PWA icons at 192×192 and 512×512 sizes with `boutikio-` prefixed filenames
    - _Requirements: 7.3_

- [x] 5. Create Docker and environment configuration
  - [x] 5.1 Create `docker-compose.yml` at repo root
    - Define `open-webui` service building from current directory
    - Map port 3000:8080, mount `open-webui-data` volume at `/app/backend/data`
    - Set all environment variables: `WEBUI_URL`, `WEBUI_NAME`, `WEBUI_SECRET_KEY`, OAuth vars (`ENABLE_OAUTH_SIGNUP`, `ENABLE_LOGIN_FORM`, `OAUTH_MERGE_ACCOUNTS_BY_EMAIL`, `ENABLE_OAUTH_TOKEN_EXCHANGE`, `OAUTH_PROVIDERS`), LLM vars (`OPENAI_API_BASE_URL`, `OPENAI_API_KEY`, `DEFAULT_MODELS`), feature flags (`SHOW_ADMIN_DETAILS`, `ENABLE_COMMUNITY_SHARING`, `ENABLE_MESSAGE_RATING`)
    - Set `restart: unless-stopped`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.6, 7.4, 7.5, 7.6_

  - [x] 5.2 Create `.env.boutikio` environment template
    - Include all required environment variables with placeholder values and comments
    - Variables: `WEBUI_SECRET_KEY`, `BOUTIKIO_OAUTH_SECRET`, `DASHSCOPE_API_KEY`, `OAUTH_PROVIDERS_JSON`
    - _Requirements: 1.3, 2.2, 3.4_

- [x] 6. Final checkpoint - Ensure all tests pass
  - All 11 property tests pass (vitest + fast-check).

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Components 1-3 from the design (OAuth, LLM, OpenClaw tool server) are configuration-only — no code tasks needed, handled via environment variables and admin panel setup
- Component 8 (NemoClaw system prompt) is configured in the admin panel, not in code
- The only upstream file modified is `Sidebar.svelte` (Requirement 9.4)
- All other changes are new files with `boutikio-` prefixed static assets (Requirement 9.5)
- Property tests validate the two correctness properties from the design document

## Implementation Summary

### Files Created
- `src/lib/components/embedded/EmbeddedPage.svelte` - Reusable iframe component with theme sync
- `src/lib/utils/themeSyncBuilder.ts` - Theme sync utilities and TypeScript interfaces
- `src/routes/(app)/billing/+page.svelte` - Billing embedded page route
- `src/routes/(app)/partner-settings/+page.svelte` - Settings embedded page route
- `src/routes/(app)/receipt-settings/+page.svelte` - Receipt settings embedded page route
- `src/routes/(app)/card-preview/+page.svelte` - Card preview embedded page route
- `src/routes/(app)/audit-log/+page.svelte` - Audit log embedded page route
- `src/routes/(app)/members/+page.svelte` - Members embedded page route
- `static/boutikio-logo.svg` - Boutikio logo
- `static/boutikio-favicon.svg` - Boutikio favicon
- `static/boutikio-pwa-icon-192.svg` - PWA icon 192x192
- `static/boutikio-pwa-icon-512.svg` - PWA icon 512x512
- `static/manifest.json` - Updated PWA manifest with Boutikio branding
- `docker-compose.yml` - Docker Compose configuration
- `.env.boutikio` - Environment template
- `src/lib/utils/__tests__/themeSyncBuilder.test.ts` - Property tests for theme sync
- `src/lib/utils/__tests__/navigationMapping.test.ts` - Property tests for navigation mapping

### Files Modified
- `src/lib/components/layout/Sidebar.svelte` - Added Boutikio navigation section
- `vite.config.ts` - Added vitest test configuration