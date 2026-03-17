# Memory Optimization Review Plan

**Last Updated**: 2025-12-25  
**Purpose**: Identify and resolve memory issues that could slow the app on shared hosting services.

---

## Executive Summary

The codebase has a solid memory optimization infrastructure (`SharedServerOptimizer`, `PerformanceService`, `memory-optimization.php` config), but several areas still load unbounded data into memory. This document catalogs all identified issues with severity, location, and recommended fixes.

---

## ✅ Existing Infrastructure (Already Implemented)

| Component | Location | Purpose |
|-----------|----------|---------|
| SharedServerOptimizer | `app/Services/Wallet/SharedServerOptimizer.php` | Batch processing, GC triggers, memory monitoring |
| PerformanceService | `app/Services/Agent/PerformanceService.php` | Chunked processing, circuit breaker, retry logic |
| Memory Config | `config/memory-optimization.php` | Shared hosting mode, thresholds, lazy loading |

---

## 🔴 Critical Issues (HIGH RISK)

### 1. Image Processing - Unbounded Memory Usage

**Severity**: 🔴 HIGH  
**Impact**: Can consume 10-50MB+ per image, especially with retina versions

| File | Line(s) | Issue |
|------|---------|-------|
| `app/Services/Wallet/ImageService.php` | 117, 134, 267, 459 | `file_get_contents()` loads entire images into memory |
| `app/Services/Wallet/ImageService.php` | 311, 465, 685, 763 | `imagecreatefromstring()` creates GD resources without size limits |
| `app/Services/Wallet/apple/AppleWalletService.php` | 423-429, 724, 820, 976 | Multiple image operations for pass generation |
| `app/Services/PasskitService.php` | 66, 86, 104, 130, 235, 256, 268, 291, 313, 515 | Base64 encoding of images |
| `app/Services/Wallet/apple/AppleCouponService.php` | 155, 321-327, 442 | Image loading and conversion |
| `app/Services/Wallet/apple/AppleCampaignService.php` | 158, 330-336, 451 | Campaign pass image processing |

**Recommended Fixes**:
- [ ] Add max dimension validation before loading images
- [ ] Implement streaming for large files
- [ ] Add memory checks before generating @2x/@3x retina versions
- [ ] Consider using Intervention Image's `stream()` method
- [ ] Implement image size limits in upload validation

---

### 2. OCR/Receipt Processing - Full Image Loading

**Severity**: 🔴 HIGH  
**Impact**: Receipt images fully loaded into memory for OCR processing

| File | Line(s) | Issue |
|------|---------|-------|
| `app/Services/Receipt/OcrService.php` | 539 | `file_get_contents($imagePath)` for OCR |
| `app/Services/Receipt/OCR/DeepSeekOcrService.php` | 42 | `base64_encode(file_get_contents($imagePath))` |
| `app/Services/Receipt/OCR/GoogleVisionOcrService.php` | 120 | Full image content loading |

**Recommended Fixes**:
- [ ] Resize images before OCR processing (OCR doesn't need full resolution)
- [ ] Add max file size validation on upload
- [ ] Implement image compression before base64 encoding

---

## 🟠 Medium Issues (MODERATE RISK)

### 3. Analytics Services - Unbounded Query Results

**Severity**: 🟠 MEDIUM  
**Impact**: Large datasets loaded entirely into memory for analysis

| File | Method | Issue |
|------|--------|-------|
| `app/Services/LoyaltyAnalyticsService.php` | Multiple methods | Transaction queries without limits |
| `app/Services/PredictiveAnalyticsService.php` | `predictChurnRisk()`, `forecastLifetimeValue()` | Gets all transactions for a member |
| `app/Services/Analytics/ReceiptScannerAnalyticsService.php` | Line 184 | Reads entire log files: `file_get_contents($logFile)` |
| `app/Services/ReceiptLogAnalyzer.php` | Multiple | Log file parsing without streaming |

**Recommended Fixes**:
- [ ] Add `->limit()` to analytics queries
- [ ] Use `->cursor()` or `->lazy()` for large result iteration
- [ ] Implement log file streaming instead of full loading
- [ ] Add date range limits to prevent unbounded queries

---

### 4. Excel/Report Exports - In-Memory Data Loading

**Severity**: 🟠 MEDIUM  
**Impact**: Large exports consume memory proportional to data size

| File | Issue |
|------|-------|
| `app/Exports/AgentAnalyticsExport.php` | Uses `FromArray` - loads all data into memory before export |

**Recommended Fixes**:
- [ ] Change from `FromArray` to `FromQuery` with automatic chunking
- [ ] Implement `ShouldQueue` for large exports
- [ ] Add row limits with pagination for CSV downloads

---

### 5. Foreach Loops on Potentially Large Collections

**Severity**: 🟠 MEDIUM  
**Impact**: Memory grows linearly with data size

| File | Line(s) | Context |
|------|---------|---------|
| `app/Services/EnhancedGdprComplianceService.php` | 729, 740, 761, 774, 797, 818, 841 | Iterates through achievements, challenges, reservations, etc. |
| `app/Services/EnhancedMemberPersonalizationService.php` | 126, 564, 602, 833, 851 | Member preference processing |
| `app/Services/EnhancedAiService.php` | Multiple (63, 82, 109, 178, 209, 225, 314, 354, 508, 567, 632, 802, 805) | Provider iteration, stats processing |

**Recommended Fixes**:
- [ ] Review each loop for potential unbounded growth
- [ ] Add chunking where collections could be large
- [ ] Consider generators for streaming data processing

---

## 🟡 Low Issues (IMPROVEMENT OPPORTUNITIES)

### 6. Log File Reading

**Severity**: 🟡 LOW  
**Impact**: Occasional memory spikes when reading large logs

| File | Line(s) | Issue |
|------|---------|-------|
| `app/Console/Commands/MonitorAiAgentHealth.php` | 99 | `file_get_contents($logFile)` |
| `app/Services/Analytics/ReceiptScannerAnalyticsService.php` | 184, 187 | Log file iteration |

**Recommended Fixes**:
- [ ] Use `SplFileObject` for line-by-line reading
- [ ] Implement log rotation and archiving
- [ ] Consider using `tail` equivalent for recent entries only

---

### 7. Certificate/Credential Loading

**Severity**: 🟡 LOW  
**Impact**: Minimal, but still loads files fully into memory

| File | Line(s) |
|------|---------|
| `app/Services/Wallet/CertificateManager.php` | 105, 157, 294 |
| `app/Services/ApiCredentialService.php` | 40, 46, 62, 112 |
| `app/Services/Admin/ApiCredentialService.php` | 40, 53, 66, 147, 429, 489 |

**Recommended Fixes**:
- [ ] These are typically small files, but consider caching parsed results

---

## 📋 Environment Configuration Checklist

Ensure these are set in your `.env` for shared hosting:

```env
# Shared Hosting Mode
SHARED_HOSTING_MODE=true
SHARED_SERVER_MEMORY_LIMIT=128M
SHARED_SERVER_MEMORY_THRESHOLD=0.8
SHARED_SERVER_BATCH_SIZE=10

# Database Optimization
DB_DEFAULT_PAGINATION_SIZE=20
DB_MAX_PAGINATION_SIZE=100
DB_EAGER_LOAD_MINIMAL=true

# Service Loading
LAZY_LOADING_ENABLED=true
PRELOAD_ESSENTIAL_ONLY=true

# AI Agent
AI_LOAD_ANALYTICS_ON_DEMAND=true
AI_LOAD_REPORTING_ON_DEMAND=true
AI_CACHE_RECOMMENDATIONS=true

# Wallet Services
WALLET_SKIP_HEAVY_SERVICES=true
WALLET_LAZY_LOAD_PROVIDERS=true

# Emergency Mode
EMERGENCY_MODE_THRESHOLD=140
EMERGENCY_DISABLE_NON_ESSENTIAL=true
EMERGENCY_FORCE_GC=true

# Caching
USE_FILE_CACHE=true
CACHE_HEAVY_COMPUTATIONS=true
```

---

## 🔧 Implementation Priority

### Phase 1: Quick Wins (1-2 days)
1. [ ] Add image dimension limits in upload validation
2. [ ] Add `->limit()` to analytics queries
3. [ ] Review `.env` configuration

### Phase 2: Image Processing (3-5 days)
1. [ ] Implement image size checks before processing
2. [ ] Add memory threshold checks in `ImageService`
3. [ ] Resize images before OCR processing

### Phase 3: Analytics & Exports (2-3 days)
1. [ ] Refactor `AgentAnalyticsExport` to use `FromQuery`
2. [ ] Add streaming for log file reading
3. [ ] Implement chunking in analytics services

### Phase 4: Comprehensive Review (1 week)
1. [ ] Audit all `foreach` loops in services
2. [ ] Add memory monitoring middleware
3. [ ] Create automated memory usage tests

---

## 📊 Testing Strategy

### Memory Profiling Commands
```bash
# Monitor memory during specific operations
php artisan tinker --execute="memory_get_peak_usage(true)"

# Run with memory profiling
XDEBUG_MODE=profile php artisan [command]
```

### Key Test Scenarios
1. Generate Apple Wallet pass with large logo images
2. Export large analytics report
3. Process multiple receipt OCR requests
4. Run analytics on partner with 10,000+ members

---

## References

- [SharedServerOptimizer](file:///Users/admin/Documents/GitHub/March/app/Services/Wallet/SharedServerOptimizer.php)
- [PerformanceService](file:///Users/admin/Documents/GitHub/March/app/Services/Agent/PerformanceService.php)
- [Memory Optimization Config](file:///Users/admin/Documents/GitHub/March/config/memory-optimization.php)
