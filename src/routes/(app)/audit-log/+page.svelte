<script lang="ts">
	import EmbeddedPage from '$lib/components/embedded/EmbeddedPage.svelte';
	import SEO from '$lib/components/SEO.svelte';
	import { page } from '$app/stores';
	import { embeddedUrl, parseLanguage } from '$lib/config/boutikio';

	$: lang = parseLanguage($page.url.searchParams.get('lang'));
</script>

<SEO page="audit" {lang} />

<EmbeddedPage
	src={embeddedUrl('audit-log')}
	title="Audit Log"
/>
