# Memory Investigation Guide for Laravel Applications

## Quick Start

### 1. Run Investigation Script
```bash
./scripts/investigate_memory.sh
```

### 2. Run Laravel Diagnostic Command
```bash
php artisan app:diagnose-memory --detailed --queries --cache --routes
```

## System Analysis

### Current System Status (from investigation)

From your latest investigation results:

- **System Memory**: 15GB used (7.2GB compressed, 3.7GB wired)
- **PHP Memory Limit**: 128M
- **Compression Active**: 26.6GB stored in compressor (7.1GB compressed size)
- **Agent Services**: Using ~40.5MB per bootstrap
- **No Queue Workers Running**
- **No Fatal Memory Errors** in recent logs

### ⚠️ Key Findings

1. **High Memory Compression**: Your system is heavily compressing memory (26GB compressed to 7GB), indicating memory pressure
2. **Log Files**: You have multiple large log files (3.2MB wallet-operations, 2.9MB sample images)
3. **PHP Memory Limit**: 128M may be insufficient for image processing and wallet operations
4. **Image Files in Logs**: Unusual to have PNG/JPG files in `storage/logs/` directory

## Common Memory Issues in Your Application

### 1. **Wallet Image Processing**

Your application processes images for Apple Wallet and Google Wallet. This is likely a major memory consumer.

**Investigation Commands:**
```bash
# Check wallet image cache
du -sh storage/app/wallet-image-cache/*

# Check wallet operations logs
tail -f storage/logs/wallet-operations-*.log | grep -i memory

# Monitor wallet pass generation
php artisan tinker
>>> memory_get_usage(true);
>>> // Generate a wallet pass
>>> memory_get_usage(true);
```

**Fix:**
```php
// In your image processing code, ensure you're freeing memory:
imagedestroy($image); // After processing GD images

// Use intervention/image with memory limits:
Image::make($image)->resize(300, 300)->destroy();

// Process images in chunks:
foreach ($images->chunk(10) as $chunk) {
    // Process chunk
    gc_collect_cycles(); // Force garbage collection
}
```

### 2. **Large Database Queries**

**Check for N+1 Queries:**
```bash
php artisan app:diagnose-memory --queries
```

**Fix Common Issues:**
```php
// BAD - Loads all records into memory
$members = Member::all();
foreach ($members as $member) {
    // Process member
}

// GOOD - Uses chunking
Member::chunk(100, function ($members) {
    foreach ($members as $member) {
        // Process member
    }
});

// BETTER - Uses lazy loading (Laravel 8+)
Member::lazy()->each(function ($member) {
    // Process member
});
```

### 3. **Wallet Pass Generation at Scale**

**Issue:** Generating multiple wallet passes simultaneously

**Fix:**
```php
// Move to queue processing
dispatch(new GenerateWalletPass($member, $card));

// Or use batch processing with memory cleanup
foreach (Members::cursor() as $member) {
    $this->generatePass($member);
    unset($member); // Explicitly free memory
    
    if (memory_get_usage() > 100 * 1024 * 1024) { // 100MB threshold
        gc_collect_cycles();
    }
}
```

### 4. **Log File Cleanup**

**Current Issue:** 
- Main laravel.log: 692KB
- Wallet operations logs: Multiple files totaling ~8MB
- **IMAGE FILES IN LOGS DIRECTORY**: 8.4MB of images

**Immediate Actions:**
```bash
# Remove image files from logs directory (they shouldn't be there)
rm storage/logs/*.png storage/logs/*.jpg

# Rotate old wallet operation logs
gzip storage/logs/wallet-operations-2025-*.log
gzip storage/logs/wallet-operations-2026-01-*.log

# Keep only recent logs
find storage/logs -name "wallet-operations-*.log.gz" -mtime +30 -delete
```

**Long-term Solution:**
```bash
# Set up log rotation in config/logging.php
'daily' => [
    'driver' => 'daily',
    'path' => storage_path('logs/laravel.log'),
    'level' => env('LOG_LEVEL', 'debug'),
    'days' => 14, // Keep logs for 14 days
],
```

### 5. **Session Accumulation**

**Current Status:** 5 session files (healthy)

**Monitor:**
```bash
# Check session growth
watch -n 60 'find storage/framework/sessions -type f | wc -l'

# Clean old sessions
php artisan session:gc
```

## Specific Laravel Optimizations

### Production Environment

```bash
# Cache everything in production
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Clear old caches
php artisan cache:clear
php artisan view:clear
```

### Memory Limits for Different Operations

**In `.env` or `php.ini`:**
```ini
# For regular web requests
memory_limit=256M

# For CLI operations (php.ini for CLI)
memory_limit=512M

# For development only
memory_limit=1G
```

**Runtime adjustments in code:**
```php
// For specific heavy operations
ini_set('memory_limit', '512M');

// In app/Console/Commands for artisan commands
public function handle()
{
    ini_set('memory_limit', '512M');
    // Your code
}
```

## Investigation Checklist

### Daily Monitoring

- [ ] Check system memory: `./scripts/investigate_memory.sh`
- [ ] Monitor PHP processes: `ps aux | grep php`
- [ ] Check log file sizes: `du -sh storage/logs/*`
- [ ] Verify cache sizes: `du -sh storage/framework/cache`

### Weekly Maintenance

- [ ] Run full diagnostic: `php artisan app:diagnose-memory --detailed --queries --cache`
- [ ] Clean old logs: `find storage/logs -mtime +7 -delete`
- [ ] Optimize database: `php artisan db:optimize`
- [ ] Clear old sessions: `php artisan session:gc`

### When Memory Issues Occur

1. **Identify the Source:**
   ```bash
   # Check Laravel logs
   tail -n 500 storage/logs/laravel.log | grep -i "memory\|fatal"
   
   # Check slow query log (if enabled)
   tail -n 100 storage/logs/query.log
   
   # Monitor in real-time
   tail -f storage/logs/laravel.log
   ```

2. **Profile the Code:**
   ```php
   // Add to suspected code
   Log::info('Memory before operation: ' . memory_get_usage(true));
   // Your operation
   Log::info('Memory after operation: ' . memory_get_usage(true));
   ```

3. **Use Laravel Telescope (Development):**
   ```bash
   composer require laravel/telescope --dev
   php artisan telescope:install
   php artisan migrate
   ```

4. **Enable Query Logging:**
   ```php
   // In a controller or service
   DB::enableQueryLog();
   // Your queries
   Log::info('Queries:', DB::getQueryLog());
   ```

## Wallet-Specific Memory Issues

### Apple Wallet Pass Generation

**Memory-intensive operations:**
- Image resizing for pass icons
- Certificate operations
- JSON manifest generation
- ZIP file creation

**Optimization:**
```php
// In AppleWalletService.php
public function generatePass($member, $card)
{
    $startMemory = memory_get_usage(true);
    
    try {
        // Generate pass
        $pass = $this->createPass($member, $card);
        
        // Log memory usage
        Log::info('Pass generation memory', [
            'member_id' => $member->id,
            'memory_used' => memory_get_usage(true) - $startMemory,
        ]);
        
        return $pass;
    } finally {
        // Clean up
        gc_collect_cycles();
    }
}
```

### Google Wallet Pass Generation

**Watch for:**
- JWT token generation
- Large JSON payloads
- API response caching

## Performance Monitoring Tools

### Install Recommended Tools

```bash
# Laravel Debugbar (Development)
composer require barryvdh/laravel-debugbar --dev

# Laravel Telescope (Development)
composer require laravel/telescope --dev

# Memory profiling
php -d memory_limit=-1 artisan your:command
```

### Custom Memory Monitoring Middleware

Create `app/Http/Middleware/LogMemoryUsage.php`:
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Log;

class LogMemoryUsage
{
    public function handle($request, Closure $next)
    {
        $startMemory = memory_get_usage(true);
        
        $response = $next($request);
        
        $endMemory = memory_get_usage(true);
        $peakMemory = memory_get_peak_usage(true);
        
        if (($endMemory - $startMemory) > 50 * 1024 * 1024) { // Log if > 50MB
            Log::warning('High memory usage detected', [
                'route' => $request->path(),
                'method' => $request->method(),
                'memory_used' => round(($endMemory - $startMemory) / 1024 / 1024, 2) . 'MB',
                'peak_memory' => round($peakMemory / 1024 / 1024, 2) . 'MB',
            ]);
        }
        
        return $response;
    }
}
```

## Emergency Procedures

### When Server Runs Out of Memory

1. **Immediate Actions:**
   ```bash
   # Restart PHP-FPM (if using)
   sudo systemctl restart php8.2-fpm
   
   # Clear all caches
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   
   # Kill hung PHP processes
   pkill -9 php
   ```

2. **Temporary Memory Increase:**
   ```bash
   # Edit php.ini
   sudo nano /etc/php/8.2/fpm/php.ini
   # Change: memory_limit = 512M
   
   # Restart
   sudo systemctl restart php8.2-fpm
   ```

3. **Long-term Fix:**
   - Identify memory leak source
   - Implement proper memory management
   - Add queue workers for heavy tasks
   - Scale horizontally if needed

## Automation

### Set Up Cron Jobs

```bash
# Add to crontab
crontab -e

# Memory monitoring (every hour)
0 * * * * cd /path/to/laravel && ./scripts/investigate_memory.sh >> storage/logs/memory-monitoring.log 2>&1

# Log cleanup (daily)
0 2 * * * find /path/to/laravel/storage/logs -name "*.log" -mtime +7 -delete

# Session cleanup (daily)
0 3 * * * cd /path/to/laravel && php artisan session:gc
```

## Related Documentation

- [Laravel Performance](https://laravel.com/docs/11.x/deployment#optimization)
- [PHP Memory Management](https://www.php.net/manual/en/features.gc.php)
- [Laravel Telescope](https://laravel.com/docs/11.x/telescope)
- [Laravel Horizon](https://laravel.com/docs/11.x/horizon) (for queue monitoring)

## Support

If memory issues persist:

1. Check the investigation results
2. Review the optimization suggestions
3. Profile specific operations
4. Consider horizontal scaling
5. Monitor with proper tools (Telescope, New Relic, etc.)
