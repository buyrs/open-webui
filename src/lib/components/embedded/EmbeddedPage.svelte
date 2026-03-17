<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		buildThemeSyncMessage,
		type ThemeSyncMessage,
		type EmbeddedReadyMessage
	} from '$lib/utils/themeSyncBuilder';

	/**
	 * Props for the EmbeddedPage component.
	 */
	export let src: string; // Full URL of the embedded page
	export let title: string; // Accessible iframe title
	export let allow: string = ''; // Optional iframe allow attribute (e.g., "payment")

	// State
	let iframeEl: HTMLIFrameElement;
	let loadError = false;
	let mutationObserver: MutationObserver | null = null;

	/**
	 * Sends theme sync message to the iframe.
	 */
	const sendThemeSync = () => {
		if (!iframeEl?.contentWindow) return;

		const message: ThemeSyncMessage = buildThemeSyncMessage();
		iframeEl.contentWindow.postMessage(message, '*');
	};

	/**
	 * Handles postMessage events from the iframe.
	 */
	const handleMessage = (event: MessageEvent) => {
		// Only accept messages from the iframe's origin
		try {
			const iframeOrigin = new URL(src).origin;
			if (event.origin !== iframeOrigin) return;
		} catch {
			return;
		}

		const data = event.data as EmbeddedReadyMessage;

		// Listen for embedded-ready message
		if (data?.type === 'embedded-ready') {
			sendThemeSync();
		}
	};

	/**
	 * Handles iframe load errors.
	 */
	const handleIframeError = () => {
		loadError = true;
	};

	/**
	 * Handles iframe load success.
	 */
	const handleIframeLoad = () => {
		loadError = false;
	};

	onMount(() => {
		// Set up message listener for embedded-ready
		window.addEventListener('message', handleMessage);

		// Set up MutationObserver to watch for dark/light mode toggles
		mutationObserver = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
					// Class changed, re-send theme sync
					sendThemeSync();
				}
			}
		});

		mutationObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['class']
		});
	});

	onDestroy(() => {
		window.removeEventListener('message', handleMessage);

		if (mutationObserver) {
			mutationObserver.disconnect();
			mutationObserver = null;
		}
	});
</script>

<div class="embedded-page-container w-full h-full">
	{#if loadError}
		<!-- Error fallback state -->
		<div
			class="flex flex-col items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300"
		>
			<div class="text-center p-8">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="size-16 mx-auto mb-4 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
					/>
				</svg>
				<p class="text-lg font-medium mb-2">Could not load page</p>
				<p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
					Try refreshing or open it directly.
				</p>
				<a
					href={src}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition"
				>
					Open in new tab
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="size-4 ml-2"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
						/>
					</svg>
				</a>
			</div>
		</div>
	{:else}
		<!-- iframe for embedded content -->
		<iframe
			bind:this={iframeEl}
			{src}
			{title}
			{allow}
			class="w-full h-full border-0"
			sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
			on:error={handleIframeError}
			on:load={handleIframeLoad}
		/>
	{/if}
</div>

<style>
	.embedded-page-container {
		min-height: 100%;
	}
</style>