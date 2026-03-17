# AI Agent Configuration Guide

This document provides a quick reference for configuring the AI Agent PIN Code Autopilot feature.

## Current Production Settings

| Setting | Value | Description |
|---------|-------|-------------|
| Min days between codes | **3 days** | Minimum gap before same member can receive another PIN code |
| Max points/member/week | **500 points** | Maximum points a single member can receive per week |
| Max actions/agent/day | **50 actions** | Maximum PIN codes an agent can generate per day |
| Budget safety margin | **95%** | Agent pauses when weekly budget reaches this threshold |

---

## Environment Configuration (Recommended)

Add these variables to your `.env` file to configure AI Agent safety guardrails:

```env
# Maximum points a single member can receive per week (default: 500)
AGENT_MAX_POINTS_PER_MEMBER_WEEK=500

# Minimum days between PIN codes to same member (default: 3)
AGENT_MIN_DAYS_BETWEEN_CODES=3

# Maximum PIN codes an agent can generate per day (default: 50)
AGENT_MAX_ACTIONS_PER_DAY=50

# Budget safety margin - agent pauses at this percentage (default: 0.95 = 95%)
AGENT_BUDGET_SAFETY_MARGIN=0.95
```

**Config file:** `config/agent.php`

---

## Configuration Files (Code Reference)

### Rate Limiting & Safety Guardrails

**File:** `app/Services/Agent/AgentSafetyService.php`

```php
// Static methods that read from config/agent.php
AgentSafetyService::maxPointsPerMemberWeek();  // config('agent.max_points_per_member_week')
AgentSafetyService::minDaysBetweenCodes();     // config('agent.min_days_between_codes')
AgentSafetyService::maxActionsPerDay();        // config('agent.max_actions_per_day')
AgentSafetyService::budgetSafetyMargin();      // config('agent.budget_safety_margin')
```

---

### Goal-Based Targeting Criteria

**File:** `app/Services/Agent/MemberAnalyzerService.php` (lines 218-248)

| Goal | Targeting Criteria |
|------|-------------------|
| `win_back` | 30+ days inactive AND 3+ previous visits |
| `increase_visits` | <30 days inactive AND visit frequency >14 days AND 3+ visits |
| `grow_members` | <30 days since signup OR (5+ visits AND <60 days inactive) |
| `boost_spending` | 3+ visits AND below 80% of average transaction value |

---

### Smart Point Allocation

**File:** `app/Services/Agent/MemberAnalyzerService.php` (lines 550-662)

Point allocation strategies:
- `smart` - Allocates 60-80% of gap to next reward
- `fixed` - Allocates fixed amount (configured in agent settings)

---

## Database Configuration

**Table:** `agent_configurations`

Key fields that affect behavior:
- `goal` - Targeting goal (win_back, increase_visits, grow_members, boost_spending)
- `operation_mode` - autonomous (auto-send) or supervised (manual approval)
- `weekly_budget` - Maximum weekly spend in euros
- `test_mode` - When true, bypasses goal criteria (but not rate limiting)
- `test_recipients` - JSON array of member IDs for test mode
- `min_points_per_action` - Minimum points to allocate
- `max_points_per_action` - Maximum points to allocate
- `points_allocation_strategy` - smart or fixed
- `fixed_points_amount` - Points for fixed strategy

---

## Useful Commands

```bash
# Diagnose member eligibility
php artisan agent:diagnose --detailed

# Accelerate testing (simulate multiple scheduler runs)
php artisan agent:accelerate --days=7 --force

# Check agent health
php artisan agent:health-check
```

---

## Testing Modifications

> ⚠️ **Remember to revert before deploying to production!**

To temporarily reduce rate limiting for testing, add to your `.env`:

```env
# Reduce minimum days between codes from 3 to 1
AGENT_MIN_DAYS_BETWEEN_CODES=1

# Optionally increase daily limit for faster testing
AGENT_MAX_ACTIONS_PER_DAY=100
```

Then clear config cache:
```bash
php artisan config:clear
```

---

## Related Files

- `app/Services/Agent/ActionSchedulerService.php` - Main scheduler orchestrator
- `app/Services/Agent/PinCodeGeneratorService.php` - PIN code generation
- `app/Services/Agent/BudgetProtectionService.php` - Budget management
- `app/Services/Agent/AnomalyDetectorService.php` - Anomaly detection
- `app/Console/Commands/AccelerateAgentCampaign.php` - Accelerate command
- `app/Console/Commands/DiagnoseAgentEligibility.php` - Diagnostic command
