# OpenClaw Tool Registry Definitions

> **Source:** Extracted from `docs/ai-agent/openclaw.md`
> **Purpose:** Ready-to-implement tool definitions for the ToolRegistry
> **Total Tools:** 42

---

## Implementation Format

Each tool entry in the `ToolRegistry` follows this structure:

```php
'tool_name' => [
    'service' => ServiceClass::class,
    'method' => 'methodName',
    'description' => 'Human-readable description for OpenAPI spec',
    'parameters' => [
        'param_name' => ['type' => 'string', 'required' => true],
        'optional_param' => ['type' => 'integer', 'required' => false],
    ],
    'gated' => false, // true = requires subscription after 100 members
],
```

---

## Subscription Gating Rules

| Category | Gated | Notes |
|----------|-------|-------|
| All `get_*` tools | ❌ No | Always accessible |
| `update_card` | ❌ No | Onboarding essential |
| Reward CRUD | ❌ No | Core functionality |
| Wallet reads | ❌ No | Read-only |
| Gamification reads | ❌ No | Read-only |
| All voucher tools | ✅ Yes | Marketing feature |
| All campaign tools | ✅ Yes | Marketing feature |
| `send_pin_code` | ✅ Yes | Marketing feature |
| `bulk_send_pin_codes` | ✅ Yes | Marketing feature |
| `create_referral_campaign` | ✅ Yes | Marketing feature |
| `greet_referral` | ✅ Yes | Marketing feature |

**Free tier limit:** 100 active members (configurable via `OPENCLAW_FREE_MEMBER_LIMIT`)

---

## Tool Definitions

### Onboarding Tools

#### `create_partner_profile`

```php
'create_partner_profile' => [
    'service' => PartnerService::class,
    'method' => 'createProfile',
    'description' => 'Create a new partner profile with store details',
    'parameters' => [
        'name' => ['type' => 'string', 'required' => true],
        'address' => ['type' => 'string', 'required' => true],
        'phone' => ['type' => 'string', 'required' => false],
        'website' => ['type' => 'string', 'required' => false],
    ],
    'gated' => false,
],
```

#### `update_card`

```php
'update_card' => [
    'service' => LoyaltyCardService::class,
    'method' => 'updateCard',
    'description' => 'Update loyalty card design (logo, banner, colors)',
    'parameters' => [
        'card_id' => ['type' => 'integer', 'required' => true],
        'logo' => ['type' => 'string', 'required' => false, 'description' => 'Logo URL or base64'],
        'banner' => ['type' => 'string', 'required' => false, 'description' => 'Banner URL or base64'],
        'colors' => ['type' => 'object', 'required' => false, 'description' => 'Primary/secondary colors'],
    ],
    'gated' => false,
],
```

#### `get_onboarding_status`

```php
'get_onboarding_status' => [
    'service' => PartnerService::class,
    'method' => 'getOnboardingStatus',
    'description' => 'Check partner onboarding completion status',
    'parameters' => [],
    'gated' => false,
],
```

#### `generate_qr_code`

```php
'generate_qr_code' => [
    'service' => QrCodeService::class,
    'method' => 'generate',
    'description' => 'Generate QR code for member enrollment',
    'parameters' => [
        'card_id' => ['type' => 'integer', 'required' => true],
    ],
    'gated' => false,
],
```

---

### Voucher Tools (All Gated)

#### `create_voucher`

```php
'create_voucher' => [
    'service' => VoucherBatchService::class,
    'method' => 'create',
    'description' => 'Create a new voucher',
    'parameters' => [
        'name' => ['type' => 'string', 'required' => true],
        'type' => ['type' => 'string', 'required' => true, 'enum' => ['percentage', 'fixed', 'bonus_points']],
        'value' => ['type' => 'number', 'required' => true, 'description' => 'Discount value or points'],
        'valid_from' => ['type' => 'string', 'required' => true, 'format' => 'date'],
        'valid_until' => ['type' => 'string', 'required' => true, 'format' => 'date'],
    ],
    'gated' => true,
],
```

#### `create_voucher_batch`

```php
'create_voucher_batch' => [
    'service' => VoucherBatchService::class,
    'method' => 'createBatch',
    'description' => 'Create a batch of vouchers from a template',
    'parameters' => [
        'name' => ['type' => 'string', 'required' => true],
        'quantity' => ['type' => 'integer', 'required' => true, 'min' => 1],
        'template_data' => ['type' => 'object', 'required' => true, 'description' => 'Voucher template with name, type, value, etc.'],
    ],
    'gated' => true,
],
```

#### `pause_voucher`

```php
'pause_voucher' => [
    'service' => VoucherBatchService::class,
    'method' => 'pause',
    'description' => 'Pause an active voucher',
    'parameters' => [
        'voucher_id' => ['type' => 'integer', 'required' => true],
    ],
    'gated' => true,
],
```

#### `resume_voucher`

```php
'resume_voucher' => [
    'service' => VoucherBatchService::class,
    'method' => 'resume',
    'description' => 'Resume a paused voucher',
    'parameters' => [
        'voucher_id' => ['type' => 'integer', 'required' => true],
    ],
    'gated' => true,
],
```

#### `get_voucher_stats`

```php
'get_voucher_stats' => [
    'service' => VoucherBatchService::class,
    'method' => 'getStats',
    'description' => 'Get voucher performance statistics',
    'parameters' => [
        'voucher_id' => ['type' => 'integer', 'required' => true],
    ],
    'gated' => false, // Read-only
],
```

#### `share_voucher_social`

```php
'share_voucher_social' => [
    'service' => VoucherSocialPostService::class,
    'method' => 'generate',
    'description' => 'Generate social media content for a voucher',
    'parameters' => [
        'voucher_id' => ['type' => 'integer', 'required' => true],
        'platform' => ['type' => 'string', 'required' => true, 'enum' => ['facebook', 'instagram', 'twitter', 'linkedin']],
    ],
    'gated' => true,
],
```

---

### Campaign Tools (All Gated Except Reads)

#### `create_campaign`

```php
'create_campaign' => [
    'service' => CampaignService::class,
    'method' => 'create',
    'description' => 'Create a marketing campaign',
    'parameters' => [
        'name' => ['type' => 'string', 'required' => true],
        'type' => ['type' => 'string', 'required' => true, 'enum' => ['promotion', 'retention', 'acquisition']],
        'details' => ['type' => 'object', 'required' => true, 'description' => 'Campaign configuration'],
        'start_date' => ['type' => 'string', 'required' => true, 'format' => 'date'],
        'end_date' => ['type' => 'string', 'required' => true, 'format' => 'date'],
    ],
    'gated' => true,
],
```

#### `pause_campaign`

```php
'pause_campaign' => [
    'service' => CampaignService::class,
    'method' => 'pause',
    'description' => 'Pause an active campaign',
    'parameters' => [
        'campaign_id' => ['type' => 'integer', 'required' => true],
    ],
    'gated' => true,
],
```

#### `resume_campaign`

```php
'resume_campaign' => [
    'service' => CampaignService::class,
    'method' => 'resume',
    'description' => 'Resume a paused campaign',
    'parameters' => [
        'campaign_id' => ['type' => 'integer', 'required' => true],
    ],
    'gated' => true,
],
```

#### `get_campaign_performance`

```php
'get_campaign_performance' => [
    'service' => CampaignService::class,
    'method' => 'getPerformance',
    'description' => 'Get campaign performance metrics',
    'parameters' => [
        'campaign_id' => ['type' => 'integer', 'required' => true],
    ],
    'gated' => false, // Read-only
],
```

---

### Member Tools

#### `get_members`

```php
'get_members' => [
    'service' => MemberAnalyzerService::class,
    'method' => 'getList',
    'description' => 'List members with optional filters',
    'parameters' => [
        'segment' => ['type' => 'string', 'required' => false, 'description' => 'Member segment filter'],
        'status' => ['type' => 'string', 'required' => false, 'enum' => ['active', 'inactive', 'churned']],
        'limit' => ['type' => 'integer', 'required' => false, 'default' => 50],
        'offset' => ['type' => 'integer', 'required' => false, 'default' => 0],
    ],
    'gated' => false,
],
```

#### `get_member_details`

```php
'get_member_details' => [
    'service' => MemberAnalyzerService::class,
    'method' => 'getDetails',
    'description' => 'Get detailed member profile',
    'parameters' => [
        'member_id' => ['type' => 'integer', 'required' => true],
    ],
    'gated' => false,
],
```

#### `reactivate_member`

```php
'reactivate_member' => [
    'service' => AgentManagerService::class,
    'method' => 'reactivateMember',
    'description' => 'Reactivate an inactive member with incentive points',
    'parameters' => [
        'member_id' => ['type' => 'integer', 'required' => true],
        'incentive_points' => ['type' => 'integer', 'required' => false, 'default' => 0],
    ],
    'gated' => false,
],
```

#### `send_pin_code`

```php
'send_pin_code' => [
    'service' => PinCodeGeneratorService::class,
    'method' => 'generateAndSend',
    'description' => 'Send a re-engagement PIN code with bonus points to a member',
    'parameters' => [
        'member_id' => ['type' => 'integer', 'required' => true],
        'points' => ['type' => 'integer', 'required' => true, 'description' => 'Bonus points awarded on PIN redemption'],
        'reasoning' => ['type' => 'string', 'required' => true, 'description' => 'Reason for sending PIN'],
    ],
    'gated' => true, // Marketing feature
],
```

#### `bulk_send_pin_codes`

```php
'bulk_send_pin_codes' => [
    'service' => PinCodeGeneratorService::class,
    'method' => 'bulkGenerateAndSend',
    'description' => 'Send PIN codes to a segment of members',
    'parameters' => [
        'segment' => ['type' => 'string', 'required' => true, 'description' => 'Target segment'],
        'points' => ['type' => 'integer', 'required' => true],
        'reasoning' => ['type' => 'string', 'required' => true],
    ],
    'gated' => true, // Marketing feature
],
```

#### `get_member_segments`

```php
'get_member_segments' => [
    'service' => MemberAnalyzerService::class,
    'method' => 'getSegments',
    'description' => 'Get available member segments',
    'parameters' => [],
    'gated' => false,
],
```

---

### Reward Tools

#### `create_reward`

```php
'create_reward' => [
    'service' => RewardService::class,
    'method' => 'create',
    'description' => 'Create a new reward',
    'parameters' => [
        'title' => ['type' => 'string', 'required' => true],
        'description' => ['type' => 'string', 'required' => true],
        'points_cost' => ['type' => 'integer', 'required' => true, 'min' => 1],
        'is_active' => ['type' => 'boolean', 'required' => false, 'default' => true],
    ],
    'gated' => false,
],
```

#### `update_reward`

```php
'update_reward' => [
    'service' => RewardService::class,
    'method' => 'update',
    'description' => 'Update an existing reward',
    'parameters' => [
        'reward_id' => ['type' => 'integer', 'required' => true],
        'title' => ['type' => 'string', 'required' => false],
        'points_cost' => ['type' => 'integer', 'required' => false],
        'is_active' => ['type' => 'boolean', 'required' => false],
    ],
    'gated' => false,
],
```

#### `pause_reward`

```php
'pause_reward' => [
    'service' => RewardService::class,
    'method' => 'pause',
    'description' => 'Deactivate a reward',
    'parameters' => [
        'reward_id' => ['type' => 'integer', 'required' => true],
    ],
    'gated' => false,
],
```

#### `resume_reward`

```php
'resume_reward' => [
    'service' => RewardService::class,
    'method' => 'resume',
    'description' => 'Activate a paused reward',
    'parameters' => [
        'reward_id' => ['type' => 'integer', 'required' => true],
    ],
    'gated' => false,
],
```

#### `get_reward_stats`

```php
'get_reward_stats' => [
    'service' => RewardService::class,
    'method' => 'getStats',
    'description' => 'Get reward redemption statistics',
    'parameters' => [
        'reward_id' => ['type' => 'integer', 'required' => true],
    ],
    'gated' => false,
],
```

---

### Referral Tools

#### `greet_referral`

```php
'greet_referral' => [
    'service' => SocialFeaturesService::class,
    'method' => 'greetReferral',
    'description' => 'Send a welcome greeting to a new referral',
    'parameters' => [
        'member_id' => ['type' => 'integer', 'required' => true],
        'referral_id' => ['type' => 'string', 'required' => true],
        'message' => ['type' => 'string', 'required' => false, 'description' => 'Personalized welcome message'],
    ],
    'gated' => true, // Marketing feature
],
```

#### `get_referral_stats`

```php
'get_referral_stats' => [
    'service' => ReferralService::class,
    'method' => 'getStats',
    'description' => 'Get referral program statistics',
    'parameters' => [
        'period' => ['type' => 'string', 'required' => false, 'default' => 'last_30_days'],
    ],
    'gated' => false,
],
```

#### `create_referral_campaign`

```php
'create_referral_campaign' => [
    'service' => ReferralService::class,
    'method' => 'createCampaign',
    'description' => 'Create a referral campaign with point rewards',
    'parameters' => [
        'name' => ['type' => 'string', 'required' => true],
        'referrer_points' => ['type' => 'integer', 'required' => true, 'description' => 'Points for referrer'],
        'referred_points' => ['type' => 'integer', 'required' => true, 'description' => 'Points for new member'],
        'start_date' => ['type' => 'string', 'required' => false, 'format' => 'date'],
        'end_date' => ['type' => 'string', 'required' => false, 'format' => 'date'],
    ],
    'gated' => true, // Marketing feature
],
```

---

### Analytics Tools

#### `get_dashboard_stats`

```php
'get_dashboard_stats' => [
    'service' => AnalyticsService::class,
    'method' => 'getDashboardStats',
    'description' => 'Get dashboard KPIs for the partner',
    'parameters' => [
        'period' => ['type' => 'string', 'required' => false, 'default' => 'last_30_days'],
    ],
    'gated' => false,
],
```

#### `get_retention_metrics`

```php
'get_retention_metrics' => [
    'service' => RetentionService::class,
    'method' => 'getMetrics',
    'description' => 'Get member retention analytics',
    'parameters' => [
        'period' => ['type' => 'string', 'required' => false, 'default' => 'last_30_days'],
    ],
    'gated' => false,
],
```

#### `get_revenue_report`

```php
'get_revenue_report' => [
    'service' => RevenueService::class,
    'method' => 'getReport',
    'description' => 'Get revenue analytics report',
    'parameters' => [
        'period' => ['type' => 'string', 'required' => false, 'default' => 'last_30_days'],
    ],
    'gated' => false,
],
```

#### `get_top_members`

```php
'get_top_members' => [
    'service' => MemberAnalyzerService::class,
    'method' => 'getTopMembers',
    'description' => 'Get top members by points or activity',
    'parameters' => [
        'limit' => ['type' => 'integer', 'required' => false, 'default' => 10],
        'period' => ['type' => 'string', 'required' => false],
    ],
    'gated' => false,
],
```

---

### Wallet Tools

#### `update_member_pass`

```php
'update_member_pass' => [
    'service' => UnifiedWalletService::class,
    'method' => 'updateMemberPass',
    'description' => 'Update a member\'s Apple/Google Wallet pass',
    'parameters' => [
        'member_id' => ['type' => 'integer', 'required' => true],
        'card_id' => ['type' => 'integer', 'required' => true],
        'data' => ['type' => 'object', 'required' => true, 'description' => 'Fields to update on the pass'],
    ],
    'gated' => false,
],
```

#### `send_wallet_notification`

```php
'send_wallet_notification' => [
    'service' => WalletNotificationOrchestrator::class,
    'method' => 'sendToMember',
    'description' => 'Send a push notification to a member\'s wallet',
    'parameters' => [
        'member_id' => ['type' => 'integer', 'required' => true],
        'card_id' => ['type' => 'integer', 'required' => true],
        'title' => ['type' => 'string', 'required' => true],
        'message' => ['type' => 'string', 'required' => true],
    ],
    'gated' => false,
],
```

#### `send_banner_notification`

```php
'send_banner_notification' => [
    'service' => WalletNotificationOrchestrator::class,
    'method' => 'sendBanner',
    'description' => 'Send a banner notification to all members with this card',
    'parameters' => [
        'card_id' => ['type' => 'integer', 'required' => true],
        'title' => ['type' => 'string', 'required' => true],
        'message' => ['type' => 'string', 'required' => true],
    ],
    'gated' => false,
],
```

#### `get_wallet_health`

```php
'get_wallet_health' => [
    'service' => UnifiedWalletService::class,
    'method' => 'getHealth',
    'description' => 'Check Apple/Google Wallet integration health',
    'parameters' => [
        'card_id' => ['type' => 'integer', 'required' => false],
    ],
    'gated' => false,
],
```

---

### Gamification Tools

#### `unlock_achievement`

```php
'unlock_achievement' => [
    'service' => AchievementService::class,
    'method' => 'unlock',
    'description' => 'Unlock an achievement for a member',
    'parameters' => [
        'member_id' => ['type' => 'integer', 'required' => true],
        'card_id' => ['type' => 'integer', 'required' => true],
        'achievement_type' => ['type' => 'string', 'required' => true],
    ],
    'gated' => false,
],
```

#### `apply_point_multiplier`

```php
'apply_point_multiplier' => [
    'service' => GamificationService::class,
    'method' => 'applyMultiplier',
    'description' => 'Apply a point multiplier for a member (e.g., double points day)',
    'parameters' => [
        'member_id' => ['type' => 'integer', 'required' => true],
        'card_id' => ['type' => 'integer', 'required' => true],
        'multiplier' => ['type' => 'number', 'required' => true, 'min' => 1],
        'reason' => ['type' => 'string', 'required' => true],
    ],
    'gated' => false,
],
```

#### `get_member_progress`

```php
'get_member_progress' => [
    'service' => GamificationService::class,
    'method' => 'getProgress',
    'description' => 'Get member gamification progress (level, achievements, streaks)',
    'parameters' => [
        'member_id' => ['type' => 'integer', 'required' => true],
        'card_id' => ['type' => 'integer', 'required' => true],
    ],
    'gated' => false,
],
```

#### `get_leaderboard`

```php
'get_leaderboard' => [
    'service' => LeaderboardService::class,
    'method' => 'get',
    'description' => 'Get member leaderboard',
    'parameters' => [
        'card_id' => ['type' => 'integer', 'required' => true],
        'period' => ['type' => 'string', 'required' => false, 'default' => 'all_time'],
        'limit' => ['type' => 'integer', 'required' => false, 'default' => 10],
    ],
    'gated' => false,
],
```

---

### Geofencing Tools

#### `create_geofence_rule`

```php
'create_geofence_rule' => [
    'service' => GeofencingNotificationService::class,
    'method' => 'createRule',
    'description' => 'Create a location-based notification trigger',
    'parameters' => [
        'card_id' => ['type' => 'integer', 'required' => true],
        'location_id' => ['type' => 'integer', 'required' => true],
        'radius' => ['type' => 'integer', 'required' => true, 'description' => 'Radius in meters'],
        'notification' => ['type' => 'object', 'required' => true, 'description' => 'Notification title and message'],
    ],
    'gated' => false,
],
```

#### `get_geofence_analytics`

```php
'get_geofence_analytics' => [
    'service' => GeofencingNotificationService::class,
    'method' => 'getAnalytics',
    'description' => 'Get geofence trigger analytics',
    'parameters' => [
        'card_id' => ['type' => 'integer', 'required' => true],
        'days' => ['type' => 'integer', 'required' => false, 'default' => 30],
    ],
    'gated' => false,
],
```

---

## Summary

| Category | Total | Gated | Ungated |
|----------|-------|-------|---------|
| Onboarding | 4 | 0 | 4 |
| Voucher | 6 | 5 | 1 |
| Campaign | 4 | 3 | 1 |
| Member | 6 | 2 | 4 |
| Reward | 5 | 0 | 5 |
| Referral | 3 | 2 | 1 |
| Analytics | 4 | 0 | 4 |
| Wallet | 4 | 0 | 4 |
| Gamification | 4 | 0 | 4 |
| Geofencing | 2 | 0 | 2 |
| **Total** | **42** | **12** | **30** |

---

## Next Steps

1. **Copy this registry** to `app/Services/OpenClaw/ToolRegistry.php`
2. **Verify service methods** exist and match signatures
3. **Add parameter validation** in `ToolExecutor`
4. **Generate OpenAPI spec** from registry via `OpenApiGenerator`