<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import StatusBanner from '$lib/components/StatusBanner.svelte';
	import { setupConvex } from 'convex-svelte';

	const { children } = $props();

	// Initialize Convex client - must be called inside a component, not at module level
	setupConvex(import.meta.env.VITE_CONVEX_URL ?? 'https://jovial-wildcat-461.convex.cloud');
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<StatusBanner />
{@render children()}
