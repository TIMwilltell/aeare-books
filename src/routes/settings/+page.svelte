<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { exportLibrary } from '$lib/api/export';
	import PrimaryButton from '$lib/components/PrimaryButton.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { showToast } from '$lib/components/Toast.svelte';

	let isOnline = $state(true);
	let lastSync = $state<Date | null>(null);
	let syncing = $state(false);
	let exporting = $state(false);

	// App version - would typically come from package.json or build info
	const appVersion = '1.0.0';

	onMount(() => {
		isOnline = navigator.onLine;
		window.addEventListener('online', () => isOnline = true);
		window.addEventListener('offline', () => isOnline = false);

		// Load last sync time from localStorage if available
		const storedSync = localStorage.getItem('lastSync');
		if (storedSync) {
			lastSync = new Date(storedSync);
		}
	});

	async function handleSync() {
		syncing = true;
		try {
			// Simulate sync - in a real app this would sync with Convex
			await new Promise(resolve => setTimeout(resolve, 1000));
			lastSync = new Date();
			localStorage.setItem('lastSync', lastSync.toISOString());
			showToast('Sync complete', 'success');
		} catch {
			showToast('Sync failed', 'error');
		} finally {
			syncing = false;
		}
	}

	async function handleExport() {
		exporting = true;
		try {
			await exportLibrary();
			showToast('Export ready', 'success');
		} catch {
			showToast('Export failed', 'error');
		} finally {
			exporting = false;
		}
	}

	function formatLastSync(date: Date | null): string {
		if (!date) return 'Never synced';
		
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `Last synced: ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
		if (diffHours < 24) return `Last synced: ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
		return `Last synced: ${date.toLocaleDateString()}`;
	}
</script>

<svelte:head>
	<title>Settings - AeAre Books</title>
</svelte:head>

<div class="settings-page">
	<header class="glass-header">
		<button class="back-button" onclick={() => goto('/')} aria-label="Go back">
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="m12 19-7-7 7-7"/>
				<path d="M19 12H5"/>
			</svg>
		</button>
		<h1>Settings</h1>
	</header>

	<main class="settings-content">
		<!-- Sync Section -->
		<section class="settings-section">
			<h2>Sync</h2>
			<div class="section-content">
				<div class="sync-status">
					<Badge 
						label={isOnline ? 'Online' : 'Offline'} 
						variant={isOnline ? 'ar-fetched' : 'ar-pending'} 
						size="md" 
					/>
					<span class="last-sync">{formatLastSync(lastSync)}</span>
				</div>
				<PrimaryButton 
					label={syncing ? 'Syncing...' : 'Sync Now'} 
					onclick={handleSync} 
					disabled={syncing || !isOnline}
					loading={syncing}
				/>
			</div>
		</section>

		<!-- Export Section -->
		<section class="settings-section">
			<h2>Export</h2>
			<div class="section-content">
				<p class="description">Download your library data as JSON</p>
				<PrimaryButton 
					label={exporting ? 'Exporting...' : 'Export to JSON'} 
					onclick={handleExport}
					loading={exporting}
				/>
			</div>
		</section>

		<!-- App Info Section -->
		<section class="settings-section app-info">
			<div class="app-info-content">
				<span class="version">Version {appVersion}</span>
				<span class="about">AeAre Books - Track AR reading progress</span>
			</div>
		</section>
	</main>
</div>

<style>
	.settings-page {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--surface);
	}

	.glass-header {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-4);
		background: rgba(255, 255, 255, 0.7);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--outline-variant);
	}

	.glass-header h1 {
		flex: 1;
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-xl);
		font-weight: var(--font-semibold);
		color: var(--on-surface);
		text-align: center;
	}

	.back-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		color: var(--on-surface);
		cursor: pointer;
		transition: background-color var(--transition-fast);
	}

	.back-button:hover {
		background-color: var(--surface-container);
	}

	.back-button:active {
		background-color: var(--surface-container-high);
	}

	.settings-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		padding: var(--space-6);
		max-width: 600px;
		width: 100%;
		margin: 0 auto;
	}

	.settings-section {
		background: var(--surface-container-low);
		border-radius: var(--radius-md);
		padding: var(--space-4);
	}

	.settings-section h2 {
		margin: 0 0 var(--space-4);
		font-family: var(--font-display);
		font-size: var(--text-lg);
		font-weight: var(--font-medium);
		color: var(--on-surface);
	}

	.section-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.sync-status {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.last-sync {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--on-surface-variant);
	}

	.description {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-base);
		color: var(--on-surface-variant);
	}

	.app-info {
		margin-top: auto;
		background: transparent;
		padding: var(--space-4) 0;
	}

	.app-info-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		text-align: center;
	}

	.version {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--on-surface-variant);
	}

	.about {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--on-surface-variant);
	}
</style>
