<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { ConvexProvider } from 'convex-svelte';
	import '$lib/convex-client';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<ConvexProvider>
	{@render children()}
</ConvexProvider>
