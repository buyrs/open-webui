# The Claw Ecosystem — Brainstorming Document

> **Date:** 2026-03-17
> **Status:** In Progress — Brainstorming
> **Vision:** Replace the traditional partner dashboard with a conversational AI interface powered by an open-weight LLM

---

## The Big Idea

Instead of building yet another dashboard with forms, tables, and buttons, we give partners a chat interface. They talk to an AI that understands their business and executes actions on their behalf. The backend is already powerful (289+ services, 88+ models). We're not rebuilding anything — we're building a new front door.

**One sentence:** Partners manage their entire loyalty program by chatting with an AI, powered by Open WebUI and Qwen3.5-Plus.

---

## System Components

| Component | Role | Technology |
|-----------|------|------------|
| **Open WebUI** | Partner-facing interface (chat + embedded pages) | Self-hosted, PWA-ready |
| **NemoClaw** | AI personality / system prompt | Qwen3.5-Plus via Alibaba Cloud Model Studio (DashScope) |
| **OpenClaw** | MCP server (tool execution layer) | Laravel, existing services |
| **Boutikio** | Backend platform | Laravel 11, 289+ services |

---

## Key Principles

1. **Don't break the backend** — OpenClaw calls existing services. No new business logic.
2. **No platform risk** — No WhatsApp, Telegram, SMS, or any third-party messaging. We own the stack.
3. **Simple > Complex** — If it can't be explained in one sentence, simplify it.
4. **One shell, one experience** — Everything lives inside Open WebUI. Partners never land on a page that looks like a different product.
5. **Chat-first, not chat-only** — Structured pages (billing, settings) live inside Open WebUI's shell as embedded pages.
6. **French + English** — NemoClaw speaks both fluently. Partners choose.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Partner (Browser/PWA)                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Open WebUI Shell                         │
│                                                                  │
│  ┌──────────┐  ┌─────────────────────────────────────────────┐  │
│  │ Sidebar  │  │                                             │  │
│  │          │  │   💬 Chat (NemoClaw)     ← default view     │  │
│  │ 💬 Chat  │  │   💳 Billing Page       ← embedded page    │  │
│  │ 💳 Billing│  │   ⚙️ Account Settings   ← embedded page    │  │
│  │ ⚙️ Settings│ │   🧾 Receipt Settings  ← embedded page    │  │
│  │ 🧾 Receipts│ │   🎴 Card Preview      ← embedded page    │  │
│  │ 🎴 Card  │  │   📋 Audit Log         ← embedded page    │  │
│  │ 📋 Audit │  │                                             │  │
│  └──────────┘  └─────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ OpenAI-compatible API
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Qwen3.5-Plus (NemoClaw)                       │
│                    via Alibaba Cloud DashScope API                │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Function Call  │  │ Vision       │  │ Thinking Mode        │  │
│  │ (tool_use)    │  │ (images)     │  │ (reasoning)          │  │
│  └───────────────┘  └──────────────┘  └──────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Tool calls
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OpenClaw MCP Server                         │
│                      (Laravel middleware)                         │
│  ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌─────────────┐  │
│  │ Onboard  │  │ Vouchers  │  │ Campaigns  │  │ Analytics   │  │
│  │ Tools    │  │ Tools     │  │ Tools      │  │ Tools       │  │
│  └──────────┘  └───────────┘  └────────────┘  └─────────────┘  │
│  ┌──────────┐  ┌───────────┐  ┌────────────┐  ┌─────────────┐  │
│  │ Reward   │  │ Member    │  │ Wallet     │  │ Gamification│  │
│  │ Tools    │  │ Tools     │  │ Tools      │  │ Tools       │  │
│  └──────────┘  └───────────┘  └────────────┘  └─────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Boutikio Laravel App                           │
│              289+ Services · 88+ Models · MySQL                  │
│              Redis · Wallet Passes · Queue Workers               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Why Qwen3.5-Plus

| Capability | Details |
|------------|---------|
| **Parameters** | 397B total, 17B active (MoE — efficient, fast inference) |
| **Context** | 1M tokens |
| **Languages** | 201 languages (French + English native-level) |
| **Vision** | Yes — native multimodal (can evaluate uploaded images) |
| **Function Calling** | Yes — native tool_use support via OpenAI-compatible API |
| **Thinking Mode** | Yes — can reason before acting |
| **API** | Alibaba Cloud Model Studio / DashScope (OpenAI-compatible) |
| **Cost** | ~$0.40/M input, ~$2.40/M output (International) or ~$0.115/M input, ~$0.688/M output (Global) |
| **Latency** | Fast — 8-19x faster decoding than Qwen3-Max |

**Why Alibaba Cloud DashScope?** OpenAI-compatible API with zero infrastructure overhead. Pay-as-you-go pricing, no subscription needed. Free 1M token quota to start. If we ever need to self-host, Qwen3.5 is open-weight and runs on standard GPU infrastructure. The API format stays the same.

**Why not Together.ai?** DashScope is cheaper for the same model family and gives us direct access to the latest Qwen models from the source (Alibaba). No middleman markup.

**Why not GPT/Claude?** Cost, control, and no vendor lock-in. Qwen3.5 is open-weight — we can switch providers or self-host anytime.

---

## Open WebUI — The Unified Partner Shell

### The UX Problem: Don't Break the Illusion

If a partner is chatting in a sleek AI interface and clicks "Billing" only to land on a completely different-looking Blade page with a traditional dashboard layout, the experience breaks. It feels like two different products. Confusing, jarring, and it undermines the whole vision.

**The solution:** Everything lives inside Open WebUI's shell. Chat is the default view. Structured pages (billing, settings, receipt config) are embedded pages that share the same navigation, same styling, same feel. The partner never leaves the shell.

### What Open WebUI Gives Us (Free)

- Chat interface with markdown rendering
- Conversation history and search
- User profiles and settings
- File/image upload support
- PWA (installable on mobile)
- Multi-model support (can add models later)
- Admin panel for managing users
- Custom system prompts per model
- Dark/light theme
- Responsive design (mobile-first)
- Plugin/extension system for custom pages

### What Lives in Chat (NemoClaw)

Everything operational — the stuff partners do daily:

- Onboarding (store setup, card design, first rewards)
- Create/manage vouchers, campaigns, rewards
- View analytics and member data
- Social media content generation
- Member re-engagement (PIN codes, reactivation)
- Referral programs
- Quick questions ("how many members do I have?")
- Image uploads (logo, banner — evaluated by vision)

### What Gets Its Own Page (Embedded in Open WebUI)

Structured, form-heavy, or visual content that doesn't work well in chat:

| Page | Why It Needs a Page | What It Shows |
|------|-------------------|---------------|
| **Billing & Subscription** | Stripe payment forms, plan comparison, invoices | Plan selector, payment method, invoice history, usage meter |
| **Account Settings** | Structured form data (email, password, timezone, language) | Profile form, password change, notification preferences |
| **Receipt Settings** | Complex OCR configuration, template rules, validation thresholds | Receipt config form, template editor, test upload |
| **Card Preview** | Visual — partners need to SEE their loyalty card | Live card preview (Apple/Google wallet mockup), QR code |
| **Audit Log** | Tabular data with filters, pagination, export | Table of all NemoClaw actions with timestamps, status, details |
| **Member Directory** | Browsable list with search, filters, bulk actions | Member table with activity, level, points, last visit |

### How Embedded Pages Work

```
┌─────────────────────────────────────────────────────────────────┐
│  Open WebUI Shell                                                │
│  ┌──────────┐  ┌─────────────────────────────────────────────┐  │
│  │ Sidebar  │  │                                             │  │
│  │          │  │  ┌─────────────────────────────────────┐    │  │
│  │ 💬 Chat  │  │  │                                     │    │  │
│  │ 💳 Billing│  │  │   Embedded Page (iframe or plugin)  │    │  │
│  │ ⚙️ Settings│ │  │                                     │    │  │
│  │ 🧾 Receipts│ │  │   Served by Boutikio Laravel app    │    │  │
│  │ 🎴 Card  │  │  │   Styled to match Open WebUI theme  │    │  │
│  │ 📋 Audit │  │  │                                     │    │  │
│  │          │  │  └─────────────────────────────────────┘    │  │
│  └──────────┘  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Two implementation options:**

**Option A: iframe embedding (simpler, faster to ship)**
- Open WebUI sidebar links load Boutikio pages in an iframe
- Boutikio serves these pages with a special "embedded" layout (no header/footer, just content)
- CSS variables sync the theme (dark/light mode, accent colors)
- Auth token passed via postMessage or shared cookie

**Option B: Open WebUI plugins (cleaner, long-term)**
- Build custom Open WebUI plugins (Svelte) for each page
- Plugins call Boutikio API endpoints for data
- Rendered natively inside Open WebUI — no iframe
- Full access to Open WebUI's design system
- More work upfront, but seamless UX

**Recommendation: Start with Option A (iframe), migrate to Option B over time.** Iframes get us running fast with existing Blade views restyled. Plugins are the long-term play for a truly native feel.

### Embedded Page Mockups

**Billing & Subscription:**
```
┌─────────────────────────────────────────────────────────────────┐
│  💳 Billing & Subscription                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Current Plan: Free Tier                                         │
│  Active Members: 87 / 100                                        │
│  ████████████████████░░░░ 87%                                    │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Starter         │  │  Growth ⭐       │  │  Pro             │  │
│  │  €29/mo          │  │  €59/mo          │  │  €99/mo          │  │
│  │  500 members     │  │  2,000 members   │  │  10,000 members  │  │
│  │  Basic analytics │  │  Full analytics  │  │  Everything      │  │
│  │  [Choose Plan]   │  │  [Choose Plan]   │  │  [Choose Plan]   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                  │
│  Payment Method: Visa •••• 4242  [Change]                        │
│  Recent Invoices:                                                │
│  Mar 2026 — €59.00 — Paid ✓  [Download]                         │
│  Feb 2026 — €59.00 — Paid ✓  [Download]                         │
└─────────────────────────────────────────────────────────────────┘
```

**Card Preview:**
```
┌─────────────────────────────────────────────────────────────────┐
│  🎴 Your Loyalty Card                                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────┐                             │
│  │  ┌───────────────────────────┐  │  Store: Café Parisien       │
│  │  │     [Banner Image]        │  │  Members: 87                │
│  │  ├───────────────────────────┤  │  Active rewards: 3          │
│  │  │  [Logo]  Café Parisien   │  │                             │
│  │  │          ⭐ Gold Member   │  │  QR Code:                   │
│  │  │          1,500 points     │  │  ┌─────────┐               │
│  │  │  Next reward: Free Coffee │  │  │ ▓▓▓▓▓▓▓ │               │
│  │  │  ████████████░░ 75%       │  │  └─────────┘               │
│  │  └───────────────────────────┘  │  [Download QR] [Print QR]   │
│  └─────────────────────────────────┘                             │
│                                                                  │
│  Want to change your card? Just tell NemoClaw in chat:           │
│  "Change my banner" or "Update my logo"                          │
└─────────────────────────────────────────────────────────────────┘
```

**Audit Log:**
```
┌─────────────────────────────────────────────────────────────────┐
│  📋 Audit Log                                    [Export CSV]    │
├─────────────────────────────────────────────────────────────────┤
│  Filter: [All Actions ▼]  Period: [Last 7 days ▼]  [Search...] │
├──────────┬──────────────────────┬─────────┬─────────────────────┤
│ Time     │ Action               │ Status  │ Details             │
├──────────┼──────────────────────┼─────────┼─────────────────────┤
│ 10:42 AM │ create_voucher_batch │ ✅ OK   │ 100 vouchers created│
│ 10:38 AM │ get_members          │ ✅ OK   │ 245 members returned│
│ 10:35 AM │ send_pin_code        │ ✅ OK   │ PIN → John D.       │
│ 09:15 AM │ create_campaign      │ 🔒 Blocked │ Subscription req │
├──────────┴──────────────────────┴─────────┴─────────────────────┤
│  Showing 1-4 of 47 actions          [← Previous] [Next →]      │
└─────────────────────────────────────────────────────────────────┘
```

### Theme Synchronization

Embedded pages must match Open WebUI's look and feel:

```css
/* Shared CSS variables injected into embedded pages */
:root {
    --owui-bg-primary: var(--open-webui-bg);
    --owui-text-primary: var(--open-webui-text);
    --owui-accent: var(--open-webui-accent);
    --owui-border: var(--open-webui-border);
    --owui-radius: var(--open-webui-radius);
    --owui-font: var(--open-webui-font);
}
/* Dark mode automatically inherited */
/* Tailwind classes used for consistency */
```

When the partner switches dark/light mode, everything updates together. Same fonts, same spacing, same colors.

---

## Authentication Flow

```
Partner clicks "Login" on Open WebUI
        │
        ▼
Redirected to Boutikio login page (existing)
        │
        ▼
Partner enters email + password (existing auth)
        │
        ▼
Boutikio authenticates → creates session + JWT
        │
        ▼
Redirect back to Open WebUI with auth token
        │
        ▼
Open WebUI session established
        │
        ▼
JWT shared with embedded pages (same origin or postMessage)
        │
        ▼
NemoClaw loads partner context via OpenClaw
```

**Registration follows the same pattern** — Open WebUI's "Sign Up" button redirects to the existing Boutikio registration page. After registration, redirect back to Open WebUI.

No new auth system. No new user tables. We reuse everything. The JWT token authenticates both chat (OpenClaw tool calls) and embedded pages (Boutikio API calls).

---

## Subscription & Billing Model

### Free Tier (Default)

Every partner starts free with full access to all features. No credit card required. No trial period. Just start chatting and set up your loyalty program.

**The catch:** When you hit 100 active members, marketing features get locked until you subscribe.

### What Happens at 100+ Members Without Subscription

| Feature | Status | Why |
|---------|--------|-----|
| Scan & reward | ✅ Always works | Never punish existing members |
| View analytics | ✅ Always works | Partners need visibility |
| View members | ✅ Always works | Basic account access |
| Modify card/rewards | ✅ Always works | Partners can always manage basics |
| Create vouchers | 🔒 Blocked | Marketing feature |
| Create campaigns | 🔒 Blocked | Marketing feature |
| Send PIN codes | 🔒 Blocked | Marketing feature |
| Social sharing | 🔒 Blocked | Marketing feature |
| New member registration | 🔒 Blocked | Growth feature |
| Referral campaigns | 🔒 Blocked | Growth feature |

### Enforcement Logic

OpenClaw checks subscription status before executing marketing tools:

```php
// In OpenClaw tool execution
if ($partner->isOverFreeLimit() && !$partner->hasActiveSubscription()) {
    if ($tool->isMarketingTool()) {
        return NemoClawResponse::subscriptionRequired(
            "You've grown past 100 active members — that's great! "
            . "To keep using marketing features, head to the Billing page "
            . "in your sidebar to pick a plan."
        );
    }
}
```

### NemoClaw Handles It Gracefully

```
Partner: "Create a 20% off voucher for this weekend"

NemoClaw: "Your loyalty program has grown to 142 active members — 
congrats! 🎉 To keep creating vouchers and campaigns, you'll need 
to pick a plan. Just click 'Billing' in your sidebar to see the 
options.

In the meantime, your scan & reward system keeps working perfectly 
for all your members. Want me to help with anything else?"
```

No hard walls. No angry error messages. Just a friendly nudge toward the billing page that's right there in the sidebar.

---

## Natural Language to Tool Calls

Partners don't need to know tool names or syntax. They just talk. Qwen3.5-Plus translates natural language into precise OpenClaw tool calls.

### Examples

**Creating a voucher:**
```
Partner: "I want to offer 15% off for the next two weeks"

Tool call: create_voucher { name: "15% Off", type: "percentage", 
  value: 15, valid_from: "2026-03-17", valid_until: "2026-03-31" }

NemoClaw: "Done! I created a 15% off voucher valid through March 31st. 
Want me to name it something specific?"
```

**Vague request:**
```
Partner: "How's business going?"

Tool call: get_dashboard_stats { period: "last_30_days" }

NemoClaw: "Here's your last 30 days:
- 47 new members (up 12% from last month)
- 312 scans total
- 89% retention rate
- 'Coffee Lover' reward is most redeemed (23 times)

Want me to dig into any of these?"
```

**Ambiguous request:**
```
Partner: "Pause it"

NemoClaw: "Which one? You have:
- 2 active vouchers: '15% Off' and 'Free Dessert Friday'
- 1 active campaign: 'Spring Re-engagement'

Just let me know!"
```

**Image upload with vision:**
```
Partner: [uploads storefront photo] "Use this as my card banner"

NemoClaw evaluates: 1200x800, not blurry, good lighting ✓

Tool call: update_card { card_id, banner_image: [uploaded_file] }

NemoClaw: "Nice photo! I've updated your card banner. Check the 
Card Preview page in your sidebar to see how it looks."
```

**Bad image caught by vision:**
```
Partner: [uploads blurry dark photo] "Use this as my logo"

NemoClaw: "That image is a bit too small and blurry for a logo. 
Could you take another one with better lighting? We also have 
clean default designs if you'd prefer."
```

**Multi-step request:**
```
Partner: "Create a reward for 500 points, a free coffee, 
and also make a voucher for 10% off this month"

Tool calls:
1. create_reward { title: "Free Coffee", points_cost: 500 }
2. create_voucher { name: "10% Off This Month", value: 10 }

NemoClaw: "All set! Created:
1. 'Free Coffee' reward — 500 points to redeem
2. '10% Off This Month' voucher — valid through March 31st"
```

---

## Partner Onboarding via Chat

No forms. No wizards. Just a conversation. When a new partner logs in for the first time, NemoClaw walks them through setup:

```
NemoClaw: "Welcome to Boutikio! I'm here to help you set up your 
loyalty program. What's the name of your store?"

Partner: "Cafe Parisien"

NemoClaw: "Great name! Where is Cafe Parisien located?"

Partner: "12 rue de la Paix, Paris 75002"

NemoClaw: "Perfect. Do you have a logo? Upload an image, or I can 
use a clean default design."

Partner: [uploads logo.png]

NemoClaw: "Looks sharp! Now let's set up your first reward. What 
would you like to offer loyal customers?"

Partner: "Free croissant for 200 points"

NemoClaw: "Love it! Want to add another reward or create a welcome 
voucher for new members?"

Partner: "Add free coffee for 500 points, then a 10% welcome voucher"

NemoClaw: "All set! Here's what we've built:
- Store: Cafe Parisien (12 rue de la Paix, Paris)
- Logo: Uploaded
- Rewards: Free Croissant (200pts), Free Coffee (500pts)
- Welcome voucher: 10% off for 30 days

Your loyalty card is live! Check the Card Preview page in your 
sidebar to grab your QR code."
```

Partners can modify everything at any time via chat — it's not just onboarding.

---

## Daily Operations Examples

### Morning Check-In
```
Partner: "Bonjour, quoi de neuf?"

NemoClaw: "Bonjour! Voici votre resume:
- 8 scans hier
- 3 nouveaux membres cette semaine
- Votre voucher '10% Off' expire dans 5 jours (12 utilisations)
- 2 membres approchent le niveau Gold

Voulez-vous prolonger le voucher ou creer quelque chose de nouveau?"
```

### Member Re-engagement
```
Partner: "Members haven't come back in a while. Can you help?"

NemoClaw: "You have 23 members inactive for 30+ days. I can:
1. Send them a PIN code with 50 bonus points
2. Create a 'We miss you' voucher campaign
3. Both

What sounds good?"

Partner: "Option 1"

NemoClaw: "Done! 23 PIN codes sent via wallet notification."
```

### Social Media Content
```
Partner: "I need an Instagram post about my new voucher"

NemoClaw: "Here's a ready-to-post caption:

🎁 Weekend Special at Cafe Parisien!
Get 15% off this Saturday & Sunday.
Show your loyalty card to claim it.
📍 12 rue de la Paix, Paris

#CafeParisien #LoyaltyRewards #ParisFood

Want me to adjust the tone?"
```

---

## Complete Partner Journey

### Day 0 — Sign Up and Onboarding
1. Partner discovers Boutikio, clicks "Get Started"
2. Creates account on Boutikio registration page
3. Redirected to Open WebUI chat
4. NemoClaw walks them through setup in 5-10 minutes
5. Card is live, QR code available in Card Preview page

### Day 1-7 — First Members
- QR code in store, customers scan and join
- Partner checks in via chat: "How many members?"
- NemoClaw reports progress, suggests improvements

### Day 7-30 — Building Momentum
- First campaign via chat, social media content
- Analytics check-ins, reward adjustments
- NemoClaw proactively suggests improvements

### Day 30-60 — Growth Phase
- 50-80 members, experimenting with vouchers and referrals
- Approaching 100 members (free tier limit)
- NemoClaw mentions billing page in sidebar when relevant

### Day 60+ — Established Program
- 100+ members, subscribed or marketing features blocked
- Daily morning check-in via chat
- Weekly analytics review, monthly performance evaluation via Audit Log page

---

## OpenClaw MCP Tools Reference

Every tool maps to existing Boutikio services. No new business logic.

### Onboarding Tools

| Tool | Service | Parameters |
|------|---------|------------|
| `create_partner_profile` | `PartnerService` | `name, address, phone?, website?` |
| `update_card` | `LoyaltyCardService` | `card_id, logo?, banner?, colors?` |
| `get_onboarding_status` | `PartnerService` | — |
| `generate_qr_code` | `QrCodeService` | `card_id` |

### Voucher Tools

| Tool | Service | Parameters |
|------|---------|------------|
| `create_voucher` | `VoucherBatchService` | `name, type, value, valid_from, valid_until` |
| `create_voucher_batch` | `VoucherBatchService` | `name, quantity, template_data` |
| `pause_voucher` | `VoucherBatchService` | `voucher_id` |
| `resume_voucher` | `VoucherBatchService` | `voucher_id` |
| `get_voucher_stats` | `VoucherBatchService` | `voucher_id` |
| `share_voucher_social` | `VoucherSocialPostService` | `voucher_id, platform` |

### Campaign Tools

| Tool | Service | Parameters |
|------|---------|------------|
| `create_campaign` | `CampaignService` | `name, type, details, start_date, end_date` |
| `pause_campaign` | `CampaignService` | `campaign_id` |
| `resume_campaign` | `CampaignService` | `campaign_id` |
| `get_campaign_performance` | `CampaignService` | `campaign_id` |

### Member Tools

| Tool | Service | Parameters |
|------|---------|------------|
| `get_members` | `MemberAnalyzerService` | `segment?, status?, limit?` |
| `get_member_details` | `MemberAnalyzerService` | `member_id` |
| `reactivate_member` | `AgentManagerService` | `member_id, incentive_points?` |
| `send_pin_code` | `PinCodeGeneratorService` | `member_id, points, reasoning` |
| `bulk_send_pin_codes` | `PinCodeGeneratorService` | `segment, points, reasoning` |
| `get_member_segments` | `MemberAnalyzerService` | — |

### Reward Tools

| Tool | Service | Parameters |
|------|---------|------------|
| `create_reward` | `RewardService` | `title, description, points_cost` |
| `update_reward` | `RewardService` | `reward_id, title?, points_cost?` |
| `pause_reward` | `RewardService` | `reward_id` |
| `resume_reward` | `RewardService` | `reward_id` |
| `get_reward_stats` | `RewardService` | `reward_id` |

### Referral Tools

| Tool | Service | Parameters |
|------|---------|------------|
| `greet_referral` | `SocialFeaturesService` | `member_id, referral_id, message?` |
| `get_referral_stats` | `ReferralService` | `period?` |
| `create_referral_campaign` | `ReferralService` | `name, referrer_points, referred_points` |

### Analytics Tools

| Tool | Service | Parameters |
|------|---------|------------|
| `get_dashboard_stats` | `AnalyticsService` | `period?` |
| `get_retention_metrics` | `RetentionService` | `period?` |
| `get_revenue_report` | `RevenueService` | `period?` |
| `get_top_members` | `MemberAnalyzerService` | `limit?, period?` |

### Wallet Tools

| Tool | Service | Parameters |
|------|---------|------------|
| `update_member_pass` | `UnifiedWalletService` | `member_id, card_id, data` |
| `send_wallet_notification` | `WalletNotificationOrchestrator` | `member_id, card_id, title, message` |
| `send_banner_notification` | `WalletNotificationOrchestrator` | `card_id, title, message` |
| `get_wallet_health` | `UnifiedWalletService` | `card_id?` |

### Gamification Tools

| Tool | Service | Parameters |
|------|---------|------------|
| `unlock_achievement` | `AchievementService` | `member_id, card_id, achievement_type` |
| `apply_point_multiplier` | `GamificationService` | `member_id, card_id, multiplier, reason` |
| `get_member_progress` | `GamificationService` | `member_id, card_id` |
| `get_leaderboard` | `LeaderboardService` | `card_id, period?, limit?` |

### Geofencing Tools

| Tool | Service | Parameters |
|------|---------|------------|
| `create_geofence_rule` | `GeofencingNotificationService` | `card_id, location_id, radius, notification` |
| `get_geofence_analytics` | `GeofencingNotificationService` | `card_id, days?` |

### Subscription-Gated Tools

**Require subscription after 100 members:** All voucher tools, all campaign tools, `send_pin_code`, `bulk_send_pin_codes`, `create_referral_campaign`, `greet_referral`

**Always work:** All `get_*` tools, `update_card`, reward CRUD, wallet reads, gamification reads

---

## Existing Boutikio Infrastructure

OpenClaw reuses everything. Here's what already exists:

### Key Services (289+ total)

| Category | Services | Purpose |
|----------|----------|---------|
| **Voucher** | `VoucherBatchService`, `VoucherSocialPostService` | Create, manage, share vouchers |
| **Campaign** | `AgentManagerService`, `AgentCampaignService` | Marketing campaigns |
| **Member** | `MemberAnalyzerService`, `MemberActivityService` | Member insights |
| **Reward** | `RewardService`, `CheckRewardEligibility` | Reward CRUD |
| **PIN Code** | `PinCodeGeneratorService` | Re-engagement PINs |
| **Wallet** | `UnifiedWalletService`, `WalletNotificationOrchestrator` | Apple/Google passes |
| **Gamification** | `GamificationService`, `AchievementService`, `LevelService` | Levels, achievements |
| **Geofencing** | `GeofencingNotificationService` | Location notifications |
| **Social** | `SocialFeaturesService` | Referrals, sharing |
| **Analytics** | `EnhancedAnalyticsService`, `RetentionService` | KPIs, retention |
| **Receipt** | `ReceiptProcessingService`, `OcrService` | Receipt scanning |

### Level System (Already Built)

```
Level 1:  New          (0 pts)     Level 6:  Diamond    (5,000 pts)
Level 2:  Bronze     (100 pts)     Level 7:  Master    (10,000 pts)
Level 3:  Silver     (500 pts)     Level 8:  Grand Master (25k pts)
Level 4:  Gold     (1,000 pts)     Level 9:  Legend    (50,000 pts)
Level 5:  Platinum (2,500 pts)     Level 10: Mythic   (100,000 pts)
```

---

## NemoClaw AI System Prompt (Draft)

```
You are NemoClaw, the AI assistant for Boutikio loyalty program management.

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

## Security and Authentication

### Authentication Chain

```
Partner -> Open WebUI -> Boutikio Auth -> JWT Session
                                            |
                                            v
                              Open WebUI -> Alibaba Cloud DashScope API (NemoClaw)
                                            |
                                            v
                              Qwen3.5-Plus -> tool_call -> OpenClaw
                                            |
                                            v
                              OpenClaw validates:
                              1. Partner session valid
                              2. Permission for tool
                              3. Subscription allows action
                              4. Rate limit not exceeded
                                            |
                                            v
                              Execute via Boutikio service
                              Log to agent_audit_logs
```

### Security Layers

| Layer | What It Does |
|-------|-------------|
| Open WebUI Auth | Session management, login/logout |
| Boutikio Auth | Email + password, Sanctum tokens |
| OpenClaw Permissions | Per-tool permission checks |
| Subscription Gate | Marketing tools blocked if over free limit |
| Rate Limiting | Per-partner request limits |
| Audit Logging | Every tool call logged |
| Input Validation | Laravel validation on all parameters |
| Partner Scoping | Every query scoped to authenticated partner |

---

## Dashboard Sunset Roadmap

### Phase 1: Chat Alongside Dashboard (Month 1-3)
- Open WebUI deployed with embedded pages
- Partners can use either interface
- NemoClaw handles: onboarding, vouchers, rewards, analytics
- Embedded pages handle: billing, settings, receipt config, card preview

### Phase 2: Chat-Primary (Month 3-6)
- Most daily operations happen via chat
- Dashboard becomes "legacy" mode
- NemoClaw handles: campaigns, member management, social sharing
- Embedded pages mature (Option A iframes -> Option B plugins)

### Phase 3: Chat-Only (Month 6-12)
- All operational features via chat
- Embedded pages cover all structured needs
- Old dashboard available on request (support cases only)
- New partners onboard exclusively via Open WebUI

### Phase 4: Dashboard Retired (Month 12+)
- Old Blade dashboard fully retired
- Everything lives in Open WebUI shell
- Chat + embedded pages = complete partner experience

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Deploy Open WebUI (Docker, self-hosted)
- [ ] Configure Alibaba Cloud DashScope API connection (Qwen3.5-Plus)
- [ ] Set up NemoClaw system prompt
- [ ] Implement Open WebUI <-> Boutikio auth bridge (JWT)
- [ ] Basic OpenClaw tool execution framework
- [ ] Partner scoping and permission checks

### Phase 2: Embedded Pages (Week 3-4)
- [ ] Billing page (iframe, Stripe integration)
- [ ] Account Settings page (iframe)
- [ ] Card Preview page (iframe, QR code)
- [ ] Audit Log page (iframe)
- [ ] Open WebUI sidebar customization
- [ ] Theme synchronization (CSS variables)

### Phase 3: Onboarding Tools (Week 5-6)
- [ ] `create_partner_profile` tool
- [ ] `update_card` tool (logo, banner, colors)
- [ ] `generate_qr_code` tool
- [ ] Image quality evaluation via Qwen3.5-Plus vision
- [ ] Onboarding conversation flow testing

### Phase 4: Core Operations (Week 7-8)
- [ ] Voucher tools (create, pause, resume, stats)
- [ ] Reward tools (create, update, pause, resume)
- [ ] Member tools (list, details, segments)
- [ ] Analytics tools (dashboard stats, retention)
- [ ] Subscription enforcement logic

### Phase 5: Marketing and Engagement (Week 9-10)
- [ ] Campaign tools (create, pause, resume)
- [ ] PIN code tools (send, bulk send)
- [ ] Social sharing tools
- [ ] Referral tools
- [ ] Wallet notification tools

### Phase 6: Advanced Features (Week 11-12)
- [ ] Gamification tools (achievements, leaderboard, levels)
- [ ] Geofencing tools
- [ ] Receipt Settings embedded page
- [ ] Member Directory embedded page
- [ ] Multi-language refinement (French/English)
- [ ] PWA testing, load testing, beta launch

---

## Open Questions

1. **Conversation Memory** — Should NemoClaw remember context across sessions? Open WebUI stores history, but should the AI reference past conversations?

2. **Proactive Messages** — Should NemoClaw send proactive alerts? ("Your voucher is 90% redeemed") Requires background jobs pushing to Open WebUI.

3. **Multi-Partner Accounts** — Can one login manage multiple stores? (Franchise owners) Open WebUI supports workspaces — could map to partner accounts.

4. **Approval Workflow** — Should sensitive actions (bulk PIN codes, large batches) require a separate confirmation step beyond "are you sure?"

5. **Offline/Fallback** — What if Alibaba Cloud DashScope is down? Fallback LLM provider? Graceful degradation?

6. **Voice Input** — Open WebUI supports voice. Should we optimize NemoClaw for voice conversations?

7. **Charts in Chat** — Should NemoClaw render charts inline? Open WebUI supports markdown. Could generate ASCII charts or link to visual dashboard.

8. **Onboarding Completion Tracking** — How do we track if partners finish onboarding? Follow up if they abandon mid-setup?

9. **iframe vs Plugin Timeline** — When do we migrate embedded pages from iframe (Option A) to native plugins (Option B)?

10. **Data Retention** — Conversation history in Open WebUI — what's our retention policy? Auto-delete after X days?

---

## Next Steps

- [ ] Evaluate Open WebUI deployment options (Docker)
- [ ] Test Alibaba Cloud DashScope API with Qwen3.5-Plus function calling
- [ ] Draft NemoClaw system prompt v2 with more examples
- [ ] Design the auth bridge (Open WebUI <-> Boutikio JWT)
- [ ] Prototype embedded Billing page (iframe in Open WebUI)
- [ ] Prototype first 3 OpenClaw tools
- [ ] Test image upload + vision evaluation flow
- [ ] Define subscription enforcement rules
- [ ] Plan beta partner selection
- [ ] Continue brainstorming on open questions

---

*Brainstorming session — The Claw Ecosystem (Open WebUI + Qwen3.5-Plus + OpenClaw)*
*Updated: Unified shell approach — all pages embedded inside Open WebUI, no external Blade redirects*

---

## How Open WebUI Actually Works (Research)

Based on deep analysis of Open WebUI's codebase (v0.8.1):

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | SvelteKit 2.x (Svelte 5), TipTap editor, Yjs (CRDT) |
| Backend | FastAPI (Python), SQLAlchemy ORM, Pydantic |
| Database | SQLite (default) or PostgreSQL |
| Real-time | Socket.IO (WebSockets) |
| Auth | JWT + OAuth 2.1 with dynamic client registration |
| Storage | Local filesystem, S3, or Azure Blob |
| Cache/Pub-Sub | Redis (for multi-instance deployments) |

### OAuth 2.1 Integration (How Boutikio Becomes the Auth Provider)

Open WebUI has built-in OAuth support via `OAUTH_PROVIDERS` environment config. It supports:
- Authorization Code flow with PKCE
- Dynamic client registration
- Token exchange (`ENABLE_OAUTH_TOKEN_EXCHANGE`)
- Role/group mapping from OAuth claims

**What Boutikio needs to expose:**

```
Boutikio (Laravel) must act as an OAuth 2.0 Authorization Server:

1. Install Laravel Passport (or extend Sanctum)
2. Expose these endpoints:
   - GET  /.well-known/openid-configuration    → discovery document
   - GET  /oauth/authorize                      → authorization screen
   - POST /oauth/token                          → token exchange
   - GET  /oauth/userinfo                       → user profile (sub, name, email, role)
   - GET  /oauth/jwks                           → JSON Web Key Set

3. Register Open WebUI as an OAuth client:
   - client_id: "open-webui"
   - redirect_uri: "https://chat.boutikio.com/oauth/callback"
   - scopes: openid, profile, email, partner
```

**Open WebUI environment config:**

```yaml
OAUTH_PROVIDERS: |
  {
    "boutikio": {
      "client_id": "open-webui",
      "client_secret": "${BOUTIKIO_OAUTH_SECRET}",
      "server_url": "https://app.boutikio.com",
      "scope": "openid profile email partner",
      "redirect_uri": "https://chat.boutikio.com/oauth/callback",
      "provider_name": "Boutikio",
      "icon_url": "/static/boutikio-logo.svg"
    }
  }
ENABLE_OAUTH_SIGNUP: true
ENABLE_OAUTH_TOKEN_EXCHANGE: true
```

When a partner clicks "Login with Boutikio" on Open WebUI, the flow is:
1. Open WebUI redirects to `https://app.boutikio.com/oauth/authorize`
2. Partner logs in (existing Boutikio auth)
3. Boutikio redirects back with authorization code
4. Open WebUI exchanges code for access token + ID token
5. Open WebUI creates/updates local user from ID token claims
6. Partner is logged in — session established

The access token from Boutikio is stored by Open WebUI and can be passed to tool servers via `system_oauth` auth type. This means OpenClaw receives the partner's Boutikio token on every tool call — no separate auth needed.

### Tool Execution System (How OpenClaw Connects)

Open WebUI supports 3 types of tools:

| Type | How It Works | Best For |
|------|-------------|----------|
| **Functions** | Python code running inside Open WebUI process | Simple utilities, data transforms |
| **OpenAPI Tools** | HTTP calls to external API described by OpenAPI spec | REST APIs with structured endpoints |
| **MCP Servers** | Model Context Protocol servers (stdio or SSE) | Complex tool servers with state |

**For OpenClaw, we have two good options:**

**Option 1: OpenAPI Tool Server (Recommended to start)**

OpenClaw exposes an OpenAPI spec describing all tools. Open WebUI auto-discovers tools from the spec and calls them via HTTP.

```
OpenClaw serves:
  GET  /openapi.json                    → tool definitions
  POST /tools/create_voucher            → execute tool
  POST /tools/get_dashboard_stats       → execute tool
  ...etc

Each endpoint:
  - Receives partner's OAuth token via Authorization header
  - Validates token against Boutikio
  - Executes the corresponding service
  - Returns structured response
```

Register in Open WebUI admin panel:
- URL: `https://api.boutikio.com/openclaw/openapi.json`
- Auth: `system_oauth` (passes partner's Boutikio token automatically)

**Option 2: MCP Server (Long-term)**

OpenClaw runs as an MCP server (SSE transport). Open WebUI connects via MCP protocol.

```
OpenClaw MCP server:
  - Transport: SSE (Server-Sent Events) over HTTP
  - Endpoint: https://api.boutikio.com/openclaw/mcp
  - Lists tools via MCP protocol
  - Receives tool calls with partner context
  - Returns results via SSE stream
```

MCP gives us streaming responses and richer tool metadata, but OpenAPI is simpler to implement first since OpenClaw is already a Laravel app — just add API routes.

**Recommendation: Start with OpenAPI, migrate to MCP when we need streaming or richer tool interactions.**

### SvelteKit Frontend (How to Add Sidebar Items and Embedded Pages)

Open WebUI's frontend is SvelteKit 2.x with Svelte 5. The sidebar is component-based:

```
src/lib/components/layout/Sidebar.svelte
  └── Navigation items are rendered from a config/store
  └── Custom items can be added via:
      1. Modifying the sidebar component (fork approach)
      2. Using Open WebUI's "Workspace" feature (pages/channels)
      3. Injecting via a custom plugin/function
```

**For embedded pages, the practical approach:**

1. **Fork Open WebUI** (we're self-hosting anyway)
2. Add custom routes in SvelteKit: `/billing`, `/settings`, `/card-preview`, `/audit-log`
3. Each route renders an iframe pointing to Boutikio's embedded layout
4. Sidebar items link to these custom routes
5. Theme sync via CSS variables + postMessage bridge

The fork is minimal — we're adding routes and sidebar items, not changing core functionality. We can rebase on upstream releases easily since our changes are additive.

### Key Open WebUI Config Variables

```bash
# Core
WEBUI_URL=https://chat.boutikio.com
WEBUI_NAME="Boutikio"
WEBUI_SECRET_KEY=${RANDOM_SECRET}

# Auth (Boutikio OAuth)
ENABLE_OAUTH_SIGNUP=true
ENABLE_LOGIN_FORM=false          # Hide email/password, force OAuth
OAUTH_MERGE_ACCOUNTS_BY_EMAIL=true

# LLM (Alibaba Cloud DashScope / Qwen3.5-Plus)
OPENAI_API_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
OPENAI_API_KEY=${DASHSCOPE_API_KEY}
DEFAULT_MODELS=qwen3.5-plus

# Tools (OpenClaw)
# Registered via admin panel as OpenAPI tool server

# Branding
WEBUI_FAVICON_URL=/static/boutikio-favicon.ico
SHOW_ADMIN_DETAILS=false
ENABLE_COMMUNITY_SHARING=false
ENABLE_MESSAGE_RATING=false
```

---

## Concrete Implementation Steps

This is the actual "how do we build this" section. Ordered by dependency — each step unlocks the next.

### Step 1: Deploy Open WebUI (Day 1-2)

```bash
# Docker Compose (production)
docker compose up -d open-webui

# Or standalone Docker
docker run -d \
  --name open-webui \
  -p 3000:8080 \
  -v open-webui-data:/app/backend/data \
  -e WEBUI_NAME="Boutikio" \
  -e WEBUI_URL="https://chat.boutikio.com" \
  ghcr.io/open-webui/open-webui:latest
```

**Verify:** Access `https://chat.boutikio.com`, create admin account, confirm chat works with a test model.

### Step 2: Connect Alibaba Cloud DashScope + Qwen3.5-Plus (Day 2-3)

```bash
# Add to Open WebUI environment
OPENAI_API_BASE_URL=https://dashscope-intl.aliyuncs.com/compatible-mode/v1
OPENAI_API_KEY=your-dashscope-api-key
```

In Open WebUI admin panel:
1. Go to Settings → Connections
2. Add OpenAI-compatible connection pointing to DashScope
3. Select `qwen3.5-plus` as default model
4. Set NemoClaw system prompt (from the draft in this doc)
5. Test: "Hello, who are you?" → should respond as NemoClaw

### Step 3: Configure Boutikio as OAuth Provider (Day 3-7)

**On Boutikio (Laravel) side:**

```bash
composer require laravel/passport
php artisan passport:install
php artisan passport:client --public \
  --name="Open WebUI" \
  --redirect_uri="https://chat.boutikio.com/oauth/callback"
```

Build these endpoints:
- `/.well-known/openid-configuration` — OIDC discovery document
- `/oauth/authorize` — authorization screen (can reuse existing login page)
- `/oauth/token` — token exchange
- `/oauth/userinfo` — returns `{ sub, name, email, partner_id, role }`
- `/oauth/jwks` — JSON Web Key Set for token verification

**On Open WebUI side:**

Configure `OAUTH_PROVIDERS` environment variable (see config above).

**Test:** Click "Login with Boutikio" on Open WebUI → redirects to Boutikio → login → redirected back → logged in.

### Step 4: Build OpenClaw Tool Server (Day 7-14)

Create a new Laravel route group for OpenClaw:

```
routes/openclaw.php:
  GET  /openclaw/openapi.json          → OpenAPI spec with all tool definitions
  POST /openclaw/tools/{tool_name}     → Execute a tool

app/Http/Controllers/OpenClaw/
  ToolController.php                   → Routes tool calls to services
  OpenApiSpecController.php            → Generates OpenAPI spec

app/Services/OpenClaw/
  ToolRegistry.php                     → Maps tool names to service methods
  ToolExecutor.php                     → Validates, executes, logs
  SubscriptionGate.php                 → Checks free tier limits
```

Each tool call:
1. Receives partner's OAuth token (from Open WebUI via `Authorization` header)
2. Validates token → extracts `partner_id`
3. Checks subscription gate (marketing tools blocked if over 100 members)
4. Calls existing Boutikio service
5. Logs to `agent_audit_logs`
6. Returns structured JSON response

Register in Open WebUI admin panel as OpenAPI tool server.

**Test:** In chat, say "How many members do I have?" → NemoClaw calls `get_dashboard_stats` → OpenClaw executes → returns data.

### Step 5: Build Embedded Pages (Day 14-21)

**On Boutikio side — create embedded layouts:**

```
resources/views/layouts/embedded.blade.php
  → No header, no footer, no sidebar
  → Just content area
  → Includes theme sync JavaScript (listens for postMessage from parent)
  → Tailwind CSS with CSS variable overrides

resources/views/embedded/
  billing.blade.php          → Stripe elements, plan selector, invoices
  settings.blade.php         → Profile form, password, notifications
  card-preview.blade.php     → Live card mockup, QR code download
  audit-log.blade.php        → Filterable table of NemoClaw actions
  receipt-settings.blade.php → OCR config, template rules
  member-directory.blade.php → Searchable member table

routes/embedded.php:
  GET /embedded/billing       → requires auth (OAuth token)
  GET /embedded/settings      → requires auth
  GET /embedded/card-preview  → requires auth
  GET /embedded/audit-log     → requires auth
  GET /embedded/receipts      → requires auth
  GET /embedded/members       → requires auth
```

**On Open WebUI side — fork and add routes:**

```
src/routes/billing/+page.svelte      → <iframe src="https://app.boutikio.com/embedded/billing">
src/routes/settings/+page.svelte     → <iframe src="...">
src/routes/card-preview/+page.svelte → <iframe src="...">
src/routes/audit-log/+page.svelte    → <iframe src="...">
```

Add sidebar items pointing to these routes.

**Theme sync bridge:**

```javascript
// In Open WebUI parent (Svelte)
const iframe = document.querySelector('iframe');
const theme = getComputedStyle(document.documentElement);
iframe.contentWindow.postMessage({
  type: 'theme-sync',
  vars: {
    '--bg': theme.getPropertyValue('--color-bg'),
    '--text': theme.getPropertyValue('--color-text'),
    '--accent': theme.getPropertyValue('--color-accent'),
    '--mode': document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  }
}, '*');

// In Boutikio embedded page (Blade)
window.addEventListener('message', (e) => {
  if (e.data.type === 'theme-sync') {
    Object.entries(e.data.vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val);
    });
    document.documentElement.classList.toggle('dark', e.data.vars['--mode'] === 'dark');
  }
});
```

### Step 6: Customize Branding (Day 21-23)

- Replace Open WebUI logo with Boutikio logo
- Set favicon, PWA manifest name/icons
- Hide unnecessary Open WebUI features (community sharing, model selector for non-admins)
- Set default model to NemoClaw (Qwen3.5-Plus)
- Configure welcome message for new partners (onboarding trigger)

### Step 7: Test End-to-End (Day 23-28)

1. New partner signs up on Boutikio → redirected to Open WebUI
2. NemoClaw starts onboarding conversation
3. Partner sets up store, uploads logo (vision evaluates quality)
4. Partner creates rewards and vouchers via chat
5. Partner checks billing page in sidebar
6. Partner views card preview, downloads QR code
7. Partner checks audit log of all NemoClaw actions
8. Partner hits 100 members → marketing tools blocked → billing nudge
9. Partner subscribes → marketing tools unlocked
10. Dark/light mode toggle → all pages sync theme

---

## Is This Document Enough?

This document covers the full vision, architecture, and implementation plan. Here's what it gives us:

**What we CAN build from this doc:**
- Deploy and configure Open WebUI
- Connect Qwen3.5-Plus via Alibaba Cloud DashScope
- Build the OAuth bridge between Boutikio and Open WebUI
- Build OpenClaw as an OpenAPI tool server
- Build all embedded pages with iframe approach
- Implement subscription enforcement
- Ship a working MVP in ~4 weeks

**What we'll figure out as we build:**
- Exact Open WebUI fork changes (sidebar component specifics)
- NemoClaw system prompt refinement (needs real conversation testing)
- Edge cases in tool execution (error handling, timeouts)
- Theme sync pixel-perfect matching (CSS variable mapping)
- Performance tuning (DashScope latency, OpenClaw response times)

**What's NOT in this doc (and doesn't need to be yet):**
- Detailed API contracts for every OpenClaw tool (build as we go)
- Stripe integration specifics (existing billing code can be reused)
- Load testing numbers (premature until MVP works)
- Migration plan for existing partners (Phase 2+ concern)

The document is a solid foundation. The next move is to start building — Step 1 (deploy Open WebUI) and Step 2 (connect DashScope) can happen today.

---

*Last updated: 2026-03-17 — Switched from Together.ai to Alibaba Cloud DashScope. Added Open WebUI research findings and concrete implementation steps.*
*Implementation split into two focused docs: `openclaw-laravel.md` (this repo) and `openclaw-openwebui.md` (Open WebUI repo)*
