# Qwen Code Project Notes

This file is used for documenting project-specific information, notes, and reminders for the Qwen Code assistant.

## Project Information
- Project Name: March
- Created: September 6, 2025
- Assistant: Qwen Code

## Notes
- This is a placeholder file that can be updated with project-specific information
- Use this file to document important project details, configurations, or reminders

## Project Overview

This is a **Reward Loyalty Platform** built with Laravel 11.x and PHP 8.2+. It's a comprehensive digital loyalty card solution that manages customer loyalty through QR codes, digital wallet integrations (Apple Wallet & Google Wallet), and a complete reward system. The platform serves multiple user roles including members, partners, staff, and administrators.

## Technology Stack

### Backend
- **PHP**: Version 8.2.0 or higher
- **Framework**: Laravel (Version 11.x)
- **Supported Databases**:
  - SQLite: Version 3.9 or above
  - MySQL: Version 5.7 or above
  - MariaDB: Version 10.3 or above

### Frontend
- **CSS Framework**: Tailwind CSS (Version 3.x)
- **JavaScript Framework**: Alpine.js
- **Components**: Flowbite (Version 1.x) - A component library for Tailwind CSS
- **UI Kit**: Tailwind Elements (Version 1.x) - Open-source UI components

### Tooling
- **Packaging**: Vite - Used for bundling JavaScript and CSS
- **Linting**: Laravel Pint - For PHP code formatting
- **JavaScript Testing**: Vitest - For unit and integration testing of JavaScript code

For a detailed list of PHP libraries, refer to the `composer.json` file. For JavaScript libraries, please check the `package.json` file.

## Design Pattern Adherence

**CRITICAL**: When working with this codebase, always follow the existing design patterns and architectural decisions already established in the platform. Do not introduce new patterns or deviate from the current structure without explicit justification.

### Key Design Patterns to Follow:
- **Service Layer Pattern**: All complex business logic should be encapsulated in service classes under `app/Services/`
- **Role-Based Architecture**: Maintain the existing multi-role system (Members, Partners, Staff, Admins) with dedicated controllers and middleware
- **Unified Wallet Architecture**: Follow the established wallet service pattern with `UnifiedWalletService` as the main orchestrator
- **Laravel MVC Structure**: Respect the existing Model-View-Controller organization
- **Configuration Management**: Use the established configuration patterns for wallet services and third-party integrations

### When Adding New Features:
1. **Analyze existing similar features** first to understand the established patterns
2. **Follow the same naming conventions** and file organization
3. **Use existing service classes** where possible rather than creating new ones
4. **Maintain consistency** with the current authentication and authorization patterns
5. **Preserve the existing API structure** and endpoint conventions

## Common Commands
### Local Development Setup
```bash
# Install PHP dependencies
composer install

# Install frontend dependencies
npm install

# Setup environment
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Seed database (optional)
php artisan db:seed

# Start Laravel development server
php artisan serve

# Start Vite development server for assets
npm run dev
```

### Testing Commands
```bash
# Run all PHP tests using Pest
php artisan test

# Run a specific test
php artisan test --filter TestName

# Run JavaScript tests using Vitest
npm run test
npm run test:run
npm run test:coverage

# Lint PHP code using Laravel Pint
./vendor/bin/pint
```

### Build Commands
```bash
# Build frontend assets for production
npm run build

# Development build with watching
npm run dev
```

### Wallet-Specific Commands
```bash
# Validate wallet configuration
php artisan wallet:validate-config

# Refresh Apple Wallet pass images
php artisan wallet:refresh-passkit-images

# Update Apple Wallet location notifications
php artisan wallet:update-apple-location-notifications

# Clean up wallet messages
php artisan wallet:cleanup-messages

# Process wallet notifications
php artisan wallet:process-notifications
```

### Key Artisan Commands
```bash
# Check reward eligibility
php artisan rewards:check-eligibility

# Process retention campaigns
php artisan campaigns:process-retention

# Send scheduled notifications
php artisan notifications:send-scheduled

# Reset PIN codes
php artisan members:reset-pins

# Run installation process
php artisan app:install
```

## Architecture Overview

### Core Application Structure

The application follows Laravel's MVC pattern with additional service layers for complex business logic:

- **Models** (`app/Models/`): Core entities including `Member`, `Partner`, `Card`, `Reward`, `Transaction`, `Location`
- **Controllers** (`app/Http/Controllers/`): Organized by user role and feature
- **Services** (`app/Services/`): Business logic layer with specialized services for wallet, payments, analytics

### Multi-Wallet Integration Architecture

The platform implements a sophisticated unified wallet system with the following key components:

**UnifiedWalletService** (`app/Services/Wallet/UnifiedWalletService.php`)
- Acts as the main orchestrator for all wallet operations
- Coordinates between Apple Wallet and Google Wallet services
- Handles template creation, member management, and pass updates across platforms

**Apple Wallet Service** (`app/Services/Wallet/apple/AppleWalletService.php`)
- Manages Apple PassKit integration using the `chiiya/passes` library
- Handles .pkpass file generation, device registration, and push notifications
- Requires Apple Developer certificates and PassKit configuration

**Google Wallet Service** (`app/Services/Wallet/google/GoogleWalletService.php`)
- Integrates with Google Wallet API using JWT authentication
- Manages Google Pay passes and object creation/updates

### User Role Architecture

The application supports multiple user types with distinct authentication systems:

1. **Members**: End users who collect points and claim rewards
2. **Partners**: Business owners who create and manage loyalty programs
3. **Staff**: Employees who can scan QR codes and process transactions
4. **Admins**: System administrators with full access

Each role has dedicated controllers, middleware, and route groups with role-specific permissions.

### Database Architecture

Key relationships:
- **Cards** belong to **Partners** and have many **Members** (many-to-many)
- **Transactions** link **Members**, **Cards**, and **Rewards**
- **Locations** provide geofencing data for Apple Wallet
- **Apple Pass Registrations** track device tokens for push notifications

### Frontend Architecture

- **Tailwind CSS** for styling with **Flowbite** components
- **Alpine.js** for reactive frontend interactions
- **HTMX** for enhanced HTML interactions
- **Vite** for asset bundling and development server
- **ApexCharts** for analytics visualization

## Development Patterns

### Service Layer Pattern
All complex business logic is encapsulated in service classes under `app/Services/`. Key services include:

- **WalletService**: Manages digital wallet operations
- **TransactionService**: Handles point transactions and reward claims
- **AnalyticsService**: Provides business intelligence and reporting
- **NotificationService**: Manages push notifications and alerts
- **CampaignService**: Handles marketing campaigns and retention

### Configuration Management
Wallet services require extensive configuration:

- Apple Wallet: Certificates, team IDs, pass type identifiers
- Google Wallet: Service account keys, issuer IDs
- Environment variables control feature toggles and API endpoints

### Image Processing Pipeline
The platform includes sophisticated image handling:

- Automatic resizing for wallet pass requirements
- Format conversion (PNG optimization for Apple Wallet)
- Fallback image management
- Image validation and error handling

### Notification System
Multi-channel notification system:

- **Apple Push Notifications**: Real-time updates to Apple Wallet passes
- **Email Notifications**: Laravel Mail with custom templates
- **SMS Integration**: Twilio integration for SMS alerts
- **In-app Notifications**: Database-driven notification system

### Wallet Notification Rule System
**NOTE**: The Marketing tab will be refactored to implement this rule-based notification system.

Wallet notifications should follow a rule-based architecture with the following components:

1. **Rule Name** - Internal reference identifier (e.g., "Near Store Notification")
2. **Rule Description** - Human-readable explanation of the rule's purpose (e.g., "Notify when customer is near store")
3. **Trigger Type** - Defines when notifications should be sent:
   - Location-based triggers (geofencing)
   - Time-based triggers (scheduled)
   - Event-based triggers (transaction, reward claim, etc.)
   - Expiration-based triggers (point expiration, pass expiration)
4. **Trigger Conditions** - The specific conditions that activate the rule:
   - Specific location IDs or coordinates
   - Date/time ranges or schedules
   - Event types and parameters
5. **Message/Content Strategy** - Choose one approach:
   - **Option A**: Single message field that updates a specific pass field
   - **Option B**: Define which pass fields to update (back fields, relevant text, etc.)
   - **Option C**: Trigger notification only; pass displays updated information automatically based on current state

This rule system should be integrated with the existing `NotificationService` and wallet services to provide flexible, condition-based notifications across both Apple Wallet and Google Wallet platforms.

## API Architecture

### Apple PassKit Web Service
Required endpoints for Apple Wallet communication:
- `GET /v1/passes/{passTypeId}/{serialNumber}` - Retrieve pass data
- `POST/DELETE /v1/devices/{deviceId}/registrations/...` - Device registration
- `GET /v1/devices/{deviceId}/registrations/{passTypeId}` - Serial updates
- `POST /v1/log` - Error logging

### RESTful APIs
Role-based API endpoints with authentication:
- `/api/{locale}/v1/admin/*` - Administrative functions
- `/api/{locale}/v1/partner/*` - Partner management
- `/api/{locale}/v1/member/*` - Member interactions

### Webhook Integrations
- **Stripe Webhooks**: Payment processing events
- **Twilio Webhooks**: SMS status updates and incoming messages

## Key Business Logic

### Point System
- Members earn points through QR code scans
- Configurable point values and expiration rules
- Transaction history with audit trails

### Reward System
- Partners define rewards with point thresholds
- Automatic eligibility checking
- Claim validation and redemption tracking

### Geofencing & Location Services
- Store locations with time-based messaging
- Apple Wallet location notifications
- Proximity-based marketing triggers

### Gamification Features
- Achievement system with badges and levels
- Leaderboards and community challenges
- Referral programs with bonus points

## Security Considerations

### Certificate Management
- Apple Wallet certificates must be properly configured and renewed
- Google Wallet service account keys require secure storage
- Environment variables for sensitive configuration

### Authentication Systems
- Separate authentication guards for each user role
- API token management with rate limiting
- Signed route protection for sensitive operations

### Data Protection
- Member data encryption for sensitive information
- Transaction integrity with audit logging
- Secure QR code generation and validation

## Testing Strategy

### PHP Testing (Pest)
- Unit tests for service classes and business logic
- Feature tests for wallet integrations and API endpoints
- Integration tests for multi-platform wallet operations

### Frontend Testing (Vitest)
- Component testing for interactive elements
- Integration testing for wallet UI components

## Deployment Considerations

### Environment Requirements
- PHP 8.2+ with required extensions (GD, cURL, OpenSSL, etc.)
- Database (MySQL 5.7+, SQLite 3.9+, or MariaDB 10.3+)
- SSL certificate for Apple Wallet production
- File storage for pass generation and image processing

### Configuration Files
Critical configuration files that require proper setup:
- `config/applewallet.php` - Apple Wallet certificates and settings
- `config/googlewallet.php` - Google Wallet API credentials
- `config/services.php` - Third-party service integrations
- Environment variables for sensitive data

### Performance Optimization
- Image processing can be resource-intensive
- Consider queue workers for wallet pass generation
- Database indexing for transaction and member lookups
- Caching for frequently accessed wallet data

## Demo Credentials

### Admin Demo Account
- **Email**: admin@example.com
- **Password**: 12345678
- **Access**: Full administrative access to the platform

## Troubleshooting Common Issues

### Wallet Integration Issues
- **Apple Certificate Problems**: Check certificate validity, password, and WWDR certificate
- **Google API Errors**: Verify service account permissions and JWT configuration
- **Pass Generation Failures**: Check image formats, sizes, and file permissions

### Development Environment
- **Asset Building**: Ensure Vite development server is running for frontend changes
- **Database Issues**: Run migrations and check database connection configuration
- **Permission Errors**: Verify file system permissions for storage directories

## Environment Variables
Document important environment variables here:
- `.env.example` - Example environment file
- `.env.backup` - Backup environment file

## References
- [AGENTS.md](AGENTS.md) - Information about agents
- [business.md](business.md) - Business-related documentation
- [campaigns.md](campaigns.md) - Campaigns documentation