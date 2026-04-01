<script lang="ts">
	import { isOnline, syncStatus, triggerSync } from '$lib/stores/sync';
	import { fade } from 'svelte/transition';
</script>

{#if !$isOnline || $syncStatus !== 'synced'}
	<div
		class={{
			'status-banner': true,
			offline: !$isOnline,
			pending: $syncStatus === 'pending',
			syncing: $syncStatus === 'syncing',
			error: $syncStatus === 'error'
		}}
		transition:fade={{ duration: 180 }}
		aria-live="polite"
	>
		{#if !$isOnline}
			<span class="icon" aria-hidden="true">Off</span>
			<div class="message-block">
				<span class="label">Offline mode</span>
				<span class="message">Changes are safe and will sync when you reconnect.</span>
			</div>
		{:else if $syncStatus === 'syncing'}
			<span class="icon" aria-hidden="true">Now</span>
			<div class="message-block">
				<span class="label">Syncing now</span>
				<span class="message">Refreshing your latest reading updates.</span>
			</div>
		{:else if $syncStatus === 'pending'}
			<span class="icon" aria-hidden="true">Soon</span>
			<div class="message-block">
				<span class="label">Pending sync</span>
				<span class="message">Recent changes haven’t been sent yet.</span>
			</div>
			<button class="sync-btn" onclick={triggerSync}>Sync now</button>
		{:else if $syncStatus === 'error'}
			<span class="icon" aria-hidden="true">Alert</span>
			<div class="message-block">
				<span class="label">Sync needs attention</span>
				<span class="message">We couldn’t sync your latest changes.</span>
			</div>
			<button class="sync-btn" onclick={triggerSync}>Retry</button>
		{/if}
	</div>
{/if}

<style>
	.status-banner {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		padding: 0.85rem 1rem;
		border-radius: var(--radius-md);
		border: 1px solid transparent;
		backdrop-filter: blur(6px);
		box-shadow: var(--shadow-soft);
	}

	.status-banner.offline {
		background: rgba(240, 201, 119, 0.18);
		border-color: rgba(240, 201, 119, 0.34);
		color: #7c5a19;
	}

	.status-banner.pending,
	.status-banner.syncing {
		background: rgba(111, 141, 114, 0.12);
		border-color: rgba(111, 141, 114, 0.26);
		color: var(--color-moss-1);
	}

	.status-banner.error {
		background: rgba(185, 85, 71, 0.12);
		border-color: rgba(185, 85, 71, 0.2);
		color: var(--color-danger);
	}

	.icon {
		display: grid;
		place-items: center;
		min-width: 2.4rem;
		height: 1.6rem;
		padding: 0 0.45rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.5);
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		flex-shrink: 0;
	}

	.message-block {
		flex: 1;
		display: grid;
		gap: 0.15rem;
	}

	.label {
		font-size: 0.82rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.message {
		font-size: 0.94rem;
	}

	.sync-btn {
		padding: 0.65rem 0.9rem;
		border-radius: var(--radius-pill);
		border: none;
		background: currentColor;
		color: white;
		font-size: 0.84rem;
		font-weight: 700;
		cursor: pointer;
	}

	@media (max-width: 520px) {
		.status-banner {
			align-items: start;
			flex-wrap: wrap;
		}

		.sync-btn {
			margin-left: 2.85rem;
		}
	}
</style>
