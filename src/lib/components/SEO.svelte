<script lang="ts">
	import { page } from '$app/stores';

	/**
	 * SEO component for setting page-specific meta tags
	 * Usage: <SEO title="Page Title" description="Page description" />
	 */

	export let title: string = 'Boutikio AI - Loyalty Program Management';
	export let description: string = 'Manage your loyalty program with AI-powered insights, vouchers, and member management.';
	export let keywords: string = 'loyalty program, AI assistant, customer retention, rewards, vouchers, member management';
	export let image: string = '/static/boutikio-pwa-icon-512.png';
	export let noindex: boolean = false;
	export let nofollow: boolean = false;

	$: canonicalUrl = `https://chat.boutikio.com${$page.url.pathname}`;
	$: pageTitle = title.includes('Boutikio') ? title : `${title} | Boutikio AI`;
	$: robotsContent = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />
	<meta name="robots" content={robotsContent} />

	<!-- Canonical URL -->
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph -->
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="https://chat.boutikio.com{image}" />
	<meta property="og:url" content={canonicalUrl} />

	<!-- Twitter -->
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="https://chat.boutikio.com{image}" />
</svelte:head>