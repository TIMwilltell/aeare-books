<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import StatusBanner from '$lib/components/StatusBanner.svelte';
	import { setupConvex } from 'convex-svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	const { children } = $props();

	// Initialize Convex client only on the client side (not during SSR)
	if (browser) {
		const convexUrl = import.meta.env.PUBLIC_CONVEX_URL ?? import.meta.env.VITE_CONVEX_URL ?? import.meta.env.CONVEX_DEPLOYMENT_URL;
		if (convexUrl) {
			setupConvex(convexUrl);
		}
	}

	function navigateTo(path: string) {
		goto(path);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<StatusBanner />

<div class="app-container">
	{@render children()}
</div>

<nav class="bottom-nav">
	<button 
		class="nav-item" 
		class:active={$page.url.pathname === '/'}
		onclick={() => navigateTo('/')}
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
			<polyline points="9 22 9 12 15 12 15 22"/>
		</svg>
		<span>Library</span>
	</button>
	<button 
		class="nav-item" 
		class:active={$page.url.pathname === '/scan'}
		onclick={() => navigateTo('/scan')}
	>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M3 7V5a2 2 0 0 1 2-2h2"/>
			<path d="M17 3h2a2 2 0 0 1 2 2v2"/>
			<path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
			<path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
			<line x1="7" y1="12" x2="17" y2="12"/>
		</svg>
		<span>Scan</span>
	</button>
</nav>

<style>
	.app-container {
		max-width: 600px;
		margin: 0 auto;
		min-height: 100vh;
		padding-bottom: 80px;
	}

	.bottom-nav {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 64px;
		background: rgba(251, 249, 248, 0.8);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-top: 1px solid rgba(193, 199, 212, 0.15);
		display: flex;
		justify-content: space-around;
		align-items: center;
		max-width: 600px;
		margin: 0 auto;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 8px 16px;
		background: none;
		border: none;
		cursor: pointer;
		color: var(--on-surface-variant, #6b6b6b);
		transition: color var(--transition-fast, 150ms);
	}

	.nav-item span {
		font-size: 12px;
		font-family: var(--font-body, 'Be Vietnam Pro', sans-serif);
	}

	.nav-item svg {
		width: 24px;
		height: 24px;
	}

	.nav-item.active {
		color: var(--primary, #005da7);
	}

	.nav-item.active span {
		font-weight: 600;
	}

	@media (min-width: 601px) {
		.bottom-nav {
			border-radius: 16px 16px 0 0;
		}
	}
</style>
