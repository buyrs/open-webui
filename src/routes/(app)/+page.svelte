<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';

	import Chat from '$lib/components/chat/Chat.svelte';
	import { page } from '$app/stores';
	import SEO from '$lib/components/SEO.svelte';

	// Get language from URL query param, default to French
	$: lang = ($page.url.searchParams.get('lang') || 'fr') as 'fr' | 'en' | 'de' | 'nl' | 'pt' | 'pt-BR' | 'es' | 'ar';

	onMount(() => {
		if ($page.url.searchParams.get('error')) {
			toast.error($page.url.searchParams.get('error') || 'An unknown error occurred.');
		}
	});
</script>

<SEO page="home" {lang} />

<Chat />