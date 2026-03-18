#!/bin/bash
set -euo pipefail

# =============================================================================
# Deploy to Boutikio Cloud
# =============================================================================
# This script pushes your changes to git and triggers the remote deployment.
# Run this from your local machine after making changes.
#
# Usage: ./deploy-cloud.sh [commit-message]
# =============================================================================

# Configuration - UPDATE THESE
REMOTE_USER="your-user"                    # SSH user on your Plesk server
REMOTE_HOST="your-server-ip-or-domain"     # Your Plesk server
REMOTE_DIR="/opt/open-webui"               # Deploy directory on server
BRANCH="main"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    if [ -n "${1:-}" ]; then
        COMMIT_MSG="$1"
    else
        echo -e "${YELLOW}You have uncommitted changes.${NC}"
        read -p "Enter commit message: " COMMIT_MSG
        [ -z "$COMMIT_MSG" ] && { echo "No commit message provided. Aborting."; exit 1; }
    fi

    echo -e "\n📦 Committing changes..."
    git add .
    git commit -m "$COMMIT_MSG"
    log "Changes committed."
fi

# Push to git
echo -e "\n🚀 Pushing to $BRANCH..."
git push origin "$BRANCH"
log "Pushed to origin/$BRANCH."

# Deploy on remote
echo -e "\n🔧 Triggering remote deployment..."
info "Connecting to $REMOTE_HOST..."

ssh "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_DIR && ./deploy.sh"

echo ""
log "Deployment complete!"
info "Your site should be live at https://chat.boutikio.com"