<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import StatusBanner from '$lib/components/StatusBanner.svelte';
	import { setupConvex } from 'convex-svelte';
	import { browser } from '$app/environment';

	const { children } = $props();

	// Initialize Convex client only on the client side (not during SSR)
	if (browser) {
		const convexUrl = import.meta.env.PUBLIC_CONVEX_URL ?? import.meta.env.VITE_CONVEX_URL ?? import.meta.env.CONVEX_DEPLOYMENT_URL;
		if (convexUrl) {
			setupConvex(convexUrl);
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<StatusBanner />
{@render children()}
