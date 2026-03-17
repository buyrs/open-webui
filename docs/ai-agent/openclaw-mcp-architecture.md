# OpenClaw MCP Server Architecture

## Overview

**OpenClaw** is an MCP (Model Context Protocol) server that enables AI agents to autonomously manage partner accounts on the Boutikio loyalty platform. It provides full access to partner operations including voucher management, campaigns, member engagement, and rewards.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AI Agent (Claude/GPT)                          │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          OpenClaw MCP Server                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │    Resources    │  │     Tools       │  │    Prompts      │          │
│  │  (Read-only)    │  │   (Actions)     │  │  (Templates)    │          │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘          │
│                                      │                                   │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    MCP Authentication Layer                       │    │
│  │              (PartnerApiKey + Permission Scoping)                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Boutikio Laravel App                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Services   │  │   Models     │  │   Database   │                   │
│  │  (Business)  │  │  (Eloquent)  │  │   (MySQL)    │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
app/
├── MCP/
│   ├── OpenClawMcpServer.php          # Main MCP server class
│   ├── Controllers/
│   │   ├── McpController.php          # MCP HTTP endpoint
│   │   └── SseController.php          # Server-Sent Events for streaming
│   ├── Resources/
│   │   ├── PartnerResource.php        # Partner profile data
│   │   ├── SubscriptionResource.php   # Subscription status
│   │   ├── StatsResource.php          # Dashboard metrics
│   │   ├── MembersResource.php        # Member list
│   │   ├── VouchersResource.php       # Voucher list
│   │   ├── CampaignsResource.php      # Campaign list
│   │   └── AgentStatusResource.php    # AI agent health
│   ├── Tools/
│   │   ├── Voucher/
│   │   │   ├── CreateVoucherTool.php
│   │   │   ├── PauseVoucherTool.php
│   │   │   ├── ResumeVoucherTool.php
│   │   │   ├── ShareVoucherSocialTool.php
│   │   │   └── GetVoucherStatsTool.php
│   │   ├── Campaign/
│   │   │   ├── CreateCampaignTool.php
│   │   │   ├── PauseCampaignTool.php
│   │   │   ├── ResumeCampaignTool.php
│   │   │   └── GetCampaignPerformanceTool.php
│   │   ├── Member/
│   │   │   ├── GetMembersTool.php
│   │   │   ├── GetMemberDetailsTool.php
│   │   │   ├── ReactivateMemberTool.php
│   │   │   ├── SendPinCodeTool.php
│   │   │   └── GetMemberSegmentsTool.php
│   │   ├── Reward/
│   │   │   ├── CreateRewardTool.php
│   │   │   ├── PauseRewardTool.php
│   │   │   ├── ResumeRewardTool.php
│   │   │   └── GetRewardStatsTool.php
│   │   ├── Referral/
│   │   │   ├── GreetReferralTool.php
│   │   │   ├── GetReferralStatsTool.php
│   │   │   └── CreateReferralCampaignTool.php
│   │   └── Analytics/
│   │       ├── GetDashboardStatsTool.php
│   │       ├── GetRetentionMetricsTool.php
│   │       └── GetRevenueReportTool.php
│   ├── Prompts/
│   │   ├── VoucherCreationPrompt.php
│   │   ├── CampaignCreationPrompt.php
│   │   ├── MemberReactivationPrompt.php
│   │   └── ReferralGreetingPrompt.php
│   ├── Middleware/
│   │   ├── McpAuthentication.php
│   │   └── PermissionScope.php
│   └── Support/
│       ├── McpResponse.php
│       ├── McpError.php
│       └── McpToolRegistry.php
├── Services/
│   └── MCP/
│       ├── McpAuthService.php          # Authentication service
│       ├── McpExecutionService.php     # Tool execution
│       └── McpStreamingService.php     # SSE streaming
config/
└── openclaw.php                         # MCP configuration
routes/
└── mcp.php                              # MCP routes
```

## MCP Resources (Read-Only)

| Resource URI | Description | Permission Required |
|-------------|-------------|---------------------|
| `partner://profile` | Partner account info | `partner.read` |
| `partner://subscription` | Current subscription/tier | `subscription.read` |
| `partner://stats` | Real-time dashboard metrics | `analytics.read` |
| `partner://members` | Member list with activity | `member.read` |
| `partner://members/{id}` | Individual member details | `member.read` |
| `partner://vouchers` | Voucher list with status | `voucher.read` |
| `partner://vouchers/{id}` | Individual voucher details | `voucher.read` |
| `partner://campaigns` | Campaign list | `campaign.read` |
| `partner://campaigns/{id}` | Campaign performance | `campaign.read` |
| `partner://rewards` | Reward list | `reward.read` |
| `partner://agent/status` | AI agent configuration & health | `agent.read` |
| `partner://referrals` | Referral statistics | `referral.read` |

## MCP Tools (Actions)

### Voucher Management

| Tool | Description | Permission | Parameters |
|------|-------------|------------|------------|
| `create_voucher` | Create a new voucher | `voucher.write` | `name, type, value, valid_from, valid_until, quantity?, minimum_purchase?` |
| `create_voucher_batch` | Create batch of vouchers | `voucher.write` | `name, quantity, template_data` |
| `pause_voucher` | Pause an active voucher | `voucher.write` | `voucher_id` |
| `resume_voucher` | Resume a paused voucher | `voucher.write` | `voucher_id` |
| `share_voucher_social` | Generate social media content | `voucher.share` | `voucher_id, platform` |
| `get_voucher_stats` | Get voucher performance | `voucher.read` | `voucher_id` |

### Campaign Management

| Tool | Description | Permission | Parameters |
|------|-------------|------------|------------|
| `create_campaign` | Create marketing campaign | `campaign.write` | `name, type, details, start_date, end_date, trigger_type?` |
| `pause_campaign` | Pause active campaign | `campaign.write` | `campaign_id` |
| `resume_campaign` | Resume paused campaign | `campaign.write` | `campaign_id` |
| `get_campaign_performance` | Get campaign metrics | `campaign.read` | `campaign_id` |

### Member Engagement

| Tool | Description | Permission | Parameters |
|------|-------------|------------|------------|
| `get_members` | List members with filters | `member.read` | `segment?, status?, limit?, offset?` |
| `get_member_details` | Get member profile | `member.read` | `member_id` |
| `reactivate_member` | Reactivate inactive member | `member.write` | `member_id, incentive_points?` |
| `send_pin_code` | Send re-engaging PIN code | `agent.execute` | `member_id, points, reasoning` |
| `get_member_segments` | Get member segment list | `member.read` | - |

### Reward Management

| Tool | Description | Permission | Parameters |
|------|-------------|------------|------------|
| `create_reward` | Create new reward | `reward.write` | `title, description, points_cost, is_active` |
| `pause_reward` | Deactivate reward | `reward.write` | `reward_id` |
| `resume_reward` | Activate reward | `reward.write` | `reward_id` |
| `get_reward_stats` | Get reward performance | `reward.read` | `reward_id` |

### Referral Management

| Tool | Description | Permission | Parameters |
|------|-------------|------------|------------|
| `greet_referral` | Send referral greeting | `referral.write` | `member_id, referral_id, message?` |
| `get_referral_stats` | Get referral analytics | `referral.read` | `period?` |
| `create_referral_campaign` | Create referral campaign | `campaign.write` | `name, referrer_points, referred_points, start_date, end_date` |

### Analytics

| Tool | Description | Permission | Parameters |
|------|-------------|------------|------------|
| `get_dashboard_stats` | Get dashboard KPIs | `analytics.read` | `period?` |
| `get_retention_metrics` | Get retention data | `analytics.read` | `period?` |
| `get_revenue_report` | Get revenue analytics | `analytics.read` | `period?` |

## MCP Prompts (Templates)

### `voucher_creation`
Guides AI through creating an effective voucher campaign.

```
Create a voucher for {{partner_name}}:
- Target audience: {{segment}}
- Discount type: percentage/fixed/bonus_points
- Validity period: {{duration}}
- Goal: {{objective}}
```

### `member_reactivation`
Template for re-engaging inactive members.

```
Reactivate members who haven't visited in {{days}} days:
- Incentive: {{points}} points
- Message template: {{message}}
- Follow-up: {{follow_up_days}} days
```

### `referral_greeting`
Template for welcoming new referrals.

```
Welcome new referral from {{referrer_name}}:
- Referral code: {{code}}
- Bonus: {{points}} points after first scan
- Personal message: {{message}}
```

## Authentication Flow

```
1. AI Agent connects with API Key (from PartnerApiKey)
   POST /mcp/connect
   Headers: X-Partner-API-Key: {key_id}:{secret}

2. Server validates key and loads partner context
   - Check key is valid (active, not expired)
   - Load permissions scope
   - Set partner context for all operations

3. AI Agent calls tools/resources
   POST /mcp/tools/{tool_name}
   Headers: Authorization: Bearer {session_token}

4. Server executes with permission checks
   - Verify permission for tool
   - Execute within partner scope
   - Return result
```

## Permission Mapping

OpenClaw extends the existing `PartnerApiKey` permission model:

| Permission | Tools Enabled |
|------------|---------------|
| `*` | Full access to all tools |
| `voucher.read` | `get_voucher_stats`, `list_vouchers` |
| `voucher.write` | `create_voucher`, `pause_voucher`, `resume_voucher` |
| `voucher.share` | `share_voucher_social` |
| `campaign.read` | `get_campaign_performance`, `list_campaigns` |
| `campaign.write` | `create_campaign`, `pause_campaign`, `resume_campaign` |
| `member.read` | `get_members`, `get_member_details`, `get_member_segments` |
| `member.write` | `reactivate_member` |
| `agent.execute` | `send_pin_code` |
| `reward.read` | `get_reward_stats`, `list_rewards` |
| `reward.write` | `create_reward`, `pause_reward`, `resume_reward` |
| `referral.read` | `get_referral_stats` |
| `referral.write` | `greet_referral` |
| `analytics.read` | `get_dashboard_stats`, `get_retention_metrics`, `get_revenue_report` |

## Service Integration

OpenClaw delegates to existing services:

| Tool | Existing Service |
|------|------------------|
| `create_voucher_batch` | `VoucherBatchService::createBatch()` |
| `share_voucher_social` | `VoucherSocialPostService::generate()` |
| `send_pin_code` | `PinCodeGeneratorService::generatePinCode()`, `sendPinCode()` |
| `reactivate_member` | `MemberAnalyzerService`, `AgentManagerService` |
| `greet_referral` | `SocialFeaturesService::generateSharingContent()` |
| `create_campaign` | `CampaignController::postInsertItem()` |
| `get_retention_metrics` | `AgentRetentionController` |

## Configuration

```php
// config/openclaw.php
return [
    'enabled' => env('OPENCLAW_ENABLED', true),

    'server' => [
        'name' => 'openclaw',
        'version' => '1.0.0',
        'description' => 'Boutikio Partner Account MCP Server',
    ],

    'auth' => [
        'session_ttl' => 3600, // 1 hour
        'rate_limit' => 100,   // requests per minute
    ],

    'streaming' => [
        'enabled' => true,
        'sse_heartbeat' => 30, // seconds
    ],

    'tools' => [
        'timeout' => 30,       // seconds per tool execution
        'concurrency' => 5,    // max concurrent tool calls
    ],
];
```

## Routes

```php
// routes/mcp.php
Route::prefix('mcp')->group(function () {
    // MCP Discovery
    Route::get('/', [McpController::class, 'info']);
    Route::get('/resources', [McpController::class, 'listResources']);
    Route::get('/tools', [McpController::class, 'listTools']);
    Route::get('/prompts', [McpController::class, 'listPrompts']);

    // Authentication
    Route::post('/connect', [McpController::class, 'connect']);

    // Resources (require auth)
    Route::middleware('mcp.auth')->group(function () {
        Route::get('/resource/{uri}', [McpController::class, 'getResource']);
    });

    // Tool Execution
    Route::middleware('mcp.auth')->group(function () {
        Route::post('/tools/{tool}', [McpController::class, 'executeTool']);
    });

    // Prompts
    Route::middleware('mcp.auth')->group(function () {
        Route::post('/prompts/{prompt}', [McpController::class, 'renderPrompt']);
    });

    // SSE Streaming
    Route::get('/stream', [SseController::class, 'connect'])
        ->middleware('mcp.auth');
});
```

## Example Usage

### Creating a Voucher Campaign

```json
// AI Agent calls:
POST /mcp/tools/create_voucher_batch
Authorization: Bearer {session_token}

{
  "name": "Summer Sale 2026",
  "quantity": 100,
  "template_data": {
    "name": "20% Off Summer Items",
    "type": "percentage",
    "value": 20,
    "valid_from": "2026-06-01",
    "valid_until": "2026-08-31",
    "minimum_purchase": 50
  }
}

// Response:
{
  "success": true,
  "batch_id": "ABC123",
  "vouchers_created": 100,
  "message": "Voucher batch 'Summer Sale 2026' created with 100 vouchers"
}
```

### Sending Re-engagement PIN Code

```json
// AI Agent calls:
POST /mcp/tools/send_pin_code
Authorization: Bearer {session_token}

{
  "member_id": "12345",
  "points": 50,
  "reasoning": "Member inactive for 30 days, sending re-engagement incentive"
}

// Response:
{
  "success": true,
  "pin_code_id": "PC789",
  "code": "4821",
  "points": 50,
  "expires_at": "2026-04-16T00:00:00Z",
  "delivery_method": "wallet_push",
  "message": "PIN code 4821 sent to member via wallet notification"
}
```

### Greeting a Referral

```json
// AI Agent calls:
POST /mcp/tools/greet_referral
Authorization: Bearer {session_token}

{
  "member_id": "12345",
  "referral_id": "REF789",
  "message": "Welcome! Thanks to John's referral, you've received 100 bonus points!"
}

// Response:
{
  "success": true,
  "notification_sent": true,
  "channel": "wallet_push",
  "message": "Referral greeting sent successfully"
}
```

## Security Considerations

1. **API Key Validation**: All requests require valid PartnerApiKey
2. **Permission Scoping**: Each tool checks required permission
3. **Rate Limiting**: Per-key rate limits prevent abuse
4. **Audit Logging**: All MCP actions logged to `agent_audit_logs`
5. **Session Management**: Time-limited session tokens
6. **Input Validation**: All tool inputs validated via Laravel validation

## Implementation Phases

### Phase 1: Core Infrastructure
- McpController and routing
- Authentication middleware
- Base resource/tool classes
- Tool registry

### Phase 2: Voucher Tools
- create_voucher_batch
- pause_voucher / resume_voucher
- share_voucher_social
- get_voucher_stats

### Phase 3: Member Tools
- get_members / get_member_details
- send_pin_code
- reactivate_member

### Phase 4: Campaign & Reward Tools
- create_campaign
- pause_campaign / resume_campaign
- create_reward
- pause_reward / resume_reward

### Phase 5: Referral & Analytics
- greet_referral
- get_referral_stats
- get_dashboard_stats
- get_retention_metrics

### Phase 6: Streaming & Prompts
- SSE streaming support
- Prompt templates
- Advanced analytics