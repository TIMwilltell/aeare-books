<script lang="ts">
	import { isOnline, syncStatus, triggerSync } from '$lib/stores/sync';
	import { fade } from 'svelte/transition';
</script>

{#if !$isOnline || $syncStatus !== 'synced'}
	<div
		class="status-banner"
		class:offline={!$isOnline}
		class:pending={$syncStatus === 'pending'}
		class:syncing={$syncStatus === 'syncing'}
		class:error={$syncStatus === 'error'}
		transition:fade={{ duration: 200 }}
	>
		{#if !$isOnline}
			<span class="icon">📴</span>
			<span class="message">You're offline. Changes will sync when connected.</span>
		{:else if $syncStatus === 'syncing'}
			<span class="icon">🔄</span>
			<span class="message">Syncing...</span>
		{:else if $syncStatus === 'pending'}
			<span class="icon">⚠️</span>
			<span class="message">Changes pending sync</span>
			<button class="sync-btn" onclick={triggerSync}>Sync now</button>
		{:else if $syncStatus === 'error'}
			<span class="icon">❌</span>
			<span class="message">Sync failed</span>
			<button class="sync-btn" onclick={triggerSync}>Retry</button>
		{/if}
	</div>
{/if}

<style>
	.status-banner {
		padding: 8px 16px;
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 14px;
		font-weight: 500;
	}

	.status-banner.offline {
		background: #fef3c7;
		color: #92400e;
	}

	.status-banner.pending,
	.status-banner.syncing {
		background: #dbeafe;
		color: #1e40af;
	}

	.status-banner.error {
		background: #fee2e2;
		color: #991b1b;
	}

	.icon {
		font-size: 16px;
	}

	.message {
		flex: 1;
	}

	.sync-btn {
		padding: 4px 12px;
		border: none;
		border-radius: 4px;
		background: currentColor;
		color: white;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
	}

	.sync-btn:hover {
		opacity: 0.9;
	}
</style>
