# SEO Content Strategy: Boutikio AI Chat Platform

## Brand Overview

**Product:** Boutikio AI (Maya chat interface)
**Tagline:** "Votre Assistant Fidélité Intelligent" (FR) / "Your AI-Powered Loyalty Program Assistant" (EN)
**Mission:** Help business owners manage their loyalty programs through natural conversation

**Target Audience:**
- Small business owners
- Retail store managers
- Restaurant owners
- Service businesses
- Marketing managers

**Key Value Propositions:**
- Manage members, vouchers, and rewards through chat
- AI-powered insights and analytics
- Apple/Google Wallet integration
- Gamification features
- Multilingual support (8 languages)

---

## Multilingual SEO Strategy

### Supported Languages

| Code | Language | Direction | Default |
|------|----------|-----------|---------|
| `fr` | Français | LTR | ✅ Default |
| `en` | English | LTR | |
| `de` | Deutsch | LTR | |
| `nl` | Nederlands | LTR | |
| `pt` | Português | LTR | |
| `pt-BR` | Português (Brasil) | LTR | |
| `es` | Español | LTR | |
| `ar` | العربية | RTL | |

### Language Detection

1. **URL Parameter:** `?lang=en`, `?lang=fr`, etc.
2. **Default:** French (no parameter needed)
3. **Browser Language:** Can be detected and matched if supported

### URL Structure

```
https://chat.boutikio.com/              # French (default)
https://chat.boutikio.com/?lang=en      # English
https://chat.boutikio.com/?lang=de      # German
https://chat.boutikio.com/?lang=nl      # Dutch
https://chat.boutikio.com/?lang=pt      # Portuguese
https://chat.boutikio.com/?lang=pt-BR   # Brazilian Portuguese
https://chat.boutikio.com/?lang=es      # Spanish
https://chat.boutikio.com/?lang=ar      # Arabic
```

---

## Page-by-Page SEO Content

### 1. Home / Chat Page (`/`)

| Language | Title |
|----------|-------|
| FR | Boutikio AI - Votre Assistant Fidélité Intelligent |
| EN | Boutikio AI - Your AI-Powered Loyalty Program Assistant |
| DE | Boutikio AI - Ihr KI-Treueprogramm-Assistent |
| NL | Boutikio AI - Uw AI-Assistent voor Trouwprogramma's |
| PT | Boutikio AI - Seu Assistente de Fidelização com IA |
| ES | Boutikio AI - Su Asistente de Fidelización con IA |
| AR | Boutikio AI - مساعد برنامج الولاء الذكي الخاص بك |

---

### 2. Billing Page (`/billing`)

| Language | Title |
|----------|-------|
| FR | Facturation & Abonnement |
| EN | Billing & Subscription |
| DE | Abrechnung & Abonnement |
| NL | Facturatie & Abonnement |
| PT | Faturação & Subscrição |
| ES | Facturación & Suscripción |
| AR | الفواتير والاشتراك |

---

### 3. Account Settings (`/partner-settings`)

| Language | Title |
|----------|-------|
| FR | Paramètres du Compte |
| EN | Account Settings |
| DE | Kontoeinstellungen |
| NL | Accountinstellingen |
| PT | Definições da Conta |
| ES | Configuración de Cuenta |
| AR | إعدادات الحساب |

---

### 4. Receipt Settings (`/receipt-settings`)

| Language | Title |
|----------|-------|
| FR | Modèles de Tickets & Reçus |
| EN | Receipt Settings & Templates |
| DE | Bon-Vorlagen & Einstellungen |
| NL | Boninstellingen & Sjablonen |
| PT | Modelos de Recibos & Definições |
| ES | Plantillas de Recibos & Configuración |
| AR | قوالب الإيصالات والإعدادات |

---

### 5. Card Preview (`/card-preview`)

| Language | Title |
|----------|-------|
| FR | Aperçu & Design de la Carte de Fidélité |
| EN | Loyalty Card Preview & Design |
| DE | Treuekarte Vorschau & Design |
| NL | Trouwkaart Voorbeeld & Ontwerp |
| PT | Pré-visualização & Design do Cartão |
| ES | Vista Previa & Diseño de Tarjeta |
| AR | معاينة وتصميم بطاقة الولاء |

---

### 6. Audit Log (`/audit-log`)

| Language | Title |
|----------|-------|
| FR | Journal d'Activité & Historique |
| EN | Activity Log & Audit Trail |
| DE | Aktivitätsprotokoll & Audit-Trail |
| NL | Activiteitenlog & Audit-Spoor |
| PT | Registo de Atividade & Auditoria |
| ES | Registro de Actividad & Auditoría |
| AR | سجل النشاط والتدقيق |

---

### 7. Members (`/members`)

| Language | Title |
|----------|-------|
| FR | Annuaire & Gestion des Membres |
| EN | Member Directory & Management |
| DE | Mitgliederverzeichnis & Verwaltung |
| NL | Ledenlijst & Beheer |
| PT | Diretório & Gestão de Membros |
| ES | Directorio & Gestión de Miembros |
| AR | دليل الأعضاء والإدارة |

---

## Implementation Files

### SEO Translations
- `src/lib/i18n/seoTranslations.ts` - All translations and language config

### SEO Component
- `src/lib/components/SEO.svelte` - Dynamic SEO with hreflang support

### Sitemap
- `src/routes/sitemap.xml/+server.ts` - Multilingual sitemap with hreflang

---

## Structured Data (JSON-LD)

### WebApplication Schema (Updated)
```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Boutikio AI",
  "alternateName": "Maya",
  "description": "Assistant IA pour la gestion de programmes de fidélité",
  "url": "https://chat.boutikio.com",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "browserRequirements": "Requires JavaScript",
  "inLanguage": ["fr", "en", "de", "nl", "pt", "pt-BR", "es", "ar"],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR",
    "description": "Offre gratuite: 100 membres actifs, chats illimités"
  }
}
```

---

## Hreflang Implementation

Every page includes automatic hreflang tags:

```html
<link rel="alternate" hreflang="fr" href="https://chat.boutikio.com/?lang=fr" />
<link rel="alternate" hreflang="en" href="https://chat.boutikio.com/?lang=en" />
<link rel="alternate" hreflang="de" href="https://chat.boutikio.com/?lang=de" />
<link rel="alternate" hreflang="nl" href="https://chat.boutikio.com/?lang=nl" />
<link rel="alternate" hreflang="pt" href="https://chat.boutikio.com/?lang=pt" />
<link rel="alternate" hreflang="pt-BR" href="https://chat.boutikio.com/?lang=pt-BR" />
<link rel="alternate" hreflang="es" href="https://chat.boutikio.com/?lang=es" />
<link rel="alternate" hreflang="ar" href="https://chat.boutikio.com/?lang=ar" />
<link rel="alternate" hreflang="x-default" href="https://chat.boutikio.com/" />
```

---

## Usage

### Using Page-Based SEO (Recommended)
```svelte
<script>
  import SEO from '$lib/components/SEO.svelte';
  import { page } from '$app/stores';

  $: lang = $page.url.searchParams.get('lang') || 'fr';
</script>

<SEO page="home" {lang} />
```

### Using Custom SEO
```svelte
<script>
  import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
  title="Custom Title"
  description="Custom description"
  keywords="custom, keywords"
/>
```

---

## SEO Checklist (Multilingual)

### Technical SEO
- [x] Title tags in all languages
- [x] Meta descriptions in all languages
- [x] Hreflang tags for all language variants
- [x] x-default hreflang (French)
- [x] Open Graph locale tags
- [x] Language direction (RTL for Arabic)
- [x] Canonical URLs
- [x] Multilingual sitemap
- [x] Content-language meta tag

### Content SEO
- [x] Unique titles per language
- [x] Unique descriptions per language
- [x] Keywords localized per language
- [x] French as default language

---

## Testing Multilingual SEO

### Google Search Console
- Verify hreflang implementation
- Check for indexing issues per language

### International Targeting
- France (default)
- Belgium (French/Dutch)
- Switzerland (French/German)
- Canada (French)
- MENA region (Arabic)
- Latin America (Spanish/Portuguese)
- Europe (German/Dutch/English)