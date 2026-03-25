<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import StatusBanner from '$lib/components/StatusBanner.svelte';
	import { setupConvex } from 'convex-svelte';

	const { children } = $props();

	// Initialize Convex client - must be called inside a component, not at module level
	setupConvex(import.meta.env.VITE_CONVEX_URL ?? import.meta.env.CONvex_DEPLOYMENT_URL);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<StatusBanner />
{@render children()}
