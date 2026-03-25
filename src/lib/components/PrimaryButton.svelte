<script lang="ts">
	import LoadingSpinner from './LoadingSpinner.svelte';

	interface Props {
		label: string;
		onclick?: () => void;
		disabled?: boolean;
		loading?: boolean;
		type?: 'button' | 'submit';
		fullWidth?: boolean;
	}

	let {
		label,
		onclick,
		disabled = false,
		loading = false,
		type = 'button',
		fullWidth = false
	}: Props = $props();
</script>

<button
	{type}
	class="primary-button"
	class:full-width={fullWidth}
	class:disabled
	disabled={disabled || loading}
	onclick={onclick}
>
	{#if loading}
		<LoadingSpinner size="small" color="var(--on-primary)" />
	{:else}
		{label}
	{/if}
</button>

<style>
	.primary-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-6);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--on-primary);
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
		border: none;
		border-radius: var(--radius-full);
		cursor: pointer;
		transition: transform var(--transition-fast), filter var(--transition-fast);
		box-shadow: var(--shadow-sm);
	}

	.primary-button:hover:not(.disabled) {
		transform: scale(1.02);
		filter: brightness(1.05);
	}

	.primary-button:active:not(.disabled) {
		transform: scale(0.98);
		background: var(--primary-fixed);
	}

	.primary-button.disabled,
	.primary-button:disabled {
		opacity: 0.38;
		cursor: not-allowed;
	}

	.full-width {
		width: 100%;
	}
</style>
