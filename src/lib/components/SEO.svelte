<script lang="ts">
	import { page as pageStore } from '$app/stores';
	import {
		type LanguageCode,
		type PageKey,
		defaultLanguage,
		languageDirections,
		getSEOContent,
		getHreflangUrls
	} from '$lib/i18n/seoTranslations';
	import { WEBUI_PUBLIC_URL } from '$lib/config/boutikio';

	/**
	 * SEO component for setting page-specific meta tags with i18n support
	 * Usage: <SEO page="home" /> or <SEO title="Custom Title" description="..." />
	 */

	// Option 1: Use predefined translations (recommended for standard pages)
	export let page: PageKey | undefined = undefined;
	export let lang: LanguageCode = defaultLanguage;

	// Option 2: Override with custom values (for dynamic pages)
	export let title: string | undefined = undefined;
	export let description: string | undefined = undefined;
	export let keywords: string | undefined = undefined;

	export let image: string = '/static/boutikio-pwa-icon-512.png';
	export let noindex: boolean = false;
	export let nofollow: boolean = false;

	// Get SEO content from translations or use custom values
	$: seoContent = page ? getSEOContent(page, lang) : null;
	$: pageTitle = title ?? seoContent?.title ?? 'Boutikio AI - Loyalty Program Management';
	$: pageDescription = description ?? seoContent?.description ?? 'Manage your loyalty program with AI-powered insights.';
	$: pageKeywords = keywords ?? seoContent?.keywords ?? 'loyalty program, AI assistant';
	$: canonicalUrl = `${WEBUI_PUBLIC_URL}${$pageStore.url.pathname}`;
	$: hreflangUrls = getHreflangUrls($pageStore.url.pathname, WEBUI_PUBLIC_URL);
	$: textDirection = languageDirections[lang];
	$: robotsContent = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={pageDescription} />
	<meta name="keywords" content={pageKeywords} />
	<meta name="robots" content={robotsContent} />

	<!-- Language and Direction -->
	<html lang={lang} dir={textDirection} />
	<meta name="language" content={lang} />

	<!-- Canonical URL -->
	<link rel="canonical" href={canonicalUrl} />

	<!-- Hreflang tags for all supported languages -->
	{#each hreflangUrls as { lang: l, url }}
		<link rel="alternate" hreflang={l} href={url} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={canonicalUrl} />

	<!-- Open Graph -->
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={pageDescription} />
	<meta property="og:image" content="{WEBUI_PUBLIC_URL}{image}" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:locale" content={lang} />
	{#each hreflangUrls as { lang: l }}
		<meta property="og:locale:alternate" content={l} />
	{/each}

	<!-- Twitter -->
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={pageDescription} />
	<meta name="twitter:image" content="{WEBUI_PUBLIC_URL}{image}" />
</svelte:head>