# BoutikioChat — AI-Powered Partner Command Center

## Vision

BoutikioChat is a **conversational interface** that replaces the traditional partner dashboard body. It sits inside the existing layout — same nav bar, same menus — and transforms the landing page from 8 static navigation cards into a live, intelligent inbox of actionable items.

The partner's role shifts from **operator** to **approver**. They don't need marketing knowledge, dashboard literacy, or time to manage campaigns. They open the app, act on ready-to-go suggestions, and get back to running their business.

**BoutikioChat is not a new AI system. It is a new presentation layer on top of existing data and services.**

### 🚫 No LLM Required for MVP

This is a **UX/information architecture project**, not an AI project. The entire Phase 1 and Phase 2 are powered by:
- SQL queries on real tables (`transactions`, `vouchers`, `receipt_submissions`, `referrals`, `card_member`)
- PHP logic (counts, date diffs, averages)
- Blade components + Alpine.js for interactivity
- Deterministic slash command matching (string comparison)

The existing GPT-4 integration remains available for **content enhancement on form fields** (the feature already in production). LLM-powered intent parsing and content generation are **optional future enhancements** (Phase 3+), not blockers.

---

## ⚠️ CRITICAL: Reality Check — What Data Actually Exists

This platform is a **standalone loyalty system**. Data doesn't come from magic — it comes from **real member activities through their wallet passes**. The chat interface can ONLY display and act on data that actually flows through the system. Here is the honest mapping:

### Real Data Sources (What Members Actually Do)

| Member Activity | Model(s) | Events | What It Generates |
|----------------|----------|--------|-------------------|
| **Pass scan** (QR at store) | `Transaction` | `TransactionCreated` | Points issued, visit recorded, timestamps |
| **Receipt scan** | `ReceiptSubmission`, `ReceiptData` | `ReceiptApprovedEvent` | Purchase amount, items, OCR data, points awarded |
| **Voucher claim** | `Voucher`, `member_voucher` pivot | `VoucherCreated` | Claim count, claim date per member |
| **Voucher redeem** | `VoucherRedemption` | `VoucherRedeemed` | Redemption date, void status, staff who verified |
| **Point request** (member→staff) | `PointRequest`, `Transaction` | — | Pending/approved/rejected requests |
| **Referral** | `Referral` | — | Referrer/referee, usage count, referral code usage |
| **Reward claim** | `Transaction` (with `reward_id`) | — | Which reward, when, points spent |
| **Pass add to wallet** | `ApplePassRegistration`, `member_card` | — | Apple/Google wallet adds, device registrations |
| **Member registration** | `Member` | `MemberRegistered` | Sign-up date, source (referral/direct/QR) |
| **Card views** | `Analytic` | — | Card views per day/week/month tracked by AnalyticsService |
| **Achievement unlock** | `MemberAchievement` | `AchievementUnlocked` | Gamification progress |
| **Level progression** | — | `LevelProgression` | Tier changes |

### Derived Metrics (Computable from Real Data)

| Metric | How It's Calculated | Source |
|--------|---------------------|--------|
| **Visit frequency** | Count `Transaction` per member over time | `transactions` table |
| **Last visit date** | MAX(`created_at`) from `Transaction` per member | `transactions` table |
| **Days since last visit** | `now() - last_visit_date` | Derived |
| **Total points balance** | SUM of card_member pivot `points` column | `card_member` pivot |
| **Points issued/redeemed** | `AnalyticsService::pointsIssuedWeek()`, `pointsRedeemedWeek()` | `transactions` table |
| **Rewards claimed** | `AnalyticsService::rewardsClaimedWeek()` | `transactions` where `reward_id` is set |
| **Vouchers available/used** | `Voucher::scopeAvailable()`, redemption counts | `vouchers` + `voucher_redemptions` |
| **Referral count** | `Referral::where('referrer_id', $member)->count()` | `referrals` table |
| **Receipt submission count** | `ReceiptSubmission::where('member_id', $member)->count()` | `receipt_submissions` table |
| **Member count** | Card's members relation | `card_member` pivot |
| **Revenue (from receipts)** | SUM `purchase_amount` from `ReceiptData` | `receipt_data` table |
| **Day-of-week activity patterns** | Group `Transaction` by day of week | `transactions` table |

### What Does NOT Exist (Honest Assessment)

| Aspirational Feature | Reality |
|---------------------|---------|
| **"Churn prediction"** | The `PredictiveAnalyticsService` has methods, but true ML models require significant historical data. **For now, churn = "hasn't visited in X days compared to their average frequency."** This is a simple query, not ML. |
| **"LTV forecasting"** | Same — deterministic calculation based on visit frequency × average spend, not real ML models. |
| **"Cross-partner intelligence"** | Partners are isolated. Each partner sees only their own members' data. No network effects yet. |
| **"A/B testing"** | Infrastructure exists in `AgentCampaignOptimizationService::createABTest()` but requires a critical mass of actions to be statistically significant. Most small shops won't have enough volume. |
| **"Behavioral segmentation"** | `SegmentationService` exists but real segmentation needs enough member diversity to be meaningful. For a kebab shop with 50 members, "VIP vs. Cold" is the most you can segment. |
| **"Event intelligence"** | `EventIntelligenceService` can check weather and holidays. Eventbrite/Ticketmaster APIs are stubbed but not battle-tested. |
| **"Agent approval learning"** | `AgentAutoApprovalLearningService` exists but needs enough partner approvals/rejections to actually learn. This ramps up over time. |

### The Honesty Principle

**Every chat card must be powered by a real query on real data.** No hardcoded scenario cards. If a partner has 5 members and zero transactions, the chat should say: *"Pas encore d'activité. Partagez votre QR code pour commencer!"* — not show fake "12 members going cold" cards.

---

## The Paradigm Shift

| | Traditional Dashboard | **BoutikioChat** |
|---|---|---|
| **Who drives?** | Partner navigates menus | **Agent proposes, partner approves in chat** |
| **Partner's role** | Operator | **Approver** |
| **Mental model** | "I manage my loyalty program" | **"My assistant handles it, I just approve"** |
| **Data shown** | Static cards linking to pages | **Live insights computed from real transactions** |
| **Daily time** | 15-30 minutes navigating | **30 seconds to 2 minutes tapping** |

---

## Architecture: Keep Nav, Replace Body

The implementation modifies **only the dashboard body**. The existing top navigation stays intact.

### What's Preserved (Zero Changes)

```
partner/layouts/default.blade.php → UNTOUCHED
├── Top nav: Boutikio logo, profile, language, dark mode
├── Secondary nav: Tableau de bord, Campagnes ▾, Utilisateurs ▾, Marketing ▾, Analytique
├── Mobile drawer menu
└── @yield('content') ← ONLY THIS CHANGES
```

### All Existing Routes Still Work

| Nav Item | Route | Status |
|----------|-------|--------|
| **Tableau de bord** | `partner.index` | ← **Only page modified** |
| Campagnes → Emplacements | `partner.locations.index` | ✅ Untouched |
| Campagnes → Cartes de fidélité | `partner.membership-cards.index` | ✅ Untouched |
| Campagnes → Récompenses | `partner.rewards.index` | ✅ Untouched |
| Utilisateurs → Personnel | `partner.staff.index` | ✅ Untouched |
| Utilisateurs → Membres | `partner.data.list` (members) | ✅ Untouched |
| Marketing → Autopilot | `partner.autopilot.index` | ✅ Untouched |
| Marketing → Bons d'achat | `partner.vouchers.index` | ✅ Untouched |
| Analytique | `partner.analytics` | ✅ Untouched |

**Partners can always fall back to manual navigation.** The chat is additive, not a replacement for existing functionality.

### What's Modified

```
partner/index.blade.php → MODIFIED (51 lines → chat body)
├── Remove: 8 static dashboard cards grid
├── Add: Chat stream with action cards
├── Add: Suggestion chips
└── Add: Input bar
```

---

## Chat Cards: Data-Driven, Not Hardcoded

Every card type must be backed by a **real query**. Here are the cards that can actually work from day one:

### Tier 1: Cards Powered by Raw Queries (No AI needed)

These require zero AI — just SQL queries on existing tables.

#### 📊 Daily Stats Summary
```
QUERY:   Transaction::where('card_id', $cardId)
            ->whereDate('created_at', today())
            ->count()  // + SUM points, etc.
DATA:    Transactions today, points issued, points redeemed, rewards claimed
TRIGGER: Every time partner opens dashboard
CARD:    "Aujourd'hui: 12 transactions, 340 points émis, 2 récompenses réclamées"
```

#### 😴 Inactive Members Alert
```
QUERY:   Members whose last Transaction is > 2× their average visit frequency
         Transaction::select('member_id', DB::raw('MAX(created_at) as last_visit'))
            ->groupBy('member_id')
            ->having('last_visit', '<', now()->subDays(14))
DATA:    Member names, last visit date, usual frequency
TRIGGER: Computed on dashboard load
CARD:    "5 membres fidèles n'ont pas visité depuis 14 jours"
ACTION:  Link to member list (existing page) OR trigger voucher send flow
```

#### 📋 Pending Receipts
```
QUERY:   ReceiptSubmission::where('card_id', $cardId)
            ->where('status', 'pending')
            ->count()
DATA:    Count of pending receipts
TRIGGER: On dashboard load
CARD:    "3 reçus en attente de validation"
ACTION:  Link to existing receipt dashboard (partner.receipts.dashboard)
```

#### 🎟️ Voucher Status
```
QUERY:   Voucher::forPartner($partnerId)->active()->get()
DATA:    Active vouchers, claims count, redemption count, exhausted ones
TRIGGER: On dashboard load
CARD:    "Bon 'Summer 10%': 45/100 réclamés, 12 utilisés, expire dans 5 jours"
ACTION:  Link to existing voucher page OR create new voucher flow
```

#### 🎉 Member Milestones
```
QUERY:   Members who recently hit a round transaction count (10th, 25th, 50th, 100th)
         OR who just crossed a reward threshold
DATA:    Member name, milestone type, visit count
TRIGGER: Events — MilestoneReached, LevelProgression, AchievementUnlocked
CARD:    "Fatima R. a effectué sa 50ème visite! 🎉"
ACTION:  Send congratulations via wallet notification (existing service)
```

#### 📈 Period Comparison
```
QUERY:   AnalyticsService::pointsIssuedWeek() vs. previous week
DATA:    This week vs. last week: transactions, points, members, rewards
TRIGGER: On dashboard load
CARD:    "Cette semaine: +15% de transactions vs. la semaine dernière"
```

#### 🔗 Referral Activity
```
QUERY:   Referral::where('card_id', $cardId)
            ->where('created_at', '>=', now()->subDays(7))
DATA:    New referrals this week, who referred whom
TRIGGER: On dashboard load
CARD:    "3 nouveaux membres via parrainage cette semaine"
```

#### 👥 New Members
```
QUERY:   card_member pivot where created_at is recent
DATA:    New member count, names, source (referral/QR/direct)
TRIGGER: On dashboard load
CARD:    "7 nouveaux membres cette semaine (3 via parrainage, 4 direct)"
```

### Tier 2: Cards With Simple Logic (Rule-Based, No ML)

These use simple rules, not AI predictions.

#### 📉 Slow Day Detection
```
LOGIC:   Group Transaction by day of week over last 8 weeks
         Find day with lowest average
         IF today is that day → suggest action
DATA:    Day-of-week transaction averages
TRIGGER: On dashboard load, if today matches the slow day
CARD:    "Mercredi est votre jour le plus calme (-40% vs. moyenne)"
ACTION:  Partner types "create voucher for today" or taps chip
```

#### ⚠️ Expiring Vouchers
```
LOGIC:   Voucher::where('valid_until', '<=', now()->addDays(3))
         Where claims < usage_limit
DATA:    Vouchers about to expire with remaining capacity
TRIGGER: On dashboard load
CARD:    "Votre bon 'Été 10%' expire dans 3 jours. 55 restants non utilisés."
ACTION:  Extend voucher or share link
```

#### 💰 Budget Status (Agent Mode)
```
LOGIC:   AgentConfiguration::where('partner_id', $partnerId)
         Compare weekly_spent vs. weekly_budget
DATA:    Budget percentage, remaining amount
TRIGGER: On dashboard load (only if agent is active)
CARD:    "Budget agent: 78% utilisé cette semaine (€39/€50)"
```

### Tier 3: Cards With AI Enhancement (GPT-4 Content)

These use the existing GPT-4 integration via `AiService` for content drafting — not for data analysis.

#### ✏️ AI-Generated Voucher Names
```
WHEN:    Partner starts "create voucher" flow
AI USE:  Generate voucher name + description based on voucher type
SERVICE: AiService::handleRequest() with 'autofill' action
EXAMPLE: Partner says "10% pour été" → AI generates "🌞 Été Frais -10%"
```

#### 📱 Social Media Caption
```
WHEN:    After voucher creation, partner taps "Share"
AI USE:  Generate social media caption in FR + EN
SERVICE: AiService::handleRequest() with custom prompt
EXAMPLE: "Profitez de 10% de rabais cet été! Scannez le lien..."
```

#### 💬 Geofencing Messages
```
WHEN:    Partner configures geofencing messages
AI USE:  Generate lockscreen notification text
SERVICE: AiService::handleRequest() with 'geofencing_message' action
         Already production-tested, max 70 chars with emoji
```

### What About the Agent Services?

The existing agent services (`AgentRecommendationEngine`, `PredictiveAnalyticsService`, `AutopilotOrchestrator`, etc.) are **Phase 2+**. They exist as code but require:

1. **Enough data** — A partner needs weeks/months of transaction history before pattern detection is meaningful
2. **Agent activation** — Partner must configure and activate the agent via existing setup wizard
3. **Budget allocation** — Agent needs a weekly budget to operate

**For BoutikioChat Phase 1, we don't touch agent services.** We build cards powered by direct queries on `transactions`, `vouchers`, `receipt_submissions`, `referrals`, `card_member`, and `analytics`. This is real, honest, data-driven functionality.

When partners have enough data and activate the agent, the chat naturally gains more intelligent cards from agent output. This is an **organic ramp-up**, not a forced feature.

---

## 🎨 Visual Design Mockups

### Mockup 1: Empty State (New Partner — Zero Data)

The welcoming onboarding screen when a partner has no members yet. Clean, honest, no fake data cards.

![Empty State Dashboard](docs/boutikiochat/scenario_a_empty_state.png)

**Key elements:**
- Boutikio nav bar preserved at top (unchanged)
- Warm, centered greeting with clear onboarding actions
- 4 action pills to get started (QR code, voucher, rewards, help)
- Chat input bar at the bottom for slash commands

---

### Mockup 2: Active Dashboard (47 Members, Daily Activity)

The main experience for a partner with real transaction data. 4 compact cards, each 2-3 lines.

![Active Dashboard](docs/boutikiochat/scenario_c_active_dashboard.png)

**Key elements:**
- **Orange border** = stats/today's activity (📊 AUJOURD'HUI)
- **Red border** = requires action (📋 REÇUS EN ATTENTE)
- **Blue/yellow border** = alert (😴 MEMBRES INACTIFS)
- **Green border** = positive milestone (🎉 FATIMA R.)
- Action buttons inline on each card (Semaine, Tout approuver, Voir, Féliciter...)
- Chevron ˅ on each card to expand for full details
- Suggestion chips row below cards (Stats semaine, Créer un bon, Reçus, Autopilot)
- Chat input bar at bottom

---

### Mockup 3: Expanded Card (Receipt Review Detail)

What the partner sees when they tap the chevron on "3 REÇUS EN ATTENTE" — full inline review experience.

![Expanded Receipt Card](docs/boutikiochat/scenario_expanded_receipt_card.png)

**Key elements:**
- Each receipt shows: member name, time ago, amount, confidence score
- **Green confidence badge** (92%, 88%) = safe to approve
- **Amber warning badge** (67% ⚠️) = needs manual verification
- Individual Approve/Reject/View buttons per receipt
- "Tout approuver (3)" bulk action at bottom
- Link to full receipt dashboard for advanced review

---

### Mockup 4: Voucher Creation Flow (Chat Conversation)

Step-by-step voucher creation as a chat conversation — no form page needed.

![Voucher Creation Flow](docs/boutikiochat/scenario_voucher_creation_flow.png)

**Key elements:**
- System asks questions, partner taps pill choices
- Selected choices highlighted in orange
- Final summary card with all parameters
- Créer / Modifier / Annuler actions
- Same code path as existing voucher form (VoucherService)
- Partner can always use the traditional Vouchers page via nav menu instead

---

## Card UX: Compact + Collapsible

### Design Principles
- Each card is **2-3 lines maximum** when collapsed
- Colored left border indicates category (orange = action, blue = info, green = milestone)
- Action buttons inline on the right (`Lancer`, `Voir`, `Passer`)
- Chevron ˅ to expand for full details
- Expanded state shows: member list, impact data, reasoning

### Collapsed Card (Default)
```
┌─ 📉 MERCREDI CALME · Double Points pour 47 membres  [Lancer] [Modifier] [Passer] ˅ ──┐
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### Expanded Card (On Click)
```
┌─ 📉 MERCREDI CALME · Double Points pour 47 membres  [Lancer] [Modifier] [Passer] ˄ ──┐
│                                                                                         │
│  Données: Ce mercredi = 8 transactions (moyenne des autres jours: 22)                   │
│  Membres ciblés: 47 membres actifs avec pass wallet                                     │
│                                                                                         │
│  Votre historique mercredi (8 dernières semaines):                                       │
│  ▁▂▁▃▁▂▁▂  (moyenne: 9 transactions)                                                   │
│                                                                                         │
│  [Lancer la campagne]  [Modifier le message]  [Passer]                                  │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Empty State (New Partner / No Data)
```
Bonjour, Dano'S! 👋

Votre programme de fidélité est prêt.
Pas encore d'activité à analyser.

Voici comment démarrer:
[📱 Afficher mon QR code]  [🎟️ Créer un bon d'achat]  [👥 Inviter des membres]

Je commencerai à vous faire des suggestions dès que
vos premiers clients auront scanné leur carte.
```

This is critical — a new partner should NEVER see fake action cards.

---

## Suggestion Chips (Context-Aware)

Chips change based on actual partner state:

### New Partner (0 members, 0 transactions)
```
[📱 Afficher mon QR] [🎟️ Créer un bon] [🎁 Configurer récompenses] [❓ Aide]
```

### Active Partner (members + transactions)
```
[📊 Stats du jour] [🎟️ Créer un bon] [📋 Reçus en attente (3)] [⚙️ Autopilot]
```

### Partner with Pending Actions
```
[✅ Tout approuver] [📊 Stats] [📋 Reçus (2)] [👥 Membres inactifs (5)]
```

Chips are generated server-side based on actual counts from queries:
```php
$chips = [];
$pendingReceipts = ReceiptSubmission::forPartner($partner)->pending()->count();
if ($pendingReceipts > 0) {
    $chips[] = ['label' => "📋 Reçus en attente ($pendingReceipts)", 'action' => 'receipts_pending'];
}
// etc.
```

---

## Chat Input: What Partners Can Type

### Slash Commands (Deterministic — No AI)
```
/stats              → Show today's stats card
/stats semaine      → Show weekly stats card
/voucher            → Start voucher creation flow
/voucher create     → Same
/members            → Navigate to members page
/members inactifs   → Show inactive members card
/receipts           → Navigate to receipt dashboard
/receipts pending   → Show pending receipt count
/rewards            → Navigate to rewards page
/analytics          → Navigate to analytics page
/help               → Show available commands
```

### Free Text (FUTURE — Optional LLM Enhancement)
```
"Combien de clients cette semaine?"  → /stats semaine
"Créer un bon de 10%"               → /voucher create (pre-filled)
"Qui n'est pas venu depuis longtemps?" → /members inactifs
"Montre mes reçus"                   → /receipts pending
```

⚠️ **Not needed for MVP.** Slash commands + suggestion chips cover 95% of partner needs. Free-text understanding is a Phase 3+ nice-to-have.

### Input Handling Flow (MVP)
```
Partner types text
    │
    ▼
Check slash command match (deterministic, zero AI cost)
    │ match? → Execute handler
    │ no match?
    ▼
Show: "Commande non reconnue. Tapez /help pour voir les commandes disponibles."

(FUTURE: LLM fallback for natural language → Phase 3+)
```

---

## Existing GPT-4 Integration (Unchanged — Future Use)

The system already uses OpenAI GPT-4 for **content enhancement on form fields** (partner edits text → clicks AI button → gets improved version). This is a small, focused feature that works in production.

- **`AiService`** — text enhancement (shorten/extend/rephrase), autofill, lockscreen notifications, geofencing messages
- **`EnhancedAiService`** — multi-provider with fallback, circuit breaker, cost tracking
- **`OpenAiProvider`** — GPT-4 via env vars

**For BoutikioChat MVP: We don't use LLM at all.** The chat dashboard is 100% query-driven.

**Future potential (Phase 3+):** If we want free-text intent parsing or AI-generated social captions someday, the infrastructure is already there. But it's not on the critical path.

---

## Conversational Flow Engine

The flow engine turns existing form pages into chat conversations. Partners can still use the traditional pages (via nav menu), but the chat offers a faster path.

### Flow: Create a Voucher
```
System: Let's create a voucher. What type?
        [Pourcentage] [Montant fixe] [Produit gratuit]

Partner: *taps Pourcentage*

System: Quel pourcentage?
        [5%] [10%] [15%] [Personnalisé]

Partner: 10%

System: Combien de bons?
        (Dernier: 500)

Partner: 200

System: Date d'expiration?
        [Pas d'expiration] [7 jours] [30 jours] [Personnalisé]

Partner: 30 jours

System: ┌─ Résumé ──────────────────────────┐
        │ 🎟️ -10% · 200 bons · 30 jours    │
        │ Code: auto-généré                  │
        └────────────────────────────────────┘
        [✅ Créer] [✏️ Modifier] [❌ Annuler]

→ CALLS: VoucherBatch creation via existing VoucherService
→ RESULT: Shows claim link + QR code + social share options
```

### Flow: Quick Stats Query
```
Partner: /stats

System: ┌─ Aujourd'hui ─────────────────────┐
        │ 📊 12 transactions                 │
        │ ⭐ 340 points émis                 │
        │ 🎁 2 récompenses réclamées         │
        │ 👥 3 nouveaux membres              │
        │ 📈 +15% vs. hier                   │
        └────────────────────────────────────┘
        [📊 Voir analytique complète] [📅 Comparer avec la semaine]

→ QUERIES: AnalyticsService + Transaction count + card_member join
```

### Flow: Review Pending Receipts
```
Partner: /receipts pending

System: 3 reçus en attente de validation
        ┌─ Reçu #1 · Ahmed K. · 14:32 ──────┐
        │ 📄 Montant: 45.00€ · Items: 3     │
        │ [✅ Approuver] [❌ Rejeter] [👀 Voir] │
        └────────────────────────────────────┘
        ┌─ Reçu #2 · Sofia M. · 11:15 ──────┐
        │ 📄 Montant: 22.50€ · Items: 2     │
        │ [✅ Approuver] [❌ Rejeter] [👀 Voir] │
        └────────────────────────────────────┘

→ QUERIES: ReceiptSubmission::pending() with ReceiptData join
→ ACTIONS: Calls existing receipt approval controllers
```

---

## Technical Architecture

### Components to Build

```
resources/views/
├── partner/
│   └── index.blade.php              # MODIFIED: chat body replaces card grid
├── components/
│   └── chat/
│       ├── stream.blade.php          # Chat message container
│       ├── input-bar.blade.php       # Text input + chips
│       └── cards/
│           ├── stats-summary.blade.php    # Daily/weekly stats (Tier 1)
│           ├── inactive-members.blade.php # Inactive alert (Tier 1)
│           ├── pending-receipts.blade.php  # Receipt queue (Tier 1)
│           ├── voucher-status.blade.php   # Voucher lifecycle (Tier 1)
│           ├── member-milestone.blade.php # Visit milestones (Tier 1)
│           ├── period-comparison.blade.php # Week-over-week (Tier 1)
│           ├── referral-activity.blade.php # Referral stats (Tier 1)
│           ├── new-members.blade.php      # New signups (Tier 1)
│           ├── slow-day.blade.php         # Day-of-week analysis (Tier 2)
│           ├── expiring-voucher.blade.php # Expiration warning (Tier 2)
│           ├── empty-state.blade.php      # No data yet (critical!)
│           ├── flow-step.blade.php        # Form-as-conversation step
│           └── confirmation.blade.php     # Action confirmation
```

```
app/
├── Services/
│   └── Chat/
│       ├── ChatDashboardService.php  # Queries real data, builds card list
│       ├── ChatFlowEngine.php        # Step-by-step form orchestration
│       └── ChatCommandParser.php     # Slash command → handler mapping
├── Http/
│   └── Controllers/
│       └── Partner/
│           └── ChatController.php    # Main chat endpoints
```

### ChatDashboardService — The Core

This is the most important new service. It queries **real tables** and decides which cards to show:

```php
class ChatDashboardService
{
    public function getCardsForPartner(Partner $partner): array
    {
        $cards = [];
        $card = $partner->cards()->first();
        if (!$card) return [['type' => 'empty-state', 'reason' => 'no_card']];

        $memberCount = $card->members()->count();
        if ($memberCount === 0) return [['type' => 'empty-state', 'reason' => 'no_members']];

        // Tier 1: Raw query cards
        $cards[] = $this->buildStatsSummary($card);
        $cards = array_merge($cards, $this->buildInactiveMembersCard($card));
        $cards = array_merge($cards, $this->buildPendingReceiptsCard($card));
        $cards = array_merge($cards, $this->buildVoucherStatusCards($card));
        $cards = array_merge($cards, $this->buildMemberMilestones($card));
        $cards = array_merge($cards, $this->buildNewMembersCard($card));

        // Tier 2: Rule-based cards (only if enough data)
        $transactionCount = Transaction::where('card_id', $card->id)->count();
        if ($transactionCount >= 50) {
            $cards = array_merge($cards, $this->buildSlowDayCard($card));
        }
        $cards = array_merge($cards, $this->buildExpiringVoucherCards($card));

        // Sort by priority/urgency
        usort($cards, fn($a, $b) => $b['priority'] <=> $a['priority']);

        return array_slice($cards, 0, 5); // Max 5 cards to avoid overload
    }
}
```

**Key principle: Every method runs a real query. No card appears without data to back it.**

---

## Implementation Plan

### Phase 1: Data-Driven Chat Dashboard (MVP)
- [ ] `ChatDashboardService` — real queries for all Tier 1 cards
- [ ] Modify `partner/index.blade.php` — replace grid with chat stream
- [ ] Tier 1 card components (stats, inactive members, pending receipts, vouchers, milestones)
- [ ] Empty state card for new partners
- [ ] Suggestion chips (context-aware, based on real counts)
- [ ] Slash command support (`/stats`, `/vouchers`, `/receipts`, `/help`)
- [ ] Collapsible card UX with Alpine.js

### Phase 2: Conversational Flows
- [ ] `ChatFlowEngine` — declarative step runner
- [ ] Voucher creation flow (replaces form page)
- [ ] Receipt review flow (inline approve/reject)
- [ ] Quick stats expansion (day/week/month toggle)

### Phase 3: Agent Integration (When Data Exists)
- [ ] Connect agent action cards to chat stream (if agent is active)
- [ ] Agent approval via chat cards
- [ ] Budget status cards
- [ ] Slow day → auto-campaign suggestion (if enough transaction history)

### FUTURE (Optional — No Timeline)

#### LLM Intent Parser
- [ ] Free-text understanding with LLM fallback
- [ ] Bilingual handling (FR/EN → same intent)
- [ ] Context threading ("pause it" → knows what "it" is)
- **Prerequisite:** Slash commands + chips must prove insufficient first

#### AI Content Generation
- [ ] Social media caption generation (GPT-4 via existing AiService)
- [ ] Voucher name/description autofill in chat flows
- [ ] Daily briefing card with natural language summary
- **Prerequisite:** Partners request this; already possible via existing AI buttons on forms

---

## Guard Rails

### Data Minimums
- **Stats card:** Show only if ≥1 transaction exists
- **Inactive members card:** Show only if ≥10 members AND ≥30 days of transaction history
- **Slow day card:** Show only if ≥50 transactions across ≥4 weeks
- **Period comparison:** Show only if ≥2 weeks of data
- **Referral card:** Show only if referral feature is enabled and ≥1 referral exists

### Card Limits
- Maximum **5 cards** per dashboard load (avoid information overload)
- Priority order: pending actions > alerts > stats > suggestions
- Dismissed cards don't return for 24 hours

### Honesty Policy
- Never show a prediction without the data behind it
- Never propose a campaign if its impact can't be estimated from real data
- Always show "Pas assez de données" rather than fake confidence
- Empty state is a **feature**, not a bug

---

## Open Questions

### Data
- [ ] What's the minimum member count before showing "inactive" alerts? (10? 20?)
- [ ] How many weeks of history before slow-day detection is reliable? (4? 8?)
- [ ] Should we track chat interactions separately for analytics?

### UX
- [ ] Real-time vs. page-load? (Start with page-load, add polling later)
- [ ] Card density — max 5 too many? Too few?
- [ ] Mobile layout — cards should be swipeable?
- [ ] Transition plan — keep old dashboard available via setting?

### Technical
- [ ] Caching strategy for dashboard queries (5 min TTL?)
- [ ] How to handle partners with multiple cards (show selector?)
- [ ] WebSocket for real-time receipt notifications? (Or just polling?)

### Business
- [ ] Is chat dashboard default for new partners?
- [ ] A/B test: old dashboard vs. chat — measure engagement?
- [ ] Does chat justify premium tier pricing?

---

## FINAL REVIEW: What the Partner Will Experience After Implementation

This section is the definitive, no-ambiguity reference for what each partner scenario looks like after BoutikioChat ships. Every card is traced to an exact query, every action to an existing controller, and every edge case is documented.

---

### Scenario A: Brand New Partner (Zero Members, Zero Transactions)

**What they see when they log in:**

```
Bonjour, Dano'S! 👋

Votre programme de fidélité est prêt.
Aucune activité pour le moment.

Voici comment démarrer:
  [📱 Afficher mon QR code]
  [🎟️ Créer un bon d'achat]
  [🎁 Configurer mes récompenses]
  [❓ Comment ça marche?]
```

**What's happening behind the scenes:**
```php
$card = $partner->cards()->first();
if (!$card) → show "create your first card" card
$memberCount = $card->members()->count(); // = 0
→ show empty state, no action cards
```

**What they can DO from this screen:**
- Tap "Afficher mon QR code" → goes to existing `partner.membership-cards.index` (shows QR for member registration)
- Tap "Créer un bon d'achat" → starts voucher creation flow in chat OR navigates to `partner.vouchers.index`
- Tap "Configurer mes récompenses" → goes to existing `partner.rewards.index`
- Use top nav (Campagnes, Marketing, etc.) → all existing pages, unchanged

**No fake cards. No dummy data. Honest empty state.**

---

### Scenario B: Small Partner (15 Members, 40 Transactions, 2 Weeks Old)

**What they see when they log in:**

```
Bonjour, Dano'S! 👋
2 éléments pour vous aujourd'hui

┌─ 📊 AUJOURD'HUI                                                              ┐
│  3 transactions · 45 points émis · 0 récompenses · 1 nouveau membre           │
│  [📊 Voir semaine] [📅 Comparer]                                          ˅   │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ 👥 1 NOUVEAU MEMBRE                                                         ┐
│  Sofia M. a rejoint aujourd'hui via scan QR                                   │
│  [👀 Voir profil]                                                         ˅   │
└───────────────────────────────────────────────────────────────────────────────┘

Suggestion chips:
  [📊 Stats du jour]  [🎟️ Créer un bon]  [🎁 Récompenses]
```

**What's happening behind the scenes:**
```php
// Stats card — Analytic model with event types
$todayIssued = Analytic::where('card_id', $cardId)
    ->where('event', 'issue_points')
    ->whereDate('created_at', today())
    ->selectRaw('COUNT(*) as count, SUM(points) as total_points')
    ->first();
// count=3, total_points=45

$todayClaimed = Analytic::where('card_id', $cardId)
    ->where('event', 'claim_reward')
    ->whereDate('created_at', today())
    ->count();
// count=0

$newMembers = DB::table('card_member')
    ->where('card_id', $cardId)
    ->whereDate('created_at', today())
    ->count();
// count=1
```

**What's NOT shown (data minimums not met):**
- ❌ No inactive members card (need ≥10 members AND ≥30 days of history)
- ❌ No slow day card (need ≥50 transactions across ≥4 weeks)
- ❌ No period comparison (need ≥2 full weeks of data)
- ❌ No referral card (need ≥1 referral)

---

### Scenario C: Active Partner (47 Members, 350+ Transactions, 3 Months Old)

**What they see when they log in:**

```
Bonjour, Dano'S! 👋
4 éléments pour vous aujourd'hui

┌─ 📊 AUJOURD'HUI · +12% vs hier                                              ┐
│  8 transactions · 120 pts émis · 1 récompense · 2 nouveaux membres            │
│  [📊 Semaine] [📅 Comparer] [📈 Analytique complète]                      ˅   │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ 📋 3 REÇUS EN ATTENTE                                                       ┐
│  Ahmed K. (45.00€) · Sofia M. (22.50€) · Tom B. (18.00€)                     │
│  [✅ Tout approuver] [👀 Examiner] [→ Dashboard reçus]                    ˅   │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ 😴 5 MEMBRES INACTIFS                                                       ┐
│  N'ont pas visité depuis 18+ jours (leur moyenne: 7 jours)                    │
│  [👀 Voir la liste] [🎟️ Envoyer un bon]                                  ˅   │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ 🎉 FATIMA R. · 50ème visite!                                                ┐
│  Membre Gold · Dernière visite: hier                                          │
│  [🎁 Féliciter] [👀 Profil]                                               ˅   │
└───────────────────────────────────────────────────────────────────────────────┘

Suggestion chips:
  [📊 Stats semaine]  [🎟️ Créer un bon]  [📋 Reçus (3)]  [⚙️ Autopilot]

┌──────────────────────────────────────────────────────────────────────────────┐
│  Tapez /help pour les commandes ou tapez un message...              [Envoyer]│
└──────────────────────────────────────────────────────────────────────────────┘
```

**What's happening behind the scenes for each card:**

**Stats card:**
```php
// AnalyticsService already used by AnalyticsController — same queries
$todayStats = [
    'transactions' => Analytic::where('card_id', $cardId)
        ->where('event', 'issue_points')->whereDate('created_at', today())->count(),
    'points' => Analytic::where('card_id', $cardId)
        ->where('event', 'issue_points')->whereDate('created_at', today())->sum('points'),
    'rewards' => Analytic::where('card_id', $cardId)
        ->where('event', 'claim_reward')->whereDate('created_at', today())->count(),
    'new_members' => DB::table('card_member')
        ->where('card_id', $cardId)->whereDate('created_at', today())->count(),
];

// Yesterday comparison
$yesterdayTransactions = Analytic::where('card_id', $cardId)
    ->where('event', 'issue_points')->whereDate('created_at', yesterday())->count();
$percentChange = (($todayStats['transactions'] - $yesterdayTransactions) / max(1, $yesterdayTransactions)) * 100;
// → "+12% vs hier"
```

**Pending receipts card:**
```php
// ReceiptSubmission model already has scopePending() and scopeForPartner()
$pendingReceipts = ReceiptSubmission::forPartner($partner->id)
    ->pending()
    ->with('member:id,first_name,last_name')
    ->latest()
    ->take(5)
    ->get();
// Returns [{member: "Ahmed K.", amount: 45.00}, {member: "Sofia M.", amount: 22.50}, ...]
```

**Inactive members card:**
```php
// Query the analytics table for last visit per member
$inactiveMembers = DB::table('analytics')
    ->where('card_id', $cardId)
    ->where('event', 'issue_points')
    ->select('member_id', DB::raw('MAX(created_at) as last_visit'))
    ->groupBy('member_id')
    ->having('last_visit', '<', now()->subDays(14))
    ->get();
// Filter: only those whose gap exceeds 2× their usual visit frequency
```

**Milestone card:**
```php
// Count transactions per member, find recent milestone crossers
$milestones = DB::table('analytics')
    ->where('card_id', $cardId)
    ->where('event', 'issue_points')
    ->select('member_id', DB::raw('COUNT(*) as visit_count'))
    ->groupBy('member_id')
    ->havingRaw('COUNT(*) IN (10, 25, 50, 100)')
    ->get();
// Cross-reference with Members table for names
```

---

### Scenario D: Partner With Vouchers (Active + Expiring)

**Additional card shown:**

```
┌─ ⚠️ BON "ÉTÉ 10%" EXPIRE DANS 3 JOURS                                      ┐
│  45/100 réclamés · 12 utilisés · 55 non utilisés                              │
│  [📅 Prolonger] [📤 Partager le lien] [👀 Détails]                        ˅   │
└───────────────────────────────────────────────────────────────────────────────┘
```

**Query:**
```php
// Voucher model has scopeActive(), scopeAvailable(), getIsValidAttribute()
$expiringVouchers = Voucher::forPartner($partner->id)
    ->where('is_active', true)
    ->where('valid_until', '<=', now()->addDays(3))
    ->where('valid_until', '>=', now()) // not yet expired
    ->get()
    ->map(fn($v) => [
        'name' => $v->getTranslation('name', app()->getLocale()),
        'claimed' => $v->members()->count(),
        'redeemed' => $v->redemptions()->count(),
        'total' => $v->usage_limit,
        'remaining' => $v->usage_limit - $v->members()->count(),
        'expires_at' => $v->valid_until,
    ]);
```

---

### Scenario E: Partner Types a Slash Command

**Partner types: `/stats semaine`**

```
Partner: /stats semaine

System:
┌─ 📊 CETTE SEMAINE (17-23 fév)                                                ┐
│                                                                                │
│  Transactions    : 42      (+15% vs sem. dernière)                             │
│  Points émis     : 630     (+22%)                                              │
│  Récompenses     : 8       (-10%)                                              │
│  Nouveaux membres: 5       (+25%)                                              │
│  Vues de carte   : 127     (+8%)                                               │
│                                                                                │
│  [📅 Comparer avec le mois] [📈 Analytique complète]                           │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Query — uses existing AnalyticsService methods directly:**
```php
$analyticsService = app(AnalyticsService::class);
$thisWeekPoints = $analyticsService->pointsIssuedWeek($cardId);  // returns ['total' => 630]
$lastWeekPoints = $analyticsService->pointsIssuedWeek($cardId, $lastWeekDate);
$thisWeekRedeemed = $analyticsService->pointsRedeemedWeek($cardId);
$thisWeekRewards = $analyticsService->rewardsClaimedWeek($cardId);
$thisWeekViews = $analyticsService->cardViewsWeek($cardId);

// These are EXISTING methods, already used by AnalyticsController
// We're just rendering their output as a chat card instead of a chart page
```

**Partner types: `/voucher create` or taps the "Créer un bon" chip**

```
System: Quel type de bon voulez-vous créer?
        [Pourcentage] [Montant fixe] [Produit gratuit]

Partner: *taps Pourcentage*

System: Quel pourcentage de réduction?
        [5%] [10%] [15%] [20%] [Autre]

Partner: *taps 10%*

System: Pour combien de personnes?
        [50] [100] [200] [500] [Autre]

Partner: 100

System: Quelle durée de validité?
        [7 jours] [14 jours] [30 jours] [Pas de limite]

Partner: 30 jours

System: ┌─ Résumé ──────────────────────────────┐
        │  🎟️ Réduction de 10%                   │
        │  📋 100 bons disponibles                │
        │  📅 Valide 30 jours (jusqu'au 23 mars)  │
        │  🔗 Code: auto-généré par bon           │
        └────────────────────────────────────────┘
        [✅ Créer] [✏️ Modifier] [❌ Annuler]

Partner: *taps Créer*

System: ✅ 100 bons créés avec succès!
        Lien de partage: https://web.boutikio.com/v/ABC123
        [📤 Copier le lien] [📱 Partager]
```

**What this calls:**
```php
// Uses existing VoucherBatch / Voucher creation logic
// Same code path as the current Vouchers page form submission
// partner.vouchers.store route handler
```

---

### Scenario F: Partner Reviews Receipts Inline

**Partner types `/receipts pending` or taps "Reçus en attente (3)" chip:**

```
System: 3 reçus en attente de validation

┌─ 📄 Ahmed K. · Il y a 2 heures                                               ┐
│  Montant: 45.00€ · Confiance: 92%                                             │
│  [✅ Approuver] [❌ Rejeter] [👀 Voir le reçu]                            ˅   │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ 📄 Sofia M. · Il y a 5 heures                                               ┐
│  Montant: 22.50€ · Confiance: 67% ⚠️                                         │
│  [✅ Approuver] [❌ Rejeter] [👀 Voir le reçu]                            ˅   │
└───────────────────────────────────────────────────────────────────────────────┘

┌─ 📄 Tom B. · Hier                                                            ┐
│  Montant: 18.00€ · Confiance: 88%                                             │
│  [✅ Approuver] [❌ Rejeter] [👀 Voir le reçu]                            ˅   │
└───────────────────────────────────────────────────────────────────────────────┘

[✅ Tout approuver (3)] [→ Dashboard reçus complet]
```

**Expanded card (partner taps ˅ on Sofia's receipt):**
```
┌─ 📄 Sofia M. · Il y a 5 heures                                           ˄   ┐
│                                                                                │
│  📷 [receipt image preview]                                                    │
│                                                                                │
│  Commerçant: Dano's Kebab (validé ✅)                                          │
│  Date reçu: 21 fév 2026, 16:15                                                │
│  Montant: 22.50€                                                               │
│  Articles: 3                                                                   │
│  Confiance OCR: 67% ⚠️ (seuil auto-approbation: 80%)                          │
│                                                                                │
│  ⚠️ Confiance basse — vérification manuelle recommandée                        │
│                                                                                │
│  [✅ Approuver (+45 pts)] [❌ Rejeter] [📝 Note]                               │
└────────────────────────────────────────────────────────────────────────────────┘
```

**Data source:**
```php
// ReceiptSubmission has all of this:
// ->status (pending/approved/rejected)
// ->getBestMerchantName()
// ->getBestTotalAmount()
// ->getBestReceiptDate()
// ->getCombinedConfidence()
// ->getExtractedLineItems()
// ->getImageUrl()
// ->isMerchantValidated()
// ->meetsAutoApprovalCriteria()
//
// Approval action: calls existing ReceiptDashboardController logic
```

---

### Scenario G: Partner Uses Top Navigation (Unchanged)

At any point, the partner can click any top nav item:

| Partner clicks... | They see... | Change from before? |
|---|---|---|
| **Tableau de bord** | Chat dashboard (new) | ← The only change |
| **Campagnes → Emplacements** | Location management page | None |
| **Campagnes → Cartes de fidélité** | Card management page | None |
| **Campagnes → Récompenses** | Reward configuration page | None |
| **Utilisateurs → Personnel** | Staff management page | None |
| **Utilisateurs → Membres** | Member list page | None |
| **Marketing → Autopilot** | Autopilot setup page | None |
| **Marketing → Bons d'achat** | Voucher management page | None |
| **Analytique** | Full analytics with charts | None |
| **Profile dropdown** | Account settings, balance, logout | None |

**The chat is ONE page change. Everything else stays put.**

---

### What Files Are Modified vs. Created

| File | Action | Lines | Risk |
|------|--------|-------|------|
| `partner/index.blade.php` | **Modified** | 51→~80 | 🟢 Low (body only) |
| `components/chat/stream.blade.php` | **New** | ~40 | 🟢 Additive |
| `components/chat/input-bar.blade.php` | **New** | ~30 | 🟢 Additive |
| `components/chat/cards/stats-summary.blade.php` | **New** | ~50 | 🟢 Additive |
| `components/chat/cards/inactive-members.blade.php` | **New** | ~40 | 🟢 Additive |
| `components/chat/cards/pending-receipts.blade.php` | **New** | ~45 | 🟢 Additive |
| `components/chat/cards/voucher-status.blade.php` | **New** | ~40 | 🟢 Additive |
| `components/chat/cards/member-milestone.blade.php` | **New** | ~30 | 🟢 Additive |
| `components/chat/cards/period-comparison.blade.php` | **New** | ~35 | 🟢 Additive |
| `components/chat/cards/empty-state.blade.php` | **New** | ~25 | 🟢 Additive |
| `Services/Chat/ChatDashboardService.php` | **New** | ~250 | 🟡 Core logic |
| `Services/Chat/ChatCommandParser.php` | **New** | ~80 | 🟢 String matching |
| `Controllers/Partner/ChatController.php` | **New** | ~100 | 🟡 New routes |
| `PageController.php` | **Modified** | +10 lines | 🟢 Add service call |

**Total: 1 modified view, 1 modified controller, ~12 new Blade components, 3 new PHP classes.**

No existing service modified. No model modified. No route removed. No migration needed.

---

### Performance Considerations

| Query | Table | Expected Speed | Cacheable? |
|-------|-------|------|------|
| Today's transactions count | `analytics` | <10ms (indexed by card_id + event + created_at) | Yes, 5min TTL |
| Pending receipts count | `receipt_submissions` | <10ms (indexed by partner_id + status) | Yes, 1min TTL |
| Inactive members | `analytics` (GROUP BY member_id) | ~50ms for 100 members | Yes, 15min TTL |
| Voucher status | `vouchers` + `member_voucher` + `voucher_redemptions` | <20ms | Yes, 5min TTL |
| New members today | `card_member` pivot | <5ms | Yes, 5min TTL |
| Milestones | `analytics` (GROUP BY member_id HAVING COUNT) | ~50ms | Yes, 15min TTL |

**Total dashboard load time: <150ms for all cards.** Can be fully cached to <20ms on subsequent loads.

---

### What Does NOT Ship (Explicitly Out of Scope)

| Feature | Why Not | When Maybe |
|---------|---------|-----------|
| Free-text chat understanding | Slash commands + chips are sufficient | When partners request it |
| AI-generated campaign proposals | Needs enough data + agent activation | Phase 3+ |
| Real-time WebSocket updates | Page reload is fine for daily operations | If receipt volume justifies it |
| Social media caption generation | Existing AI buttons on forms work | When chat flows are proven |
| Cross-partner benchmarking | Partners are isolated, no shared data | Never in current architecture |
| ML churn prediction | Simple "days since last visit" works | When ML infra is justified |
| Push notifications to partner | They check dashboard when they want | If daily briefing is requested |

---

### Success Metrics

After launch, measure:

1. **Dashboard dwell time** — Should decrease (partner gets info faster, leaves sooner)
2. **Pending receipt resolution time** — Should decrease (inline approve vs. navigate to page)
3. **Voucher creation frequency** — Should increase (easier flow)
4. **Partner daily login rate** — Should increase (dashboard is now useful, not just nav links)
5. **Nav menu click rate** — Should decrease for items surfaced in chat (stats, receipts) but stay same for items not in chat (locations, staff)

---

### Bottom Line

**What changes:** The `partner.index` page body goes from 8 static navigation cards to a live data stream.

**What doesn't change:** Navigation, all other pages, all routes, all controllers, all services, all models, all APIs.

**What powers it:** SQL queries on existing tables using existing Eloquent models and existing `AnalyticsService` methods.

**What it costs:** Zero additional infrastructure, zero LLM calls, zero new dependencies.

**What the partner gets:** Instead of "click here to maybe find something useful," they get "here's what's happening in your business right now, and here are actions you can take."

**Implementation estimate:** ~12 new Blade components, 3 new PHP classes, 1 modified view, 1 modified controller. No migrations, no new packages, no API keys.
