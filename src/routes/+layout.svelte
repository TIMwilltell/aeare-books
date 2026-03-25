<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import StatusBanner from '$lib/components/StatusBanner.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { setupConvex } from 'convex-svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	const { children } = $props();

	// Initialize Convex client only on the client side (not during SSR)
	if (browser) {
		// VITE_ prefix is required for Vite to expose env vars to client
		const convexUrl = import.meta.env.VITE_CONVEX_URL ?? import.meta.env.PUBLIC_CONVEX_URL ?? import.meta.env.CONVEX_DEPLOYMENT_URL;
		// Fallback for development if env var not set
		const finalUrl = convexUrl ?? 'https://jovial-wildcat-461.convex.cloud';
		setupConvex(finalUrl);
	}

	// Navigation items
	const navItems = [
		{ path: '/', label: 'Library', icon: 'book' },
		{ path: '/scan', label: 'Scan', icon: 'scan' },
		{ path: '/settings', label: 'Settings', icon: 'settings' }
	];

	function navigateTo(path: string) {
		goto(path);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<StatusBanner />

<Toast />

<div class="app-container">
	<nav class="bottom-nav">
		{#each navItems as item}
			<button 
				class="nav-item" 
				class:active={$page.url.pathname === item.path}
				onclick={() => navigateTo(item.path)}
			>
				{#if item.icon === 'book'}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
					</svg>
				{:else if item.icon === 'scan'}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M3 7V5a2 2 0 0 1 2-2h2"/>
						<path d="M17 3h2a2 2 0 0 1 2 2v2"/>
						<path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
						<path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
						<line x1="7" y1="12" x2="17" y2="12"/>
					</svg>
				{:else if item.icon === 'settings'}
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
						<circle cx="12" cy="12" r="3"/>
					</svg>
				{/if}
				<span>{item.label}</span>
			</button>
		{/each}
	</nav>

	<main class="main-content">
		{@render children()}
	</main>
</div>

<style>
	.app-container {
		max-width: 600px;
		margin: 0 auto;
		min-height: 100vh;
		padding-bottom: 80px;
	}

	.main-content {
		min-height: calc(100vh - 64px);
	}

	/* Mobile: Bottom navigation */
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

	/* Tablet (600px+) */
	@media (min-width: 600px) {
		.bottom-nav {
			border-radius: 16px 16px 0 0;
		}

		.app-container {
			max-width: 100%;
		}

		.main-content {
			padding: var(--space-6);
		}
	}

	/* Desktop (1024px+) */
	@media (min-width: 1024px) {
		.app-container {
			display: flex;
			flex-direction: row;
			max-width: none;
			padding-bottom: 0;
		}

		.bottom-nav {
			position: fixed;
			left: 0;
			top: 0;
			bottom: 0;
			right: auto;
			width: 200px;
			height: 100vh;
			flex-direction: column;
			justify-content: flex-start;
			padding: var(--space-8) var(--space-4);
			gap: var(--space-2);
			border-top: none;
			border-right: 1px solid rgba(193, 199, 212, 0.15);
			border-radius: 0;
			transform: none;
			max-width: none;
			left: 0;
		}

		.nav-item {
			flex-direction: row;
			width: 100%;
			padding: var(--space-3) var(--space-4);
			justify-content: flex-start;
			gap: var(--space-3);
		}

		.nav-item span {
			font-size: var(--text-base);
		}

		.main-content {
			margin-left: 200px;
			padding: var(--space-8);
			max-width: 900px;
			width: 100%;
		}
	}
</style>
