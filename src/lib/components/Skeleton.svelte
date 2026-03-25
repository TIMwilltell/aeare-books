<script lang="ts">
	interface SkeletonProps {
		variant?: 'text' | 'title' | 'thumbnail' | 'card';
		width?: string;
		height?: string;
	}

	let {
		variant = 'text',
		width,
		height
	}: SkeletonProps = $props();

	const variantClasses: Record<string, string> = {
		text: 'skeleton-text',
		title: 'skeleton-title',
		thumbnail: 'skeleton-thumbnail',
		card: 'skeleton-card'
	};
</script>

<div 
	class="skeleton {variantClasses[variant]}" 
	style:width={width}
	style:height={height}
></div>

<style>
	.skeleton {
		background: linear-gradient(
			90deg,
			var(--surface-container-highest, #e4e2e2) 0%,
			var(--surface-container-low, #f5f3f3) 50%,
			var(--surface-container-highest, #e4e2e2) 100%
		);
		background-size: 200% 100%;
		border-radius: var(--radius-sm, 0.25rem);
		animation: shimmer 1.5s ease-in-out infinite;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	.skeleton-text {
		height: 16px;
		width: 100%;
		border-radius: 4px;
	}

	.skeleton-title {
		height: 24px;
		width: 100%;
		border-radius: 4px;
	}

	.skeleton-thumbnail {
		width: 80px;
		height: 120px;
		border-radius: var(--radius-md, 0.75rem);
	}

	.skeleton-card {
		height: 80px;
		width: 100%;
		border-radius: var(--radius-md, 0.75rem);
	}
</style>