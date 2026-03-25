<script lang="ts">
	interface EmptyStateProps {
		icon?: string;
		title: string;
		description?: string;
		actionLabel?: string;
		onAction?: () => void;
	}

	let {
		icon = '📚',
		title,
		description,
		actionLabel,
		onAction
	}: EmptyStateProps = $props();
</script>

<div class="empty-state">
	<div class="icon">{icon}</div>
	<h2 class="title">{title}</h2>
	{#if description}
		<p class="description">{description}</p>
	{/if}
	{#if actionLabel && onAction}
		<button class="cta-button" onclick={onAction}>
			{actionLabel}
		</button>
	{/if}
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		text-align: center;
	}

	.icon {
		font-size: 120px;
		line-height: 1;
		margin-bottom: 16px;
		opacity: 0.6;
		filter: grayscale(30%);
	}

	.title {
		font-family: var(--font-serif, 'Noto Serif', Georgia, serif);
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--on-surface, #1a1a1a);
		margin: 0 0 8px;
		line-height: 1.3;
	}

	.description {
		font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
		font-size: 1rem;
		color: var(--on-surface-variant, #666);
		margin: 0 0 24px;
		max-width: 300px;
		line-height: 1.5;
	}

	.cta-button {
		padding: 12px 24px;
		background: var(--primary, #4A90D9);
		color: var(--on-primary, white);
		border: none;
		border-radius: var(--radius-md, 0.75rem);
		font-family: var(--font-sans, 'Inter', system-ui, sans-serif);
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: background 0.2s, transform 0.2s;
	}

	.cta-button:hover {
		background: var(--primary-hover, #3a7bc8);
		transform: translateY(-1px);
	}

	.cta-button:active {
		transform: translateY(0);
	}
</style>