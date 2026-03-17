# Memory Investigation Quick Reference

## ⚡ Quick Commands

### 1. System Check (30 seconds)
```bash
./scripts/investigate_memory.sh
```

### 2. Laravel Diagnostic (60 seconds)
```bash
php artisan app:diagnose-memory --detailed --routes
```

### 3. Real-time Memory Monitor
```bash
watch -n 5 'ps aux | grep php | grep -v grep'
```

## 🔍 Investigation Results Summary

### Current Status (2026-02-04)

✅ **Healthy:**
- No fatal memory errors in logs
- Session count: 5 files (healthy)
- Cache: Minimal (0 files)
- No zombie processes

⚠️ **Attention Required:**
- **System Memory**: High compression active (26GB → 7GB)
- **PHP Memory**: Using 50.78% of 128MB limit
- **Routes**: 854 routes (high, needs caching)
- **Image Files in Logs**: 8.4MB of PNG/JPG files that shouldn't be there
- **Vendor Size**: 364MB (consider composer install --no-dev in production)

❌ **Issues:**
- Image files stored incorrectly in `storage/logs/` directory
- Old log files accumulating (wallet operations logs)
- Routes not cached (performance impact)

## 🚨 Immediate Actions Recommended

### 1. Clean Up Image Files (SAFE)
```bash
# Review files first
ls -lh storage/logs/*.{png,jpg}

# Move to proper location (DO NOT DELETE without reviewing)
mkdir -p storage/app/debug-images
mv storage/logs/*.{png,jpg} storage/app/debug-images/

# Or if they're truly unnecessary:
# rm storage/logs/*.{png,jpg}
```

### 2. Cache Routes (SAFE for production)
```bash
php artisan route:cache
php artisan config:cache
php artisan view:cache
```

### 3. Clean Old Logs (REVIEW FIRST)
```bash
# Compress old logs
gzip storage/logs/wallet-operations-2025-*.log

# Remove compressed logs older than 30 days
find storage/logs -name "*.log.gz" -mtime +30 -delete
```

## 📊 Key Metrics to Monitor

### Normal Operating Range:
- **PHP Memory**: < 70% of limit
- **System Memory**: < 80% usage
- **Session Files**: < 1000
- **Cache Size**: < 100MB
- **Log Files**: Rotate after 7-14 days

### Alert Thresholds:
- **PHP Memory**: > 80% → Increase limit or optimize code
- **System Memory**: > 85% → Investigate memory leaks
- **Session Files**: > 5000 → Run session:gc
- **Log Files**: > 50MB → Rotate immediately

## 🔧 Common Fixes

### High Memory Usage?
```bash
# 1. Check what's using memory
ps aux --sort=-%mem | head -10

# 2. Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# 3. Restart queue workers (if running)
php artisan queue:restart
```

### Memory Limit Errors?
```php
// In specific commands or controllers
ini_set('memory_limit', '512M');

// Or globally in php.ini
memory_limit = 256M
```

### Slow Performance?
```bash
# Production optimizations
php artisan optimize
php artisan route:cache
php artisan config:cache
php artisan view:cache
```

## 🎯 Application-Specific Issues

### Wallet Image Processing
**Problem**: Large memory usage during pass generation

**Solution**:
```php
// After image processing
imagedestroy($image);
gc_collect_cycles();

// Use memory limit
ini_set('memory_limit', '256M');
```

### Large Database Queries
**Problem**: Loading too many records at once

**Solution**:
```php
// Instead of Model::all()
Model::chunk(100, function ($items) {
    // Process items
});

// Or use lazy loading
Model::lazy()->each(function ($item) {
    // Process item
});
```

### AI Agent Services
**Current**: ~40.5MB per bootstrap

**Monitor**:
```bash
tail -f storage/logs/laravel.log | grep "Memory usage"
```

## 📈 Monitoring Setup

### Daily Check (Add to cron)
```bash
# Create monitoring log
0 */6 * * * cd /path/to/march && ./scripts/investigate_memory.sh >> storage/logs/memory-daily.log 2>&1
```

### Alert on High Memory
```bash
# Create alert script
#!/bin/bash
USAGE=$(ps aux | grep php | awk '{sum+=$4} END {print sum}')
if (( $(echo "$USAGE > 80" | bc -l) )); then
    echo "High PHP memory usage: ${USAGE}%" | mail -s "Memory Alert" admin@example.com
fi
```

## 📚 Documentation

- **Full Guide**: `docs/MEMORY_INVESTIGATION_GUIDE.md`
- **Investigation Script**: `scripts/investigate_memory.sh`
- **Diagnostic Command**: `php artisan app:diagnose-memory --help`

## 🆘 Emergency Contact

### When Memory is Exhausted:
1. Stop queue workers: `php artisan queue:restart`
2. Clear all caches: `php artisan cache:clear && php artisan view:clear`
3. Check running processes: `ps aux | grep php`
4. Increase PHP limit temporarily: Edit `php.ini`
5. Investigate cause: Run diagnostic commands
6. Review logs: `tail -n 500 storage/logs/laravel.log`

### Production Server:
```bash
# Restart PHP-FPM
sudo systemctl restart php8.2-fpm

# Kill hung processes (CAUTION)
sudo pkill -9 php
```

## ✅ Health Check Checklist

- [ ] System memory < 80%
- [ ] PHP memory usage < 70%
- [ ] No image files in logs/
- [ ] Routes cached in production
- [ ] Config cached in production
- [ ] Logs rotated (< 14 days old)
- [ ] Sessions cleaned (<1000 files)
- [ ] Queue workers restarting regularly
- [ ] No zombie processes
- [ ] Vendor/ optimized (--no-dev in production)

---

**Last Updated**: 2026-02-04
**Status**: ⚠️ Requires attention (image cleanup, route caching)
