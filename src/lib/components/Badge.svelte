<script lang="ts">
	interface Props {
		label: string;
		variant?: 'ar-fetched' | 'ar-manual' | 'ar-pending';
		size?: 'sm' | 'md';
	}

	let {
		label,
		variant = 'ar-pending',
		size = 'md'
	}: Props = $props();

	const variantClasses = {
		'ar-fetched': 'badge-fetched',
		'ar-manual': 'badge-manual',
		'ar-pending': 'badge-pending'
	};

	const sizeClasses = {
		'sm': 'badge-sm',
		'md': 'badge-md'
	};
</script>

<span class="badge {variantClasses[variant]} {sizeClasses[size]}">
	{label}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		font-family: var(--font-display);
		font-weight: var(--font-medium);
		letter-spacing: 0.05em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	/* Size variants */
	.badge-sm {
		padding: var(--space-1) var(--space-2);
		font-size: 0.6875rem;
		border-radius: var(--radius-sm);
	}

	.badge-md {
		padding: var(--space-1) var(--space-3);
		font-size: 0.75rem;
		border-radius: var(--radius-md);
	}

	/* Status variants */
	.badge-fetched {
		background-color: var(--primary-fixed);
		color: #21496f;
	}

	.badge-manual {
		background-color: #ffdea3;
		color: #5d4200;
	}

	.badge-pending {
		background-color: var(--outline-variant);
		color: var(--on-surface-variant);
	}
</style>
