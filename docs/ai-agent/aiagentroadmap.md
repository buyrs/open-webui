# AI Agent Feature — Analysis & Roadmap

> Generated: February 11, 2026  
> Status: Brainstorm / Review Draft

---

## 1. What the AI Agent Feature Actually Is

The AI Agent is an **autonomous loyalty marketing autopilot**. It analyzes member behavior, decides who to target, and automatically sends incentives (PIN codes for bonus points, or vouchers) to drive specific business goals like retention, reactivation, or increased spending.

It is NOT a chatbot or conversational AI — it's a decision-making engine that acts on behalf of the partner.

### The Core Loop

1. **Analyze members** — engagement scores, visit frequency, lifetime value, churn risk (MemberAnalyzerService)
2. **Decide who to target** — learns from redemptions, expirations, rejections (LearningEngineService)
3. **Calculate optimal incentive** — optimal points, voucher selection, strategic allocation
4. **Schedule & deliver** — send time optimization, PIN codes or vouchers via email/wallet push (ActionSchedulerService)
5. **Learn from outcomes** — feedback loop: did they redeem? did they return? ROI tracking
6. **Protect the business** — rate limits, budget caps, fraud detection, auto-pause (AgentSafetyService, BudgetProtectionService, AnomalyDetectorService)

### Scale of the Feature

| Category | Count |
|----------|-------|
| Services | 36 |
| Models | 20 |
| Controllers | 24 |
| Views/Components | 18 |
| Test files | 80 |

---

## 2. Agent Types — Defined vs Implemented

The `Agent` model defines 6 types:

| Type | Status |
|------|--------|
| `recommendation` | Partially implemented |
| `analytics` | Placeholder — no dedicated service |
| `customer_service` | Placeholder — no dedicated service |
| `marketing` | **Heavily implemented** (core of the system) |
| `retention` | **Heavily implemented** (core of the system) |
| `fraud_detection` | Placeholder — no dedicated service |

**Decision needed**: Build out the unused types or prune them from the model to avoid confusion.

---

## 3. What's Working Well

### Safety Layer (Don't Touch)
- Budget protection with auto-pause at configurable thresholds
- Anomaly detection (spending spikes, targeting anomalies, abuse patterns, low redemption rates, retry queue anomalies)
- Rate limiting per member (weekly point caps, minimum gaps between codes, daily action limits)
- Voucher-specific safety (weekly voucher limits per member, daily voucher action limits)
- Auto-pause with partner notification
- 617 lines of guardrails in AgentSafetyService alone

### Learning Engine
- 900-line service tracking redemptions, expirations, rejections
- Calculates optimal points by member segment
- Confidence levels based on sample size
- Success factor identification
- ROI calculation per action
- Post-redemption spending tracking

### Test Coverage
- 80 test files across unit, integration, feature, performance, and property-based tests
- Covers: scheduling, analytics, retention, safety, auto-approval, data validation, rate limiting, health monitoring, error handling, geofencing, timing optimization, A/B testing, security

### UX Foundation
- Agent list view (card grid, status badges, goal display)
- Dashboard detail view (Alpine.js reactive, test mode, campaign type badges)
- Blade components: funnel visualization, action history table, quick controls, test mode indicator, autopilot overview
- Setup wizard for creating new agents
- Admin dashboard with operational status, feedback impact, recommendation batches

---

## 4. What Needs Attention

### 4.1 Quarantined Controllers — Security Debt

Three controllers sit in `QUARANTINE_VULNERABLE/`:
- `AgentActivityController`
- `AgentApprovalController`
- `AgentMarketingController`

The approval workflow (approve/reject/bulk actions) is critical functionality. If this is the only way to manually approve agent actions, partners may be stuck in auto-approve-only mode.

**Action items:**
- [ ] Audit the security issues in quarantined controllers
- [ ] Either fix and move back to Partner namespace, or build proper replacements
- [ ] Ensure manual approval mode is fully functional outside quarantine

### 4.2 Service Sprawl — Duplicate/Overlapping Services

Several services appear to be "optimized" or "enhanced" versions layered on top without removing originals:

| Potential Duplicates | Question |
|---------------------|----------|
| `AgentRecommendationService` vs `RecommendationService` | Two recommendation services? |
| `PerformanceService` vs `OptimizedAgentPerformanceService` | What's the difference? |
| `AgentAnalyticsService` vs `OptimizedAgentAnalyticsService` vs `EnhancedAnalyticsService` | Three analytics services? |
| `BudgetMonitoringService` vs `BudgetProtectionService` | Overlap? |

**Action items:**
- [ ] Map which services are actually used in controllers/routes
- [ ] Deprecate and remove unused originals
- [ ] Consolidate into single authoritative services

### 4.3 Oversized Services (Violating 200-Line Guideline)

| Service | Lines | Responsibility Overload |
|---------|-------|------------------------|
| `LearningEngineService` | 902 | Segmentation, point optimization, redemption tracking, expiration learning, ROI calculation, engagement recording, batch outcomes |
| `ActionSchedulerService` | 819 | Agent processing, PIN codes, vouchers, auto-approval, retry queues, budget tracking, reasoning generation |
| `MemberAnalyzerService` | 782 | Member analysis, priority scores, optimal points, voucher history, strategic allocation, reward alignment |
| `AgentGeofencingController` | 736 | CRUD + analytics + message templates + ROI + location metrics |
| `AgentSafetyService` | 617 | All safety checks in one class (acceptable given its critical nature) |
| `FeedbackService` | 568 | Feedback summary, trends, learning impact, confidence distribution, category performance |

**Proposed splits:**

`LearningEngineService` →
- `SegmentationEngine` — member segment identification
- `PointOptimizer` — optimal point calculation by segment
- `OutcomeTracker` — redemption/expiration/rejection tracking
- `ROICalculator` — action ROI and spending tracking

`ActionSchedulerService` →
- `AgentProcessor` — orchestration and agent processing loop
- `PinCodeActionService` — PIN code specific logic
- `VoucherActionService` — voucher specific logic (partially exists already)
- `AutoApprovalEngine` — auto-approve decision logic

`MemberAnalyzerService` →
- `MemberProfileAnalyzer` — engagement, frequency, lifetime value
- `TargetingEngine` — member selection and priority scoring
- `PointAllocationStrategy` — optimal points, limits, reward alignment

---

## 5. UX Improvement Opportunities

### 5.1 Transparency / Explainability (High Priority)
The agent makes autonomous decisions with partner budgets. Partners need to clearly see *why* it targeted a specific member and *why* it chose a specific point amount. `generateReasoning` exists in the backend — ensure it's prominently surfaced in the dashboard, not buried.

### 5.2 Simulation / What-If Mode (High Priority)
Test mode exists (test recipients), but there's no "dry run" simulation. Proposal: "If I set the budget to X and the goal to retention, here's what the agent would do this week based on current member data." This reduces the anxiety of turning on an autonomous system.

### 5.3 Approval Queue UX (High Priority)
With the approval controller in quarantine, the manual review experience needs attention. For partners who want oversight before full autopilot:
- Clean batch review table with one-click bulk actions
- Quick approve/reject with reason capture
- Filter by confidence level, point amount, member segment

### 5.4 Real-Time Activity Feed (Medium Priority)
HTMX is already in the stack. A live activity feed showing "Agent just sent 50 points to Member #1234 because they haven't visited in 14 days" would build trust and engagement with the feature.

### 5.5 Budget Visualization (Medium Priority)
Budget protection is robust in the backend but needs a visual burn-down chart: "You've spent 340 of 500 points budget this week, projected to use 480 by Sunday." Visual budget pacing with projections.

### 5.6 Goal-Setting Evolution (Medium Priority)
Current: partners configure goals (retention, reactivation, spending).  
Proposed: let partners set *outcome targets* — "Reduce churn by 10% this month" — and let the agent figure out the strategy. Move from "configure the how" to "define the what."

### 5.7 Competitive Benchmarking (Low Priority)
Anonymized cross-partner benchmarks: "Your agent is performing in the top 20% of similar businesses." Builds confidence and motivation.

---

## 6. Architectural Ideas

### 6.1 Agent-to-Agent Communication
Currently each agent config operates independently. Proposal: retention agent detects a churning member → hands off to marketing agent for a win-back voucher. Cross-agent orchestration.

### 6.2 Natural Language Configuration
OpenAI integration already exists for receipts. Extend to agent setup: "Target members who haven't visited in 2 weeks and usually spend over $50" instead of form fields.

### 6.3 A/B Testing on All Actions
`AgentGeofencingABTest` model exists for geofencing. Extend A/B testing to all agent actions — automatically test different point amounts, timing, and messaging. Let the learning engine pick winners.

### 6.4 Member-Facing Transparency
"You received this offer because you're a valued customer who hasn't visited recently." Let members know an AI is working for them. Builds brand trust.

### 6.5 Seasonal Intelligence
Does the learning engine account for seasonality? A coffee shop's retention strategy in December differs from July. The agent should detect and adapt to seasonal patterns automatically.

---

## 7. Recommended Priority Order

### Phase 1 — Stabilize (Security + Debt)
1. Resolve quarantined controllers (security audit or rebuild)
2. Consolidate duplicate services (analytics, performance, recommendation)
3. Split the 3 mega-services for maintainability

### Phase 2 — Trust (UX for Partner Confidence)
4. Explainability improvements (surface reasoning prominently)
5. Simulation / dry-run mode
6. Budget burn-down visualization
7. Approval queue rebuild (outside quarantine)

### Phase 3 — Intelligence (Smarter Agent)
8. A/B testing on all agent actions
9. Seasonal pattern detection
10. Outcome-based goal setting ("reduce churn by X%")

### Phase 4 — Scale (Platform Features)
11. Agent-to-agent communication
12. Natural language configuration
13. Cross-partner benchmarking
14. Member-facing transparency

---

## 8. What NOT to Refactor

- **Safety/protection layer** — it's solid and critical, leave it alone
- **Test suite** — 80 test files is a strength, preserve and extend
- **Dashboard views** — well-structured with Alpine.js, add features on top
- **Config system** — clean env-based overrides with sensible defaults
