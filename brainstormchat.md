# Brainstorm: chat.boutikio.com — Partner Registration & Shared Backend

## Contexte

- `chat.boutikio.com` → Open WebUI (ce repo) — interface chat IA pour les partenaires
- `web.boutikio.com` → Boutikio backend principal (gestion programme fidélité, OAuth provider)
- Les deux domaines partagent le même backend Boutikio
- Les admins de l'app fidélité n'ont PAS besoin de se connecter au chat
- Seuls les **partenaires** utilisent le chat et s'inscrivent via `chat.boutikio.com`

---

## Architecture actuelle

### Authentification

| Élément | Valeur |
|---------|--------|
| Login form email/password | **Désactivé** (`ENABLE_LOGIN_FORM=false`) |
| OAuth provider unique | Boutikio (OIDC) → `web.boutikio.com/oauth/*` |
| Scopes demandés | `openid profile email partner` |
| Auto-redirect | Oui — un seul provider + pas de form → redirect automatique vers OAuth |
| Signup via OAuth | Activé (`ENABLE_OAUTH_SIGNUP=true`) |
| Merge par email | Activé (`OAUTH_MERGE_ACCOUNTS_BY_EMAIL=true`) |

### Flux OAuth actuel

1. Partenaire visite `chat.boutikio.com`
2. Auto-redirect vers `web.boutikio.com/oauth/authorize`
3. Partenaire se connecte sur Boutikio
4. Callback vers `chat.boutikio.com/oauth/callback`
5. Open WebUI crée un user local (table `user`) avec `oauth.sub` dans le champ JSON
6. Tokens OAuth (access/refresh) chiffrés et stockés dans `oauth_session`
7. JWT Open WebUI émis + cookie httponly

### Stockage des credentials

| Table | Rôle |
|-------|------|
| `auth` | id, email, password (hashé bcrypt), active — **utilisé uniquement pour les comptes locaux (désactivés)** |
| `user` | id, email, username, role, name, profile, `oauth` (JSON: `{provider: {sub: "..."}}`) |
| `oauth_session` | tokens OAuth chiffrés (Fernet), expires_at, indexé par user_id+provider |

→ **Les credentials partenaire vivent sur le backend Boutikio, pas dans Open WebUI.** C'est correct.

### Pages embarquées (iframe)

Le pattern existant utilise `EmbeddedPage` pour intégrer des pages Boutikio dans le chat :

| Route chat | Page embarquée |
|------------|---------------|
| `/partner-settings` | `web.boutikio.com/embedded/settings` |
| `/billing` | `web.boutikio.com/embedded/billing` |
| `/members` | `web.boutikio.com/embedded/members` |
| `/audit-log` | `web.boutikio.com/embedded/audit-log` |
| `/receipt-settings` | `web.boutikio.com/embedded/receipt-settings` |
| `/card-preview` | `web.boutikio.com/embedded/card-preview` |

Communication parent ↔ iframe via `postMessage` (sync thème dark/light).

---

## Le problème : pas d'inscription partenaire depuis chat.boutikio.com

Un nouveau partenaire qui visite `chat.boutikio.com` est redirigé vers `web.boutikio.com/oauth/authorize`.
S'il n'a **pas encore de compte Boutikio**, il est bloqué — aucun chemin d'inscription n'existe côté chat.

---

## Solutions proposées

### Option A : Inscription embarquée (iframe) ✅ Recommandée

**Cohérent avec le pattern existant** (settings, billing, members sont déjà en iframe).

**Côté Boutikio backend (`web.boutikio.com`) :**
- Créer `/embedded/register` — formulaire d'inscription partenaire
- Après inscription réussie, la page embarquée envoie un `postMessage` au parent

**Côté chat (`chat.boutikio.com`) :**
- Nouvelle route `/register` avec `EmbeddedPage` pointant vers `web.boutikio.com/embedded/register`
- Sur réception du `postMessage` de succès, redirect vers le flux OAuth login
- Ajouter un lien "Pas encore de compte ? Inscrivez-vous" sur la page `/auth`

**Avantages :**
- Credentials restent 100% sur Boutikio
- UX intégrée dans le chat
- Réutilise le composant `EmbeddedPage` existant
- Le partenaire ne quitte jamais `chat.boutikio.com`

**Inconvénients :**
- Nécessite du dev côté Boutikio backend (page `/embedded/register`)
- Deux étapes : inscription → puis OAuth login (pas seamless)

### Option B : Registration via OAuth natif (prompt=create)

**Côté Boutikio backend :**
- Supporter `prompt=create` dans l'endpoint OAuth authorize
- Ou exposer `/oauth/register` qui redirige vers un formulaire puis revient dans le flux OAuth

**Côté chat :**
- Modifier l'URL de redirect OAuth pour inclure un paramètre signup
- Ex: `web.boutikio.com/oauth/authorize?prompt=create&...`

**Avantages :**
- Flow seamless : inscription + auth en une seule étape
- Pas besoin d'iframe
- Standard OIDC

**Inconvénients :**
- Nécessite que le serveur OAuth Boutikio supporte `prompt=create` ou un flow custom
- Le partenaire voit brièvement `web.boutikio.com` (pas forcément un problème)

### Option C : Formulaire d'inscription natif dans Open WebUI

**Côté chat :**
- Réactiver le formulaire signup (`ENABLE_LOGIN_FORM=true` + `ENABLE_SIGNUP=true`)
- Intercepter le signup pour appeler l'API Boutikio au lieu de créer un compte local
- Créer un endpoint proxy `/api/auth/partner-register` qui forward vers Boutikio

**Inconvénients :**
- Complexe : il faut modifier le flow auth d'Open WebUI
- Risque de divergence entre les deux bases de données
- Maintenance lourde

→ **Non recommandée**

---

## Actions chat → Backend Boutikio

Actuellement, il n'y a **aucun outil custom** qui appelle le backend Boutikio depuis le chat.
Les seuls outils existants sont les built-in d'Open WebUI (search web, fetch URL, execute code, memories, notes, etc.).

### Ce qu'il faut construire

Pour que les actions initiées dans le chat déclenchent des opérations sur le backend Boutikio :

1. **Custom Tools Open WebUI** — créer des fonctions/outils qui appellent les APIs Boutikio
   - Utiliser le token OAuth du partenaire (stocké dans `oauth_session`) pour authentifier les appels
   - Exemples : créer un bon, lister les membres, consulter les stats fidélité

2. **Pipeline ou Function** — Open WebUI supporte les "functions" custom
   - Fichier dans `backend/open_webui/tools/` ou via l'interface admin
   - Chaque function fait un appel HTTP vers `web.boutikio.com/api/...` avec le bearer token

### Schéma du flux

```
Partenaire (chat) → AI Assistant → Custom Tool → web.boutikio.com/api/...
                                                    ↑
                                          OAuth access_token
                                        (depuis oauth_session)
```

---

## Configuration actuelle (.env)

```env
# OAuth
OAUTH_CLIENT_ID=8fd877ab-ca67-4c00-8d27-44047ba75198
OAUTH_PROVIDER_NAME=Boutikio
OAUTH_SCOPES=openid profile email partner
OAUTH_AUTHORIZE_URL=https://web.boutikio.com/oauth/authorize
OAUTH_TOKEN_URL=https://web.boutikio.com/oauth/token
OAUTH_USERINFO_URL=https://web.boutikio.com/oauth/userinfo
OPENID_REDIRECT_URI=https://chat.boutikio.com/oauth/callback

# Frontend
VITE_BOUTIKIO_BASE_URL=https://web.boutikio.com
VITE_WEBUI_PUBLIC_URL=https://chat.boutikio.com

# Behavior
ENABLE_LOGIN_FORM=false
ENABLE_OAUTH_SIGNUP=true
OAUTH_MERGE_ACCOUNTS_BY_EMAIL=true
WEBUI_NAME=Boutikio
```

---

## Modèle de données pertinent

### User (Open WebUI)

```python
class User(Base):
    id          = Column(String, primary_key=True)
    email       = Column(String)
    username    = Column(String(50))
    role        = Column(String)          # "user", "admin", "pending"
    name        = Column(String)
    oauth       = Column(JSON)            # {"boutikio": {"sub": "..."}}
    settings    = Column(JSON)
    last_active_at = Column(BigInteger)
```

### OAuthSession (Open WebUI)

```python
class OAuthSession(Base):
    id          = Column(Text, primary_key=True)
    user_id     = Column(Text)
    provider    = Column(Text)            # "oidc" / "boutikio"
    token       = Column(Text)            # JSON chiffré (access_token, refresh_token)
    expires_at  = Column(BigInteger)
```

---

## Prochaines étapes recommandées

1. **Boutikio backend** : créer `/embedded/register` (formulaire inscription partenaire)
2. **Chat frontend** : ajouter route `/register` avec `EmbeddedPage` + lien sur `/auth`
3. **Chat backend** : créer des custom tools pour appeler les APIs Boutikio avec le token OAuth
4. **Tester** : flow complet inscription → OAuth login → chat → action Boutikio

---

## Option retenue : Option 2 — Formulaire natif sur chat → POST vers Boutikio API

Le formulaire d'inscription partenaire est construit en SvelteKit directement sur `chat.boutikio.com`.
Les données sont envoyées à `web.boutikio.com/api/partner/register` (ou endpoint équivalent).
Les credentials sont stockés uniquement sur le backend Boutikio.

---

## Questions ouvertes (à valider avant implémentation)

### 1. Endpoint API Boutikio

Est-ce que `web.boutikio.com` expose déjà un endpoint d'inscription partenaire ?
- Ex: `POST /api/partner/register`
- Si oui, quel est le payload attendu (champs, format, validation) ?
- Si non, il faudra le créer côté Boutikio avant de connecter le formulaire.

### 2. Champs du formulaire d'inscription

Quels champs sont nécessaires ? Au minimum :
- Nom
- Email
- Mot de passe
- Nom du commerce / entreprise

Champs additionnels possibles :
- Téléphone ?
- Adresse ?
- Langue préférée ?
- Confirmation mot de passe ?

### 3. CORS (Cross-Origin Resource Sharing)

Est-ce que `web.boutikio.com` autorise les requêtes cross-origin depuis `chat.boutikio.com` ?
- Si oui → le formulaire peut appeler directement l'API Boutikio
- Si non → il faudra un endpoint proxy côté Open WebUI backend (`/api/partner/register`) qui forward la requête vers Boutikio. Le formulaire appelle le proxy, le proxy appelle Boutikio.

### 4. Après inscription

Quel comportement après une inscription réussie ?
- **Auto-login** : redirect immédiat vers le flux OAuth (`web.boutikio.com/oauth/authorize`) pour connecter le partenaire au chat ?
- **Vérification email** : le partenaire doit d'abord confirmer son email avant de pouvoir se connecter ?
- **Page de confirmation** : simple message "Compte créé, connectez-vous" avec lien vers login ?
