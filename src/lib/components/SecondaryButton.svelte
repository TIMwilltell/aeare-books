<script lang="ts">
	interface Props {
		label: string;
		onclick?: () => void;
		disabled?: boolean;
		type?: 'button' | 'submit';
		fullWidth?: boolean;
	}

	let {
		label,
		onclick,
		disabled = false,
		type = 'button',
		fullWidth = false
	}: Props = $props();
</script>

<button
	{type}
	class="secondary-button"
	class:full-width={fullWidth}
	class:disabled
	disabled={disabled}
	onclick={onclick}
>
	{label}
</button>

<style>
	.secondary-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-3) var(--space-6);
		font-family: var(--font-display);
		font-size: var(--text-sm);
		font-weight: var(--font-semibold);
		color: var(--on-secondary-container);
		background: transparent;
		border: 1px solid rgba(171, 172, 190, 0.15);
		border-radius: var(--radius-full);
		cursor: pointer;
		transition: background-color var(--transition-fast), border-color var(--transition-fast);
	}

	.secondary-button:hover:not(.disabled) {
		background-color: var(--secondary-fixed);
		border-color: var(--secondary-fixed-dim);
	}

	.secondary-button:active:not(.disabled) {
		background-color: var(--secondary-fixed-dim);
	}

	.secondary-button.disabled,
	.secondary-button:disabled {
		opacity: 0.38;
		cursor: not-allowed;
	}

	.full-width {
		width: 100%;
	}
</style>
