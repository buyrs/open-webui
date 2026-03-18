#!/bin/bash
set -euo pipefail

# Configuration
DEPLOY_DIR="/opt/open-webui"
CONTAINER_NAME="boutikio-open-webui"
IMAGE_NAME="boutikio-open-webui"
BRANCH="main"
HOST_PORT="3000"
CONTAINER_PORT="8080"
ENV_FILE="${DEPLOY_DIR}/.env"
VOLUME_NAME="open-webui-data"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

# Sanity checks
command -v docker >/dev/null 2>&1 || err "Docker n'est pas installé."
[ -d "$DEPLOY_DIR" ] || err "Le répertoire ${DEPLOY_DIR} n'existe pas."
[ -f "$ENV_FILE" ] || err "Le fichier .env est introuvable: ${ENV_FILE}"

echo ""
echo "========================================="
echo "  Déploiement Boutikio Open WebUI"
echo "========================================="
echo ""

# 1. Pull latest changes
echo -e "🔄 Pull des modifications depuis ${BRANCH}..."
git -C "$DEPLOY_DIR" pull origin "$BRANCH" || err "Échec du git pull."
log "Code à jour."

# 2. Build the image
echo -e "\n🔨 Build de l'image Docker..."
docker buildx build --platform linux/amd64 -t "$IMAGE_NAME" --load "$DEPLOY_DIR" \
  || err "Échec du build Docker."
log "Image construite."

# 3. Stop and remove existing container (if running)
echo -e "\n🔁 Redémarrage du conteneur..."
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker stop "$CONTAINER_NAME" 2>/dev/null || true
  docker rm "$CONTAINER_NAME" 2>/dev/null || true
  log "Ancien conteneur supprimé."
else
  warn "Aucun conteneur existant trouvé, création d'un nouveau."
fi

# 4. Run the new container
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  -p "127.0.0.1:${HOST_PORT}:${CONTAINER_PORT}" \
  -v "${VOLUME_NAME}:/app/backend/data" \
  --env-file "$ENV_FILE" \
  --add-host=host.docker.internal:host-gateway \
  "$IMAGE_NAME" \
  || err "Échec du lancement du conteneur."
log "Conteneur démarré."

# 5. Health check
echo -e "\n⏳ Vérification du démarrage (30s max)..."
HEALTHY=false
for i in $(seq 1 30); do
  if docker exec "$CONTAINER_NAME" curl -sf "http://localhost:${CONTAINER_PORT}/health" >/dev/null 2>&1; then
    HEALTHY=true
    break
  fi
  sleep 1
done

if [ "$HEALTHY" = true ]; then
  log "Le service est opérationnel sur le port ${HOST_PORT}."
else
  warn "Le health check n'a pas répondu après 30s. Voici les derniers logs:"
  docker logs --tail 30 "$CONTAINER_NAME"
fi

# 6. Cleanup dangling images
echo -e "\n🧹 Nettoyage des images inutilisées..."
docker image prune -f >/dev/null 2>&1 || true

echo ""
log "Déploiement terminé."
